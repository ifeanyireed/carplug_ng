package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

type SubmitVerificationInput struct {
	EntityType  string `json:"entityType" binding:"required"` // customs_sgd, seller_nin, tech_license, dealer_cac
	EntityID    string `json:"entityId"`
	DocumentURL string `json:"documentUrl" binding:"required"`
	VIN         string `json:"vin"`
	Notes       string `json:"notes"`
}

// SubmitVerification records a compliance document submission
func SubmitVerification(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	var req SubmitVerificationInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entityType := strings.ToLower(strings.TrimSpace(req.EntityType))
	validTypes := map[string]bool{
		"customs_sgd":  true,
		"seller_nin":   true,
		"tech_license": true,
		"dealer_cac":   true,
	}
	if !validTypes[entityType] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid entityType. Allowed values: customs_sgd, seller_nin, tech_license, dealer_cac",
		})
		return
	}

	entityID := strings.TrimSpace(req.EntityID)
	if entityID == "" {
		entityID = userID
	}

	db := config.GetDB()

	// If dealer CAC and entityID wasn't given, try resolving dealer shop ID
	if entityType == "dealer_cac" && entityID == userID {
		var shop models.DealerShop
		if err := db.Where("user_id = ? OR id = ?", userID, userID).First(&shop).Error; err == nil {
			entityID = shop.ID
		}
	}

	verification := models.Verification{
		ID:          "ver-" + strconv.FormatInt(time.Now().UnixNano(), 36),
		UserID:      userID,
		EntityType:  entityType,
		EntityID:    entityID,
		DocumentURL: req.DocumentURL,
		VIN:         strings.ToUpper(strings.TrimSpace(req.VIN)),
		Status:      "pending",
		Notes:       req.Notes,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&verification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record verification submission: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Verification document submitted successfully and queued for review",
		"data":    verification,
	})
}

// GetMyVerifications lists the authenticated user's own verification document submissions
func GetMyVerifications(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	db := config.GetDB()
	query := db.Model(&models.Verification{}).Where("user_id = ?", userID)

	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if entityType := c.Query("entityType"); entityType != "" && entityType != "all" {
		query = query.Where("entity_type = ?", entityType)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count verifications: " + err.Error()})
		return
	}

	var list []models.Verification
	if err := query.Order("created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query verifications: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
		"data":     list,
	})
}

// GetVerifications lists pending, approved, or rejected verifications for the admin compliance queue
func GetVerifications(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.Verification{})

	if filterUser := c.Query("userId"); filterUser != "" {
		query = query.Where("user_id = ?", filterUser)
	}

	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if entityType := c.Query("entityType"); entityType != "" && entityType != "all" {
		query = query.Where("entity_type = ?", entityType)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count verifications: " + err.Error()})
		return
	}

	var list []models.Verification
	if err := query.Order("created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query verifications: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
		"data":     list,
	})
}

type UpdateVerificationStatusInput struct {
	Status string `json:"status" binding:"required"` // approved, rejected
	Notes  string `json:"notes"`
}

// UpdateVerificationStatus processes admin audits on verification requests
func UpdateVerificationStatus(c *gin.Context) {
	id := c.Param("id")
	adminIDVal, _ := c.Get("userID")
	adminID, _ := adminIDVal.(string)

	var req UpdateVerificationStatusInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status != "approved" && status != "rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status must be 'approved' or 'rejected'"})
		return
	}

	db := config.GetDB()
	var verification models.Verification
	if err := db.First(&verification, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Verification request not found"})
		return
	}

	now := time.Now()
	verification.Status = status
	verification.ReviewedBy = adminID
	verification.ReviewedAt = &now
	if req.Notes != "" {
		verification.Notes = req.Notes
	}
	verification.UpdatedAt = now

	if err := db.Save(&verification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification: " + err.Error()})
		return
	}

	// Automated compliance actions on approval
	if status == "approved" {
		switch verification.EntityType {
		case "customs_sgd":
			// Upgrade vehicle listing customs clearance and trust tier
			var vehicle models.Vehicle
			query := db.Where("1 = 0")
			if verification.VIN != "" {
				query = db.Where("vin = ?", verification.VIN)
			}
			if verification.EntityID != "" && verification.EntityID != verification.UserID {
				if verification.VIN != "" {
					query = db.Where("vin = ? OR id = ?", verification.VIN, verification.EntityID)
				} else {
					query = db.Where("id = ?", verification.EntityID)
				}
			}

			if err := query.First(&vehicle).Error; err == nil {
				vehicle.CustomsDoc = true
				vehicle.CustomsStatus = "Fully Cleared"
				if vehicle.TrustTier < 3 {
					vehicle.TrustTier = 3
					vehicle.TrustTierLabel = "Tier 3: Customs SGD Verified"
				}
				_ = db.Save(&vehicle).Error
			}

		case "tech_license":
			// Upgrade technician's verification badge
			var tech models.Technician
			if err := db.Where("id = ?", verification.EntityID).First(&tech).Error; err == nil {
				tech.Badge = "Master Technician • State Certified"
				_ = db.Save(&tech).Error
			}

		case "dealer_cac":
			// Upgrade dealer showroom to CAC Verified (Priority 1)
			var shop models.DealerShop
			if err := db.Where("id = ? OR user_id = ?", verification.EntityID, verification.UserID).First(&shop).Error; err == nil {
				shop.VerifiedCAC = true
				_ = db.Save(&shop).Error
			}

		case "seller_nin":
			// Upgrade private seller account to National Identity Verified (Priority 1)
			var user models.User
			if err := db.Where("id = ?", verification.UserID).First(&user).Error; err == nil {
				user.IsVerified = true
				_ = db.Save(&user).Error
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification status updated successfully",
		"data":    verification,
	})
}
