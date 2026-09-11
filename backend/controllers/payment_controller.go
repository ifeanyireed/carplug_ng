package controllers

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func generateTxnRef(prefix string) string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%s-%d-%s", prefix, time.Now().Unix(), hex.EncodeToString(b))
}

// GetTransactions lists financial ledger records (Admin has full ledger, users see only their own)
func GetTransactions(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")
	userID, _ := userIDVal.(string)
	userRole, _ := userRoleVal.(string)

	db := config.GetDB()
	query := db.Model(&models.Transaction{})

	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	} else if filterUser := c.Query("userId"); filterUser != "" {
		query = query.Where("user_id = ?", filterUser)
	}

	if txnType := c.Query("type"); txnType != "" && txnType != "all" {
		query = query.Where("type = ?", txnType)
	}

	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count transactions: " + err.Error()})
		return
	}

	// Volume metrics
	var totalVol int64
	var escrowVol int64
	var settledVol int64

	type VolumeResult struct {
		Status string
		Total  int64
	}
	var volResults []VolumeResult
	db.Model(&models.Transaction{}).
		Select("status, SUM(amount) as total").
		Group("status").
		Scan(&volResults)

	for _, v := range volResults {
		totalVol += v.Total
		if v.Status == "held_in_escrow" {
			escrowVol += v.Total
		} else if v.Status == "settled" {
			settledVol += v.Total
		}
	}

	var list []models.Transaction
	if err := query.Order("created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query transactions: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":         total,
		"page":          page,
		"pageSize":      pageSize,
		"totalVolume":   totalVol,
		"escrowVolume":  escrowVol,
		"settledVolume": settledVol,
		"data":          list,
	})
}

// GetWallet returns current user/technician wallet balance and settlement records using DB aggregates
func GetWallet(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	db := config.GetDB()

	// 1. Total settled earnings (inflows)
	var totalEarned int64
	db.Model(&models.Transaction{}).
		Where("user_id = ? AND type != ? AND status = ?", userID, "tech_payout", "settled").
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalEarned)

	// 2. Prior payouts (settled or pending)
	var totalPayouts int64
	db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND status IN ?", userID, "tech_payout", []string{"settled", "pending"}).
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalPayouts)

	availableBalance := totalEarned - totalPayouts
	if availableBalance < 0 {
		availableBalance = 0
	}

	// 3. Pending escrow
	var pendingEscrow int64
	db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND status = ?", userID, "inspection_escrow", "held_in_escrow").
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&pendingEscrow)

	// Fetch recent 50 transactions for display list
	var txns []models.Transaction
	if err := db.Where("user_id = ?", userID).Order("created_at desc").Limit(50).Find(&txns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query wallet: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"balance":       availableBalance,
		"pendingEscrow": pendingEscrow,
		"totalEarned":   totalEarned,
		"currency":      "NGN",
		"transactions":  txns,
	})
}

type InitializePaymentInput struct {
	Type        string `json:"type" binding:"required"` // inspection_escrow, dealer_subscription, ad_campaign
	Amount      int64  `json:"amount" binding:"required,gt=0"`
	EntityID    string `json:"entityId"`
	Title       string `json:"title"`
	Gateway     string `json:"gateway"` // paystack, bank_transfer
	CallbackURL string `json:"callbackUrl"`
}

