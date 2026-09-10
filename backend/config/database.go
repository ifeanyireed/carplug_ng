package config

import (
	"fmt"
	"log"
	"time"

	"github.com/ifeanyireed/carplug_ng/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local&timeout=10s&readTimeout=30s&writeTimeout=30s",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
		cfg.DBCharset,
	)

	logLevel := logger.Info
	if cfg.GinMode == "release" {
		logLevel = logger.Warn
	}

	log.Printf("[Database] Connecting to MySQL at %s:%s (database: %s)...\n", cfg.DBHost, cfg.DBPort, cfg.DBName)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get generic database object: %w", err)
	}

	// Connection pooling optimized for remote cloud MySQL over VPN (short idle timeouts prevent dead TCP sockets)
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxIdleTime(15 * time.Second)
	sqlDB.SetConnMaxLifetime(1 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping MySQL database: %w", err)
	}

	log.Printf("[Database] Successfully connected to MySQL at %s:%s / %s\n", cfg.DBHost, cfg.DBPort, cfg.DBName)

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
		)
		if err != nil {
			return nil, fmt.Errorf("auto-migration failed: %w", err)
		}
		log.Println("[Database] Schema migrations completed successfully.")
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
