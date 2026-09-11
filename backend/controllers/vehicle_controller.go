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
		query = query.Where("public_location LIKE ?", "%"+state+"%")
	}
	if condition := c.Query("condition"); condition != "" {
		switch condition {
		case "tokunbo":
			query = query.Where("`condition` = ?", "Foreign Used (Tokunbo)")
		case "nigerian_used":
			query = query.Where("`condition` = ?", "Nigerian Used")
		case "brand_new":
			query = query.Where("`condition` = ?", "Brand New")
		default:
			query = query.Where("`condition` = ?", condition)
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
		query = query.Where("title LIKE ? OR make LIKE ? OR model LIKE ? OR public_location LIKE ?", searchPattern, searchPattern, searchPattern, searchPattern)
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

func CreateVehicle(c *gin.Context) {
	userID := c.GetString("userID")
	userRole := c.GetString("userRole")

	var vehicle models.Vehicle
	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if vehicle.ID == "" {
		vehicle.ID = "v-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if vehicle.Images == "" {
		vehicle.Images = "[]"
	}

	// Attribution: non-admins cannot impersonate other seller IDs
	if userRole != "admin" || vehicle.SellerID == "" {
		vehicle.SellerID = userID
	}

	if vehicle.SellerType == "" {
		if userRole == "dealer" {
			vehicle.SellerType = "dealer"
		} else {
			vehicle.SellerType = "private"
		}
	}

	db := config.GetDB()
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
