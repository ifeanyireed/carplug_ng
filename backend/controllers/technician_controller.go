package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetTechnicians(c *gin.Context) {
	db := config.GetDB()
	var technicians []models.Technician

	if err := db.Order("rating desc").Find(&technicians).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch technicians: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(technicians), "data": technicians})
}

func GetTechnicianByID(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var tech models.Technician
	if err := db.First(&tech, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Technician not found"})
		return
	}

	c.JSON(http.StatusOK, tech)
}
