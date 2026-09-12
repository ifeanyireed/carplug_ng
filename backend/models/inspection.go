package models

import "time"

type InspectionReport struct {
	ID                string    `gorm:"primaryKey;size:64" json:"id"`
	VehicleID         string    `gorm:"size:64;index;not null" json:"vehicleId"`
	VehicleTitle      string    `gorm:"size:255" json:"vehicleTitle"`
	VehicleVIN        string    `gorm:"size:50" json:"vehicleVin"`
	BuyerID             string    `gorm:"size:64;index" json:"buyerId"`
	EscrowTransactionID string    `gorm:"size:64;index" json:"escrowTransactionId,omitempty"`
	TechnicianID        string    `gorm:"size:64;index" json:"technicianId"`

	TechnicianName    string    `gorm:"size:150" json:"technicianName"`
	TechnicianAvatar  string    `gorm:"size:255" json:"technicianAvatar,omitempty"`
	TechnicianPhone   string    `gorm:"size:50" json:"technicianPhone"`
	TechnicianTier    string    `gorm:"size:100" json:"technicianTier"`
	InspectionTier    string    `gorm:"size:50;not null" json:"inspectionTier"`
	Status            string    `gorm:"size:50;default:'requested';index" json:"status"`
	ScheduledDate     string    `gorm:"size:50" json:"scheduledDate"`
	CompletedDate     string    `gorm:"size:50" json:"completedDate,omitempty"`
	OverallScore      int       `gorm:"default:0" json:"overallScore"`
	Categories        string    `gorm:"type:json" json:"categories"` // JSON categories breakdown
	TechnicianSummary string    `gorm:"type:text" json:"technicianSummary"`
	RepairCostMin     float64   `gorm:"type:decimal(12,2)" json:"repairCostMin,omitempty"`
	RepairCostMax     float64   `gorm:"type:decimal(12,2)" json:"repairCostMax,omitempty"`
	Media             string    `gorm:"type:json" json:"media"` // JSON encoded media items
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}
