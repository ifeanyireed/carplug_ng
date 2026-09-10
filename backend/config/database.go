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
		"%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
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

	// Connection pooling optimized for remote cloud MySQL
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetConnMaxIdleTime(1 * time.Minute)
	sqlDB.SetConnMaxLifetime(3 * time.Minute)

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
