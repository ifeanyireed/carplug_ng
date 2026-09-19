package controllers

import (
	"fmt"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetLeads(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.Lead{})

	sellerId := c.Query("sellerId")
	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")
	userID, _ := userIDVal.(string)
	userRole, _ := userRoleVal.(string)

	if sellerId != "" {
		var dealer models.DealerShop
		if err := db.Where("id = ? OR user_id = ? OR slug = ?", sellerId, sellerId, sellerId).First(&dealer).Error; err == nil {
			query = query.Where("seller_id = ? OR seller_id = ?", dealer.ID, dealer.UserID)
		} else {
			query = query.Where("seller_id = ?", sellerId)
		}
	} else if userRole == "dealer" {
		var dealer models.DealerShop
		if err := db.Where("user_id = ? OR id = ?", userID, userID).First(&dealer).Error; err == nil {
			query = query.Where("seller_id = ? OR seller_id = ?", dealer.ID, dealer.UserID)
		} else {
			query = query.Where("seller_id = ?", userID)
		}
	} else if userRole == "seller" {
		query = query.Where("seller_id = ?", userID)
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

	// Normalize seller ID and auto-fill vehicle details if provided
	if lead.VehicleID != "" && (lead.SellerID == "" || lead.VehicleTitle == "" || lead.VehiclePrice == 0) {
		var veh models.Vehicle
		if err := db.First(&veh, "id = ?", lead.VehicleID).Error; err == nil {
			if lead.SellerID == "" {
				lead.SellerID = veh.SellerID
			}
			if lead.VehicleTitle == "" {
				lead.VehicleTitle = veh.Title
			}
			if lead.VehiclePrice == 0 {
				lead.VehiclePrice = veh.Price
			}
		}
	}

	if lead.SellerID != "" {
		var dealer models.DealerShop
		if err := db.Where("slug = ? OR id = ? OR user_id = ?", lead.SellerID, lead.SellerID, lead.SellerID).First(&dealer).Error; err == nil {
			lead.SellerID = dealer.ID
		}
	}

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

type ConciergeMatchRequest struct {
	MakeModel   string  `json:"makeModel"`
	BudgetNaira float64 `json:"budgetNaira"`
	Condition   string  `json:"condition"`
	City        string  `json:"city"`
}

type ConciergeMatchedVehicle struct {
	models.Vehicle
	MatchScore  int    `json:"matchScore"`
	MatchReason string `json:"matchReason"`
}

// MatchConciergeInventory ranks existing verified inventory against a buyer's concierge brief
func MatchConciergeInventory(c *gin.Context) {
	var req ConciergeMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	db := config.GetDB()
	var candidates []models.Vehicle
	query := db.Model(&models.Vehicle{})

	cleanMM := strings.TrimSpace(req.MakeModel)
	if cleanMM != "" {
		tokens := strings.Fields(cleanMM)
		for _, token := range tokens {
			like := "%" + strings.ToLower(token) + "%"
			query = query.Where("LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(title) LIKE ?", like, like, like)
		}
	}

	if req.BudgetNaira > 0 {
		minBudget := req.BudgetNaira * 0.65
		maxBudget := req.BudgetNaira * 1.35
		query = query.Where("price >= ? AND price <= ?", minBudget, maxBudget)
	}

	if err := query.Limit(12).Find(&candidates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query matching inventory: " + err.Error()})
		return
	}

	var matches []ConciergeMatchedVehicle
	for _, v := range candidates {
		score := 70
		var reasons []string

		// Budget closeness
		if req.BudgetNaira > 0 {
			diff := math.Abs(v.Price - req.BudgetNaira)
			pctDiff := diff / req.BudgetNaira
			if pctDiff <= 0.05 {
				score += 20
				reasons = append(reasons, "Exact budget match (within 5%)")
			} else if pctDiff <= 0.15 {
				score += 12
				reasons = append(reasons, "Close budget match (within 15%)")
			} else {
				score += 5
				reasons = append(reasons, "Within target budget range")
			}
		}

		// Condition match
		if req.Condition != "" && strings.EqualFold(v.Condition, req.Condition) {
			score += 10
			reasons = append(reasons, fmt.Sprintf("Matches condition (%s)", v.Condition))
		}

		// Trust Tier bonus
		if v.TrustTier >= 4 {
			score += 5
			reasons = append(reasons, "150-Point Certified vehicle")
		}

		if score > 99 {
			score = 99
		}

		matches = append(matches, ConciergeMatchedVehicle{
			Vehicle:     v,
			MatchScore:  score,
			MatchReason: strings.Join(reasons, " • "),
		})
	}

	// Sort highest match first
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].MatchScore > matches[j].MatchScore
	})

	c.JSON(http.StatusOK, gin.H{
		"count":   len(matches),
		"matches": matches,
	})
}


