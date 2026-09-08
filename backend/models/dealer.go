package models

import "time"

type DealerShop struct {
	ID                  string    `gorm:"primaryKey;size:64" json:"id"`
	Slug                string    `gorm:"size:100;uniqueIndex;not null" json:"slug"`
	Name                string    `gorm:"size:150;not null" json:"name"`
	Tagline             string    `gorm:"size:255" json:"tagline"`
	Logo                string    `gorm:"size:255" json:"logo"`
	Banner              string    `gorm:"size:255" json:"banner"`
	Location            string    `gorm:"size:100" json:"location"`
	Address             string    `gorm:"size:255" json:"address"`
	Rating              float64   `gorm:"type:decimal(3,2);default:5.0" json:"rating"`
	ReviewCount         int       `gorm:"default:0" json:"reviewCount"`
	VerifiedCAC         bool      `gorm:"default:false" json:"verifiedCAC"`
	Plan                string    `gorm:"size:50;default:'Basic Shop'" json:"plan"`
	ActiveListingsCount int       `gorm:"default:0" json:"activeListingsCount"`
	Phone               string    `gorm:"size:50" json:"phone"`
	Whatsapp            string    `gorm:"size:50" json:"whatsapp"`
	Email               string    `gorm:"size:100" json:"email"`
	OperatingHours      string    `gorm:"size:100" json:"operatingHours"`
	JoinedDate          string    `gorm:"size:50" json:"joinedDate"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}
