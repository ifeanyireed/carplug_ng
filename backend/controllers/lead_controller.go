package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetLeads(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.Lead{})

	if sellerId := c.Query("sellerId"); sellerId != "" {
		query = query.Where("seller_id = ?", sellerId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if leadType := c.Query("type"); leadType != "" {
		query = query.Where("type = ?", leadType)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "25"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 25
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count leads: " + err.Error()})
		return
	}

	var leads []models.Lead
	if err := query.Order("created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&leads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leads: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count":    len(leads),
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
		"data":     leads,
	})
}

func CreateLead(c *gin.Context) {
	var lead models.Lead
	if err := c.ShouldBindJSON(&lead); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if lead.ID == "" {
		lead.ID = "lead-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if lead.Date == "" {
		lead.Date = time.Now().Format("2006-01-02")
	}
	if lead.Status == "" {
		lead.Status = "new"
	}

	db := config.GetDB()
	if err := db.Create(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lead: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, lead)
}

func UpdateLeadStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validStatuses := map[string]bool{
		"new": true, "routed": true, "contacted": true,
		"completed": true, "cancelled": true,
	}
	if !validStatuses[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status: must be one of new, routed, contacted, completed, cancelled"})
		return
	}

	db := config.GetDB()
	var lead models.Lead
	if err := db.First(&lead, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lead not found"})
		return
	}

	userID := c.GetString("userID")
	role := c.GetString("userRole")
	isOwner := (lead.SellerID == userID)
	if !isOwner && role == "dealer" {
		var dealer models.DealerShop
		if err := db.Where("user_id = ? AND id = ?", userID, lead.SellerID).First(&dealer).Error; err == nil {
			isOwner = true
		}
	}
	if role != "admin" && !isOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to update this lead"})
		return
	}

	var updateErr error
	for attempt := 1; attempt <= 3; attempt++ {
		updateErr = db.Model(&lead).Update("status", req.Status).Error
		if updateErr == nil {
			break
		}
		time.Sleep(300 * time.Millisecond)
	}

	if updateErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update lead status: " + updateErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lead status updated", "id": id, "status": req.Status})
}

