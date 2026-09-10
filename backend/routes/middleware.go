package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/middleware"
)

// AuthMiddleware delegates to middleware.AuthMiddleware for JWT authentication.
func AuthMiddleware(secret string) gin.HandlerFunc {
	return middleware.AuthMiddleware(secret)
}

// RequireRoles delegates to middleware.RequireRoles for role-based access control.
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return middleware.RequireRoles(allowedRoles...)
}
