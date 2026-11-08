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
	"github.com/ifeanyireed/carplug_ng/backend/utils"
	"gorm.io/gorm"
)

type StartConversationRequest struct {
	VehicleID string `json:"vehicleId" binding:"required"`
	Message   string `json:"message"`
}

type SendMessageRequest struct {
	Body string `json:"body" binding:"required"`
}

// resolveUserParticipantIDs returns all identifiers that can represent a user in conversations,
// including their primary user ID, dealer shop ID(s), slug(s), and stripped/prefixed variations.
func resolveUserParticipantIDs(db *gorm.DB, userID string) []string {
	if userID == "" {
		return nil
	}

	idsMap := make(map[string]bool)
	idsMap[userID] = true

	// Handle prefix variations (e.g. usr-dealer-reed -> dealer-reed, reed)
	trimmed := strings.TrimPrefix(userID, "usr-")
	if trimmed != "" && trimmed != userID {
		idsMap[trimmed] = true
		idsMap["dealer-"+trimmed] = true
		idsMap["seller-"+trimmed] = true
	}
	if strings.HasPrefix(userID, "dealer-") {
		idsMap["usr-"+userID] = true
	}
	if strings.HasPrefix(userID, "seller-") {
		idsMap["usr-"+userID] = true
	}

	// Check if this user is associated with any dealer shop
	var shops []models.DealerShop
	if err := db.Where("user_id = ? OR id = ? OR slug = ?", userID, userID, userID).Find(&shops).Error; err == nil {
		for _, s := range shops {
			if s.ID != "" {
				idsMap[s.ID] = true
			}
			if s.UserID != "" {
				idsMap[s.UserID] = true
			}
			if s.Slug != "" {
				idsMap[s.Slug] = true
			}
		}
	}

	var result []string
	for id := range idsMap {
		result = append(result, id)
	}
	return result
}

