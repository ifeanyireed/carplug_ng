package models

import "time"

type Subscription struct {
	ID            string    `gorm:"primaryKey;size:64" json:"id"`
	DealerID      string    `gorm:"size:64;index;not null" json:"dealerId"`
	Plan          string    `gorm:"size:50;not null;default:'Basic Shop'" json:"plan"` // "Basic Shop", "Pro Shop", "Premium Shop"
	Status        string    `gorm:"size:50;default:'active';index" json:"status"`      // "active", "expired", "grace_period"
	BillingCycle  string    `gorm:"size:50;default:'monthly'" json:"billingCycle"`
	ListingsLimit int       `gorm:"default:15" json:"listingsLimit"`
	Price         float64   `gorm:"type:decimal(12,2)" json:"price"`
	ExpiresAt     time.Time `json:"expiresAt"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
