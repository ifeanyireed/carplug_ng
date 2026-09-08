package models

import "time"

type SwapRequest struct {
	ID               string    `gorm:"primaryKey;size:64" json:"id"`
	CustomerName     string    `gorm:"size:150;not null" json:"customerName"`
	CustomerPhone    string    `gorm:"size:50;not null" json:"customerPhone"`
	CurrentCar       string    `gorm:"size:255;not null" json:"currentCar"`
	CurrentCarImage  string    `gorm:"size:255" json:"currentCarImage"`
	AppraisedEquity  float64   `gorm:"type:decimal(15,2)" json:"appraisedEquity"`
	TargetCar        string    `gorm:"size:255;not null" json:"targetCar"`
	TargetCarPrice   float64   `gorm:"type:decimal(15,2)" json:"targetCarPrice"`
	PlatformDiscount float64   `gorm:"type:decimal(15,2)" json:"platformDiscount"`
	NetTopUp         float64   `gorm:"type:decimal(15,2)" json:"netTopUp"`
	Status           string    `gorm:"size:50;default:'Pending Audit';index" json:"status"`
	ScheduledDate    string    `gorm:"size:50" json:"scheduledDate"`
	AssignedTech     string    `gorm:"size:150" json:"assignedTech"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}
