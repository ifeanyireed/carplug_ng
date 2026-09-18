package main

import (
	"log"

	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func main() {
	log.Println("==================================================")
	log.Println("  Running PostgreSQL (Neon) Schema Migration...  ")
	log.Println("==================================================")

	cfg := config.LoadConfig()
	cfg.AutoMigrate = true
	cfg.AutoSeed = true

	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("[Migrate] Database initialization failed: %v", err)
	}

	tables := []interface{}{
		&models.User{},
		&models.Vehicle{},
		&models.DealerShop{},
		&models.Technician{},
		&models.InspectionReport{},
		&models.Lead{},
		&models.SwapRequest{},
		&models.Campaign{},
		&models.SavedVehicle{},
		&models.Conversation{},
		&models.Message{},
		&models.Subscription{},
		&models.Verification{},
		&models.Transaction{},
		&models.OTPVerification{},
	}

	log.Printf("[Migrate] Verifying tables exist in PostgreSQL...")
	for _, table := range tables {
		stmt := &models.User{}
		_ = stmt
		if db.Migrator().HasTable(table) {
			log.Printf("  ✓ Table exists: %T", table)
		} else {
			log.Fatalf("  ✗ Table missing: %T", table)
		}
	}

	log.Println("==================================================")
	log.Println("  Schema Migration & Seeding Succeeded on Neon!   ")
	log.Println("==================================================")
}
