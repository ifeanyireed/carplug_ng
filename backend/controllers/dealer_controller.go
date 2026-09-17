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

	for i := range vehicles {
		vehicles[i].SellerPhone = MaskPhone(vehicles[i].SellerPhone)
	}

	c.JSON(http.StatusOK, gin.H{"count": len(vehicles), "data": vehicles})
}

func CreateDealer(c *gin.Context) {
	var dealer models.DealerShop
	if err := c.ShouldBindJSON(&dealer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("userID")
	if uid, ok := userIDVal.(string); ok && uid != "" {
		if dealer.UserID == "" {
			dealer.UserID = uid
		}
	}

	if dealer.ID == "" {
		dealer.ID = "dlr-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if dealer.Slug == "" {
		slugBase := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(dealer.Name), " ", "-"))
		dealer.Slug = slugBase + "-" + strconv.FormatInt(time.Now().Unix()%10000, 10)
	}
	if dealer.JoinedDate == "" {
		dealer.JoinedDate = time.Now().Format("Jan 2006")
	}

	db := config.GetDB()
	if err := db.Create(&dealer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create dealer: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dealer)
}

type UpdateDealerInput struct {
	Name           string `json:"name"`
	Tagline        string `json:"tagline"`
	Logo           string `json:"logo"`
	Banner         string `json:"banner"`
	Location       string `json:"location"`
	Address        string `json:"address"`
	Phone          string `json:"phone"`
	Whatsapp       string `json:"whatsapp"`
	Email          string `json:"email"`
	OperatingHours string `json:"operatingHours"`
}

// UpdateDealer updates storefront settings for the authenticated dealer
func UpdateDealer(c *gin.Context) {
	identifier := c.Param("id")
	db := config.GetDB()

	var dealer models.DealerShop
	if err := db.Where("id = ? OR slug = ? OR user_id = ?", identifier, identifier, identifier).First(&dealer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dealer shop not found"})
		return
	}

	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")
	userID, _ := userIDVal.(string)
	userRole, _ := userRoleVal.(string)

	// Ownership security: Only the dealer who owns this shop (or an admin) can update it
	if userRole != "admin" {
		if dealer.UserID != "" && dealer.UserID != userID && dealer.ID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not authorized to update this dealership storefront"})
			return
		}
		if dealer.UserID == "" {
			dealer.UserID = userID
		}
	}

	var req UpdateDealerInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		dealer.Name = req.Name
	}
	if req.Tagline != "" {
		dealer.Tagline = req.Tagline
	}
	if req.Logo != "" {
		dealer.Logo = req.Logo
	}
	if req.Banner != "" {
		dealer.Banner = req.Banner
	}
	if req.Location != "" {
		dealer.Location = req.Location
	}
	if req.Address != "" {
		dealer.Address = req.Address
	}
	if req.Phone != "" {
		dealer.Phone = req.Phone
	}
	if req.Whatsapp != "" {
		dealer.Whatsapp = req.Whatsapp
	}
	if req.Email != "" {
		dealer.Email = req.Email
	}
	if req.OperatingHours != "" {
		dealer.OperatingHours = req.OperatingHours
	}
	dealer.UpdatedAt = time.Now()

	if err := db.Save(&dealer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update dealer shop: " + err.Error()})
		return
	}

	// Synchronize dealer contact updates to their active vehicle listings
	if dealer.ID != "" {
		_ = db.Model(&models.Vehicle{}).Where("seller_id = ?", dealer.ID).Updates(map[string]interface{}{
			"seller_name":  dealer.Name,
			"seller_phone": dealer.Phone,
		}).Error
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Dealer shop storefront updated successfully",
		"data":    dealer,
	})
}

// GetDealerMeShop retrieves or auto-provisions the authenticated dealer's shop profile
func GetDealerMeShop(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	db := config.GetDB()
	var dealer models.DealerShop

	// Find shop associated with this user ID
	if err := db.Where("user_id = ? OR id = ?", userID, userID).First(&dealer).Error; err != nil {
		// Auto-provision initial storefront from user profile
		var u models.User
		if userErr := db.First(&u, "id = ?", userID).Error; userErr == nil {
			shopName := u.Name
			if shopName == "" {
				shopName = "Premier Dealership"
			}
			slugPart := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(shopName), " ", "-"))
			if len(slugPart) > 20 {
				slugPart = slugPart[:20]
			}
			name := shopName
			if !strings.HasSuffix(strings.ToLower(name), "motors") && !strings.HasSuffix(strings.ToLower(name), "cars") && !strings.HasSuffix(strings.ToLower(name), "auto") {
				name = name + " Motors"
			}
			dealer = models.DealerShop{
				ID:             "dlr-" + userID,
				UserID:         userID,
				Slug:           slugPart + "-" + strconv.FormatInt(time.Now().Unix()%10000, 10),
				Name:           name,
				Tagline:        "Verified Automotive Dealership",
				Location:       "Lagos, Nigeria",
				Address:        "Showroom Plaza, Lagos",
				Phone:          u.Phone,
				Whatsapp:       u.Phone,
				Email:          u.Email,
				Plan:           "Basic Shop",
				OperatingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
				JoinedDate:     time.Now().Format("Jan 2006"),
			}
			if err := db.Create(&dealer).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to auto-provision dealer storefront: " + err.Error()})
				return
			}
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Dealership profile not found"})
			return
		}
	}

	c.JSON(http.StatusOK, dealer)
}

