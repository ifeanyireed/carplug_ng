# Carplug Nigeria (Verza) — Next Steps & Remaining Technical Roadmap

This document serves as the master execution roadmap for the **7 remaining core features** required to complete the Carplug Nigeria (Verza) platform across both the Go backend (`backend`) and Next.js frontend (`web_app`).

---

## Technical Roadmap Overview

| Step   | Feature Domain                           | Backend Requirements                                                     | Frontend Integrations                                                               | Priority          |
| :----- | :--------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :---------------- |
| **01** | **Direct Messaging & Chat Engine**       | `Conversation` & `Message` models, REST endpoints                        | `/buyer/messages`, `/dealer/messages`, `/seller/messages`, vehicle detail chat CTAs | **Done** |
| **02** | **150-Point Inspection & Health Report** | Report submission endpoint, vehicle Tier 5 auto-upgrade, tech dispatches | `/technician/inspections/[id]/checklist`, `/composer`, dynamic booking flow         | **Done** |
| **03** | **Dealer Storefronts & Subscriptions**   | `PUT /api/dealers/:id`, `Subscription` model, plan upgrade API           | `/dealer/shop` settings editor, `/dealer/subscription` tier upgrades                | **Done**          |
| **04** | **Vehicle Editing & Ownership Security** | Ownership auth guards, multi-field filters (`make`, `model`, `year`)     | `/dealer/vehicles` edit flow, `/seller/sell` listing submission                     | **Done**          |
| **05** | **KYC & Document Verification Queue**    | `Verification` model, document submit & admin audit endpoints            | `/seller/onboard`, `/technician/onboard`, `/admin/verifications` queue              | **Done**          |
| **06** | **Financial Ledger, Escrow & Wallet**    | `Transaction` model, escrow tracking, wallet balance, Paystack hooks     | `/admin/payments` ledger, `/technician/earnings` wallet                             | **Done**          |
| **07** | **Buyer Concierge & District Map**       | Concierge lead routing & admin management                                | `/buyer/concierge` brief form, `/buyer/map` live inventory sync                     | **Done**          |

---

## Detailed Step-by-Step Breakdown

### Step 1: Real-Time Direct Messaging & Buyer-Seller Chat Engine (Done)

Enable authenticated buyers, private sellers, and certified dealers to communicate directly regarding specific vehicle listings.

- **Backend Deliverables:**
  - **Models:**
    - `models.Conversation`: `id`, `vehicle_id` (indexed), `buyer_id` (indexed), `seller_id`, `dealer_id`, `last_message`, `last_message_at`, `created_at`, `updated_at`.
    - `models.Message`: `id`, `conversation_id` (indexed), `sender_id` (indexed), `body`, `read_at`, `created_at`.
  - **Endpoints:**
    - `POST /api/conversations`: Start or retrieve an existing conversation for a vehicle listing.
    - `GET /api/conversations`: List active conversations for the authenticated user with unread counts.
    - `GET /api/conversations/:id/messages`: Retrieve paginated chat history for a thread.
    - `POST /api/conversations/:id/messages`: Append a new message to a thread and update `last_message_at`.
  - **Security:** AuthMiddleware protection; users can only read/write to conversations where `sender_id == UserID` or `buyer_id/seller_id == UserID`.

- **Frontend Deliverables:**
  - Update `web_app/src/services/api.ts` with `fetchConversations()`, `fetchMessages(convId)`, `sendMessage(convId, body)`, and `startConversation(vehicleId)`.
  - Wire `/buyer/messages/page.tsx` and `/buyer/messages/[id]/page.tsx` to live thread history.
  - Wire `/dealer/messages/page.tsx` and `/seller/messages/page.tsx` for inbound prospect negotiation.
  - Wire `/buyer/vehicles/[id]/page.tsx` "Contact Seller (Masked)" CTA button to create/resume conversation thread and redirect to `/buyer/messages?c={id}`.

---

### Step 2: Technician 150-Point Inspection & Health Report Compilation Pipeline (Done)

Allow certified technicians to receive dispatched bookings, complete 150-point digital checklist audits, and publish comprehensive Vehicle Health Reports with automated listing Tier 5 upgrade.

- **Backend Deliverables:**
  - **Endpoints:**
    - `POST /api/inspections/:id/report`: Technician submit final report with overall health score (0–100), plain-language summary, estimated repair budget, and itemized sub-system ratings.
    - Automated upgrade: Upon valid report submission, update associated vehicle listing to `trust_tier = 5` ("150-Point Certified"), `health_score = overall_score`, and link `latest_inspection_id`.
    - `GET /api/technicians/me/inspections`: Dispatched inspections queue for authenticated technician.

- **Frontend Deliverables:**
  - Complete `/technician/inspections/[id]/checklist/page.tsx` with dynamic category checkpoints (Engine, Transmission, Suspension, Electrical, Body, Interior) and auto-save.
  - Complete `/technician/inspections/[id]/composer/page.tsx` for scoring, repair cost budgeting, and one-click publishing.
  - Wire `/buyer/inspections/book/[vehicleId]/technicians/page.tsx` "Select & Dispatch" button to call `createInspection()` dynamically and redirect to the newly assigned inspection tracker.

---

### Step 3: Dealer Storefront Management (PUT) & Subscription Engine (Done)

Enable car dealerships to manage their public showroom profile and upgrade their platform capacity.

