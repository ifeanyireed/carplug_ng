package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleBuyer      UserRole = "buyer"
	RoleSeller     UserRole = "seller"
	RoleDealer     UserRole = "dealer"
	RoleTechnician UserRole = "technician"
	RoleAdmin      UserRole = "admin"
)

// User represents an authenticated account in the Verza / Carplug ecosystem.
type User struct {
	ID           string         `gorm:"primaryKey;size:64" json:"id"`
	Name         string         `gorm:"size:150;not null" json:"name"`
	Email        string         `gorm:"size:150;uniqueIndex;not null" json:"email"`
	Phone        string         `gorm:"size:50" json:"phone,omitempty"`
	PasswordHash string         `gorm:"size:255;not null" json:"-"` // NEVER exposed in JSON
	Role         string         `gorm:"size:50;default:'buyer';index" json:"role"` // buyer, seller, dealer, technician, admin
	Avatar       string         `gorm:"size:255" json:"avatar,omitempty"`
	IsVerified   bool           `gorm:"default:false" json:"isVerified"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
