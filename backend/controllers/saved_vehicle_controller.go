package controllers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"gorm.io/gorm"
)

// Helper to get authenticated user ID from context
func getUserIDFromContext(c *gin.Context) (string, bool) {
	val, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	id, ok := val.(string)
	return id, ok && id != ""
}

// GetSavedVehicles returns all vehicle records favorited by the authenticated user
func GetSavedVehicles(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required to view saved vehicles"})
		return
	}

	db := config.GetDB()
	var savedItems []models.SavedVehicle

	if err := db.Where("user_id = ?", userID).
		Preload("Vehicle").
		Order("created_at desc").
		Find(&savedItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved vehicles: " + err.Error()})
		return
	}

	vehicles := make([]models.Vehicle, 0, len(savedItems))
	for _, item := range savedItems {
		if item.Vehicle.ID != "" {
			item.Vehicle.SellerPhone = MaskPhone(item.Vehicle.SellerPhone)
			vehicles = append(vehicles, item.Vehicle)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(vehicles),
		"data":  vehicles,
	})
}

// GetSavedVehicleIDs returns an array of vehicle IDs saved by the user
func GetSavedVehicleIDs(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	db := config.GetDB()
	var ids []string

	if err := db.Model(&models.SavedVehicle{}).
		Where("user_id = ?", userID).
		Pluck("vehicle_id", &ids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved IDs: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ids": ids,
	})
}

// SaveVehicle adds a vehicle to the user's saved list
func SaveVehicle(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required to save vehicles"})
		return
	}

	vehicleID := c.Param("vehicleId")
	if vehicleID == "" {
		var req struct {
			VehicleID string `json:"vehicleId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Vehicle ID is required"})
			return
		}
		vehicleID = req.VehicleID
	}

	db := config.GetDB()

	// Verify the vehicle exists
	var vehicle models.Vehicle
	if err := db.Select("id").Where("id = ?", vehicleID).First(&vehicle).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify vehicle: " + err.Error()})
		return
	}

	// Check if already saved (idempotent)
	var existing models.SavedVehicle
	if err := db.Where("user_id = ? AND vehicle_id = ?", userID, vehicleID).First(&existing).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":    "already_saved",
			"vehicleId": vehicleID,
			"isSaved":   true,
		})
		return
	}

	saved := models.SavedVehicle{
		UserID:    userID,
		VehicleID: vehicleID,
		CreatedAt: time.Now(),
	}

	if err := db.Create(&saved).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":    "saved",
		"vehicleId": vehicleID,
		"isSaved":   true,
	})
}

// RemoveSavedVehicle removes a vehicle from the user's saved list
func RemoveSavedVehicle(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	vehicleID := c.Param("vehicleId")
	if vehicleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vehicle ID is required"})
		return
	}

	db := config.GetDB()
	result := db.Where("user_id = ? AND vehicle_id = ?", userID, vehicleID).Delete(&models.SavedVehicle{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove saved vehicle: " + result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "removed",
		"vehicleId": vehicleID,
		"isSaved":   false,
	})
}

// ToggleSavedVehicle flips the saved state for a vehicle
func ToggleSavedVehicle(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required to save vehicles"})
		return
	}

	vehicleID := c.Param("vehicleId")
	if vehicleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vehicle ID is required"})
		return
	}

	db := config.GetDB()

	// Check if already saved
	var existing models.SavedVehicle
	if err := db.Where("user_id = ? AND vehicle_id = ?", userID, vehicleID).First(&existing).Error; err == nil {
		// Found -> remove
		if delErr := db.Delete(&existing).Error; delErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove saved vehicle"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":    "removed",
			"vehicleId": vehicleID,
			"isSaved":   false,
		})
		return
	}

	// Not found -> verify vehicle exists and save
	var vehicle models.Vehicle
	if err := db.Select("id").Where("id = ?", vehicleID).First(&vehicle).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	saved := models.SavedVehicle{
		UserID:    userID,
		VehicleID: vehicleID,
		CreatedAt: time.Now(),
	}

	if err := db.Create(&saved).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "saved",
		"vehicleId": vehicleID,
		"isSaved":   true,
	})
}
