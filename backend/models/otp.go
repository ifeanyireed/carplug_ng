package models

import "time"

type OTPVerification struct {
	ID        string    `gorm:"primaryKey;size:64" json:"id"`
	Email     string    `gorm:"size:191;index;not null" json:"email"`
	Code      string    `gorm:"size:10;not null" json:"-"` // Never expose in JSON serialization
	Type      string    `gorm:"size:30;index;not null" json:"type"` // "signup" | "password_reset"
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	Attempts  int       `gorm:"default:0" json:"attempts"`
	IsUsed    bool      `gorm:"default:false" json:"isUsed"`
	CreatedAt time.Time `json:"createdAt"`
}
