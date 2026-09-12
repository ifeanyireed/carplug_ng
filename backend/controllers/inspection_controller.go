package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)


func toJSONString(val any) string {
	if val == nil {
		return "[]"
	}
	if str, ok := val.(string); ok {
		if str == "" {
			return "[]"
		}
		return str
	}
	bytes, err := json.Marshal(val)
	if err != nil {
		return "[]"
	}
	return string(bytes)
}

func GetInspections(c *gin.Context) {
	db := config.GetDB()
	query := db.Model(&models.InspectionReport{})

	if vehicleId := c.Query("vehicleId"); vehicleId != "" {
		query = query.Where("vehicle_id = ?", vehicleId)
	}
	if techId := c.Query("technicianId"); techId != "" {
		query = query.Where("technician_id = ?", techId)
	}
	if buyerId := c.Query("buyerId"); buyerId != "" {
		query = query.Where("buyer_id = ?", buyerId)
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

type CreateInspectionInput struct {
	ID                  string  `json:"id"`
	VehicleID           string  `json:"vehicleId"`
	VehicleTitle        string  `json:"vehicleTitle"`
	VehicleVIN          string  `json:"vehicleVin"`
	BuyerID             string  `json:"buyerId"`
	EscrowTransactionID string  `json:"escrowTransactionId"`
	TechnicianID        string  `json:"technicianId"`
	TechnicianName      string  `json:"technicianName"`
	TechnicianAvatar    string  `json:"technicianAvatar"`
	TechnicianPhone     string  `json:"technicianPhone"`
	TechnicianTier      string  `json:"technicianTier"`
	InspectionTier      string  `json:"inspectionTier"`
	Status              string  `json:"status"`
	ScheduledDate       string  `json:"scheduledDate"`
	CompletedDate       string  `json:"completedDate"`
	OverallScore        int     `json:"overallScore"`
	Categories          any     `json:"categories"`
	TechnicianSummary   string  `json:"technicianSummary"`
	RepairCostMin       float64 `json:"repairCostMin"`
	RepairCostMax       float64 `json:"repairCostMax"`
	Media               any     `json:"media"`
}

func CreateInspection(c *gin.Context) {
	var req CreateInspectionInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Priority 0.1: Require and validate real held escrow payment
	if req.EscrowTransactionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "escrowTransactionId is required — an inspection cannot be created without a funded escrow payment"})
		return
	}

	var escrowTxn models.Transaction
	if err := db.Where("id = ? AND type = ? AND status = ?", req.EscrowTransactionID, "inspection_escrow", "held_in_escrow").
		First(&escrowTxn).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No funded escrow transaction found for this inspection request"})
		return
	}

	callerID := c.GetString("userID")
	callerRole := c.GetString("userRole")

	// Priority 0.1 & 0.3: Confirm escrow belongs to requesting caller (if not admin) and guard against self-assignment
	buyerID := callerID
	if callerRole != "admin" {
		if escrowTxn.UserID != callerID {
			c.JSON(http.StatusForbidden, gin.H{"error": "This escrow transaction does not belong to you"})
			return
		}
		if req.TechnicianID != "" && req.TechnicianID == callerID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Self-assignment is not permitted: buyer cannot assign themselves as technician"})
			return
		}
	} else {
		if req.BuyerID != "" {
			buyerID = req.BuyerID
		} else if escrowTxn.UserID != "" {
			buyerID = escrowTxn.UserID
		}
	}

	// Guard against duplicate use of same escrow transaction
	var existingReport models.InspectionReport
	if err := db.Where("escrow_transaction_id = ?", req.EscrowTransactionID).First(&existingReport).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This escrow transaction has already been linked to an inspection"})
		return
	}

	// Priority 0.3: If a technician ID is passed, verify technician identity
	if req.TechnicianID != "" {
		var techUser models.User
		isTech := false
		if err := db.Where("id = ? AND role = ?", req.TechnicianID, "technician").First(&techUser).Error; err == nil {
			isTech = true
		} else {
			var techRecord models.Technician
			if err := db.Where("id = ?", req.TechnicianID).First(&techRecord).Error; err == nil {
				isTech = true
			}
		}
		if !isTech {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Assigned technician must be a valid registered platform technician"})
			return
		}
	}

	report := models.InspectionReport{
		ID:                  req.ID,
		VehicleID:           req.VehicleID,
		VehicleTitle:        req.VehicleTitle,
		VehicleVIN:          req.VehicleVIN,
		BuyerID:             buyerID,
		EscrowTransactionID: req.EscrowTransactionID,
		TechnicianID:        req.TechnicianID,
		TechnicianName:      req.TechnicianName,
		TechnicianAvatar:    req.TechnicianAvatar,
		TechnicianPhone:     req.TechnicianPhone,
		TechnicianTier:      req.TechnicianTier,
		InspectionTier:      req.InspectionTier,
		Status:              req.Status,
		ScheduledDate:       req.ScheduledDate,
		CompletedDate:       req.CompletedDate,
		OverallScore:        req.OverallScore,
		Categories:          toJSONString(req.Categories),
		TechnicianSummary:   req.TechnicianSummary,
		RepairCostMin:       req.RepairCostMin,
		RepairCostMax:       req.RepairCostMax,
		Media:               toJSONString(req.Media),
	}

	if report.ID == "" {
		report.ID = "insp-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	if report.Status == "" {
		report.Status = "requested"
	}
	if report.InspectionTier == "" {
		report.InspectionTier = "Premium Diagnostic"
	}
	if report.ScheduledDate == "" {
		report.ScheduledDate = time.Now().Format("Jan 02, 2006")
	}

	// Auto-populate Vehicle info if missing
	if report.VehicleID != "" && (report.VehicleTitle == "" || report.VehicleVIN == "") {
		var vehicle models.Vehicle
		if err := db.First(&vehicle, "id = ?", report.VehicleID).Error; err == nil {
			if report.VehicleTitle == "" {
				report.VehicleTitle = vehicle.Title
			}
			if report.VehicleVIN == "" {
				report.VehicleVIN = vehicle.VIN
			}
		}
	}

	// Auto-populate Technician info if missing
	if report.TechnicianID != "" && (report.TechnicianName == "" || report.TechnicianPhone == "") {
		var tech models.Technician
		if err := db.First(&tech, "id = ?", report.TechnicianID).Error; err == nil {
			if report.TechnicianName == "" {
				report.TechnicianName = tech.Name
			}
			if report.TechnicianTier == "" {
				report.TechnicianTier = tech.Badge
			}
			if report.TechnicianAvatar == "" {
				report.TechnicianAvatar = tech.Avatar
			}
			if report.TechnicianPhone == "" {
				report.TechnicianPhone = "+234 800 000 0000"
			}
		} else {
			// Fallback: Check if technician is registered in users table
			var u models.User
			if err := db.First(&u, "id = ?", report.TechnicianID).Error; err == nil {
				if report.TechnicianName == "" {
					report.TechnicianName = u.Name
				}
				if report.TechnicianAvatar == "" {
					report.TechnicianAvatar = u.Avatar
				}
				if report.TechnicianPhone == "" {
					report.TechnicianPhone = u.Phone
				}
				if report.TechnicianTier == "" {
					report.TechnicianTier = "Platform Certified"
				}
			}
		}
	}

	if report.TechnicianTier == "" {
		report.TechnicianTier = "Platform Certified"
	}
	if report.TechnicianPhone == "" {
		report.TechnicianPhone = "+234 800 000 0000"
	}

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