- **Backend Deliverables:**
  - **Endpoints:**
    - `PUT /api/dealers/:id`: Authenticated dealer update for brand name, tagline, showroom address, phone, WhatsApp, operating hours, and banner/logo URLs.
    - `models.Subscription`: `id`, `dealer_id`, `plan` (`basic`, `pro`, `enterprise`), `status` (`active`, `expired`), `billing_cycle`, `expires_at`, `created_at`.
    - `GET /api/dealers/me/subscription`: Returns current plan limits, active vehicle quota, and expiry date.
    - `POST /api/dealers/subscription/upgrade`: Processes plan tier upgrades.

- **Frontend Deliverables:**
  - Connect `/dealer/shop/page.tsx` form to `updateDealerShop(id, payload)` with real-time feedback banner.
  - Connect `/dealer/subscription/page.tsx` upgrade action buttons to change plan state.

---

### Step 4: Vehicle Inventory Ownership Security & Vehicle Editing Mode (Done)

Harden inventory mutations and allow dealers and private sellers to edit existing listings.

- **Backend Deliverables:**
  - Enforce strict ownership check in `UpdateVehicle` and `DeleteVehicle`: authenticated user must match `vehicle.SellerID` or possess `role == "admin"`.
  - Expand `GetVehicles` query filters in `vehicle_controller.go` to support direct facet filtering by `make`, `model`, `yearMin`, `yearMax`, `bodyType`, `fuelType`, and `transmission`.

- **Frontend Deliverables:**
  - Add vehicle editing flow to pre-populate existing vehicle data and dispatch `PUT /api/vehicles/:id`.
  - Update `Edit` button on `/dealer/vehicles/page.tsx` to route to the pre-filled edit mode.
  - Add listing creation link on `/seller/sell/page.tsx` after algorithmic valuation estimate.

---

### Step 5: Document Verification & KYC Queue (Done)

Create the compliance backbone to verify customs SGD declarations, dealer CAC certificates, and seller government IDs.

- **Backend Deliverables:**
  - **Model:**
    - `models.Verification`: `id`, `user_id` (indexed), `entity_type` (`customs_sgd`, `seller_nin`, `tech_license`, `dealer_cac`), `entity_id` (vehicle or user ID), `document_url`, `vin`, `status` (`pending`, `approved`, `rejected`), `notes`, `created_at`.
  - **Endpoints:**
    - `POST /api/verifications`: Upload document and submit for verification.
    - `GET /api/verifications`: Admin queue for pending verifications.
    - `PATCH /api/verifications/:id/status`: Admin approval or rejection; on approval, automatically toggle `verified_cac` or update listing trust badge.

- **Frontend Deliverables:**
  - Wire `/seller/onboard/page.tsx` and `/technician/onboard/page.tsx` file upload inputs to Cloudinary and submit to `/api/verifications`.
  - Wire `/admin/verifications/page.tsx` table to fetch pending queue and bind Approve / Reject audit buttons.

---

### Step 6: Financial Ledger, Escrow & Technician Payout Wallet (Done)

Provide complete accounting transparency for buyer inspection deposits, technician payouts, and advertising payments.

- **Backend Deliverables:**
  - **Model:**
    - `models.Transaction`: `id`, `reference`, `user_id` (indexed), `type` (`inspection_escrow`, `dealer_subscription`, `ad_campaign`, `tech_payout`), `amount`, `currency`, `gateway` (`paystack`, `bank_transfer`), `status` (`pending`, `held_in_escrow`, `settled`, `refunded`), `created_at`.
  - **Endpoints:**
    - `GET /api/payments/transactions`: Master financial audit ledger (Admin only).
    - `GET /api/payments/wallet`: Authenticated user/technician balance and settlement history.
    - `POST /api/payments/initialize`: Payment initialization endpoint (Paystack/Flutterwave).
    - `POST /api/payments/webhook`: Webhook endpoint for payment confirmation.

- **Frontend Deliverables:**
  - Wire `/admin/payments/page.tsx` to `fetchTransactions()` API.
  - Wire `/technician/earnings/page.tsx` to `fetchWalletBalance()` and settlement table.

---

### Step 7: Buyer Concierge Sourcing & District Map Discovery (Done)

Connect VIP car search requests and neighborhood discovery to live platform inventory.

- **Backend Deliverables:**
  - Route concierge submissions to `POST /api/leads` with `type: "concierge"` or a dedicated `models.ConciergeRequest` table.
  - Ensure admin leads console displays concierge search briefs with priority badges.

- **Frontend Deliverables:**
  - Connect form submission in `/buyer/concierge/page.tsx` to `createLead({ type: "concierge", ... })`.
  - Connect `/buyer/map/page.tsx` to live `fetchVehicles()` filtered by location district.

---

## Execution Status Tracker

- [x] **Step 1:** Direct Messaging & Buyer-Seller Chat Engine
- [x] **Step 2:** 150-Point Inspection & Health Report Compilation Pipeline
- [x] **Step 3:** Dealer Storefront Management (PUT) & Subscription Engine
- [x] **Step 4:** Vehicle Inventory Ownership Security & Vehicle Editing Mode
- [x] **Step 5:** Document Verification & KYC Queue
- [x] **Step 6:** Financial Ledger, Escrow & Technician Payout Wallet
- [x] **Step 7:** Buyer Concierge Sourcing & District Map Discovery
