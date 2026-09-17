# Carplug (Verza) — Lead Ownership Fix

Small, focused fix. Verify after:

```bash
cd backend && go build ./... && go vet ./...
```

---

## Priority 0 — `UpdateLeadStatus` has no ownership check

`backend/controllers/lead_controller.go`, `UpdateLeadStatus` currently
updates any lead's status with no check that the caller actually owns it,
and no validation that the submitted status is a real one. `Lead` already
has a `SellerID` field (`models/lead.go`) meant for exactly this.

**Fix:**

```go
func UpdateLeadStatus(c *gin.Context) {
    id := c.Param("id")
    var req struct {
        Status string `json:"status" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    validStatuses := map[string]bool{
        "new": true, "routed": true, "contacted": true,
        "completed": true, "cancelled": true,
    }
    if !validStatuses[req.Status] {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status: must be one of new, routed, contacted, completed, cancelled"})
        return
    }

    db := config.GetDB()
    var lead models.Lead
    if err := db.First(&lead, "id = ?", id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Lead not found"})
        return
    }

    userID := c.GetString("userID")
    role := c.GetString("userRole")
    if role != "admin" && lead.SellerID != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to update this lead"})
        return
    }

    var updateErr error
    for attempt := 1; attempt <= 3; attempt++ {
        updateErr = db.Model(&lead).Update("status", req.Status).Error
        if updateErr == nil {
            break
        }
        time.Sleep(300 * time.Millisecond)
    }
    if updateErr != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update lead status: " + updateErr.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Lead status updated", "id": id, "status": req.Status})
}
```

(Kept the existing 3-attempt retry pattern for the update itself — that part
was fine, just add the ownership + validation checks ahead of it.)

**Manual test:** create two seller accounts, create a lead tied to seller
A's vehicle, try to update its status using seller B's token — confirm 403.

---

## Note for whoever wires real Paystack next (informational, no action needed now)

`InitializePayment` currently marks `dealer_subscription` and `ad_campaign`
transactions `"settled"` immediately at creation time, since there's no live
gateway to wait on yet. Once a real Paystack key is connected, that
immediate-settle behavior needs to move into `HandleWebhook` instead —
otherwise calling `/api/payments/initialize` alone would grant an active
subscription or live ad campaign before any real payment actually clears.
Flag this to whoever does that integration; no code change needed until
that work starts.

---

## Definition of done

- [ ] `UpdateLeadStatus` checks `SellerID` ownership (or admin) before updating
- [ ] `UpdateLeadStatus` validates `status` against the known enum
- [ ] Manual two-account test confirms 403 for a non-owner
- [ ] `go build ./...` / `go vet ./...` clean
