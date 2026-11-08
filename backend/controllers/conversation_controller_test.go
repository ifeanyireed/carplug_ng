package controllers

import (
	"testing"

	"github.com/ifeanyireed/carplug_ng/backend/models"
)

func TestIsUserParticipant(t *testing.T) {
	conv := &models.Conversation{
		ID:        "conv_test_1",
		VehicleID: "v_1",
		BuyerID:   "usr_buyer_1",
		SellerID:  "dealer-reed-motors",
		DealerID:  "dealer-reed-motors",
	}

	// 1. Admin should always be participant
	if !isUserParticipant(conv, []string{"usr_admin"}, "admin") {
		t.Errorf("admin should always be considered participant")
	}

	// 2. Direct buyer match
	if !isUserParticipant(conv, []string{"usr_buyer_1"}, "buyer") {
		t.Errorf("buyer should be participant")
	}

	// 3. Dealer matching via shop ID alias
	dealerAliases := []string{"usr-dealer-reed", "dealer-reed-motors", "dealer-reed"}
	if !isUserParticipant(conv, dealerAliases, "dealer") {
		t.Errorf("dealer with shop alias dealer-reed-motors should be participant")
	}

	// 4. Unrelated user should be rejected
	if isUserParticipant(conv, []string{"usr_stranger"}, "buyer") {
		t.Errorf("unrelated user should not be participant")
	}
}
