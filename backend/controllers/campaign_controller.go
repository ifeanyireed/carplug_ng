package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetCampaigns(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.Campaign{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var campaigns []models.Campaign
	if err := query.Order("created_at desc").Find(&campaigns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaigns: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(campaigns), "data": campaigns})
}

func CreateCampaign(c *gin.Context) {
	var camp models.Campaign

	if err := c.ShouldBindJSON(&camp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if camp.ID == "" {
		camp.ID = "camp-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if camp.Status == "" {
		camp.Status = "Active"
	}

	db := config.GetDB()
	if err := db.Create(&camp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create campaign: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, camp)
}

func UpdateCampaignStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	if err := db.Model(&models.Campaign{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update campaign status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign status updated", "id": id, "status": req.Status})
}
