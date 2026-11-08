package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/models"
	"github.com/ifeanyireed/carplug_ng/backend/routes"
)

func TestConversationFlow_DealerAndBuyer(t *testing.T) {
	cfg := config.LoadConfig()
	if cfg.DatabaseURL == "" {
		t.Skip("DATABASE_URL not set; skipping database integration test")
	}

	_, err := config.InitDB(cfg)
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}

	r := routes.SetupRouter(cfg)
	srv := httptest.NewServer(r)
	defer srv.Close()

	// 1. Login Buyer (Dr. Chidi Nwosu)
	buyerLoginBody, _ := json.Marshal(map[string]string{
		"email":    "buyer.chidi@mycars.ng",
		"password": "Carplug2026!",
	})
	resp, err := http.Post(srv.URL+"/api/auth/login", "application/json", bytes.NewReader(buyerLoginBody))
	if err != nil {
		t.Fatalf("Buyer login request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Buyer login failed with status %d", resp.StatusCode)
	}
	var buyerLoginResp struct {
		Token string `json:"token"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&buyerLoginResp)
	if buyerLoginResp.Token == "" {
		t.Fatalf("Buyer token is empty")
	}

	// 2. Buyer starts conversation on Dew Autos vehicle
	startConvBody, _ := json.Marshal(map[string]string{
		"vehicleId": "v-bmw-m4-2021",
		"message":   "Hello Dew Autos, is this BMW M4 available?",
	})
	req, _ := http.NewRequest("POST", srv.URL+"/api/conversations", bytes.NewReader(startConvBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+buyerLoginResp.Token)
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Start conversation request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		t.Fatalf("Start conversation returned status %d", resp.StatusCode)
	}
	var conv models.Conversation
	_ = json.NewDecoder(resp.Body).Decode(&conv)
	if conv.ID == "" {
		t.Fatalf("Conversation ID is empty")
	}

	// 3. Login Dealer (Dew Autos)
	dealerLoginBody, _ := json.Marshal(map[string]string{
		"email":    "carsplug0@gmail.com",
		"password": "Carplug2026!",
	})
	resp, err = http.Post(srv.URL+"/api/auth/login", "application/json", bytes.NewReader(dealerLoginBody))
	if err != nil {
		t.Fatalf("Dealer login request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Dealer login failed with status %d", resp.StatusCode)
	}
	var dealerLoginResp struct {
		Token string `json:"token"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&dealerLoginResp)
	if dealerLoginResp.Token == "" {
		t.Fatalf("Dealer token is empty")
	}

	// 4. Dealer GET /conversations -> MUST include the conversation!
	req, _ = http.NewRequest("GET", srv.URL+"/api/conversations", nil)
	req.Header.Set("Authorization", "Bearer "+dealerLoginResp.Token)
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Dealer GET /conversations failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Dealer GET /conversations returned status %d", resp.StatusCode)
	}
	var dealerConvs []models.Conversation
	_ = json.NewDecoder(resp.Body).Decode(&dealerConvs)
	found := false
	for _, c := range dealerConvs {
		if c.ID == conv.ID {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("Dealer was NOT able to see inbound buyer conversation %s! Found %d total convs", conv.ID, len(dealerConvs))
	}

	// 5. Dealer GET /conversations/:id/messages -> MUST be 200 OK (NOT 403 Forbidden!)
	req, _ = http.NewRequest("GET", srv.URL+"/api/conversations/"+conv.ID+"/messages", nil)
	req.Header.Set("Authorization", "Bearer "+dealerLoginResp.Token)
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Dealer GET messages failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Dealer GET messages returned status %d (expected 200)", resp.StatusCode)
	}

	// 6. Dealer Send Reply -> MUST be 201 Created (NOT 403 Forbidden!)
	replyBody, _ := json.Marshal(map[string]string{
		"body": "Yes Dr. Chidi, available for viewing in Victoria Island!",
	})
	req, _ = http.NewRequest("POST", srv.URL+"/api/conversations/"+conv.ID+"/messages", bytes.NewReader(replyBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+dealerLoginResp.Token)
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Dealer send message failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Dealer send message returned status %d (expected 201)", resp.StatusCode)
	}

	// 7. Buyer GET /conversations/:id/messages -> MUST include dealer's reply!
	req, _ = http.NewRequest("GET", srv.URL+"/api/conversations/"+conv.ID+"/messages", nil)
	req.Header.Set("Authorization", "Bearer "+buyerLoginResp.Token)
	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Buyer GET messages failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Buyer GET messages returned status %d", resp.StatusCode)
	}
	var messages []models.Message
	_ = json.NewDecoder(resp.Body).Decode(&messages)
	if len(messages) < 2 {
		t.Fatalf("Expected at least 2 messages, got %d", len(messages))
	}
	t.Logf("Successfully verified end-to-end conversation flow between Buyer and Dealer with %d messages!", len(messages))
}
