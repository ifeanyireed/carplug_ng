package models

import "time"

type Campaign struct {
	ID                   string    `gorm:"primaryKey;size:64" json:"id"`
	Advertiser           string    `gorm:"size:150;not null" json:"advertiser"`
	Placement            string    `gorm:"size:150;not null" json:"placement"`
	CreativeImage        string    `gorm:"size:255" json:"creativeImage"`
	Budget               float64   `gorm:"type:decimal(12,2)" json:"budget"`
	Dates                string    `gorm:"size:100" json:"dates"`
	ImpressionsDelivered int       `gorm:"default:0" json:"impressionsDelivered"`
	ImpressionGoal       int       `gorm:"default:0" json:"impressionGoal"`
	Clicks               int       `gorm:"default:0" json:"clicks"`
	Status               string    `gorm:"size:50;default:'Active';index" json:"status"`
	TargetCity           string    `gorm:"size:100" json:"targetCity"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}
