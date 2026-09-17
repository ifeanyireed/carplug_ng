package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
)

// AuthMiddleware validates the JWT token in Authorization: Bearer <token>.
func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header format must be Bearer <token>"})
			return
		}

		tokenString := strings.TrimSpace(parts[1])
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token string cannot be empty"})
			return
		}

		claims, err := utils.ValidateToken(tokenString, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

// RequireRoles restricts access to users possessing at least one of the specified roles.
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[strings.ToLower(r)] = true
	}

	return func(c *gin.Context) {
		roleVal, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user role not present in context"})
			return
		}

		role, ok := roleVal.(string)
		if !ok || !allowed[strings.ToLower(role)] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions for this resource"})
			return
		}

		c.Next()
	}
}