type SubmitInspectionReportRequest struct {
	OverallScore      int      `json:"overallScore"`
	TechnicianSummary string   `json:"technicianSummary"`
	RepairCostMin     *float64 `json:"repairCostMin"`
	RepairCostMax     *float64 `json:"repairCostMax"`
	Categories        any      `json:"categories"`
	Media             any      `json:"media"`
}

// SubmitInspectionReport handles technician checklist compilation and certification
func SubmitInspectionReport(c *gin.Context) {
	id := c.Param("id")
	var req SubmitInspectionReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	var report models.InspectionReport
	if err := db.First(&report, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inspection report not found"})
		return
	}

	// Priority 0.1 & Priority 1.4: Require valid linked escrow transaction
	if report.EscrowTransactionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot submit report: no valid funded escrow transaction is attached to this inspection"})
		return
	}

	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")
	userID, _ := userIDVal.(string)
	userRole, _ := userRoleVal.(string)

	// Ownership validation: Authenticated technician must be assigned to this dispatch, or admin
	if userRole != "admin" {
		if report.TechnicianID != "" && report.TechnicianID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You are not assigned to this inspection dispatch"})
			return
		}
		// If unassigned, assign to submitting technician
		if report.TechnicianID == "" {
			report.TechnicianID = userID
			var u models.User
			if err := db.First(&u, "id = ?", userID).Error; err == nil {
				if report.TechnicianName == "" {
					report.TechnicianName = u.Name
				}
				if report.TechnicianAvatar == "" {
					report.TechnicianAvatar = u.Avatar
				}
				if report.TechnicianPhone == "" {
					report.TechnicianPhone = u.Phone
				}
			}
		}
	}

	report.OverallScore = req.OverallScore
	report.TechnicianSummary = req.TechnicianSummary
	if req.RepairCostMin != nil {
		report.RepairCostMin = *req.RepairCostMin
	}
	if req.RepairCostMax != nil {
		report.RepairCostMax = *req.RepairCostMax
	}
	if req.Categories != nil {
		report.Categories = toJSONString(req.Categories)
	}
	if req.Media != nil {
		report.Media = toJSONString(req.Media)
	}
	report.Status = "completed"
	report.CompletedDate = time.Now().Format("Jan 02, 2006")
	report.UpdatedAt = time.Now()

	// Priority 0.2: Release actual escrow amount atomically inside one DB transaction
	var escrowTxn models.Transaction
	var feeTxn models.Transaction

	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Verify and lock the held escrow transaction
		if err := tx.Where("id = ? AND type = ? AND status = ?",
			report.EscrowTransactionID, "inspection_escrow", "held_in_escrow").
			First(&escrowTxn).Error; err != nil {
			return fmt.Errorf("no held escrow found for this inspection: %w", err)
		}

		// 2. Mark escrow settled
		escrowTxn.Status = "settled"
		escrowTxn.UpdatedAt = time.Now()
		if err := tx.Save(&escrowTxn).Error; err != nil {
			return err
		}

		// 3. Create settled technician earning transaction with escrowTxn.Amount (REAL amount, no fabrication)
		feeTxn = models.Transaction{
			ID:        "txn-" + strconv.FormatInt(time.Now().UnixNano(), 36),
			Reference: fmt.Sprintf("CP-EARN-%d-%s", time.Now().Unix(), report.ID),
			UserID:    report.TechnicianID,
			UserName:  report.TechnicianName,
			UserRole:  "technician",
			Type:      "inspection_earning",
			Title:     fmt.Sprintf("Inspection Fee: %s (%s)", report.VehicleTitle, report.InspectionTier),
			EntityID:  report.ID,
			Amount:    escrowTxn.Amount,
			Currency:  "NGN",
			Gateway:   "wallet",
			Status:    "settled",
			Notes:     fmt.Sprintf("Released from escrow (%s) upon inspection report completion", escrowTxn.Reference),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := tx.Create(&feeTxn).Error; err != nil {
			return err
		}

		// 4. Save inspection report
		if err := tx.Save(&report).Error; err != nil {
			return err
		}

		// 5. Automatic Vehicle Tier 5 Upgrade & Link
		if report.VehicleID != "" {
			vehicleUpdates := map[string]interface{}{
				"trust_tier":           5,
				"trust_tier_label":     "Tier 5 Verified • 150-Point Certified",
				"health_score":         report.OverallScore,
				"latest_inspection_id": report.ID,
			}
			if err := tx.Model(&models.Vehicle{}).Where("id = ?", report.VehicleID).Updates(vehicleUpdates).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("[CRITICAL] Inspection report %s saved but earnings release failed: %v", report.ID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to complete inspection report and disburse earnings: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Inspection report compiled and vehicle upgraded to Tier 5 successfully",
		"data":               report,
		"escrowTransaction":  escrowTxn,
		"earningTransaction": feeTxn,
	})
}


// GetTechnicianMeInspections returns inspection dispatches assigned to the authenticated technician
func GetTechnicianMeInspections(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")
	userID, _ := userIDVal.(string)
	userRole, _ := userRoleVal.(string)

	db := config.GetDB()
	query := db.Model(&models.InspectionReport{})

	if userRole != "admin" {
		query = query.Where("technician_id = ?", userID)
	} else if techId := c.Query("technicianId"); techId != "" {
		query = query.Where("technician_id = ?", techId)
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var reports []models.InspectionReport
	if err := query.Order("created_at desc").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch technician inspections: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": len(reports), "data": reports})
}
