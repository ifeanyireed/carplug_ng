package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
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
	if fuelType := c.Query("fuelType"); fuelType != "" {
		query = query.Where("fuel_type = ?", fuelType)
	}
	if transmission := c.Query("transmission"); transmission != "" {
		query = query.Where("transmission = ?", transmission)
	}
	if yearMinStr := c.Query("yearMin"); yearMinStr != "" {
		if yearMin, err := strconv.Atoi(yearMinStr); err == nil {
			query = query.Where("year >= ?", yearMin)
		}
	} else if minYearStr := c.Query("minYear"); minYearStr != "" {
		if minYear, err := strconv.Atoi(minYearStr); err == nil {
			query = query.Where("year >= ?", minYear)
		}
	}
	if yearMaxStr := c.Query("yearMax"); yearMaxStr != "" {
		if yearMax, err := strconv.Atoi(yearMaxStr); err == nil {
			query = query.Where("year <= ?", yearMax)
		}
	} else if maxYearStr := c.Query("maxYear"); maxYearStr != "" {
		if maxYear, err := strconv.Atoi(maxYearStr); err == nil {
			query = query.Where("year <= ?", maxYear)
		}
	}
	if yearStr := c.Query("year"); yearStr != "" {
		if yr, err := strconv.Atoi(yearStr); err == nil {
			query = query.Where("year = ?", yr)
		}
	}
	if state := c.Query("state"); state != "" {
		query = query.Where("public_location ILIKE ?", "%"+state+"%")
	}
	if condition := c.Query("condition"); condition != "" {
		switch condition {
		case "tokunbo":
			query = query.Where("\"condition\" = ?", "Foreign Used (Tokunbo)")
		case "nigerian_used":
			query = query.Where("\"condition\" = ?", "Nigerian Used")
		case "brand_new":
			query = query.Where("\"condition\" = ?", "Brand New")
		default:
			query = query.Where("\"condition\" = ?", condition)
		}
	}
	if minTierStr := c.Query("minTrustTier"); minTierStr != "" {
		if minTier, err := strconv.Atoi(minTierStr); err == nil {
			query = query.Where("trust_tier >= ?", minTier)
		}
	} else if tierStr := c.Query("trustTier"); tierStr != "" {
		if tier, err := strconv.Atoi(tierStr); err == nil {
			query = query.Where("trust_tier = ?", tier)
		}
	}
	if priceRating := c.Query("priceRating"); priceRating != "" {
		query = query.Where("price_rating = ?", priceRating)
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
		query = query.Where("title ILIKE ? OR make ILIKE ? OR model ILIKE ? OR public_location ILIKE ?", searchPattern, searchPattern, searchPattern, searchPattern)
	}

	orderClause := "created_at desc"
	switch c.Query("sortBy") {
	case "trust":
		orderClause = "trust_tier desc, created_at desc"
	case "price_asc":
		orderClause = "price asc"
	case "price_desc":
		orderClause = "price desc"
	case "featured":
		orderClause = "featured desc, created_at desc"
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "24"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 24
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count vehicles: " + err.Error()})
		return
	}

	var vehicles []models.Vehicle
	if err := query.Order(orderClause).Offset((page - 1) * pageSize).Limit(pageSize).Find(&vehicles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vehicles: " + err.Error()})
		return
	}

	for i := range vehicles {
		vehicles[i].SellerPhone = MaskPhone(vehicles[i].SellerPhone)
	}

	c.JSON(http.StatusOK, gin.H{
		"count":    len(vehicles),
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
		"data":     vehicles,
	})
}

// MaskPhone obscures middle digits for public unauthenticated views (e.g. +234 803 *** **21)
func MaskPhone(phone string) string {
	cleaned := strings.TrimSpace(phone)
	if len(cleaned) < 7 {
		return "+234 80* *** **"
	}
	if strings.HasPrefix(cleaned, "+234") && len(cleaned) >= 13 {
		return cleaned[:8] + " *** **" + cleaned[len(cleaned)-2:]
	}
	if len(cleaned) >= 10 {
		return cleaned[:4] + " *** **" + cleaned[len(cleaned)-2:]
	}
	return cleaned[:3] + " *** " + cleaned[len(cleaned)-2:]
}

