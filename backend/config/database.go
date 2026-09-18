package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/ifeanyireed/carplug_ng/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *Config) (*gorm.DB, error) {
	var dsn string
	if cfg.DatabaseURL != "" {
		dsn = cfg.DatabaseURL
	} else {
		sslMode := cfg.DBSSLMode
		if sslMode == "" {
			sslMode = "require"
		}
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			cfg.DBHost,
			cfg.DBUser,
			cfg.DBPassword,
			cfg.DBName,
			cfg.DBPort,
			sslMode,
		)
	}

	logLevel := logger.Info
	if cfg.GinMode == "release" {
		logLevel = logger.Warn
	}

	var err error
	maxRetries := 5
	for attempt := 1; attempt <= maxRetries; attempt++ {
		targetHost := cfg.DBHost
		if cfg.DatabaseURL != "" {
			targetHost = "Neon Cloud Postgres"
		}
		log.Printf("[Database] Connecting to PostgreSQL at %s [attempt %d/%d]...\n", targetHost, attempt, maxRetries)
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logLevel),
		})
		if err == nil {
			var sqlDB *sql.DB
			sqlDB, err = DB.DB()
			if err == nil {
				sqlDB.SetMaxIdleConns(5)
				sqlDB.SetMaxOpenConns(20)
				sqlDB.SetConnMaxIdleTime(15 * time.Minute)
				sqlDB.SetConnMaxLifetime(1 * time.Hour)
				if err = sqlDB.Ping(); err == nil {
					log.Printf("[Database] Successfully connected to PostgreSQL (Neon)\n")
					break
				}
			}
		}

		if attempt < maxRetries {
			log.Printf("[Database] Connection attempt %d failed: %v. Retrying in 2 seconds...\n", attempt, err)
			time.Sleep(2 * time.Second)
		}
	}
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL database after %d attempts: %w", maxRetries, err)
	}

	// Run AutoMigrations if enabled
	if cfg.AutoMigrate {
		log.Println("[Database] Running schema migrations with GORM AutoMigrate...")
		err = DB.AutoMigrate(
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
		)
		if err != nil {
			return nil, fmt.Errorf("auto-migration failed: %w", err)
		}
		log.Println("[Database] Schema migrations completed successfully.")
	} else {
		// Ensure Messaging and Subscription tables exist even when full AutoMigrate is disabled
		if !DB.Migrator().HasTable(&models.Conversation{}) || !DB.Migrator().HasTable(&models.Message{}) {
			log.Println("[Database] Initializing Conversation and Message tables...")
			if migErr := DB.AutoMigrate(&models.Conversation{}, &models.Message{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating messaging tables: %v\n", migErr)
			} else {
				log.Println("[Database] Conversation and Message tables verified/migrated.")
			}
		}
		if !DB.Migrator().HasTable(&models.Subscription{}) {
			log.Println("[Database] Initializing Subscription table...")
			if migErr := DB.AutoMigrate(&models.Subscription{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating Subscription table: %v\n", migErr)
			} else {
				log.Println("[Database] Subscription table verified/migrated.")
			}
		}
		if !DB.Migrator().HasColumn(&models.DealerShop{}, "UserID") {
			log.Println("[Database] Migrating dealer_shops for UserID column...")
			if migErr := DB.AutoMigrate(&models.DealerShop{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating dealer_shops: %v\n", migErr)
			} else {
				log.Println("[Database] dealer_shops table updated.")
			}
		}
		if !DB.Migrator().HasTable(&models.Verification{}) {
			log.Println("[Database] Initializing Verification table...")
			if migErr := DB.AutoMigrate(&models.Verification{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating Verification table: %v\n", migErr)
			} else {
				log.Println("[Database] Verification table verified/migrated.")
			}
		}
		if !DB.Migrator().HasTable(&models.Transaction{}) {
			log.Println("[Database] Initializing Transaction table...")
			if migErr := DB.AutoMigrate(&models.Transaction{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating Transaction table: %v\n", migErr)
			} else {
				log.Println("[Database] Transaction table verified/migrated.")
			}
		}
		if !DB.Migrator().HasTable(&models.OTPVerification{}) {
			log.Println("[Database] Initializing OTPVerification table...")
			if migErr := DB.AutoMigrate(&models.OTPVerification{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating OTPVerification table: %v\n", migErr)
			} else {
				log.Println("[Database] OTPVerification table verified/migrated.")
			}
		}
		if !DB.Migrator().HasColumn(&models.InspectionReport{}, "EscrowTransactionID") {
			log.Println("[Database] Migrating inspection_reports for EscrowTransactionID column...")
			if migErr := DB.AutoMigrate(&models.InspectionReport{}); migErr != nil {
				log.Printf("[Database] Warning: auto-migrating inspection_reports: %v\n", migErr)
			} else {
				log.Println("[Database] inspection_reports table updated.")
			}
		}
	}

	// Auto seed initial data if enabled
	if cfg.AutoSeed {
		models.SeedInitialData(DB)
	}

	return DB, nil
}

func GetDB() *gorm.DB {
	return DB
}
