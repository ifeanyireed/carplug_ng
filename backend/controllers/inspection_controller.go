package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func GetInspections(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.InspectionReport{})

	if vehicleId := c.Query("vehicleId"); vehicleId != "" {
		query = query.Where("vehicle_id = ?", vehicleId)
	}
	if techId := c.Query("technicianId"); techId != "" {
		query = query.Where("technician_id = ?", techId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var reports []models.InspectionReport
	if err := query.Order("created_at desc").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inspections: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(reports), "data": reports})
}

func GetInspectionByID(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var report models.InspectionReport
	if err := db.First(&report, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inspection report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

func CreateInspection(c *gin.Context) {
	var report models.InspectionReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if report.ID == "" {
		report.ID = "insp-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if report.Status == "" {
		report.Status = "requested"
	}

	db := config.GetDB()
	if err := db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create inspection: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, report)
}

func UpdateInspectionStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	if err := db.Model(&models.InspectionReport{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully", "id": id, "status": req.Status})
}
