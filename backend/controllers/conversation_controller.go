package controllers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
)

type StartConversationRequest struct {
	VehicleID string `json:"vehicleId" binding:"required"`
	Message   string `json:"message"`
}

type SendMessageRequest struct {
	Body string `json:"body" binding:"required"`
}

// StartConversation starts or returns an existing conversation for a vehicle listing.
func StartConversation(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required to start conversation"})
		return
	}

	var req StartConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vehicle ID is required"})
		return
	}

	db := config.GetDB()

	// 1. Fetch Vehicle
	var vehicle models.Vehicle
	if err := db.Where("id = ?", req.VehicleID).First(&vehicle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle listing not found"})
		return
	}

	// 2. Prevent buyer from starting conversation with themselves
	if vehicle.SellerID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot start a conversation regarding your own vehicle listing"})
		return
	}

	// 3. Fetch Buyer User
	var buyer models.User
	if err := db.Where("id = ?", userID).First(&buyer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load user profile"})
		return
	}

	// 4. Check if a conversation between this buyer and vehicle already exists
	var existing models.Conversation
	err := db.Where("vehicle_id = ? AND buyer_id = ?", vehicle.ID, userID).First(&existing).Error
	if err == nil {
		// Existing conversation found. If a new initial message was supplied, append it.
		trimmedMsg := strings.TrimSpace(req.Message)
		if trimmedMsg != "" {
			now := time.Now()
			msgID := "msg_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16]
			msg := models.Message{
				ID:             msgID,
				ConversationID: existing.ID,
				SenderID:       userID,
				SenderName:     buyer.Name,
				SenderRole:     buyer.Role,
				Body:           trimmedMsg,
				CreatedAt:      now,
				UpdatedAt:      now,
			}
			if err := db.Create(&msg).Error; err == nil {
				existing.LastMessage = trimmedMsg
				existing.LastMessageAt = &now
				existing.UpdatedAt = now
				db.Save(&existing)
			}
		}

		c.JSON(http.StatusOK, existing)
		return
	}

	// 5. Extract first image for thumbnail preview
	var images []string
	_ = json.Unmarshal([]byte(vehicle.Images), &images)
	firstImage := ""
	if len(images) > 0 {
		firstImage = images[0]
	}

	// 6. Create New Conversation
	now := time.Now()
	convID := "conv_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16]
	trimmedMsg := strings.TrimSpace(req.Message)

	conv := models.Conversation{
		ID:            convID,
		VehicleID:     vehicle.ID,
		BuyerID:       userID,
		SellerID:      vehicle.SellerID,
		DealerID:      "",
		LastMessage:   trimmedMsg,
		LastMessageAt: &now,
		VehicleTitle:  vehicle.Title,
		VehicleImage:  firstImage,
		VehiclePrice:  vehicle.Price,
		BuyerName:     buyer.Name,
		SellerName:    vehicle.SellerName,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if vehicle.SellerType == "dealer" {
		conv.DealerID = vehicle.SellerID
	}

	if err := db.Create(&conv).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation: " + err.Error()})
		return
	}

	// 7. If initial message was supplied, append it
	if trimmedMsg != "" {
		msgID := "msg_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16]
		msg := models.Message{
			ID:             msgID,
			ConversationID: convID,
			SenderID:       userID,
			SenderName:     buyer.Name,
			SenderRole:     buyer.Role,
			Body:           trimmedMsg,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		_ = db.Create(&msg)
	}

	c.JSON(http.StatusCreated, conv)
}

// GetConversations returns all conversations the user is participating in.
func GetConversations(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userRole, _ := c.Get("userRole")
	db := config.GetDB()

	var conversations []models.Conversation
	query := db.Model(&models.Conversation{})

	if userRole != "admin" {
		query = query.Where("buyer_id = ? OR seller_id = ?", userID, userID)
	}

	if err := query.Order("COALESCE(last_message_at, updated_at, created_at) DESC").Find(&conversations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations: " + err.Error()})
		return
	}

	// Calculate unread count for each thread
	for i := range conversations {
		var unread int64
		db.Model(&models.Message{}).
			Where("conversation_id = ? AND sender_id != ? AND read_at IS NULL", conversations[i].ID, userID).
			Count(&unread)
		conversations[i].UnreadCount = int(unread)
	}

	c.JSON(http.StatusOK, conversations)
}

// GetConversationByID returns a single conversation metadata and verifies participation.
func GetConversationByID(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	id := c.Param("id")
	userRole, _ := c.Get("userRole")
	db := config.GetDB()

	var conv models.Conversation
	if err := db.Where("id = ?", id).First(&conv).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	// Participation check
	if userRole != "admin" && conv.BuyerID != userID && conv.SellerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to view this conversation"})
		return
	}

	// Compute unread count
	var unread int64
	db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND read_at IS NULL", conv.ID, userID).
		Count(&unread)
	conv.UnreadCount = int(unread)

	c.JSON(http.StatusOK, conv)
}

// GetMessages retrieves the message history for a conversation and marks incoming messages as read.
func GetMessages(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	id := c.Param("id")
	userRole, _ := c.Get("userRole")
	db := config.GetDB()

	// 1. Verify Conversation Existence & Participation
	var conv models.Conversation
	if err := db.Where("id = ?", id).First(&conv).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	if userRole != "admin" && conv.BuyerID != userID && conv.SellerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to view messages in this conversation"})
		return
	}

	// 2. Mark incoming messages as read
	now := time.Now()
	_ = db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND read_at IS NULL", id, userID).
		Update("read_at", &now)

	// 3. Fetch messages
	var messages []models.Message
	if err := db.Where("conversation_id = ?", id).
		Order("created_at ASC").
		Limit(100).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}

// SendMessage sends a new message in a conversation.
func SendMessage(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	id := c.Param("id")
	userRole, _ := c.Get("userRole")

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Body) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message body cannot be empty"})
		return
	}

	db := config.GetDB()

	// 1. Verify Conversation Existence & Participation
	var conv models.Conversation
	if err := db.Where("id = ?", id).First(&conv).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	if userRole != "admin" && conv.BuyerID != userID && conv.SellerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to send messages in this conversation"})
		return
	}

	// 2. Fetch Sender User Details
	var sender models.User
	if err := db.Where("id = ?", userID).First(&sender).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load sender details"})
		return
	}

	// 3. Create Message
	now := time.Now()
	msgID := "msg_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16]
	bodyClean := strings.TrimSpace(req.Body)

	msg := models.Message{
		ID:             msgID,
		ConversationID: conv.ID,
		SenderID:       userID,
		SenderName:     sender.Name,
		SenderRole:     sender.Role,
		Body:           bodyClean,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message: " + err.Error()})
		return
	}

	// 4. Update Conversation last message and timestamp
	conv.LastMessage = bodyClean
	conv.LastMessageAt = &now
	conv.UpdatedAt = now
	db.Save(&conv)

	c.JSON(http.StatusCreated, msg)
}
