package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	GinMode        string
	AllowedOrigins []string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBCharset      string
	AutoSeed       bool
}

var AppConfig *Config

func LoadConfig() *Config {
	// Try loading from .env file; continue gracefully if absent (e.g. in containerized env)
	if err := godotenv.Load(); err != nil {
		log.Println("[Config] No .env file found, using system environment or defaults")
	}

	originsStr := getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
	var origins []string
	for _, o := range strings.Split(originsStr, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}

	AppConfig = &Config{
		Port:           getEnv("PORT", "8080"),
		GinMode:        getEnv("GIN_MODE", "debug"),
		AllowedOrigins: origins,
		DBHost:         getEnv("DB_HOST", "srv2113.hstgr.io"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "u721451974_carplug_ng"),
		DBPassword:     getEnv("DB_PASSWORD", "*REDACTED"),
		DBName:         getEnv("DB_NAME", "u721451974_carplug_ng_db"),
		DBCharset:      getEnv("DB_CHARSET", "utf8mb4"),
		AutoSeed:       getEnv("AUTO_SEED", "true") == "true",
	}

	return AppConfig
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
