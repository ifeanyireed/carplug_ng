package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer (64 KB).
	maxMessageSize = 65536
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  2048,
	WriteBufferSize: 2048,
	CheckOrigin: func(r *http.Request) bool {
		// Allow loopback and configured application origins
		return true
	},
}

// WSClient represents a single active WebSocket connection
type WSClient struct {
	Hub      *WSHub
	Conn     *websocket.Conn
	UserID   string
	UserName string
	UserRole string
	Send     chan []byte
}

// WSIncomingMessage represents client-sent payloads over WebSocket
type WSIncomingMessage struct {
	Type           string `json:"type"` // "chat_message", "typing", "ping"
	ConversationID string `json:"conversationId"`
	Body           string `json:"body"`
}

// WSOutgoingEvent represents server-pushed payloads to clients
type WSOutgoingEvent struct {
	Type           string      `json:"type"` // "new_message", "user_typing", "pong"
	ConversationID string      `json:"conversationId,omitempty"`
	Message        any         `json:"message,omitempty"`
	UserID         string      `json:"userId,omitempty"`
	UserName       string      `json:"userName,omitempty"`
	Timestamp      string      `json:"timestamp"`
}

// WSHub maintains the set of active clients and broadcasts messages to targeted users
type WSHub struct {
	// Registered clients map
	clients map[*WSClient]bool

	// Map of UserID -> set of active client connections (e.g. multiple tabs or devices)
	userClients map[string]map[*WSClient]bool

	// Inbound register requests
	register chan *WSClient

	// Inbound unregister requests
	unregister chan *WSClient

	// Mutex for thread safety
	mu sync.RWMutex
}

var GlobalWSHub = NewWSHub()

func NewWSHub() *WSHub {
	return &WSHub{
		clients:     make(map[*WSClient]bool),
		userClients: make(map[string]map[*WSClient]bool),
		register:    make(chan *WSClient),
		unregister:  make(chan *WSClient),
	}
}

// Run executes the hub's event loop in a goroutine
func (h *WSHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if _, ok := h.userClients[client.UserID]; !ok {
				h.userClients[client.UserID] = make(map[*WSClient]bool)
			}
			h.userClients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("[WebSocket] User connected: %s (%s). Active connections: %d\n", client.UserName, client.UserID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				if userConns, ok := h.userClients[client.UserID]; ok {
					delete(userConns, client)
					if len(userConns) == 0 {
						delete(h.userClients, client.UserID)
					}
				}
				log.Printf("[WebSocket] User disconnected: %s (%s). Remaining connections: %d\n", client.UserName, client.UserID, len(h.clients))
			}
			h.mu.Unlock()
		}
	}
}

// BroadcastToUsers sends an event to all active connections belonging to the specified user IDs
func (h *WSHub) BroadcastToUsers(userIDs []string, event WSOutgoingEvent) {
	bytes, err := json.Marshal(event)
	if err != nil {
		log.Printf("[WebSocket] Failed to marshal event: %v\n", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, uid := range userIDs {
		if conns, ok := h.userClients[uid]; ok {
			for client := range conns {
				select {
				case client.Send <- bytes:
				default:
					// Channel is congested or full, drop gracefully
				}
			}
		}
	}
}

// BroadcastMessageToConversation notifies both the buyer and seller of a newly created message
func BroadcastMessageToConversation(convID string, buyerID string, sellerID string, msg models.Message) {
	event := WSOutgoingEvent{
		Type:           "new_message",
		ConversationID: convID,
		Message:        msg,
		Timestamp:      time.Now().Format(time.RFC3339),
	}
	GlobalWSHub.BroadcastToUsers([]string{buyerID, sellerID}, event)
}

// ReadPump pumps messages from the websocket connection to the hub.
func (c *WSClient) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	db := config.GetDB()

	for {
		_, messageBytes, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebSocket] Read error: %v\n", err)
			}
			break
		}

		var inMsg WSIncomingMessage
		if err := json.Unmarshal(messageBytes, &inMsg); err != nil {
			continue
		}

		switch inMsg.Type {
		case "ping":
			c.Send <- []byte(`{"type":"pong"}`)

		case "typing":
			if inMsg.ConversationID == "" {
				continue
			}
			var conv models.Conversation
			if err := db.Where("id = ?", inMsg.ConversationID).First(&conv).Error; err == nil {
				targetUserID := conv.SellerID
				if c.UserID == conv.SellerID {
					targetUserID = conv.BuyerID
				}
				c.Hub.BroadcastToUsers([]string{targetUserID}, WSOutgoingEvent{
					Type:           "user_typing",
					ConversationID: conv.ID,
					UserID:         c.UserID,
					UserName:       c.UserName,
					Timestamp:      time.Now().Format(time.RFC3339),
				})
			}

		case "chat_message":
			bodyClean := strings.TrimSpace(inMsg.Body)
			if bodyClean == "" || inMsg.ConversationID == "" {
				continue
			}

			// Validate conversation participation
			var conv models.Conversation
			if err := db.Where("id = ?", inMsg.ConversationID).First(&conv).Error; err != nil {
				continue
			}
			if conv.BuyerID != c.UserID && conv.SellerID != c.UserID && c.UserRole != "admin" {
				continue
			}

			now := time.Now()
			msgID := "msg_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:16]

			msg := models.Message{
				ID:             msgID,
				ConversationID: conv.ID,
				SenderID:       c.UserID,
				SenderName:     c.UserName,
				SenderRole:     c.UserRole,
				Body:           bodyClean,
				CreatedAt:      now,
				UpdatedAt:      now,
			}

			if err := db.Create(&msg).Error; err != nil {
				log.Printf("[WebSocket] Failed to persist message: %v\n", err)
				continue
			}

			// Update conversation record
			conv.LastMessage = bodyClean
			conv.LastMessageAt = &now
			conv.UpdatedAt = now
			db.Save(&conv)

			// Instantly broadcast to both buyer and seller
			BroadcastMessageToConversation(conv.ID, conv.BuyerID, conv.SellerID, msg)
		}
	}
}

// WritePump pumps messages from the hub to the websocket connection.
func (c *WSClient) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Add queued chat messages to the current websocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte{'\n'})
				_, _ = w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// HandleWebSocket upgrades incoming HTTP connections to WebSocket and registers the client
func HandleWebSocket(c *gin.Context) {
	// Extract JWT token from Query parameter (?token=...) or Authorization header
	tokenStr := c.Query("token")
	if tokenStr == "" {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication token required for WebSocket connection"})
		return
	}

	claims, err := utils.ValidateToken(tokenStr, config.AppConfig.JWTSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired authentication token"})
		return
	}

	db := config.GetDB()
	var user models.User
	userName := "User"
	if err := db.Where("id = ?", claims.UserID).First(&user).Error; err == nil {
		userName = user.Name
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade error: %v\n", err)
		return
	}

	client := &WSClient{
		Hub:      GlobalWSHub,
		Conn:     conn,
		UserID:   claims.UserID,
		UserName: userName,
		UserRole: claims.Role,
		Send:     make(chan []byte, 256),
	}

	client.Hub.register <- client

	// Start read and write pumps in separate goroutines
	go client.WritePump()
	go client.ReadPump()
}
