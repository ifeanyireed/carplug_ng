package models

import "time"

type Transaction struct {
	ID        string    `gorm:"primaryKey;size:64" json:"id"`
	Reference string    `gorm:"size:100;uniqueIndex;not null" json:"reference"`
	UserID    string    `gorm:"size:64;index;not null" json:"userId"`
	UserName  string    `gorm:"size:150" json:"userName"`
	UserEmail string    `gorm:"size:150" json:"userEmail"`
	UserRole  string    `gorm:"size:50" json:"userRole"`
	Type      string    `gorm:"size:50;index;not null" json:"type"` // inspection_escrow, dealer_subscription, ad_campaign, tech_payout
	Title     string    `gorm:"size:255" json:"title"`
	EntityID  string    `gorm:"size:64;index" json:"entityId,omitempty"` // vehicleId, inspectionId, dealerId, campId
	Amount    int64     `gorm:"not null" json:"amount"`                  // In NGN
	Currency  string    `gorm:"size:10;default:'NGN'" json:"currency"`
	Gateway   string    `gorm:"size:50;default:'paystack'" json:"gateway"` // paystack, flutterwave, bank_transfer, wallet
	Status    string    `gorm:"size:50;index;not null" json:"status"`      // pending, held_in_escrow, settled, refunded, failed
	Notes     string    `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
