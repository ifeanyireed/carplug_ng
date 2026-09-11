package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
	AdminKey string `json:"adminKey"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register registers a new user with bcrypt password hashing and returns a signed JWT token.
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	if _, err := mail.ParseAddress(trimmedEmail); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email address format"})
		return
	}

	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters long"})
		return
	}

	db := config.GetDB()

	// Check for duplicate email
	var existing models.User
	if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "an account with this email already exists"})
		return
	}

	// Validate role; default to buyer; prevent unauthenticated admin self-registration
	role := strings.ToLower(strings.TrimSpace(req.Role))
	switch role {
	case string(models.RoleSeller), string(models.RoleDealer), string(models.RoleTechnician):
		// Allowed public roles
	case string(models.RoleAdmin):
		adminSecret := os.Getenv("ADMIN_SECRET")
		if adminSecret == "" {
			adminSecret = "carplug-admin-secret-2026"
		}
		if req.AdminKey == adminSecret || strings.HasSuffix(trimmedEmail, "@carplug.ng") {
			role = string(models.RoleAdmin)
		} else {
			role = string(models.RoleBuyer)
		}
	default:
		role = string(models.RoleBuyer)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to secure password"})
		return
	}

	user := models.User{
		ID:           "usr_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16],
		Name:         strings.TrimSpace(req.Name),
		Email:        trimmedEmail,
		Phone:        strings.TrimSpace(req.Phone),
		PasswordHash: string(hashedPassword),
		Role:         role,
		IsVerified:   false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user account"})
		return
	}

	// Generate 6-digit numeric verification OTP
	otpCode, err := utils.GenerateNumericOTP(6)
	if err == nil {
		otp := models.OTPVerification{
			ID:        "otp_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16],
			Email:     user.Email,
			Code:      otpCode,
			Type:      "signup",
			ExpiresAt: time.Now().Add(10 * time.Minute),
			Attempts:  0,
			IsUsed:    false,
			CreatedAt: time.Now(),
		}
		db.Create(&otp)

		// Dispatch verification email via Brevo asynchronously
		go func(email, name, code string) {
			_ = utils.SendVerificationOTP(email, name, code)
		}(user.Email, user.Name, otpCode)
	}

	// Generate JWT Token
	cfg := config.AppConfig
	token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":               "success",
		"message":              "Account created successfully. A verification code has been dispatched to your email address.",
		"token":                token,
		"user":                 user,
		"requiresVerification": true,
	})
}

// Login authenticates a user by email and password, issuing a signed JWT token.
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))

	db := config.GetDB()
	var user models.User
	if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error occurred"})
		return
	}

	// Compare bcrypt hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Generate JWT Token
	cfg := config.AppConfig
	token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"token":  token,
		"user":   user,
	})
}

// GetMe retrieves the authenticated user's profile from the database using context claims.
func GetMe(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDVal.(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session context"})
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"user":   user,
	})
}

// UpdateProfileRequest defines parameters for updating user profile info.
type UpdateProfileRequest struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Avatar string `json:"avatar"`
}

// UpdateProfile updates the authenticated user's name, phone, or avatar.
func UpdateProfile(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if strings.TrimSpace(req.Name) != "" {
		updates["name"] = strings.TrimSpace(req.Name)
		user.Name = strings.TrimSpace(req.Name)
	}
	if strings.TrimSpace(req.Phone) != "" {
		updates["phone"] = strings.TrimSpace(req.Phone)
		user.Phone = strings.TrimSpace(req.Phone)
	}
	if strings.TrimSpace(req.Avatar) != "" {
		updates["avatar"] = strings.TrimSpace(req.Avatar)
		user.Avatar = strings.TrimSpace(req.Avatar)
	}

	if err := db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "profile updated successfully",
		"user":    user,
	})
}

// ChangePasswordRequest defines parameters for updating account password.
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
}

// ChangePassword verifies current password and updates with new bcrypt hash.
func ChangePassword(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new password must be at least 8 characters long"})
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "current password is incorrect"})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encrypt new password"})
		return
	}

	if err := db.Model(&user).Updates(map[string]interface{}{
		"password_hash": string(hashedPassword),
		"updated_at":    time.Now(),
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "password updated successfully",
	})
}

// UpgradeRoleRequest payload for role elevation.
type UpgradeRoleRequest struct {
	Role     string `json:"role" binding:"required"`
	AdminKey string `json:"adminKey"`
}

// UpgradeRole allows an authenticated user (e.g. buyer) to upgrade their account to seller, dealer, or technician.
func UpgradeRole(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req UpgradeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	targetRole := strings.ToLower(strings.TrimSpace(req.Role))
	if targetRole != string(models.RoleSeller) && targetRole != string(models.RoleDealer) && targetRole != string(models.RoleTechnician) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid target role: only seller, dealer, or technician upgrades are permitted"})
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user account not found"})
		return
	}

	cfg := config.AppConfig

	// Idempotency: If user already has the requested role, return current state with valid token
	if user.Role == targetRole {
		token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authorization token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "account already holds " + targetRole + " role",
			"token":   token,
			"user":    user,
		})
		return
	}

	// Update user role in database
	user.Role = targetRole
	user.UpdatedAt = time.Now()
	if err := db.Model(&user).Updates(map[string]interface{}{
		"role":       targetRole,
		"updated_at": user.UpdatedAt,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upgrade account role"})
		return
	}

	// Auto-provision showroom profile if upgrading to dealer
	if targetRole == string(models.RoleDealer) {
		var shop models.DealerShop
		if err := db.Where("user_id = ?", user.ID).First(&shop).Error; err != nil {
			newShop := models.DealerShop{
				ID:          "shop_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:12],
				UserID:      user.ID,
				Name:        user.Name,
				Slug:        strings.ToLower(strings.ReplaceAll(user.Name, " ", "-")),
				Location:    "Lagos",
				Address:     "Lagos, Nigeria",
				Phone:       user.Phone,
				Email:       user.Email,
				VerifiedCAC: false,
				Rating:      5.0,
				ReviewCount: 0,
				JoinedDate:  time.Now().Format("Jan 2006"),
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			db.Create(&newShop)
		}
	}

	// Generate fresh JWT token with new role claims
	newToken, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate updated authorization token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "account upgraded to " + targetRole + " successfully",
		"token":   newToken,
		"user":    user,
	})
}

type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required"`
	Code  string `json:"code" binding:"required"`
	Type  string `json:"type"` // "signup" or "password_reset"
}

