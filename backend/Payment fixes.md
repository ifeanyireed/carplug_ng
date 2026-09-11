# Carplug (Verza) — Payments & KYC Fix Guide

Fourth pass. Read in full before making changes. Priority 0 is the reason
this file exists — do not connect a real Paystack secret key to this
codebase until Priority 0 is done and verified.

Verification after every section:

```bash
cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build
```

---

## Priority 0 — Payment integrity (do this before any real Paystack key)

### 0.1 `RequestPayout` must not self-settle

`controllers/payment_controller.go`, `RequestPayout` currently creates a
`tech_payout` transaction with `Status: "settled"` immediately on request,
with no check against what the technician has actually earned and no
approval step.

**Fix:**

1. Compute the technician's actual available balance server-side (sum of
   `settled` inflows for their user_id minus sum of prior `tech_payout`
   amounts already paid — not by trusting client input).
2. Reject the payout with `400` if `req.Amount` exceeds that computed
   balance.
3. Create the transaction with `Status: "pending"`, not `"settled"` — a
   payout should only become `"settled"` once an admin confirms the bank
   transfer actually happened (add an admin-only endpoint or extend
   `admin` routes with `PATCH /api/payments/payouts/:id/status` for this),
   or once a real payment gateway payout API confirms it. Do not let the
   requesting user's own call settle their own payout.

### 0.2 `HandleWebhook` needs real signature verification

Currently fully public with zero verification — anyone can POST a
reference and mark it `"settled"`.

**Fix:** Paystack signs webhook payloads with `x-paystack-signature`
(HMAC-SHA512 of the raw request body using the Paystack secret key). Verify
it before trusting anything in the payload:

```go
func HandleWebhook(c *gin.Context) {
    body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read payload"})
        return
    }

    signature := c.GetHeader("x-paystack-signature")
    mac := hmac.New(sha512.New, []byte(config.AppConfig.PaystackSecretKey))
    mac.Write(body)
    expected := hex.EncodeToString(mac.Sum(nil))
    if !hmac.Equal([]byte(signature), []byte(expected)) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
        return
    }

    var payload map[string]interface{}
    if err := json.Unmarshal(body, &payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook payload"})
        return
    }
    // ...rest unchanged
}
```

Add `PAYSTACK_SECRET_KEY` to `config.go` and `.env.example` (placeholder
value only, same rule as every other secret in this repo). This will need
a real Paystack test-mode key to actually test end-to-end — coordinate
with Shuddy before wiring it, since it requires a Paystack account.

### 0.3 Never trust client-supplied payment amounts

`InitializePayment` currently uses `req.Amount` directly with no
server-side validation against what the transaction type should actually
cost.

**Fix:** add a server-side price table (or lookup from the relevant model —
e.g. dealer subscription tiers should have fixed prices defined once, not
inferred from whatever amount the client sends):

```go
var subscriptionPrices = map[string]int64{
    "Basic Shop":   25000,
    "Pro Shop":     75000,
    "Premium Shop": 150000,
}
```

For `inspection_escrow`, the amount should come from a fixed inspection fee
(check if one exists in `models.InspectionReport` or the product blueprint's
pricing section) rather than the client. For `ad_campaign`, pricing should
come from the campaign's selected package/tier, not a free-text amount.
Reject the request with 400 if the client sends an amount that doesn't
match the server-computed price for the given type/entity.

### 0.4 `GetWallet` balance should be a DB aggregate, not a 50-row scan

```go
var balance int64
db.Model(&models.Transaction{}).
    Where("user_id = ? AND type = ? AND status = ?", userID, "tech_payout", "settled").
    Select("COALESCE(SUM(amount), 0)").Row().Scan(&balance)
```

Do the same for `pendingEscrow` and `totalEarned` instead of summing a
capped 50-row slice in Go. Keep the 50-row `transactions` list in the
response for display purposes, just don't use it for the balance math.

---

## Priority 1 — KYC approval should actually set the trust flags it promises

`UpdateVerificationStatus`'s approval switch statement only handles
`customs_sgd` and `tech_license`. Add cases for the other two entity types
so approval actually does something visible:

```go
case "dealer_cac":
    var shop models.DealerShop
    if err := db.Where("id = ?", verification.EntityID).First(&shop).Error; err == nil {
        shop.VerifiedCAC = true
        _ = db.Save(&shop).Error
    }

case "seller_nin":
    var user models.User
    if err := db.Where("id = ?", verification.UserID).First(&user).Error; err == nil {
        user.IsVerified = true
        _ = db.Save(&user).Error
    }
```

Confirm `models.DealerShop.VerifiedCAC` and `models.User.IsVerified` are
actually surfaced in the relevant frontend views (dealer shop page, trust
badges on listings) — if they're not read anywhere yet, flag that back as
a small frontend follow-up rather than silently leaving the approval
invisible.

---

## Priority 2 — Small hardening

2.1. `verifications.GET("")` currently relies entirely on
`GetVerifications`'s internal filtering to keep non-admins from seeing
other users' KYC documents. The logic is correct today, but add a
comment directly above the filtering block explaining that this is
the only thing preventing a PII leak, so a future edit doesn't remove
it accidentally. (Optional stronger fix: split into two handlers —
`GetMyVerifications` for the self-service case and
`GetVerifications` behind `RequireRoles("admin")` for the admin
queue — removes the reliance on remembering the filter entirely.)

2.2. Document why CORS allows all localhost/127.0.0.1 origins regardless
of `GIN_MODE` — add a one-line comment in `CORSMiddleware` so the next
person reading it doesn't mistake this for an oversight.

---

## Do NOT do yet

- Don't wire a real Paystack secret key into any environment until 0.1–0.3
  are done and manually verified.
- Don't build the admin payout-approval UI/endpoint beyond what 0.1
  requires to make payouts non-self-settling — a full admin payment
  console is a separate task.

---

## Definition of done

- [ ] `RequestPayout` checks actual balance and creates `"pending"`, not
      `"settled"`, transactions
- [ ] `HandleWebhook` verifies `x-paystack-signature` before trusting the
      payload
- [ ] `InitializePayment` validates `amount` against a server-side price
      table, not the client
- [ ] `GetWallet` balance math uses DB-side `SUM()`
- [ ] `dealer_cac` and `seller_nin` approvals set `VerifiedCAC`/`IsVerified`
- [ ] `go build ./...` / `go vet ./...` clean
- [ ] `npx eslint .` / `npx next build` clean in `web_app`
