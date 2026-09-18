package models

import (
	"time"

	"gorm.io/gorm"
)

type Technician struct {
	ID              string    `gorm:"primaryKey;size:64" json:"id"`
	Name            string    `gorm:"size:150;not null" json:"name"`
	Badge           string    `gorm:"size:100" json:"badge"`
	Avatar          string    `gorm:"size:255" json:"avatar"`
	Rating          float64   `gorm:"type:decimal(3,2);default:5.0" json:"rating"`
	CompletedJobs   int       `gorm:"default:0" json:"completedJobs"`
	ServiceAreas    string    `gorm:"type:json;default:'[]'" json:"serviceAreas"` // JSON encoded string slice
	WorkshopAddress string    `gorm:"size:255" json:"workshopAddress"`
	Specialties     string    `gorm:"type:json;default:'[]'" json:"specialties"` // JSON encoded string slice
	DistanceKm      float64   `gorm:"type:decimal(5,2)" json:"distanceKm,omitempty"`
	Availability    string    `gorm:"size:50" json:"availability"`
	HourlyRate      float64   `gorm:"type:decimal(10,2)" json:"hourlyRate"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

func (t *Technician) BeforeCreate(tx *gorm.DB) error {
	if t.ServiceAreas == "" {
		t.ServiceAreas = "[]"
	}
	if t.Specialties == "" {
		t.Specialties = "[]"
	}
	return nil
}

func (t *Technician) BeforeSave(tx *gorm.DB) error {
	if t.ServiceAreas == "" {
		t.ServiceAreas = "[]"
	}
	if t.Specialties == "" {
		t.Specialties = "[]"
	}
	return nil
}