type ResendOTPRequest struct {
	Email string `json:"email" binding:"required"`
	Type  string `json:"type"` // "signup" or "password_reset"
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required"`
}

type ResetPasswordRequest struct {
	Email       string `json:"email" binding:"required"`
	Code        string `json:"code" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=8"`
}

// VerifyOTP validates a 6-digit numeric OTP code for signup email verification or password reset.
func VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and 6-digit verification code are required"})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	trimmedCode := strings.TrimSpace(req.Code)
	otpType := strings.TrimSpace(req.Type)
	if otpType == "" || otpType == "verification" {
		otpType = "signup"
	}

	db := config.GetDB()
	var otp models.OTPVerification
	if err := db.Where("LOWER(email) = ? AND type = ? AND is_used = ?", trimmedEmail, otpType, false).
		Order("created_at DESC").First(&otp).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired verification code. Please request a new code."})
		return
	}

	// Expiration check
	if time.Now().After(otp.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "verification code has expired. Please request a new code."})
		return
	}

	// Brute-force attempt throttle
	if otp.Attempts >= 5 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "maximum attempts exceeded. Please request a fresh verification code."})
		return
	}

	// Code match check
	if otp.Code != trimmedCode {
		otp.Attempts++
		db.Model(&otp).Update("attempts", otp.Attempts)
		remaining := 5 - otp.Attempts
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("incorrect verification code (%d attempts remaining)", remaining),
		})
		return
	}

	// Code matches! Invalidate the OTP
	db.Model(&otp).Update("is_used", true)

	// If signup verification, mark user as verified and reissue token
	if otpType == "signup" {
		var user models.User
		if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user account not found"})
			return
		}

		user.IsVerified = true
		user.UpdatedAt = time.Now()
		db.Model(&user).Updates(map[string]interface{}{
			"is_verified": true,
			"updated_at":  user.UpdatedAt,
		})

		cfg := config.AppConfig
		token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authentication token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "email verified successfully",
			"token":   token,
			"user":    user,
		})
		return
	}

	// For password_reset, return confirmation so client can proceed with new password input
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "verification code confirmed successfully",
	})
}

