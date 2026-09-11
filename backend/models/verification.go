package models

import "time"

type Verification struct {
	ID          string     `gorm:"primaryKey;size:64" json:"id"`
	UserID      string     `gorm:"size:64;index;not null" json:"userId"`
	EntityType  string     `gorm:"size:50;index;not null" json:"entityType"` // customs_sgd, seller_nin, tech_license, dealer_cac
	EntityID    string     `gorm:"size:64;index" json:"entityId"`            // vehicle ID, user ID, or dealer ID
	DocumentURL string     `gorm:"size:500;not null" json:"documentUrl"`
	VIN         string     `gorm:"size:50;index" json:"vin,omitempty"`
	Status      string     `gorm:"size:50;default:'pending';index" json:"status"` // pending, approved, rejected
	Notes       string     `gorm:"type:text" json:"notes,omitempty"`
	ReviewedBy  string     `gorm:"size:64" json:"reviewedBy,omitempty"`
	ReviewedAt  *time.Time `json:"reviewedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
