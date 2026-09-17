package models

import (
	"time"
)

type SavedVehicle struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    string    `gorm:"size:64;not null;index:idx_user_vehicle,unique" json:"userId"`
	VehicleID string    `gorm:"size:64;not null;index:idx_user_vehicle,unique" json:"vehicleId"`
	CreatedAt time.Time `json:"createdAt"`

	// Associations
	User    User    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Vehicle Vehicle `gorm:"foreignKey:VehicleID;references:ID;constraint:OnDelete:CASCADE" json:"vehicle,omitempty"`
}