// InitializePayment creates a new pending or escrow-funded transaction
func InitializePayment(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	var req InitializePaymentInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Server-side pricing enforcement (Priority 0.3)
	switch req.Type {
	case "dealer_subscription":
		valid := false
		for _, price := range []int64{25000, 65000, 75000, 150000} {
			if req.Amount == price {
				valid = true
				break
			}
		}
		if !valid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid subscription amount: must match server price tier (₦25,000 Basic, ₦65,000/₦75,000 Pro, or ₦150,000 Premium)",
			})
			return
		}

	case "inspection_escrow":
		valid := false
		for _, price := range []int64{25000, 45000, 75000} {
			if req.Amount == price {
				valid = true
				break
			}
		}
		if !valid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid inspection fee: must match server price tier (₦25,000 Standard, ₦45,000 Premium Diagnostic, or ₦75,000 Comprehensive Master Audit)",
			})
			return
		}

	case "ad_campaign":
		valid := false
		for _, price := range []int64{75000, 120000, 250000} {
			if req.Amount == price {
				valid = true
				break
			}
		}
		if !valid {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid ad campaign amount: must match server price package (₦75,000 Sponsored, ₦120,000 Banner, or ₦250,000 Hero Spotlight)",
			})
			return
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported payment transaction type: " + req.Type})
		return
	}

	db := config.GetDB()
	var user models.User
	userName := "Platform User"
	userEmail := ""
	userRole := "buyer"
	if err := db.First(&user, "id = ?", userID).Error; err == nil {
		userName = user.Name
		userEmail = user.Email
		userRole = user.Role
	}

	gateway := strings.ToLower(strings.TrimSpace(req.Gateway))
	if gateway == "" {
		gateway = "paystack"
	}

	reference := generateTxnRef("CP-TXN")
	initialStatus := "held_in_escrow"
	if req.Type == "dealer_subscription" || req.Type == "ad_campaign" {
		initialStatus = "settled"
	}

	title := req.Title
	if title == "" {
		switch req.Type {
		case "inspection_escrow":
			title = "150-Point Inspection Escrow Deposit"
		case "dealer_subscription":
			title = "Dealer Storefront Subscription"
		case "ad_campaign":
			title = "Platform Ad Campaign Placement"
		default:
			title = "Carplug Platform Payment"
		}
	}

	txn := models.Transaction{
		ID:        "txn-" + strconv.FormatInt(time.Now().UnixNano(), 36),
		Reference: reference,
		UserID:    userID,
		UserName:  userName,
		UserEmail: userEmail,
		UserRole:  userRole,
		Type:      req.Type,
		Title:     title,
		EntityID:  req.EntityID,
		Amount:    req.Amount,
		Currency:  "NGN",
		Gateway:   gateway,
		Status:    initialStatus,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&txn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction: " + err.Error()})
		return
	}

	// Downstream action: if dealer subscription, update or create dealer subscription
	if req.Type == "dealer_subscription" && req.EntityID != "" {
		plan := "Pro Shop"
		limit := 60
		if req.Amount >= 150000 {
			plan = "Premium Shop"
			limit = 9999
		} else if req.Amount <= 25000 {
			plan = "Basic Shop"
			limit = 15
		}

		var sub models.Subscription
		if err := db.Where("dealer_id = ?", req.EntityID).First(&sub).Error; err != nil {
			sub = models.Subscription{
				ID:            "sub-" + strconv.FormatInt(time.Now().UnixNano(), 36),
				DealerID:      req.EntityID,
				Plan:          plan,
				Status:        "active",
				BillingCycle:  "monthly",
				ListingsLimit: limit,
				Price:         float64(req.Amount),
				ExpiresAt:     time.Now().AddDate(0, 1, 0),
			}
			_ = db.Create(&sub).Error
		} else {
			sub.Plan = plan
			sub.ListingsLimit = limit
			sub.Price = float64(req.Amount)
			sub.Status = "active"
			sub.ExpiresAt = time.Now().AddDate(0, 1, 0)
			_ = db.Save(&sub).Error
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Payment initialized successfully",
		"reference":   reference,
		"checkoutUrl": fmt.Sprintf("https://checkout.paystack.com/%s", reference),
		"transaction": txn,
	})
}

type PayoutRequestInput struct {
	Amount        int64  `json:"amount" binding:"required,gt=0"`
	BankName      string `json:"bankName" binding:"required"`
	AccountNumber string `json:"accountNumber" binding:"required"`
	AccountName   string `json:"accountName" binding:"required"`
}

