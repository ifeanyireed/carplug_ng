package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
)

var startTime = time.Now()

func CheckHealth(c *gin.Context) {
	dbStatus := "connected"
	var dbErr string
	db := config.GetDB()
	if db != nil {
		sqlDB, err := db.DB()
		if err != nil {
			dbStatus = "disconnected"
			dbErr = err.Error()
		} else if pingErr := sqlDB.Ping(); pingErr != nil {
			dbStatus = "disconnected"
			dbErr = pingErr.Error()
		}
	} else {
		dbStatus = "uninitialized"
	}

	resp := gin.H{
		"status":      "ok",
		"service":     "carplug-backend",
		"database":    dbStatus,
		"uptime":      time.Since(startTime).String(),
		"currentTime": time.Now().Format(time.RFC3339),
	}

	// Only expose internal infrastructure details if DEBUG_HEALTH=true is explicitly enabled
	if os.Getenv("DEBUG_HEALTH") == "true" {
		if config.AppConfig != nil {
			resp["dbHost"] = config.AppConfig.DBHost
			resp["dbName"] = config.AppConfig.DBName
		}
		if dbErr != "" {
			resp["dbError"] = dbErr
		}
	}

	c.JSON(http.StatusOK, resp)
}
