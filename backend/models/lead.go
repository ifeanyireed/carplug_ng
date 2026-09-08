package models

import "time"

type Lead struct {
	ID           string    `gorm:"primaryKey;size:64" json:"id"`
	BuyerName    string    `gorm:"size:150;not null" json:"buyerName"`
	BuyerPhone   string    `gorm:"size:50;not null" json:"buyerPhone"`
	BuyerCity    string    `gorm:"size:100" json:"buyerCity"`
	VehicleID    string    `gorm:"size:64;index" json:"vehicleId"`
	VehicleTitle string    `gorm:"size:255" json:"vehicleTitle"`
	VehiclePrice float64   `gorm:"type:decimal(15,2)" json:"vehiclePrice"`
	Type         string    `gorm:"size:50;index;not null" json:"type"` // inspection_request, viewing_schedule, direct_inquiry, concierge
	Status       string    `gorm:"size:50;default:'new';index" json:"status"` // new, routed, contacted, completed, cancelled
	SellerID     string    `gorm:"size:64;index" json:"sellerId"`
	TechnicianID string    `gorm:"size:64;index" json:"technicianId,omitempty"`
	Date         string    `gorm:"size:50" json:"date"`
	Note         string    `gorm:"type:text" json:"note,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
