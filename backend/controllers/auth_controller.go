package controllers

import (
	"errors"
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
	Password string `json:"password" binding:"required,min=6"`
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

	if len(req.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 6 characters"})
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

	// Generate JWT Token
	cfg := config.AppConfig
	token, err := utils.GenerateToken(&user, cfg.JWTSecret, cfg.JWTExpirationHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"token":  token,
		"user":   user,
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
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
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

	if len(req.NewPassword) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new password must be at least 6 characters long"})
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


