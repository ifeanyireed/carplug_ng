package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetDealers(c *gin.Context) {
	db := config.GetDB()
	var dealers []models.DealerShop

	if err := db.Order("rating desc").Find(&dealers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dealers: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(dealers), "data": dealers})
}

func GetDealerBySlugOrID(c *gin.Context) {
	identifier := c.Param("id")
	if identifier == "" {
		identifier = c.Param("slugOrId")
	}
	db := config.GetDB()

	var dealer models.DealerShop
	if err := db.Where("slug = ? OR id = ?", identifier, identifier).First(&dealer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dealer not found"})
		return
	}

	c.JSON(http.StatusOK, dealer)
}

func GetDealerInventory(c *gin.Context) {
	identifier := c.Param("id")
	db := config.GetDB()

	// Try resolving dealer ID if identifier is a slug
	sellerID := identifier
	var dealer models.DealerShop
	if err := db.Select("id").Where("slug = ? OR id = ?", identifier, identifier).First(&dealer).Error; err == nil {
		sellerID = dealer.ID
	}

	var vehicles []models.Vehicle
	if err := db.Where("seller_id = ?", sellerID).Order("created_at desc").Find(&vehicles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dealer inventory: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(vehicles), "data": vehicles})
}

func CreateDealer(c *gin.Context) {
	var dealer models.DealerShop
	if err := c.ShouldBindJSON(&dealer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	if err := db.Create(&dealer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create dealer: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dealer)
}
