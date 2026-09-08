package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
)

var startTime = time.Now()

func CheckHealth(c *gin.Context) {
	dbStatus := "connected"
	db := config.GetDB()
	if db != nil {
		sqlDB, err := db.DB()
		if err != nil || sqlDB.Ping() != nil {
			dbStatus = "disconnected"
		}
	} else {
		dbStatus = "uninitialized"
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "ok",
		"service":     "carplug-backend",
		"database":    dbStatus,
		"uptime":      time.Since(startTime).String(),
		"currentTime": time.Now().Format(time.RFC3339),
		"dbHost":      config.AppConfig.DBHost,
		"dbName":      config.AppConfig.DBName,
	})
}
