package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"gorm.io/gorm"
)

// Usage: go run ./cmd/createadmin -email someone@example.com
// Promotes an existing, already-registered user to the admin role.
func main() {
	emailFlag := flag.String("email", "", "Email address of the existing user to promote to admin")
	flag.Parse()

	email := strings.ToLower(strings.TrimSpace(*emailFlag))
	if email == "" {
		fmt.Println("Error: -email flag is required.")
		fmt.Println("Usage: go run ./cmd/createadmin -email someone@example.com")
		os.Exit(1)
	}

	cfg := config.LoadConfig()
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("[CreateAdmin] Database connection failed: %v", err)
	}

	var user models.User
	if err := db.Where("LOWER(email) = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Fatalf("[CreateAdmin] User not found with email: %s", email)
		}
		log.Fatalf("[CreateAdmin] Database query error: %v", err)
	}

	// Update role to admin
	if err := db.Model(&user).Updates(map[string]interface{}{
		"role":        string(models.RoleAdmin),
		"is_verified": true,
	}).Error; err != nil {
		log.Fatalf("[CreateAdmin] Failed to update user to admin: %v", err)
	}

	// Refresh user state
	db.Where("id = ?", user.ID).First(&user)

	fmt.Println("==================================================")
	fmt.Println("  Admin Account Provisioned Successfully")
	fmt.Println("==================================================")
	fmt.Printf("  ID:          %s\n", user.ID)
	fmt.Printf("  Name:        %s\n", user.Name)
	fmt.Printf("  Email:       %s\n", user.Email)
	fmt.Printf("  Role:        %s\n", user.Role)
	fmt.Printf("  IsVerified:  %t\n", user.IsVerified)
	fmt.Println("==================================================")
}
