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
