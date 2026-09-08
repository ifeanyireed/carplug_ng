package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetSwaps(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.SwapRequest{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var swaps []models.SwapRequest
	if err := query.Order("created_at desc").Find(&swaps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch swaps: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(swaps), "data": swaps})
}

func CreateSwap(c *gin.Context) {
	var swap models.SwapRequest
	if err := c.ShouldBindJSON(&swap); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if swap.ID == "" {
		swap.ID = "swap-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if swap.Status == "" {
		swap.Status = "Pending Audit"
	}
	if swap.NetTopUp == 0 && swap.TargetCarPrice > 0 {
		swap.NetTopUp = swap.TargetCarPrice - swap.AppraisedEquity - swap.PlatformDiscount
	}

	db := config.GetDB()
	if err := db.Create(&swap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create swap request: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, swap)
}

func UpdateSwapStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	if err := db.Model(&models.SwapRequest{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update swap status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Swap status updated", "id": id, "status": req.Status})
}