// GetDealerSubscription returns current plan limits, active quota, and expiry date
func GetDealerSubscription(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	db := config.GetDB()
	var dealer models.DealerShop
	_ = db.Where("user_id = ? OR id = ?", userID, userID).First(&dealer).Error

	dealerID := dealer.ID
	if dealerID == "" {
		dealerID = userID
	}

	var sub models.Subscription
	if err := db.Where("dealer_id = ?", dealerID).First(&sub).Error; err != nil {
		// Auto-initialize active subscription
		plan := dealer.Plan
		if plan == "" {
			plan = "Pro Shop"
		}
		limit := 60
		price := 65000.0
		if strings.Contains(strings.ToLower(plan), "basic") {
			limit = 15
			price = 25000.0
		} else if strings.Contains(strings.ToLower(plan), "premium") {
			limit = 9999
			price = 150000.0
		}

		sub = models.Subscription{
			ID:            "sub-" + strconv.FormatInt(time.Now().UnixNano(), 36),
			DealerID:      dealerID,
			Plan:          plan,
			Status:        "active",
			BillingCycle:  "monthly",
			ListingsLimit: limit,
			Price:         price,
			ExpiresAt:     time.Now().AddDate(0, 1, 0),
		}
		_ = db.Create(&sub).Error
	}

	var activeCount int64
	db.Model(&models.Vehicle{}).Where("seller_id = ?", dealerID).Count(&activeCount)

	daysRemaining := int(time.Until(sub.ExpiresAt).Hours() / 24)
	if daysRemaining < 0 {
		daysRemaining = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"subscription":        sub,
		"activeListingsCount": activeCount,
		"listingsLimit":       sub.ListingsLimit,
		"daysRemaining":       daysRemaining,
	})
}

type UpgradeSubscriptionInput struct {
	Plan string `json:"plan" binding:"required"`
}

// UpgradeDealerSubscription processes plan tier upgrades
func UpgradeDealerSubscription(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	var req UpgradeSubscriptionInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	var dealer models.DealerShop
	_ = db.Where("user_id = ? OR id = ?", userID, userID).First(&dealer).Error

	dealerID := dealer.ID
	if dealerID == "" {
		dealerID = userID
	}

	// Normalize plan selection
	planNormalized := strings.ToLower(strings.TrimSpace(req.Plan))
	var planName string
	var limit int
	var price float64

	switch {
	case strings.Contains(planNormalized, "basic"):
		planName = "Basic Shop"
		limit = 15
		price = 25000.0
	case strings.Contains(planNormalized, "premium") || strings.Contains(planNormalized, "enterprise"):
		planName = "Premium Shop"
		limit = 9999
		price = 150000.0
	default:
		planName = "Pro Shop"
		limit = 60
		price = 65000.0
	}

	var sub models.Subscription
	if err := db.Where("dealer_id = ?", dealerID).First(&sub).Error; err != nil {
		sub = models.Subscription{
			ID:            "sub-" + strconv.FormatInt(time.Now().UnixNano(), 36),
			DealerID:      dealerID,
			Plan:          planName,
			Status:        "active",
			BillingCycle:  "monthly",
			ListingsLimit: limit,
			Price:         price,
			ExpiresAt:     time.Now().AddDate(0, 1, 0),
		}
		if err := db.Create(&sub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription: " + err.Error()})
			return
		}
	} else {
		sub.Plan = planName
		sub.ListingsLimit = limit
		sub.Price = price
		sub.Status = "active"
		sub.ExpiresAt = time.Now().AddDate(0, 1, 0)
		sub.UpdatedAt = time.Now()
		if err := db.Save(&sub).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subscription: " + err.Error()})
			return
		}
	}

	// Update plan in dealer_shops table as well
	if dealer.ID != "" {
		_ = db.Model(&models.DealerShop{}).Where("id = ?", dealer.ID).Update("plan", planName).Error
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Subscription upgraded to " + planName + " successfully",
		"subscription": sub,
	})
}

