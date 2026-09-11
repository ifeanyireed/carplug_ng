package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	GinMode            string
	AllowedOrigins     []string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBCharset          string
	AutoMigrate        bool
	AutoSeed           bool
	JWTSecret          string
	JWTExpirationHours int
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	BrevoAPIKey        string
	BrevoSenderName    string
	BrevoSenderEmail   string
	PaystackSecretKey  string
}

var AppConfig *Config

func LoadConfig() *Config {
	// Try loading from .env file; check candidate locations in order
	loaded := false
	for _, envPath := range []string{".env", "backend/.env", "../.env"} {
		if _, err := os.Stat(envPath); err == nil {
			if err := godotenv.Load(envPath); err == nil {
				log.Printf("[Config] Successfully loaded environment from: %s\n", envPath)
				loaded = true
				break
			}
		}
	}
	if !loaded {
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

	jwtExpHours, err := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "72"))
	if err != nil || jwtExpHours <= 0 {
		jwtExpHours = 72
	}

	jwtSecret := getEnv("JWT_SECRET", "verza_carplug_dev_jwt_secret_2026_super_secure_key")

	AppConfig = &Config{
		Port:               getEnv("PORT", "8080"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		AllowedOrigins:     origins,
		DBHost:             getEnv("DB_HOST", ""),
		DBPort:             getEnv("DB_PORT", "3306"),
		DBUser:             getEnv("DB_USER", ""),
		DBPassword:         getEnv("DB_PASSWORD", ""),
		DBName:             getEnv("DB_NAME", ""),
		DBCharset:          getEnv("DB_CHARSET", "utf8mb4"),
		AutoMigrate:        getEnv("AUTO_MIGRATE", "true") == "true",
		AutoSeed:           getEnv("AUTO_SEED", "true") == "true",
		JWTSecret:          jwtSecret,
		JWTExpirationHours: jwtExpHours,
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
		BrevoAPIKey:        getEnv("BREVO_API_KEY", ""),
		BrevoSenderName:    getEnv("BREVO_SENDER_NAME", "CarPlug Nigeria"),
		BrevoSenderEmail:   getEnv("BREVO_SENDER_EMAIL", "verify@carplug.ng"),
		PaystackSecretKey:  getEnv("PAYSTACK_SECRET_KEY", ""),
	}

	if AppConfig.DBPassword == "" {
		log.Fatal("[Config] DB_PASSWORD environment variable is required and was not set")
	}
	if AppConfig.DBHost == "" {
		log.Fatal("[Config] DB_HOST environment variable is required and was not set")
	}
	if AppConfig.DBUser == "" {
		log.Fatal("[Config] DB_USER environment variable is required and was not set")
	}
	if AppConfig.DBName == "" {
		log.Fatal("[Config] DB_NAME environment variable is required and was not set")
	}

	// Require strong custom JWT_SECRET in production release mode
	if AppConfig.GinMode == "release" && (os.Getenv("JWT_SECRET") == "" || AppConfig.JWTSecret == "verza_carplug_dev_jwt_secret_2026_super_secure_key") {
		log.Fatal("[Config] CRITICAL SECURITY ERROR: Running in production mode (GIN_MODE=release) without a custom JWT_SECRET! You must set a strong, non-default JWT_SECRET in production.")
	}

	return AppConfig
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
