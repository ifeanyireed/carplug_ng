package models

import "time"

type Vehicle struct {
	ID                 string    `gorm:"primaryKey;size:64" json:"id"`
	Title              string    `gorm:"size:255;not null" json:"title"`
	Year               int       `gorm:"not null" json:"year"`
	Make               string    `gorm:"size:100;index;not null" json:"make"`
	Model              string    `gorm:"size:100;index;not null" json:"model"`
	Trim               string    `gorm:"size:100" json:"trim,omitempty"`
	BodyType           string    `gorm:"size:50;index;not null" json:"bodyType"`
	Condition          string    `gorm:"size:50;index;not null" json:"condition"`
	Mileage            int       `gorm:"not null" json:"mileage"`
	Transmission       string    `gorm:"size:50;not null" json:"transmission"`
	FuelType           string    `gorm:"size:50;not null" json:"fuelType"`
	EngineSize         string    `gorm:"size:50" json:"engineSize"`
	VIN                string    `gorm:"size:50;uniqueIndex;not null" json:"vin"`
	Price              float64   `gorm:"type:decimal(15,2);index;not null" json:"price"`
	MarketPriceMin     float64   `gorm:"type:decimal(15,2)" json:"marketPriceMin"`
	MarketPriceMax     float64   `gorm:"type:decimal(15,2)" json:"marketPriceMax"`
	PriceRating        string    `gorm:"size:50" json:"priceRating"`
	PriceVerdict       string    `gorm:"type:text" json:"priceVerdict"`
	TrustTier          int       `gorm:"default:1;index" json:"trustTier"`
	TrustTierLabel     string    `gorm:"size:100" json:"trustTierLabel"`
	Images             string    `gorm:"type:json" json:"images"` // JSON encoded string slice
	PublicLocation     string    `gorm:"size:150" json:"publicLocation"`
	ExactLocation      string    `gorm:"size:255" json:"exactLocation,omitempty"`
	SellerID           string    `gorm:"size:64;index" json:"sellerId"`
	SellerType         string    `gorm:"size:50" json:"sellerType"`
	SellerName         string    `gorm:"size:150" json:"sellerName"`
	SellerPhone        string    `gorm:"size:50" json:"sellerPhone"`
	SellerRating       float64   `gorm:"type:decimal(3,2)" json:"sellerRating"`
	CustomsStatus      string    `gorm:"size:100" json:"customsStatus"`
	CustomsDoc         bool      `gorm:"default:false" json:"customsDoc"`
	RegistrationDoc    bool      `gorm:"default:false" json:"registrationDoc"`
	Roadworthiness     bool      `gorm:"default:false" json:"roadworthiness"`
	TintPermit         bool      `gorm:"default:false" json:"tintPermit"`
	PoliceExtracted    bool      `gorm:"default:false" json:"policeExtracted"`
	HealthScore        int       `gorm:"default:0" json:"healthScore"`
	LatestInspectionID string    `gorm:"size:64" json:"latestInspectionId,omitempty"`
	Featured           bool      `gorm:"default:false;index" json:"featured"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}
