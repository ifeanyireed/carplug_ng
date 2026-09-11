package models

import (
	"time"

	"gorm.io/gorm"
)

// Conversation represents a direct communication thread between a buyer and a seller/dealer regarding a vehicle listing.
type Conversation struct {
	ID            string         `gorm:"primaryKey;size:64" json:"id"`
	VehicleID     string         `gorm:"size:64;not null;index:idx_conv_vehicle" json:"vehicleId"`
	BuyerID       string         `gorm:"size:64;not null;index:idx_conv_buyer" json:"buyerId"`
	SellerID      string         `gorm:"size:64;not null;index:idx_conv_seller" json:"sellerId"`
	DealerID      string         `gorm:"size:64" json:"dealerId,omitempty"`
	LastMessage   string         `gorm:"type:text" json:"lastMessage"`
	LastMessageAt *time.Time     `gorm:"index" json:"lastMessageAt"`
	VehicleTitle  string         `gorm:"size:255" json:"vehicleTitle"`
	VehicleImage  string         `gorm:"size:500" json:"vehicleImage"`
	VehiclePrice  float64        `gorm:"type:decimal(15,2)" json:"vehiclePrice"`
	BuyerName     string         `gorm:"size:150" json:"buyerName"`
	SellerName    string         `gorm:"size:150" json:"sellerName"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Non-persisted computed fields for API responses
	UnreadCount int `gorm:"-" json:"unreadCount"`
}

// Message represents an individual text communication within a Conversation thread.
type Message struct {
	ID             string         `gorm:"primaryKey;size:64" json:"id"`
	ConversationID string         `gorm:"size:64;not null;index:idx_msg_conv" json:"conversationId"`
	SenderID       string         `gorm:"size:64;not null;index:idx_msg_sender" json:"senderId"`
	SenderName     string         `gorm:"size:150" json:"senderName"`
	SenderRole     string         `gorm:"size:50" json:"senderRole"`
	Body           string         `gorm:"type:text;not null" json:"body"`
	ReadAt         *time.Time     `gorm:"index" json:"readAt"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