// isUserParticipant checks whether any of the user's participant IDs match the conversation participants.
func isUserParticipant(conv *models.Conversation, participantIDs []string, userRole string) bool {
	if userRole == "admin" {
		return true
	}
	for _, id := range participantIDs {
		if conv.BuyerID == id || conv.SellerID == id || (conv.DealerID != "" && conv.DealerID == id) {
			return true
		}
	}
	return false
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
	participantIDs := resolveUserParticipantIDs(db, userID)
	for _, pid := range participantIDs {
		if vehicle.SellerID == pid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot start a conversation regarding your own vehicle listing"})
			return
		}
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
				BroadcastMessageToConversation(existing.ID, existing.BuyerID, existing.SellerID, msg)

				// Update or create corresponding Lead entry
				leadID := "lead-conv-" + existing.ID
				var l models.Lead
				if err := db.Where("id = ?", leadID).First(&l).Error; err == nil {
					l.Note = trimmedMsg
					l.Status = "new"
					l.UpdatedAt = now
					db.Save(&l)
				}
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
		VehicleTitle:  vehicle.Title,
		VehicleImage:  firstImage,
		VehiclePrice:  vehicle.Price,
		BuyerID:       userID,
		BuyerName:     buyer.Name,
		SellerID:      vehicle.SellerID,
		SellerName:    vehicle.SellerName,
		LastMessage:   trimmedMsg,
		LastMessageAt: &now,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	if vehicle.SellerType == "dealer" || strings.HasPrefix(vehicle.SellerID, "dealer-") || strings.HasPrefix(vehicle.SellerID, "dlr-") {
		conv.DealerID = vehicle.SellerID
	}

	if err := db.Create(&conv).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation: " + err.Error()})
		return
	}

	// Also record an inbound Lead so dealer CRM and dashboards immediately see the inquiry
	leadNote := trimmedMsg
	if leadNote == "" {
		leadNote = "In-app buyer inquiry initiated"
	}
	buyerPhone := buyer.Phone
	if buyerPhone == "" {
		buyerPhone = "+234 Masked Contact"
	}
	newLead := models.Lead{
		ID:           "lead-conv-" + conv.ID,
		BuyerName:    buyer.Name,
		BuyerPhone:   buyerPhone,
		BuyerCity:    "Lagos, Nigeria",
		VehicleID:    vehicle.ID,
		VehicleTitle: vehicle.Title,
		VehiclePrice: vehicle.Price,
		Type:         "direct_inquiry",
		Status:       "new",
		SellerID:     vehicle.SellerID,
		Date:         time.Now().Format("2006-01-02"),
		Note:         leadNote,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	_ = db.Create(&newLead)

	// 7. If initial message was supplied, append it and broadcast
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
		if err := db.Create(&msg).Error; err == nil {
			BroadcastMessageToConversation(convID, conv.BuyerID, conv.SellerID, msg)
		}

		// Asynchronously notify vehicle seller of the new buyer inquiry
		go func(sellerID, buyerName, vehTitle, messageText string) {
			var recipientEmail string
			var recipientName string

			var dealer models.DealerShop
			if err := db.Where("id = ? OR user_id = ? OR slug = ?", sellerID, sellerID, sellerID).First(&dealer).Error; err == nil {
				recipientEmail = dealer.Email
				recipientName = dealer.Name
				if recipientEmail == "" && dealer.UserID != "" {
					var u models.User
					if err := db.Where("id = ?", dealer.UserID).First(&u).Error; err == nil {
						recipientEmail = u.Email
					}
				}
			}

			if recipientEmail == "" {
				var u models.User
				if err := db.Where("id = ?", sellerID).First(&u).Error; err == nil {
					recipientEmail = u.Email
					recipientName = u.Name
				}
			}

			if recipientEmail != "" {
				if recipientName == "" {
					recipientName = "Seller"
				}
				_ = utils.SendNewMessageNotificationEmail(
					recipientEmail,
					recipientName,
					buyerName,
					vehTitle,
					messageText,
				)
			}
		}(vehicle.SellerID, buyer.Name, vehicle.Title, trimmedMsg)
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

	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(string)
	db := config.GetDB()

	participantIDs := resolveUserParticipantIDs(db, userID)

	var conversations []models.Conversation
	query := db.Model(&models.Conversation{})

	if userRole != "admin" {
		query = query.Where("buyer_id IN (?) OR seller_id IN (?) OR dealer_id IN (?)", participantIDs, participantIDs, participantIDs)
	}

	if err := query.Order("COALESCE(last_message_at, updated_at, created_at) DESC").Find(&conversations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations: " + err.Error()})
		return
	}

	// Calculate unread count for each thread
	for i := range conversations {
		var unread int64
		db.Model(&models.Message{}).
			Where("conversation_id = ? AND sender_id NOT IN (?) AND read_at IS NULL", conversations[i].ID, participantIDs).
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
	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(string)
	db := config.GetDB()

	var conv models.Conversation
	if err := db.Where("id = ?", id).First(&conv).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	participantIDs := resolveUserParticipantIDs(db, userID)

	// Participation check
	if !isUserParticipant(&conv, participantIDs, userRole) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to view this conversation"})
		return
	}

	// Compute unread count
	var unread int64
	db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id NOT IN (?) AND read_at IS NULL", conv.ID, participantIDs).
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
	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(string)
	db := config.GetDB()

	// 1. Verify Conversation Existence & Participation
	var conv models.Conversation
	if err := db.Where("id = ?", id).First(&conv).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	participantIDs := resolveUserParticipantIDs(db, userID)

	if !isUserParticipant(&conv, participantIDs, userRole) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to view messages in this conversation"})
		return
	}

	// 2. Mark incoming messages as read
	now := time.Now()
	_ = db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id NOT IN (?) AND read_at IS NULL", id, participantIDs).
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
	userRoleVal, _ := c.Get("userRole")
	userRole, _ := userRoleVal.(string)

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

	participantIDs := resolveUserParticipantIDs(db, userID)

	if !isUserParticipant(&conv, participantIDs, userRole) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to send messages in this conversation"})
		return
	}

	// 2. Fetch Sender User Details
	var sender models.User
	if err := db.Where("id = ?", userID).First(&sender).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load sender details"})
		return
	}

	senderRole := sender.Role
	if senderRole == "" {
		senderRole = userRole
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
		SenderRole:     senderRole,
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

	// 5. Broadcast in real time to WebSocket subscribers
	BroadcastMessageToConversation(conv.ID, conv.BuyerID, conv.SellerID, msg)

	c.JSON(http.StatusCreated, msg)
}
