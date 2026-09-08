package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetVehicles(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.Vehicle{})

	if makeParam := c.Query("make"); makeParam != "" {
		query = query.Where("make = ?", makeParam)
	}
	if modelParam := c.Query("model"); modelParam != "" {
		query = query.Where("model = ?", modelParam)
	}
	if bodyType := c.Query("bodyType"); bodyType != "" {
		query = query.Where("body_type = ?", bodyType)
	}
	if condition := c.Query("condition"); condition != "" {
		query = query.Where("condition = ?", condition)
	}
	if sellerId := c.Query("sellerId"); sellerId != "" {
		query = query.Where("seller_id = ?", sellerId)
	}
	if featured := c.Query("featured"); featured == "true" {
		query = query.Where("featured = ?", true)
	}
	if minPriceStr := c.Query("minPrice"); minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			query = query.Where("price >= ?", minPrice)
		}
	}
	if maxPriceStr := c.Query("maxPrice"); maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			query = query.Where("price <= ?", maxPrice)
		}
	}
	if q := c.Query("q"); q != "" {
		searchPattern := "%" + q + "%"
		query = query.Where("title LIKE ? OR make LIKE ? OR model LIKE ? OR public_location LIKE ?", searchPattern, searchPattern, searchPattern, searchPattern)
	}

	var vehicles []models.Vehicle
	if err := query.Order("created_at desc").Find(&vehicles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vehicles: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(vehicles),
		"data":  vehicles,
	})
}

func GetVehicleByID(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var vehicle models.Vehicle
	if err := db.First(&vehicle, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	c.JSON(http.StatusOK, vehicle)
}

func CreateVehicle(c *gin.Context) {
	var vehicle models.Vehicle
	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if vehicle.ID == "" {
		vehicle.ID = "v-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}

	db := config.GetDB()
	if err := db.Create(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, vehicle)
}

func UpdateVehicle(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var existing models.Vehicle
	if err := db.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	var updates models.Vehicle
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates.ID = id
	if err := db.Model(&existing).Updates(&updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	if err := db.Delete(&models.Vehicle{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted successfully"})
}