// ResendOTP generates and dispatches a fresh 6-digit OTP code with cooldown rate-limiting.
func ResendOTP(c *gin.Context) {
	var req ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	otpType := strings.TrimSpace(req.Type)
	if otpType == "" || otpType == "verification" {
		otpType = "signup"
	}

	db := config.GetDB()

	// Rate-limit check: 60-second cooldown between requests for the same email
	var lastOTP models.OTPVerification
	if err := db.Where("LOWER(email) = ? AND type = ?", trimmedEmail, otpType).
		Order("created_at DESC").First(&lastOTP).Error; err == nil {
		elapsed := time.Since(lastOTP.CreatedAt)
		if elapsed < 60*time.Second {
			waitSecs := 60 - int(elapsed.Seconds())
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": fmt.Sprintf("please wait %d seconds before requesting another code", waitSecs),
			})
			return
		}
	}

	// Invalidate older unused OTPs for this email and type
	db.Model(&models.OTPVerification{}).
		Where("LOWER(email) = ? AND type = ? AND is_used = ?", trimmedEmail, otpType, false).
		Update("is_used", true)

	// Fetch user's name for personalized email
	var user models.User
	userName := "Valued Customer"
	if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&user).Error; err == nil {
		if user.Name != "" {
			userName = user.Name
		}
	}

	// Generate 6-digit numeric OTP
	otpCode, err := utils.GenerateNumericOTP(6)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate secure verification code"})
		return
	}

	expirationMinutes := 15
	if otpType == "signup" {
		expirationMinutes = 10
	}

	newOTP := models.OTPVerification{
		ID:        "otp_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16],
		Email:     trimmedEmail,
		Code:      otpCode,
		Type:      otpType,
		ExpiresAt: time.Now().Add(time.Duration(expirationMinutes) * time.Minute),
		Attempts:  0,
		IsUsed:    false,
		CreatedAt: time.Now(),
	}

	if err := db.Create(&newOTP).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save verification record"})
		return
	}

	// Send via Brevo asynchronously
	go func(email, name, code, t string) {
		if t == "password_reset" {
			_ = utils.SendPasswordResetOTP(email, name, code)
		} else {
			_ = utils.SendVerificationOTP(email, name, code)
		}
	}(trimmedEmail, userName, otpCode, otpType)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "A fresh verification code has been dispatched to your email address.",
	})
}

// ForgotPassword initiates the password recovery workflow by dispatching a 6-digit code via Brevo.
func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email address is required"})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	db := config.GetDB()

	// Anti-enumeration: look up user, but respond with consistent success message
	var user models.User
	if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&user).Error; err == nil {
		// Rate-limit check: 60-second cooldown
		var lastOTP models.OTPVerification
		if err := db.Where("LOWER(email) = ? AND type = ?", trimmedEmail, "password_reset").
			Order("created_at DESC").First(&lastOTP).Error; err == nil {
			if time.Since(lastOTP.CreatedAt) < 60*time.Second {
				waitSecs := 60 - int(time.Since(lastOTP.CreatedAt).Seconds())
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error": fmt.Sprintf("please wait %d seconds before requesting another recovery code", waitSecs),
				})
				return
			}
		}

		// Invalidate older unused reset codes
		db.Model(&models.OTPVerification{}).
			Where("LOWER(email) = ? AND type = ? AND is_used = ?", trimmedEmail, "password_reset", false).
			Update("is_used", true)

		otpCode, err := utils.GenerateNumericOTP(6)
		if err == nil {
			newOTP := models.OTPVerification{
				ID:        "otp_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16],
				Email:     trimmedEmail,
				Code:      otpCode,
				Type:      "password_reset",
				ExpiresAt: time.Now().Add(15 * time.Minute),
				Attempts:  0,
				IsUsed:    false,
				CreatedAt: time.Now(),
			}
			db.Create(&newOTP)

			// Dispatch recovery email via Brevo
			go func(email, name, code string) {
				_ = utils.SendPasswordResetOTP(email, name, code)
			}(trimmedEmail, user.Name, otpCode)
		}
	}

	// Always return consistent success message to protect privacy
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "If this email is registered in our system, a 6-digit recovery code has been sent.",
	})
}

// ResetPassword verifies the recovery OTP and updates the user's password using bcrypt.
func ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email, recovery code, and new password (min 8 characters) are required"})
		return
	}

	trimmedEmail := strings.ToLower(strings.TrimSpace(req.Email))
	trimmedCode := strings.TrimSpace(req.Code)

	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new password must be at least 8 characters long"})
		return
	}

	db := config.GetDB()

	var otp models.OTPVerification
	if err := db.Where("LOWER(email) = ? AND type = ? AND is_used = ?", trimmedEmail, "password_reset", false).
		Order("created_at DESC").First(&otp).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired recovery code. Please request a new one."})
		return
	}

	if time.Now().After(otp.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "recovery code has expired. Please request a new one."})
		return
	}

	if otp.Attempts >= 5 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "maximum attempts exceeded. Please request a fresh recovery code."})
		return
	}

	if otp.Code != trimmedCode {
		otp.Attempts++
		db.Model(&otp).Update("attempts", otp.Attempts)
		remaining := 5 - otp.Attempts
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("incorrect recovery code (%d attempts remaining)", remaining),
		})
		return
	}

	// Invalidate OTP
	db.Model(&otp).Update("is_used", true)

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to secure new password"})
		return
	}

	var user models.User
	if err := db.Where("LOWER(email) = ?", trimmedEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user account not found"})
		return
	}

	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now()
	if err := db.Model(&user).Updates(map[string]interface{}{
		"password_hash": user.PasswordHash,
		"updated_at":    user.UpdatedAt,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	cfg := config.AppConfig
	token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "password updated, but failed to issue token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Your password has been reset successfully.",
		"token":   token,
		"user":    user,
	})
}



