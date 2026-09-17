package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestAuthMiddleware_NoHeader(t *testing.T) {
	r := gin.New()
	r.Use(AuthMiddleware("test-secret"))
	r.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	secret := "test-secret"
	user := &models.User{
		ID:    "usr_12345",
		Email: "buyer@carplug.ng",
		Role:  "buyer",
	}

	token, err := utils.GenerateToken(user, secret, 24)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	r := gin.New()
	r.Use(AuthMiddleware(secret))
	r.GET("/test", func(c *gin.Context) {
		userID, _ := c.Get("userID")
		role, _ := c.Get("userRole")
		c.JSON(http.StatusOK, gin.H{"userId": userID, "role": role})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestRequireRoles(t *testing.T) {
	secret := "test-secret"
	dealerUser := &models.User{
		ID:    "usr_dealer",
		Email: "dealer@carplug.ng",
		Role:  "dealer",
	}

	dealerToken, _ := utils.GenerateToken(dealerUser, secret, 24)

	buyerUser := &models.User{
		ID:    "usr_buyer",
		Email: "buyer@carplug.ng",
		Role:  "buyer",
	}

	buyerToken, _ := utils.GenerateToken(buyerUser, secret, 24)

	r := gin.New()
	r.Use(AuthMiddleware(secret))
	r.GET("/dealer-only", RequireRoles("dealer", "admin"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Test with dealer token -> should pass 200
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/dealer-only", nil)
	req1.Header.Set("Authorization", "Bearer "+dealerToken)
	r.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Errorf("expected status %d for dealer, got %d", http.StatusOK, w1.Code)
	}

	// Test with buyer token -> should be 403 Forbidden
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("GET", "/dealer-only", nil)
	req2.Header.Set("Authorization", "Bearer "+buyerToken)
	r.ServeHTTP(w2, req2)

	if w2.Code != http.StatusForbidden {
		t.Errorf("expected status %d for buyer on dealer route, got %d", http.StatusForbidden, w2.Code)
	}
}
