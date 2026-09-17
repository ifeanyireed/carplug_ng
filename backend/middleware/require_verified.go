package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

// RequireVerifiedEmail enforces that the authenticated user has verified their email address.
func RequireVerifiedEmail() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized: missing user context",
			})
			return
		}

		var user models.User
		if err := config.GetDB().Where("id = ?", userID).First(&user).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "account not found",
			})
			return
		}

		if !user.IsVerified {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Please verify your email address to continue",
				"code":  "EMAIL_NOT_VERIFIED",
			})
			return
		}

		c.Next()
	}
}
