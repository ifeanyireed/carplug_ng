package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func main() {
	if len(os.Args) < 2 {
		os.Exit(1)
	}
	email := strings.ToLower(strings.TrimSpace(os.Args[1]))
	cfg := config.LoadConfig()
	cfg.AutoMigrate = false
	cfg.AutoSeed = false
	if _, err := config.InitDB(cfg); err != nil {
		os.Exit(1)
	}
	db := config.GetDB()

	var otp models.OTPVerification
	if err := db.Where("LOWER(email) = ? AND is_used = false", email).Order("created_at DESC").First(&otp).Error; err != nil {
		os.Exit(1)
	}
	fmt.Print(otp.Code)
}