func GetVehicleByID(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var vehicle models.Vehicle
	if err := db.First(&vehicle, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	vehicle.SellerPhone = MaskPhone(vehicle.SellerPhone)
	c.JSON(http.StatusOK, vehicle)
}

// CleanNigerianPhone normalizes Nigerian telephone numbers into international digits without '+' (e.g. 2348035004401)
func CleanNigerianPhone(phone string) string {
	digits := ""
	for _, ch := range phone {
		if ch >= '0' && ch <= '9' {
			digits += string(ch)
		}
	}
	if strings.HasPrefix(digits, "0") && len(digits) == 11 {
		return "234" + digits[1:]
	}
	if strings.HasPrefix(digits, "234") {
		return digits
	}
	if len(digits) == 10 {
		return "234" + digits
	}
	if digits == "" {
		return "2348035004401" // Platform concierge fallback
	}
	return digits
}

// GetVehicleContact resolves direct WhatsApp contact and telemetry for a vehicle
func GetVehicleContact(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var vehicle models.Vehicle
	if err := db.First(&vehicle, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	contactPhone := vehicle.SellerPhone

	// If vehicle is from a dealer, look up the verified dealership WhatsApp or phone
	if vehicle.SellerType == "dealer" || strings.HasPrefix(vehicle.SellerID, "dlr-") {
		var dealer models.DealerShop
		if err := db.Where("id = ? OR user_id = ?", vehicle.SellerID, vehicle.SellerID).First(&dealer).Error; err == nil {
			if dealer.Whatsapp != "" {
				contactPhone = dealer.Whatsapp
			} else if dealer.Phone != "" {
				contactPhone = dealer.Phone
			}
		}
	}

	cleanPhone := CleanNigerianPhone(contactPhone)

	// Format price in NGN
	formattedPrice := fmt.Sprintf("%.0f", vehicle.Price)
	prefilledMsg := fmt.Sprintf("Hello %s, I saw your %d %s %s (VIN: %s) listed for ₦%s on Carplug Nigeria. Is it still available for viewing/inspection?",
		vehicle.SellerName, vehicle.Year, vehicle.Make, vehicle.Model, vehicle.VIN, formattedPrice)

	waURL := fmt.Sprintf("https://wa.me/%s?text=%s", cleanPhone, url.QueryEscape(prefilledMsg))

	// Telemetric lead tracking: record whatsapp inquiry lead asynchronously
	go func(veh models.Vehicle, phone string) {
		lead := models.Lead{
			ID:           "lead-wa-" + strconv.FormatInt(time.Now().UnixNano(), 36),
			BuyerName:    "WhatsApp Inquirer",
			BuyerPhone:   "+" + phone,
			VehicleID:    veh.ID,
			VehicleTitle: veh.Title,
			VehiclePrice: veh.Price,
			Type:         "whatsapp_click",
			Status:       "new",
			SellerID:     veh.SellerID,
			Date:         time.Now().Format("2006-01-02"),
			Note:         "Direct WhatsApp deep link clicked on Carplug listing.",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		db.Create(&lead)
	}(vehicle, cleanPhone)

	c.JSON(http.StatusOK, gin.H{
		"status":           "success",
		"vehicleId":        vehicle.ID,
		"vehicleTitle":     vehicle.Title,
		"sellerName":       vehicle.SellerName,
		"sellerType":       vehicle.SellerType,
		"phone":            "+" + cleanPhone,
		"whatsapp":         cleanPhone,
		"whatsappUrl":      waURL,
		"prefilledMessage": prefilledMsg,
	})
}

type CreateVehicleInput struct {
	ID                 string   `json:"id"`
	Title              string   `json:"title"`
	Year               int      `json:"year"`
	Make               string   `json:"make"`
	Model              string   `json:"model"`
	Trim               string   `json:"trim"`
	BodyType           string   `json:"bodyType"`
	Condition          string   `json:"condition"`
	Mileage            int      `json:"mileage"`
	Transmission       string   `json:"transmission"`
	FuelType           string   `json:"fuelType"`
	EngineSize         string   `json:"engineSize"`
	VIN                string   `json:"vin"`
	Price              float64  `json:"price"`
	MarketPriceMin     float64  `json:"marketPriceMin"`
	MarketPriceMax     float64  `json:"marketPriceMax"`
	PriceRating        string   `json:"priceRating"`
	PriceVerdict       string   `json:"priceVerdict"`
	TrustTier          int      `json:"trustTier"`
	TrustTierLabel     string   `json:"trustTierLabel"`
	Images             any      `json:"images"`
	PublicLocation     string   `json:"publicLocation"`
	ExactLocation      string   `json:"exactLocation"`
	SellerID           string   `json:"sellerId"`
	SellerType         string   `json:"sellerType"`
	SellerName         string   `json:"sellerName"`
	SellerPhone        string   `json:"sellerPhone"`
	SellerRating       float64  `json:"sellerRating"`
	CustomsStatus      string   `json:"customsStatus"`
	CustomsDoc         bool     `json:"customsDoc"`
	RegistrationDoc    bool     `json:"registrationDoc"`
	Roadworthiness     bool     `json:"roadworthiness"`
	TintPermit         bool     `json:"tintPermit"`
	PoliceExtracted    bool     `json:"policeExtracted"`
	HealthScore        int      `json:"healthScore"`
	LatestInspectionID string   `json:"latestInspectionId"`
	Featured           bool     `json:"featured"`
}

func CreateVehicle(c *gin.Context) {
	userID := c.GetString("userID")
	userRole := c.GetString("userRole")

	var req CreateVehicleInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	imagesJSON := "[]"
	if req.Images != nil {
		if str, ok := req.Images.(string); ok {
			if str != "" {
				imagesJSON = str
			}
		} else if b, err := json.Marshal(req.Images); err == nil {
			imagesJSON = string(b)
		}
	}

	vehicle := models.Vehicle{
		ID:                 req.ID,
		Title:              req.Title,
		Year:               req.Year,
		Make:               req.Make,
		Model:              req.Model,
		Trim:               req.Trim,
		BodyType:           req.BodyType,
		Condition:          req.Condition,
		Mileage:            req.Mileage,
		Transmission:       req.Transmission,
		FuelType:           req.FuelType,
		EngineSize:         req.EngineSize,
		VIN:                req.VIN,
		Price:              req.Price,
		MarketPriceMin:     req.MarketPriceMin,
		MarketPriceMax:     req.MarketPriceMax,
		PriceRating:        req.PriceRating,
		PriceVerdict:       req.PriceVerdict,
		TrustTier:          req.TrustTier,
		TrustTierLabel:     req.TrustTierLabel,
		Images:             imagesJSON,
		PublicLocation:     req.PublicLocation,
		ExactLocation:      req.ExactLocation,
		SellerID:           req.SellerID,
		SellerType:         req.SellerType,
		SellerName:         req.SellerName,
		SellerPhone:        req.SellerPhone,
		SellerRating:       req.SellerRating,
		CustomsStatus:      req.CustomsStatus,
		CustomsDoc:         req.CustomsDoc,
		RegistrationDoc:    req.RegistrationDoc,
		Roadworthiness:     req.Roadworthiness,
		TintPermit:         req.TintPermit,
		PoliceExtracted:    req.PoliceExtracted,
		HealthScore:        req.HealthScore,
		LatestInspectionID: req.LatestInspectionID,
		Featured:           req.Featured,
	}

	if vehicle.ID == "" {
		vehicle.ID = "v-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}

	db := config.GetDB()

	if userRole == "dealer" {
		vehicle.SellerType = "dealer"
		var shop models.DealerShop
		if err := db.Where("user_id = ? OR id = ?", userID, userID).First(&shop).Error; err == nil {
			if vehicle.SellerID == "" || userRole != "admin" {
				vehicle.SellerID = shop.ID
			}
			if vehicle.SellerName == "" {
				vehicle.SellerName = shop.Name
			}
			if vehicle.SellerPhone == "" && shop.Phone != "" {
				vehicle.SellerPhone = shop.Phone
			}
		} else if userRole != "admin" || vehicle.SellerID == "" {
			vehicle.SellerID = userID
		}
	} else {
		if vehicle.SellerType == "" {
			vehicle.SellerType = "private"
		}
		if userRole != "admin" || vehicle.SellerID == "" {
			vehicle.SellerID = userID
		}
	}

	// Optionally populate seller name / phone from user profile if not provided
	if vehicle.SellerName == "" || vehicle.SellerPhone == "" {
		var user models.User
		if err := db.First(&user, "id = ?", userID).Error; err == nil {
			if vehicle.SellerName == "" {
				vehicle.SellerName = user.Name
			}
			if vehicle.SellerPhone == "" && user.Phone != "" {
				vehicle.SellerPhone = user.Phone
			}
		}
	}

	// Automated Dynamic Valuation & Fair-Price Comps Intelligence
	if vehicle.MarketPriceMin == 0 || vehicle.PriceVerdict == "" || vehicle.PriceRating == "" {
		val := utils.CalculateValuation(db, vehicle.Make, vehicle.Model, vehicle.Year, vehicle.Condition, vehicle.Mileage, vehicle.Price)
		if vehicle.MarketPriceMin == 0 {
			vehicle.MarketPriceMin = val.MarketPriceMin
		}
		if vehicle.MarketPriceMax == 0 {
			vehicle.MarketPriceMax = val.MarketPriceMax
		}
		if vehicle.PriceRating == "" {
			vehicle.PriceRating = val.PriceRating
		}
		if vehicle.PriceVerdict == "" {
			vehicle.PriceVerdict = val.PriceVerdict
		}
	}

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

	userID := c.GetString("userID")
	userRole := c.GetString("userRole")

	// Ownership check: only the listing owner or an admin can modify this vehicle
	isOwner := (existing.SellerID == userID)
	if !isOwner && userRole == "dealer" {
		var dealer models.DealerShop
		if err := db.Where("user_id = ? AND id = ?", userID, existing.SellerID).First(&dealer).Error; err == nil {
			isOwner = true
		}
	}
	if userRole != "admin" && !isOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to modify this vehicle listing"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Never allow primary key or seller ownership to be hijacked via update payload
	delete(updates, "id")
	delete(updates, "ID")
	if userRole != "admin" {
		delete(updates, "sellerId")
		delete(updates, "seller_id")
		delete(updates, "SellerID")
		delete(updates, "sellerType")
		delete(updates, "seller_type")
	}

	if err := db.Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle: " + err.Error()})
		return
	}

	db.First(&existing, "id = ?", id)
	existing.SellerPhone = MaskPhone(existing.SellerPhone)
	c.JSON(http.StatusOK, existing)
}

func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var existing models.Vehicle
	if err := db.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	userID := c.GetString("userID")
	userRole := c.GetString("userRole")

	// Ownership check: only the listing owner or an admin can delete this vehicle
	isOwner := (existing.SellerID == userID)
	if !isOwner && userRole == "dealer" {
		var dealer models.DealerShop
		if err := db.Where("user_id = ? AND id = ?", userID, existing.SellerID).First(&dealer).Error; err == nil {
			isOwner = true
		}
	}
	if userRole != "admin" && !isOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this vehicle listing"})
		return
	}

	if err := db.Delete(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted successfully"})
}
