package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

// JWTClaims encapsulates standard JWT claims along with application-specific user metadata.
type JWTClaims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates and signs a new JWT token for an authenticated user.
func GenerateToken(user *models.User, secret string, expiryHours int) (string, error) {
	if secret == "" {
		return "", errors.New("jwt secret key cannot be empty")
	}
	if expiryHours <= 0 {
		expiryHours = 72
	}

	claims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour)),
			Issuer:    "carplug-verza-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return signedToken, nil
}

// ValidateToken parses and verifies a JWT token string against the secret, returning the claims.
func ValidateToken(tokenString string, secret string) (*JWTClaims, error) {
	if secret == "" {
		return nil, errors.New("jwt secret key cannot be empty")
	}

	parsedToken, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := parsedToken.Claims.(*JWTClaims)
	if !ok || !parsedToken.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}
