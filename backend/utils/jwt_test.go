package utils

import (
	"testing"

	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func TestGenerateAndValidateToken(t *testing.T) {
	secret := "test_jwt_secret_key_12345"
	user := &models.User{
		ID:    "usr_test123",
		Name:  "Test User",
		Email: "test@carplug.ng",
		Role:  "dealer",
	}

	token, err := GenerateToken(user, secret, 24)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	if token == "" {
		t.Fatal("GenerateToken returned empty token")
	}

	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.UserID != user.ID {
		t.Errorf("expected UserID %s, got %s", user.ID, claims.UserID)
	}
	if claims.Email != user.Email {
		t.Errorf("expected Email %s, got %s", user.Email, claims.Email)
	}
	if claims.Role != user.Role {
		t.Errorf("expected Role %s, got %s", user.Role, claims.Role)
	}
}

func TestValidateToken_InvalidSecret(t *testing.T) {
	secret := "test_jwt_secret_key_12345"
	user := &models.User{
		ID:    "usr_test123",
		Name:  "Test User",
		Email: "test@carplug.ng",
		Role:  "buyer",
	}

	token, err := GenerateToken(user, secret, 24)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	_, err = ValidateToken(token, "wrong_secret_key")
	if err == nil {
		t.Error("expected error when validating with wrong secret, got nil")
	}
}

func TestValidateToken_EmptySecret(t *testing.T) {
	_, err := ValidateToken("some.fake.token", "")
	if err == nil {
		t.Error("expected error when validating with empty secret, got nil")
	}
}