// RequestPayout records a withdrawal request to the user's verified bank account
func RequestPayout(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, _ := userIDVal.(string)

	var req PayoutRequestInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// 1. Compute technician's actual available balance server-side using DB aggregate (Priority 0.1)
	var totalEarned int64
	db.Model(&models.Transaction{}).
		Where("user_id = ? AND type != ? AND status = ?", userID, "tech_payout", "settled").
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalEarned)

	var priorPayouts int64
	db.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND status IN ?", userID, "tech_payout", []string{"settled", "pending"}).
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&priorPayouts)

	availableBalance := totalEarned - priorPayouts
	if availableBalance < 0 {
		availableBalance = 0
	}

	// 2. Reject the payout with 400 if req.Amount exceeds that computed balance
	if req.Amount > availableBalance {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":            fmt.Sprintf("insufficient funds: requested payout of ₦%d exceeds available balance of ₦%d", req.Amount, availableBalance),
			"requestedAmount":  req.Amount,
			"availableBalance": availableBalance,
		})
		return
	}

	var user models.User
	userName := "Certified Technician"
	userEmail := ""
	userRole := "technician"
	if err := db.First(&user, "id = ?", userID).Error; err == nil {
		userName = user.Name
		userEmail = user.Email
		userRole = user.Role
	}

	reference := generateTxnRef("CP-PAYOUT")
	// 3. Create transaction with Status: "pending", not "settled" (Priority 0.1)
	payoutTxn := models.Transaction{
		ID:        "txn-" + strconv.FormatInt(time.Now().UnixNano(), 36),
		Reference: reference,
		UserID:    userID,
		UserName:  userName,
		UserEmail: userEmail,
		UserRole:  userRole,
		Type:      "tech_payout",
		Title:     fmt.Sprintf("Bank Payout to %s (%s)", req.BankName, req.AccountNumber),
		Amount:    req.Amount,
		Currency:  "NGN",
		Gateway:   "bank_transfer",
		Status:    "pending",
		Notes:     fmt.Sprintf("Pending bank transfer to %s • %s • %s", req.AccountName, req.AccountNumber, req.BankName),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&payoutTxn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record payout transaction: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":          "Payout request submitted successfully and queued for admin settlement",
		"transaction":      payoutTxn,
		"availableBalance": availableBalance - req.Amount,
	})
}

type UpdatePayoutStatusInput struct {
	Status string `json:"status" binding:"required"` // settled, failed, refunded, pending
	Notes  string `json:"notes"`
}

// UpdatePayoutStatus allows administrators to confirm/settle or reject a pending technician payout (Priority 0.1)
func UpdatePayoutStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdatePayoutStatusInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newStatus := strings.ToLower(strings.TrimSpace(req.Status))
	if newStatus != "settled" && newStatus != "failed" && newStatus != "refunded" && newStatus != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payout status: must be 'settled', 'failed', 'refunded', or 'pending'"})
		return
	}

	db := config.GetDB()
	var txn models.Transaction
	if err := db.Where("id = ? OR reference = ?", id, id).First(&txn).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payout transaction not found"})
		return
	}

	if txn.Type != "tech_payout" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "transaction is not a technician payout"})
		return
	}

	txn.Status = newStatus
	if req.Notes != "" {
		txn.Notes = req.Notes
	}
	txn.UpdatedAt = time.Now()

	if err := db.Save(&txn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update payout status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     fmt.Sprintf("Payout status updated to '%s' successfully", newStatus),
		"transaction": txn,
	})
}

// HandleWebhook receives payment notifications from gateway (Priority 0.2)
func HandleWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read payload"})
		return
	}

	signature := c.GetHeader("x-paystack-signature")
	secretKey := config.AppConfig.PaystackSecretKey

	if secretKey != "" {
		mac := hmac.New(sha512.New, []byte(secretKey))
		mac.Write(body)
		expected := hex.EncodeToString(mac.Sum(nil))
		if !hmac.Equal([]byte(signature), []byte(expected)) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
			return
		}
	} else if config.AppConfig.GinMode == "release" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "PAYSTACK_SECRET_KEY not configured in production mode"})
		return
	}

	var payload map[string]interface{}
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook payload"})
		return
	}

	reference, _ := payload["reference"].(string)
	if reference == "" {
		if data, ok := payload["data"].(map[string]interface{}); ok {
			reference, _ = data["reference"].(string)
		}
	}

	if reference == "" {
		c.JSON(http.StatusOK, gin.H{"message": "Webhook acknowledged (no reference)"})
		return
	}

	db := config.GetDB()
	var txn models.Transaction
	if err := db.Where("reference = ?", reference).First(&txn).Error; err == nil {
		txn.Status = "settled"
		txn.UpdatedAt = time.Now()
		_ = db.Save(&txn).Error
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Webhook processed successfully",
	})
}
