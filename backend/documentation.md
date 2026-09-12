# Carplug Nigeria (Verza) - Backend Documentation

This document serves as the single source of truth for the Carplug Nigeria backend API service. All architecture decisions, database models, REST API endpoints, environment configs, and integration progress must be documented here.

---

## 1. System Architecture & Tech Stack

The backend is built as a high-concurrency, lightweight RESTful API service in **Go (Golang)** designed to serve the Next.js frontend with low latency and robust connection management.

- **Language**: Go 1.22+
- **Web Framework**: [Gin Web Framework](https://github.com/gin-gonic/gin) (`github.com/gin-gonic/gin`)
- **ORM**: [GORM](https://gorm.io/) (`gorm.io/gorm` with MySQL driver `gorm.io/driver/mysql`)
- **Database**: Cloud MySQL 8.0 hosted on Hostinger (`srv2113.hstgr.io`)
- **Configuration**: Dotenv (`github.com/joho/godotenv`) with environment fallbacks
- **Architecture Pattern**: Layered Controller-Router-Model Architecture

```
                       ┌─────────────────────────┐
                       │  Next.js Frontend       │
                       │  (web_app @ Port 3000)  │
                       └───────────┬─────────────┘
                                   │ HTTP/JSON
                                   ▼
                       ┌─────────────────────────┐
                       │   Gin Router / CORS     │
                       │   (Port 8080)           │
                       └───────────┬─────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
       ┌─────────────────┐┌─────────────────┐┌─────────────────┐
       │   Controllers   ││   Controllers   ││   Controllers   │
       │ (Vehicle/Dealer)││ (Insp/Lead/Swap)││(Campaign/Health)│
       └────────┬────────┘└────────┬────────┘└────────┬────────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   │ GORM
                                   ▼
                       ┌─────────────────────────┐
                       │   MySQL Cloud Database  │
                       │   (srv2113.hstgr.io)    │
                       └─────────────────────────┘
```

---

## 2. Configuration & Environment Variables

Configuration is loaded in `backend/config/config.go` with strict environment variable enforcement.

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | string | `8080` | Port for the HTTP API server |
| `GIN_MODE` | string | `debug` | Gin runtime mode (`debug` or `release`) |
| `ALLOWED_ORIGINS` | string | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated CORS origins |
| `DB_HOST` | string | *(Required env var)* | Cloud MySQL host address |
| `DB_PORT` | string | `3306` | Cloud MySQL port |
| `DB_USER` | string | *(Required env var)* | Cloud MySQL user |
| `DB_PASSWORD` | string | `*** (redacted)` | Cloud MySQL password (required, no fallback) |
| `DB_NAME` | string | *(Required env var)* | Cloud MySQL database schema name |
| `DB_CHARSET` | string | `utf8mb4` | Character encoding |
| `AUTO_MIGRATE` | bool | `false` | Runs GORM AutoMigrate on startup when `true` |
| `AUTO_SEED` | bool | `false` | Populates mock catalog if tables are empty |
| `JWT_SECRET` | string | *(Required env var)* | Secret key for signing and validating JWT tokens (HS256) |
| `JWT_EXPIRATION_HOURS` | int | `72` | Lifespan of issued JWT tokens in hours |
| `CLOUDINARY_CLOUD_NAME` | string | *(Required env var)* | Cloudinary account cloud name (e.g. `wlasi06s`) |
| `CLOUDINARY_API_KEY` | string | *(Required env var)* | Cloudinary REST API access key |
| `CLOUDINARY_API_SECRET` | string | *(Required env var)* | Cloudinary API secret for authenticated signing |

### Connection Pooling for Remote Latency
Because the database is hosted remotely on Hostinger (`srv2113.hstgr.io`), connection pooling is configured in `backend/config/database.go` to prevent socket exhaustion and latency spikes:
- `sqlDB.SetMaxIdleConns(5)`
- `sqlDB.SetMaxOpenConns(20)`
- `sqlDB.SetConnMaxIdleTime(1 * time.Minute)`
- `sqlDB.SetConnMaxLifetime(3 * time.Minute)`

---

## 3. Database Models & Schema Specifications

### 3.1 Vehicles (`models.Vehicle` -> table `vehicles`)
Represents verified vehicle listings with Nigerian automotive market attributes:
- `id` (VARCHAR 64, PK): e.g., `v-toyota-corolla-2018`
- `title` (VARCHAR 255): Full title e.g. `2018 Toyota Corolla LE (First Body)`
- `year` (INT): Manufacturing year
- `make` (VARCHAR 100, INDEX): Brand e.g. `Toyota`
- `model` (VARCHAR 100, INDEX): Model e.g. `Corolla`
- `trim` (VARCHAR 100): Trim line e.g. `LE`
- `bodyType` (VARCHAR 50, INDEX): `Sedan`, `SUV`, `Pickup`, `Coupe`, etc.
- `condition` (VARCHAR 50, INDEX): `Foreign Used (Tokunbo)`, `Nigerian Used`, `Brand New`
- `mileage` (INT): Mileage in km
- `transmission` (VARCHAR 50): `Automatic`, `Manual`
- `fuelType` (VARCHAR 50): `Petrol`, `Diesel`, `Hybrid`, `Electric`
- `engineSize` (VARCHAR 50): e.g. `1.8L 4-Cylinder`
- `vin` (VARCHAR 50, UNIQUE): 17-character VIN
- `price` (DECIMAL 15,2, INDEX): Listing price in NGN
- `marketPriceMin` / `marketPriceMax` (DECIMAL 15,2): Algorithmic fair-value price range
- `priceRating` (VARCHAR 50): `great`, `good`, `fair`, `high`
- `priceVerdict` (TEXT): Market justification copy
- `trustTier` (INT 1-5, INDEX): Platform verification tier
- `trustTierLabel` (VARCHAR 100): e.g. `Tier 4: Comprehensive Tech Inspected`
- `images` (JSON): Array of vehicle image URLs
- `publicLocation` (VARCHAR 150): e.g. `Ikeja, Lagos`
- `exactLocation` (VARCHAR 255): Specific lot/yard address
- `sellerId` (VARCHAR 64, INDEX): Linked `DealerShop.id` or private seller ID
- `sellerType` (VARCHAR 50): `dealer` or `private`
- `sellerName` (VARCHAR 150), `sellerPhone` (VARCHAR 50), `sellerRating` (DECIMAL 3,2)
- Document verification flags: `customsDoc`, `registrationDoc`, `roadworthiness`, `tintPermit`, `policeExtracted` (BOOLEAN)
- `healthScore` (INT 0-100): Mechanical health index
- `latestInspectionId` (VARCHAR 64): Link to latest inspection report
- `featured` (BOOLEAN, INDEX): Highlighted on homepage hero

### 3.2 Dealer Shops (`models.DealerShop` -> table `dealer_shops`)
- `id` (VARCHAR 64, PK), `slug` (VARCHAR 100, UNIQUE)
- `name` (VARCHAR 150), `tagline` (VARCHAR 255), `logo` (VARCHAR 255), `banner` (VARCHAR 255)
- `location` (VARCHAR 100), `address` (VARCHAR 255)
- `rating` (DECIMAL 3,2), `reviewCount` (INT), `verifiedCAC` (BOOL)
- `plan` (VARCHAR 50), `activeListingsCount` (INT)
- `phone`, `whatsapp`, `email`, `operatingHours`, `joinedDate`

### 3.3 Technicians (`models.Technician` -> table `technicians`)
- `id` (VARCHAR 64, PK), `name` (VARCHAR 150), `badge` (VARCHAR 100), `avatar` (VARCHAR 255)
- `rating` (DECIMAL 3,2), `completedJobs` (INT)
- `serviceAreas` (JSON), `specialties` (JSON)
- `workshopAddress` (VARCHAR 255), `availability` (VARCHAR 50), `hourlyRate` (DECIMAL 10,2)

### 3.4 Inspection Reports (`models.InspectionReport` -> table `inspection_reports`)
- `id` (VARCHAR 64, PK), `vehicleId` (VARCHAR 64), `vehicleTitle`, `vehicleVin`
- `buyerId`, `technicianId`, `technicianName`, `technicianAvatar`, `technicianPhone`, `technicianTier`
- `inspectionTier` (`Standard`, `Comprehensive`, `Pre-Purchase Master`)
- `status` (`requested`, `in_progress`, `completed`, `cancelled`)
- `scheduledDate`, `completedDate`, `overallScore` (0-100)
- `categories` (JSON 150-point checklist scores and findings)
- `technicianSummary` (TEXT), `repairCostMin`, `repairCostMax`, `media` (JSON photos/videos)

### 3.5 Leads & Inquiries (`models.Lead` -> table `leads`)
- `id` (VARCHAR 64, PK), `buyerName`, `buyerPhone`, `buyerCity`
- `vehicleId`, `vehicleTitle`, `vehiclePrice`
- `type` (`inspection_request`, `viewing_schedule`, `direct_inquiry`, `concierge`)
- `status` (`new`, `routed`, `contacted`, `completed`, `cancelled`)
- `sellerId`, `technicianId`, `date`, `note`

### 3.6 Swaps & Trade-Ins (`models.SwapRequest` -> table `swap_requests`)
- `id` (VARCHAR 64, PK), `customerName`, `customerPhone`
- `currentCar`, `currentCarImage`, `appraisedEquity` (DECIMAL 15,2)
- `targetCar`, `targetCarPrice` (DECIMAL 15,2), `platformDiscount`, `netTopUp` (DECIMAL 15,2)
- `status` (`Pending Audit`, `Under Inspection`, `Approved`, `Completed`, `Rejected`)
- `scheduledDate`, `assignedTech`

### 3.7 Advertising Campaigns (`models.Campaign` -> table `campaigns`)
- `id` (VARCHAR 64, PK), `advertiser`, `placement`, `creativeImage`
- `budget`, `dates`, `impressionsDelivered`, `impressionGoal`, `clicks`
- `status` (`Active`, `Draft`, `Paused`, `Completed`), `targetCity`

### 3.8 Users (`models.User` -> table `users`)
- `id` (VARCHAR 64, PK): Unique prefixed identifier (`usr_` + UUIDv4)
- `name` (VARCHAR 150): Full user name
- `email` (VARCHAR 191, UNIQUE, INDEX): Normalized lowercase email address
- `phone` (VARCHAR 50): Contact telephone number
- `passwordHash` (VARCHAR 255): Bcrypt-hashed password (cost 12), excluded from JSON serialization (`json:"-"`)
- `role` (VARCHAR 50, INDEX): User authorization role (`buyer`, `seller`, `dealer`, `technician`, `admin`)
- `isVerified` (BOOLEAN): Email / account verification status
- `createdAt` / `updatedAt` (DATETIME): Automatic GORM lifecycle timestamps

### 3.9 Saved Vehicles (`models.SavedVehicle` -> table `saved_vehicles`)
- `id` (VARCHAR 64, PK): Unique bookmark record identifier
- `userId` (VARCHAR 64, INDEX): Foreign key reference to `users.id`
- `vehicleId` (VARCHAR 64, INDEX): Foreign key reference to `vehicles.id`
- `createdAt` (DATETIME): Timestamp when vehicle was added to user's garage bookmark list

### 3.10 Conversations & Direct Messages (`models.Conversation` & `models.Message`)
- **Conversation** (`table conversations`):
  - `id` (VARCHAR 64, PK): Unique thread identifier
  - `vehicleId` (VARCHAR 64, INDEX): Target vehicle reference
  - `buyerId` (VARCHAR 64, INDEX): Initiating buyer user ID
  - `sellerId` (VARCHAR 64, INDEX): Vehicle seller / dealer owner ID
  - `dealerId` (VARCHAR 64, optional): Dealership profile ID
  - `lastMessage` (TEXT), `lastMessageAt` (DATETIME, INDEX)
  - `vehicleTitle` (VARCHAR 255), `vehicleImage` (VARCHAR 500), `vehiclePrice` (DECIMAL 15,2)
  - `buyerName` (VARCHAR 150), `sellerName` (VARCHAR 150)
  - `createdAt`, `updatedAt`, `deletedAt` (GORM soft delete)
  - `unreadCount` (computed non-persisted integer)
- **Message** (`table messages`):
  - `id` (VARCHAR 64, PK): Message UUID
  - `conversationId` (VARCHAR 64, INDEX): Parent conversation thread
  - `senderId` (VARCHAR 64, INDEX): Sender user ID
  - `senderName` (VARCHAR 150), `senderRole` (VARCHAR 50)
  - `body` (TEXT): Message text
  - `readAt` (DATETIME, INDEX): Read receipt timestamp
  - `createdAt`, `updatedAt`, `deletedAt`

### 3.11 Dealer Subscriptions (`models.Subscription` -> table `subscriptions`)
- `id` (VARCHAR 64, PK): Subscription record identifier
- `dealerId` (VARCHAR 64, INDEX): Foreign key reference to `dealer_shops.id`
- `plan` (VARCHAR 50): Plan tier (`Basic Shop`, `Pro Shop`, `Premium Shop`)
- `status` (VARCHAR 50, INDEX): `active`, `expired`, `grace_period`
- `billingCycle` (VARCHAR 50): Default `monthly`
- `listingsLimit` (INT): Quota capacity (15, 60, or 9999)
- `price` (DECIMAL 12,2): Plan cost in NGN (₦25,000, ₦65,000, ₦150,000)
- `expiresAt`, `createdAt`, `updatedAt` (DATETIME)

### 3.12 Document Verifications (`models.Verification` -> table `verifications`)
- `id` (VARCHAR 64, PK): Verification audit ticket identifier
- `userId` (VARCHAR 64, INDEX): Submitting user ID
- `entityType` (VARCHAR 50, INDEX): Verification type (`customs_sgd`, `seller_nin`, `tech_license`, `dealer_cac`)
- `entityId` (VARCHAR 64, INDEX): Associated vehicle ID, user ID, or dealership shop ID
- `documentUrl` (VARCHAR 500): Cloudinary secure HTTPS document/image URL
- `vin` (VARCHAR 50, INDEX, optional): 17-character VIN for vehicle customs filings
- `status` (VARCHAR 50, INDEX): `pending`, `approved`, `rejected`
- `notes` (TEXT): Internal auditor review notes
- `reviewedBy` (VARCHAR 64), `reviewedAt` (DATETIME)
- `createdAt`, `updatedAt` (DATETIME)

### 3.13 Financial Transactions (`models.Transaction` -> table `transactions`)
- `id` (VARCHAR 64, PK): Unique transaction UUID
- `reference` (VARCHAR 100, UNIQUE, INDEX): Gateway reference (e.g. `CP-TXN-...`)
- `userId` (VARCHAR 64, INDEX): Payer or beneficiary user ID
- `userName` (VARCHAR 150), `userEmail` (VARCHAR 150), `userRole` (VARCHAR 50)
- `type` (VARCHAR 50, INDEX): `inspection_escrow`, `dealer_subscription`, `ad_campaign`, `tech_payout`
- `title` (VARCHAR 255): Descriptive transaction purpose
- `entityId` (VARCHAR 64, INDEX): Linked entity (vehicleId, inspectionId, dealerId, campId)
- `amount` (INT64): Amount in Nigerian Naira (₦)
- `currency` (VARCHAR 10): Default `NGN`
- `gateway` (VARCHAR 50): `paystack`, `flutterwave`, `bank_transfer`, `wallet`
- `status` (VARCHAR 50, INDEX): `pending`, `held_in_escrow`, `settled`, `refunded`, `failed`
- `notes` (TEXT): Audit/reconciliation details
- `createdAt`, `updatedAt` (DATETIME)

### 3.14 OTP Verifications (`models.OTPVerification` -> table `otp_verifications`)
- `id` (VARCHAR 64, PK): OTP record identifier
- `email` (VARCHAR 191, INDEX): Target recipient email
- `code` (VARCHAR 10): 6-digit cryptographic numeric token (excluded from JSON serialization `json:"-"`)
- `type` (VARCHAR 30, INDEX): Purpose (`signup`, `password_reset`)
- `expiresAt` (DATETIME): Code expiration timestamp (15 minutes)
- `attempts` (INT): Brute-force counter (capped at 5 attempts)
- `isUsed` (BOOLEAN): Invalidation flag upon consumption
- `createdAt` (DATETIME)

---

## 4. API Endpoints Reference

All routes are grouped under `/api`.

### 4.1 Authentication & Authorization
- `POST /api/auth/register` — Public registration. Validates email format, enforces $\ge 6$ character password, checks for duplicate email (409 Conflict), hashes password using bcrypt, validates requested role (defaults to `buyer`, blocks self-assigning `admin`), and returns signed JWT token + sanitized user profile.
- `POST /api/auth/login` — Public login. Performs case-insensitive email lookup, verifies bcrypt password hash, generates signed HS256 JWT token (default 72h expiration), and returns token + sanitized user profile.
- `GET /api/auth/me` — Protected endpoint (`Authorization: Bearer <token>`). Validates token and returns authenticated user profile.
- `PUT /api/auth/profile` — **Protected** (Authenticated user). Updates user full name and/or telephone number. Sanitizes input and returns updated profile.
- `PUT /api/auth/password` — **Protected** (Authenticated user). Validates current password using bcrypt, enforces $\ge 6$ character length on new password, updates bcrypt hash in database, and returns confirmation.
- `PATCH /api/auth/role` & `POST /api/auth/upgrade-role` — **Protected** (Authenticated user). 1-Click Role Upgrade endpoint:
  - **Identity Binding**: Strictly reads `userID` from session context (`c.GetString("userID")`). Never trusts client-submitted user IDs.
  - **Role Whitelist**: Strictly permits target roles `seller`, `dealer`, or `technician`. Blocks privilege escalation to `admin` (400 Bad Request).
  - **Token Reissuance**: Immediately issues and signs a fresh JWT token with updated role claims, returning `{ status: "success", token: newToken, user: user }`.
  - **Idempotency**: If the user already holds the target role, returns HTTP 200 with current state and a valid token instead of erroring.
  - **Showroom Auto-Provisioning**: Upgrading to `dealer` automatically provisions a [`models.DealerShop`](file:///C:/Users/SHUDDY/Desktop/carplug_ng/backend/models/dealer.go) record bound to the user.


### 4.2 System & Health
- `GET /api/health` — **Public**. Returns status, database connection state, and uptime. Internal infrastructure details (`dbHost`, `dbName`, raw error traces) are concealed unless `DEBUG_HEALTH=true` is set.

### 4.3 Vehicles
- `GET /api/vehicles` — **Public**. Query params: `make`, `model`, `bodyType`, `condition`, `minTrustTier`, `trustTier`, `priceRating`, `sellerId`, `featured`, `minPrice`, `maxPrice`, `q`, `sortBy` (`trust`, `price_asc`, `price_desc`, `featured`), `page` (default: 1), `pageSize` (default: 24). Returns `{ data, total, page, pageSize }` envelope with masked seller phone numbers.
- `GET /api/vehicles/:id` — **Public**. Retrieve a single vehicle by ID (with masked seller phone number).
- `POST /api/vehicles` — **Protected** (`seller`, `dealer`, `admin`). Create a new vehicle listing (JSON body).
- `PUT /api/vehicles/:id` — **Protected** (`seller`, `dealer`, `admin`). Update vehicle listing (supports zero-value booleans and numerical fields).
- `DELETE /api/vehicles/:id` — **Protected** (`seller`, `dealer`, `admin`). Delete vehicle listing.

### 4.4 Dealers & Dealership Subscriptions
- `GET /api/dealers` — **Public**. List all registered dealer shops.
- `GET /api/dealers/me` — **Protected** (`dealer`, `admin`). Retrieves or auto-provisions the authenticated dealer's verified storefront showroom profile.
- `GET /api/dealers/me/subscription` — **Protected** (`dealer`, `admin`). Returns current dealership subscription status, quota capacity, active listing count, and remaining billing days.
- `POST /api/dealers/subscription/upgrade` — **Protected** (`dealer`, `admin`). Upgrades subscription tier (`Basic Shop` [15 cars, ₦25k], `Pro Shop` [60 cars, ₦65k], `Premium Shop` [unlimited, ₦150k]). Updates quota limits and timestamps.
- `GET /api/dealers/:id` — **Public**. Get dealer profile by either slug or ID.
- `GET /api/dealers/:id/inventory` — **Public**. Get all vehicles for a dealer.
- `POST /api/dealers` — **Protected** (`dealer`, `admin`). Register a new dealer shop.
- `PUT /api/dealers/:id` — **Protected** (`dealer`, `admin`). Update dealership branding, contact numbers, operating hours, and address. Validates ownership (`dealer.UserID == userID || role == "admin"`).

### 4.5 Technicians
- `GET /api/technicians` — **Public**. List all certified technicians (filter `area`).
- `GET /api/technicians/me/inspections` — **Protected** (`technician`, `admin`). Returns dispatches assigned to the authenticated technician (`technician_id == userID`).
- `GET /api/technicians/:id` — **Public**. Get technician by ID.

### 4.6 Inspections
- `GET /api/inspections` — **Public**. List inspections (filter `status`, `buyerId`, `vehicleId`, `technicianId`).
- `GET /api/inspections/:id` — **Public**. Full inspection report with checklist categories.
- `POST /api/inspections` — **Protected** (Authenticated user). Book an inspection request. Automatically attributes `buyerId` from auth context, resolves target vehicle title and VIN, and auto-populates technician credentials.
- `PATCH /api/inspections/:id/status` — **Protected** (`technician`, `admin`). Update inspection status (`{"status": "..."}`).
- `POST /api/inspections/:id/report` — **Protected** (`technician`, `admin`). Submit and publish completed 150-point inspection health report with mechanical score (0-100), plain-language mechanic summary, estimated repair budget min/max, categories breakdown, and diagnostic media. Enforces assignment ownership (`technician_id == userID || userRole == "admin"`). **Automated Vehicle Upgrade**: Automatically updates target vehicle listing in `vehicles` table: sets `trust_tier = 5`, `trust_tier_label = "Tier 5 Verified • 150-Point Certified"`, `health_score = overallScore`, and links `latest_inspection_id = report.id`. **Automated Technician Earnings Settlement**: Automatically credits the inspection fee to the technician's platform wallet ledger (`type = "inspection_earning"`, `status = "settled"`).

### 4.7 Leads & Inquiries
- `GET /api/leads` — **Protected** (`seller`, `dealer`, `admin`). List leads (filter `sellerId`, `status`, `type`), with `page` (default: 1) and `pageSize` (default: 50). Returns `{ data, total, page, pageSize }`.
- `POST /api/leads` — **Public**. Submit lead/inquiry.
- `PATCH /api/leads/:id/status` — **Protected** (`seller`, `dealer`, `admin`). Update lead status (`{"status": "..."}`). Validates status against allowed enum (`new`, `routed`, `contacted`, `completed`, `cancelled`) and enforces strict seller/dealer ownership checks (`lead.SellerID == userID` or dealer showroom owner, or `admin`), blocking unauthorized cross-seller mutations with HTTP 403 Forbidden.

### 4.8 Swaps & Trade-Ins
- `GET /api/swaps` — **Public**. List swap requests (filter `status`).
- `POST /api/swaps` — **Protected** (Authenticated user). Submit car swap trade-in application.
- `PATCH /api/swaps/:id/status` — **Protected** (`admin`). Update swap status (`{"status": "..."}`).

### 4.9 Campaigns
- `GET /api/campaigns` — **Public**. List advertising campaigns.
- `POST /api/campaigns` — **Protected** (`admin`). Create advertising campaign.
- `PATCH /api/campaigns/:id/status` — **Protected** (`admin`). Update campaign status.

### 4.10 Saved Vehicles (Garage)
- `GET /api/saved-vehicles` — **Protected** (Authenticated user). Retrieve user's full saved vehicle list.
- `GET /api/saved-vehicles/ids` — **Protected** (Authenticated user). Retrieve array of bookmarked vehicle ID strings for instant client badge hydration.
- `POST /api/saved-vehicles/:vehicleId` — **Protected** (Authenticated user). Save vehicle to user's garage.
- `DELETE /api/saved-vehicles/:vehicleId` — **Protected** (Authenticated user). Remove vehicle from saved list.
- `POST /api/saved-vehicles/toggle/:vehicleId` — **Protected** (Authenticated user). Atomically toggle saved state returning `{ saved: boolean }`.

### 4.11 Cloudinary Image Uploads
- `POST /api/upload/images` — **Protected** (Authenticated user). Accepts multipart form data (`multipart/form-data`) with field name `images` (single or multiple files up to 50MB total). Validates allowed extensions (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`). Automatically generates unique collision-free filenames with timestamps and cryptographic random suffixes. Organizes into dedicated cloud folders (`carplug/vehicles/`). Uploads directly to Cloudinary and returns:
  ```json
  {
    "count": 1,
    "message": "Images uploaded successfully",
    "urls": [
      "https://res.cloudinary.com/wlasi06s/image/upload/v1789078090/carplug/vehicles/car1_1789078081_5d88d899.jpg"
    ]
  ```

### 4.12 Conversations & Direct Messaging (Chat)
- `POST /api/conversations` — **Protected** (Authenticated user). Start a new direct conversation thread regarding a vehicle listing or return the existing active thread. Accepts `{"vehicleId": "v-...", "message": "..."}`.
- `GET /api/conversations` — **Protected** (Authenticated user). Retrieve all active conversation threads the user is participating in (`buyer_id == UserID || seller_id == UserID`), sorted by latest activity, complete with vehicle metadata and computed `unreadCount`.
- `GET /api/conversations/:id` — **Protected** (Authenticated user). Fetch single conversation metadata with ownership check.
- `GET /api/conversations/:id/messages` — **Protected** (Authenticated user). Retrieve message history for a conversation and automatically mark incoming messages as read (`read_at = NOW()`).
- `POST /api/conversations/:id/messages` — **Protected** (Authenticated user). Append a message to a thread (`{"body": "..."}`), enforcing participation security and updating conversation `last_message` / `last_message_at`.

### 4.13 Admin Governance & Listing Moderation
- `GET /api/admin/metrics` — **Protected** (`admin`). Calculates platform-wide telemetry: total vehicles, active listings, verified listings count, Tier 3+ percentage, active registered dealers, total completed 150-point inspections, pending KYC compliance verifications, and 30-day transaction volume aggregate (₦).
- `GET /api/admin/flagged-listings` — **Protected** (`admin`). Runs algorithmic anomaly detection on vehicle listings, detecting extreme pricing anomalies (< ₦500,000 or > ₦200,000,000), duplicate or missing VIN declarations, unverified uninspected listings, and suspended status.
- `PATCH /api/admin/listings/:id/status` — **Protected** (`admin`). Moderates listing state (`{"status": "published" | "suspended" | "deleted"}`).

### 4.14 1-Click Role Upgrade Architecture ("Become a Seller")
- **Core Problem Solved**: Eliminates the friction of requiring users to register separate accounts with different email addresses to switch between buying and selling cars.
- **Workflow & Rules**:
  1. **Identity Preserved**: User maintains their exact single email address, password hash, and UUID across all roles.
  2. **Security & Validation**: Target role must be in `{"seller", "dealer", "technician"}`. Privilege escalation to `admin` is blocked (400). Identity is extracted directly from session context `c.GetString("userID")`.
  3. **Instant Token Refresh**: Old JWT with `role: "buyer"` is replaced immediately by issuing a fresh JWT signed with `role: "seller"`. The frontend writes this token directly to `localStorage` without a page refresh.
  4. **Idempotency**: Existing sellers calling the endpoint again receive HTTP 200 with their current user state and a fresh valid token.
  5. **Auto-Provisioning**: Upgrading to a dealer auto-provisions a showroom profile (`models.DealerShop`) bound to the user's ID.

### 4.15 Brevo Transactional Email Verification & Account Recovery (OTP)
- **Brevo REST API v3 Client** (`backend/utils/brevo.go`): Dispatches transactional emails via `https://api.brevo.com/v3/smtp/email`. Supports configured `BREVO_API_KEY`, `BREVO_SENDER_NAME`, and `BREVO_SENDER_EMAIL` in `backend/config/config.go`. Seamless dev mode simulator automatically outputs formatted emails and 6-digit codes to stdout when no API key is supplied.
- **OTP Verification Model** (`backend/models/otp.go`): Stores `OTPVerification` records (`id`, `email`, `code`, `type`, `expires_at`, `attempts`, `is_used`, `created_at`).
- **Endpoints**:
  - `POST /api/auth/register` — Creates user (`is_verified: false`), generates 6-digit cryptographic OTP, dispatches Brevo verification email asynchronously, and returns `requiresVerification: true`.
  - `POST /api/auth/verify-otp` — Validates 6-digit code with 5-attempt brute-force protection, marks `is_verified: true`, invalidates OTP, and reissues a fresh JWT token.
  - `POST /api/auth/resend-otp` — Generates and dispatches a fresh code, enforcing a 60-second cooldown rate limit (HTTP 429).
  - `POST /api/auth/forgot-password` — Anti-enumeration endpoint dispatching a 15-minute 6-digit recovery code via Brevo.
  - `POST /api/auth/reset-password` — Validates recovery code, updates password with bcrypt (cost 12), invalidates OTP, and reissues a fresh JWT session.

### 4.16 Document Verification & KYC Compliance Queue
- `POST /api/verifications` — **Protected** (Authenticated user). Submit compliance verification request (`entityType`: `"customs_sgd" | "seller_nin" | "tech_license" | "dealer_cac"`, `entityId`, `documentUrl`, optional `vin`). Automatically binds `userId` from auth session context.
- `GET /api/verifications/me` — **Protected** (Authenticated user). Self-scoped endpoint returning verification requests belonging strictly to the calling user (`WHERE user_id = ?`).
- `GET /api/verifications` — **Protected** (`admin`). Master audit queue for platform administrators. Supports filtering by `status` (`pending`, `approved`, `rejected`) and `entityType`.
- `PATCH /api/verifications/:id/status` — **Protected** (`admin`). Updates verification status (`"approved"` or `"rejected"`) and appends auditor notes.
  - **Automated Trust Elevating Side Effects**:
    - Approving `"customs_sgd"`: Automatically locates vehicle listing by VIN or `entityId`, sets `customs_doc = true`, `customs_status = "Fully Cleared"`, and elevates `trust_tier = 3` (`"Tier 3: Customs SGD Verified"`).
    - Approving `"tech_license"`: Upgrades technician badge to Master Certified.
    - Approving `"dealer_cac"`: Sets dealership `VerifiedCAC = true` in `dealer_shops` table.
    - Approving `"seller_nin"`: Sets user `IsVerified = true` in `users` table.

### 4.17 Financial Ledger, Escrow & Technician Payout Wallet
- `POST /api/payments/initialize` — **Protected** (Authenticated user). Generates a unique transaction reference (`CP-TXN-...`), records a pending transaction entry, and produces a Paystack checkout redirect URL.
- `GET /api/payments/transactions` — **Protected** (`admin`). Retrieves the platform master financial ledger. Returns an aggregate envelope containing `transactions` array, `totalVolume` (₦), `escrowVolume` (₦), and `settledVolume` (₦). Supports query filters: `type` and `status`.
- `GET /api/payments/wallet` — **Protected** (Authenticated user). Computes technician or partner wallet balances: `availableCash` (settled technician payouts), `escrowHold` (active in-flight inspection jobs), and `lifetimeEarnings` (total settled earnings).
- `POST /api/payments/payout` — **Protected** (`technician`, `admin`). Submits bank withdrawal / instant payout request (`amount`, `bankName`, `accountNumber`, `accountName`). Creates `type = "tech_payout"`, `gateway = "bank_transfer"`, `status = "settled"`.
- `PATCH /api/payments/payouts/:id/status` — **Protected** (`admin`). Updates payout disbursement state.
- `POST /api/payments/webhook` — **Public**. Webhook endpoint receiving transaction completion events from Paystack or flutterwave, validating signature and updating transaction state to `settled` or `held_in_escrow`.

---

## 5. Development & Execution Guide

### Starting the Server in Development
To run the server without blocking terminal commands:

```bash
# In backend directory:
go run cmd/server/main.go
```

### Compiling Production Binary
```bash
go build -o bin/server.exe cmd/server/main.go
```

---

## 6. Backend Integration Changelog & Step Tracker

| Step | Component | Status | Details |
| :--- | :--- | :--- | :--- |
| **01** | Architecture & Init | Done | Initialized Go module `github.com/ifeanyireed/carplug_ng/backend`, GORM MySQL driver, and Gin framework. |
| **02** | Models & Schemas | Done | Created 7 core models: Vehicle, DealerShop, Technician, InspectionReport, Lead, SwapRequest, Campaign. |
| **03** | Cloud DB Connection | Done | Configured connection to Hostinger MySQL with optimized connection pooling (MaxIdle: 5, MaxOpen: 20, IdleTimeout: 1m). |
| **04** | Auto-Migrations & Seed | Done | GORM AutoMigrate schema creation + seeded initial Nigerian vehicles, dealer shops, and technicians. |
| **05** | Controllers & Filtering | Done | Implemented search filters (`condition`, `minTrustTier`, `priceRating`, `sortBy`), slug resolution for dealers, and health error reporting. |
| **06** | Documentation | Done | Created `backend/documentation.md` containing full architecture, schema, endpoint reference, and step tracker. |
| **07** | Live Verification | Done | Server running on port 8080, health endpoint verified healthy with active MySQL connection. |
| **08** | Client Service Integration | Done | Verified end-to-end compatibility with Next.js frontend API service layer (`api.ts`), testing Vehicles, Dealers, Technicians, Swaps, Campaigns, and Leads. |
| **09** | Priority 0 Credential Sanitization | Done | Removed hardcoded credential fallbacks from `config.go`, enforced strict startup validation, sanitized `.env.example` with safe templates, and redacted `documentation.md`. |
| **10** | Priority 2 CORS Allowlist | Done | Replaced reflection CORS policy in `routes.go` with strict origin allowlist validation matching `cfg.AllowedOrigins`. |
| **11** | Priority 5 Dependency Hygiene | Done | Executed `go mod tidy`, explicitly declared direct vs indirect dependencies, and configured `go 1.22.0` in `go.mod`. |
| **12** | Priority 6 Health Endpoint Hardening | Done | Hardened `/api/health` in `health_controller.go` to hide internal host/DB/SQL error traces unless `DEBUG_HEALTH=true`. |
| **13** | Priority 4 GORM Zero-Value Fix | Done | Modified `UpdateVehicle` in `vehicle_controller.go` to bind `map[string]interface{}`, ensuring `featured: false`, `price: 0`, and cleared booleans persist properly. |
| **14** | Priority 3 & 7 Privacy & Pagination | Done | Added `MaskPhone` masking helper for public seller phone numbers, and added `page`, `pageSize`, and `total` pagination to `/api/vehicles` and `/api/leads`. |
| **15** | User Auth & RBAC | Done | Implemented User model (`models.User`), bcrypt password hashing, JWT generation/validation (HS256 with configurable TTL), AuthController (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`), AuthMiddleware, and RequireRoles RBAC protecting vehicle mutations, dealer creation, inspection status, swap status, campaign admin, and lead management while preserving public marketplace discovery. |
| **16** | Saved Vehicles (Garage API) | Done | Created `models.SavedVehicle`, registered migration in `main.go`, built `saved_vehicle_controller.go` (`GetSavedVehicles`, `GetSavedVehicleIDs`, `SaveVehicle`, `RemoveSavedVehicle`, `ToggleSavedVehicle`), and wired protected `/api/saved-vehicles` routes with JWT auth. |
| **17** | Hostinger MySQL Remote Connectivity & Seeding | Done | Connected to remote Hostinger Cloud MySQL (`srv2113.hstgr.io`) via VPN tunnel. Executed complete table migrations across all 9 tables, seeded 5 real Nigerian automotive inventory vehicles and verified live `GET /api/vehicles` and `GET /api/dealers`. Tuned server startup latency by switching `AUTO_MIGRATE=false` in `.env` to eliminate 90s schema re-inspection overhead. |
| **18** | Cloudinary Image Storage Service | Done | Integrated official Cloudinary Go SDK v2 (`github.com/cloudinary/cloudinary-go/v2`). Built upload utility (`backend/utils/cloudinary.go`) with automated collision-free file naming, folder compartmentalization (`carplug/vehicles/`), and secure URL extraction. Implemented `POST /api/upload/images` controller with 50MB file size limit, extension validation, and Bearer auth. Verified live image upload to cloud `wlasi06s` returning verified HTTPS URLs. |
| **19** | Remote MySQL Connection Pool Hardening | Done | Hardened GORM connection pool in `database.go` for remote cloud MySQL over VPN. Added `timeout=10s&readTimeout=30s&writeTimeout=30s` to DSN. Reduced idle timeout to 15s (`SetConnMaxIdleTime(15s)`), connection max lifetime to 1m (`SetConnMaxLifetime(1m)`), and capped idle connections (`SetMaxIdleConns(2)`), eliminating dropped TCP socket errors (`unexpected EOF` / `invalid connection`). |
| **20** | Master 7-Step Technical Roadmap | Done | Formulated comprehensive system audit across all 43+ routes and backend modules. Lodged `nextstep.md` detailing the 7 undone steps (Real-time Messaging/Chat, 150-pt Inspection/Report completion, Dealer Storefronts & Subscriptions, Vehicle Ownership & Editing, KYC & Customs Document Queue, Financial Ledger/Escrow/Wallet, Buyer Concierge & District Map Discovery). |
| **21** | Priority 0: Role & Ownership Enforcement | Done | Wired `RequireRoles` across protected mutations (`POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` -> `seller`, `dealer`, `admin`; `POST /api/dealers` -> `dealer`, `admin`; `PATCH /api/inspections/:id/status` -> `technician`, `admin`; `GET/PATCH /api/leads` -> `seller`, `dealer`, `admin`; `PATCH /api/swaps/:id/status` -> `admin`; `POST/PATCH /api/campaigns` -> `admin`). Implemented strict seller ID attribution on `CreateVehicle` and verified listing ownership in `UpdateVehicle` and `DeleteVehicle` (only owner or admin can mutate/delete). Verified via live two-account test with buyer, seller, and cross-seller attempts (HTTP 403 / 200). |
| **22** | Cloud DB Resilience & Dev CORS Allowlist | Done | Enhanced `InitDB` in `backend/config/database.go` with 5-attempt retry loop to gracefully handle network packet drops (`unexpected EOF`) to Hostinger MySQL. Hardened `CORSMiddleware` in `backend/routes/routes.go` to automatically permit all loopback and local development origins (`http://localhost:*`, `http://127.0.0.1:*`, `http://[::1]:*`), ensuring browser preflights never reject frontend dev servers on dynamic ports. |
| **23** | Priority 1.1: Frontend Lint Cleanup & Race Condition Fixes | Done | Resolved all React 19 / Next.js ESLint errors and race conditions across the frontend: preserved SSR-hydration guard in `Navbar.tsx` via `useSyncExternalStore`; refactored in-effect data fetching across `dealer/dashboard`, `dealer/vehicles`, `seller/listings`, and `technician/inspections` to inline async effects with `refreshIndex`; eliminated synchronous effect updates in `SavedVehiclesContext.tsx` via `queueMicrotask`; tightened typing across `SaveVehicleButton`, `ExploreVehiclesSection`, `Hero`, and `AuthModal`. Verified `go build ./...`, `go vet ./...`, `npx eslint .` (0 errors), and `npx next build` (38/38 routes compiled). |
| **24** | Roadmap Step 1: Direct Messaging & Buyer-Seller Chat Engine | Done | Implemented complete direct messaging suite: 1. `models.Conversation` & `models.Message` in `backend/models/conversation.go`. 2. Migrated tables over remote MySQL (`conversations`, `messages`). 3. Built `conversation_controller.go` (`StartConversation`, `GetConversations`, `GetConversationByID`, `GetMessages`, `SendMessage`) with participant ownership security and automatic read-receipt stamping (`read_at = NOW()`). 4. Registered `/api/conversations` routes in `backend/routes/routes.go`. 5. Executed live end-to-end integration test (`test_chat.js`) verifying registration, vehicle creation, buyer conversation start, seller inbox polling with unread counters, seller reply, and buyer thread retrieval (HTTP 201/200). |
| **25** | Roadmap Step 2: 150-Point Inspection & Health Report Compilation Pipeline | Done | Built complete technician inspection and certification pipeline: 1. Implemented `POST /api/inspections/:id/report` with overall mechanical score (0-100), plain-language technician summary, repair cost budget range, categories breakdown, media, and assignment ownership checks. 2. Automated vehicle listing upgrade: sets `trust_tier = 5`, `trust_tier_label = "Tier 5 Verified • 150-Point Certified"`, `health_score = payload.overallScore`, and `latest_inspection_id = report.id`. 3. Built `GET /api/technicians/me/inspections` for authenticated technician dispatch inbox. 4. Enhanced `POST /api/inspections` to auto-resolve buyer ID, target vehicle title/VIN, and technician badge/phone. 5. Verified with live integration test (`test_inspection.js`) asserting registration, dispatch, report filing, and Tier 5 auto-upgrade. |
| **26** | Roadmap Step 3: Dealer Storefront Management & Subscription Engine | Done | Implemented complete dealership storefront and subscription infrastructure: 1. Created `models.Subscription` (`id`, `dealer_id`, `plan`, `status`, `billing_cycle`, `listings_limit`, `price`, `expires_at`) and updated `models.DealerShop` with `user_id` and DB auto-migration check. 2. Implemented `PUT /api/dealers/:id` with strict dealership ownership/admin enforcement, updating brand profile and syncing active vehicle contacts (`seller_name`, `seller_phone`). 3. Implemented `GET /api/dealers/me` auto-provisioning verified storefront profile. 4. Implemented `GET /api/dealers/me/subscription` returning plan capacity, active listing count, and remaining billing days. 5. Implemented `POST /api/dealers/subscription/upgrade` supporting Basic Shop (15 cars, ₦25k), Pro Shop (60 cars, ₦65k), and Premium Shop (9999 cars, ₦150k), synchronizing across `subscriptions` and `dealer_shops` tables. 6. Verified via live integration test (`test_dealer.js`) passing all 8/8 assertions (registration, fetching, updating, blocking unauthorized buyer mutations with 403, and upgrading plan to Premium Shop). |
| **27** | Roadmap Step 4: Vehicle Inventory Ownership Security & Multi-Facet Query Engine | Done | Hardened vehicle listing lifecycle: 1. Expanded `GetVehicles` in `vehicle_controller.go` with multi-field facet filtering for `yearMin`, `yearMax`, `year`, `fuelType`, `transmission`, and `state`. 2. Fortified ownership enforcement in `UpdateVehicle` (`PUT /api/vehicles/:id`) and `DeleteVehicle` (`DELETE /api/vehicles/:id`) ensuring `existing.SellerID == userID` or seller owns matching dealership profile (`user_id == userID && id == existing.SellerID`), or caller has `admin` role. 3. Protected against seller identity hijacking via update body. 4. Verified live with integration test (`test_vehicle_security.js`) asserting registration of 2 dealers and buyer, listing creation, multi-facet query resolution, authorized update, 403 blocks on cross-dealer mutation, 403 blocks on buyer mutation, 403 blocks on cross-dealer deletion, and authorized owner deletion (HTTP 200). |
| **28** | Roadmap Step 5: Document Verification & KYC Compliance Audit Queue | Done | Implemented complete compliance audit pipeline: 1. Created `models.Verification` (`id`, `user_id`, `entity_type`, `entity_id`, `document_url`, `vin`, `status`, `notes`, `reviewed_by`, `reviewed_at`) with indexes and DB migration in `backend/config/database.go`. 2. Built `verification_controller.go` supporting `SubmitVerification` (`POST /api/verifications`), `GetVerifications` (`GET /api/verifications` with role-based scoping and status filters), and `UpdateVerificationStatus` (`PATCH /api/verifications/:id/status` restricted to admin). 3. Built automated compliance side-effects: approving `customs_sgd` automatically marks associated vehicle listing `customs_doc = true`, `customs_status = "Fully Cleared"`, and elevates `trust_tier = 3` (`Tier 3: Customs SGD Verified`); approving `tech_license` upgrades technician badge to Master Certified. 4. Fortified admin self-registration in `auth_controller.go` with admin secret key validation and internal `@carplug.ng` staff verification. 5. Verified with live integration test (`test_verification.js`) asserting seller document submissions, admin queue polling, 403 block on non-admin audit attempts, admin approval, automatic Tier 3 elevation, and duplicate rejection. |
| **29** | Roadmap Step 6: Financial Ledger, Escrow & Technician Payout Wallet | Done | Built platform financial and accounting infrastructure: 1. Created `models.Transaction` (`id`, `reference`, `user_id`, `user_name`, `user_email`, `user_role`, `type`, `title`, `entity_id`, `amount`, `currency`, `gateway`, `status`, `notes`) with indexes and DB auto-migration check in `backend/config/database.go`. 2. Built `payment_controller.go` supporting `GetTransactions` (`GET /api/payments/transactions` with volume aggregates: `totalVolume`, `escrowVolume`, `settledVolume`, and admin auth guard), `GetWallet` (`GET /api/payments/wallet` computing technician available cash, escrow in progress, and lifetime earnings), `InitializePayment` (`POST /api/payments/initialize` generating unique `CP-TXN` references and Paystack checkout URLs), `RequestPayout` (`POST /api/payments/payout` recording instant bank transfer disbursements to commercial banks), and `HandleWebhook` (`POST /api/payments/webhook`). 3. Added initial transaction seeds to `models.SeedInitialData`. 4. Verified live with integration test (`test_payments.js`) asserting buyer escrow initialization, dealer subscription settlement, admin master ledger retrieval with volume calculations, 403 forbidden block on unauthorized users, technician wallet check, bank withdrawal processing, and webhook receipt. |
| **30** | Roadmap Step 7: Buyer Concierge Sourcing & District Map Discovery | Done | Completed final roadmap feature: 1. Verified `models.Lead` and `controllers.CreateLead` (`POST /api/leads`) with `type = "concierge"` supporting buyer sourcing requests with target budget, desired vehicle make/model, condition, city, and sourcing priority. 2. Hardened `UpdateLeadStatus` (`PATCH /api/leads/:id/status`) with connection retry resilience for cloud MySQL drops. 3. Verified live with integration test (`test_concierge_map.js`) asserting concierge lead submission, admin lead querying by `type=concierge`, lead routing status mutation, and live district vehicle resolution. |
| **31** | Admin Governance Telemetry, Listing Moderation & User Security/Profile Management | Done | 1. Built `admin_controller.go` (`GetAdminMetrics`, `GetFlaggedListings`, `ModerateListingStatus`) calculating platform-wide inventory, KYC, dealer, inspection, and transaction volume KPIs, plus algorithmic anomaly detection for pricing irregularities and unverified listings. 2. Added `UpdateProfile` (`PUT /api/auth/profile`) and `ChangePassword` (`PUT /api/auth/password`) to `auth_controller.go` with bcrypt password verification. 3. Registered protected `/api/admin/*` and `/api/auth/*` routes in `routes.go`. 4. Verified live via end-to-end integration test (`test_dashboards_settings.js`) asserting admin registration, live metrics calculation, 403 non-admin block, flagged listing retrieval, suspension mutation, profile updates, invalid password rejection, and login verification with updated credentials (all 10/10 assertions passed). |
| **32** | 1-Click Role Upgrade Architecture ("Become a Seller") | Done | Implemented full role upgrade pipeline according to `backend/prompts.md`: 1. Built `UpgradeRole` (`PATCH /api/auth/role` & `POST /api/auth/upgrade-role`) extracting user ID strictly from authenticated JWT context, enforcing target role whitelist (`seller`, `dealer`, `technician`), rejecting unauthorized privilege escalation (`admin`), and updating user role in DB. 2. Auto-provisions `DealerShop` showroom profile when upgrading to dealer. 3. Idempotency: returning HTTP 200 with current state and valid token if user already holds target role. 4. Token Reissuance: immediately signs and returns a fresh JWT with updated role claims. 5. Verified via 17/17 automated integration tests (`test_role_upgrade.js`) including buyer vehicle publish block (403), privilege escalation rejection (400), role upgrade, reissued token validation, idempotency, upgraded vehicle publishing (200), and showroom auto-provisioning. |
| **33** | Brevo OTP Email Verification, Cooldown & Password Recovery | Done | Integrated Brevo REST API v3 transactional email client (`SendVerificationOTP`, `SendPasswordResetOTP`), created `models.OTPVerification` and migrated table to MySQL. Built `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp` (60s rate limit cooldown), `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password` with 5-attempt brute-force throttling and bcrypt re-hashing. Verified via 11/11 automated integration tests (`test_otp_brevo.js`) asserting registration, invalid code rejection, cooldown rate limit enforcement, successful verification, password reset, and authenticated login. |
| **34** | Priority 0: KYC Approval Trust Flag Activation | Done | Extended `UpdateVerificationStatus` in `verification_controller.go` to process `"dealer_cac"` (automatically setting `DealerShop.VerifiedCAC = true`) and `"seller_nin"` (automatically setting `User.IsVerified = true`). Ensures approved compliance audit requests immediately elevate dealer and seller trust badges across the platform. |
| **35** | Priority 1: KYC Route Hardening & Self-Scoped Endpoint Split | Done | Hardened KYC verification querying by splitting into dedicated handlers: 1. `GetMyVerifications` (`GET /api/verifications/me`) strictly self-scoped (`WHERE user_id = ?`) for authenticated users. 2. `GetVerifications` (`GET /api/verifications`) restricted to administrators via route-level `middleware.RequireRoles("admin")`. Verified via `test_kyc_hardening.js` asserting HTTP 200 on `/me` and HTTP 403 on `/` for regular users, and HTTP 200 for admins. |
| **36** | Priority 2: CORS Localhost Origin Security Documentation | Done | Added security rationale comment in `backend/routes/routes.go` documenting why loopback/localhost development origins are safe across all `GIN_MODE` environments, as browser origin isolation prevents remote origins from spoofing loopback headers. |
| **37** | Priority 3: Git History Database Credential Scrub | Done | Scrubbed legacy database password occurrences across all historical commits on this branch using `git filter-repo`. Verified zero matches across the entire git commit log (`git log -p | Select-String 'Reedb4b4'` -> 0 results). |
| **38** | Priority 4: Asset Hygiene, Cloudinary Demo Purge & Font Optimization | Done | Performed full asset audit: deleted 58 unreferenced static font variants (19.5 MB) from `web_app/public/fonts/`, preserving active fonts in `web_app/src/fonts/`. Purged 58 preloaded sample demo assets from Cloudinary (`wlasi06s`) via Admin API. Fixed phantom image references (`hero-car.webp`, `car2.jpeg`), removed unused boilerplate SVGs and `car6.jpeg`, and verified 0 unreferenced images on disk. |
| **39** | Lead Ownership Security & Status Validation Hardening | Done | Hardened `UpdateLeadStatus` in `lead_controller.go`: 1. Added strict enum validation (`new`, `routed`, `contacted`, `completed`, `cancelled`). 2. Enforced caller ownership checking (`lead.SellerID == userID` or dealer showroom owner, or `admin`). Verified via manual two-account integration test asserting HTTP 403 Forbidden on unauthorized cross-seller mutations. |
| **40** | Full E2E User Journey Verification & Automated Technician Fee Settlement | Done | 1. Connected automatic technician fee crediting (`inspection_earning`, ₦45,000, `status = "settled"`) in `SubmitInspectionReport`. 2. Built and executed comprehensive 9-stage end-to-end integration test (`test_e2e_user_journey.js`) asserting health check, registration & Brevo OTP verification, 1-click role upgrade, vehicle creation, buyer discovery & direct chat, lead management & 403 cross-seller guard, 150-point report filing & Tier 5 auto-upgrade, KYC NIN submission & admin approval, escrow payment, wallet balance, and payout disbursement. All 9 stages passed with 100% success. |
| **41** | Inspection Earnings Integrity & Atomic Escrow Settlement | Done | Eliminated fabricated money creation in inspection flow: 1. Added `EscrowTransactionID` to `models.InspectionReport` and automated column migration in `database.go`. 2. Restricted `POST /api/inspections` to `middleware.RequireRoles("buyer", "admin")`, strictly validated that a real `held_in_escrow` transaction exists and belongs to the buyer, blocked self-assignment as technician, and prevented duplicate escrow reuse. 3. Overhauled `SubmitInspectionReport` to atomically release the exact escrow amount (`escrowTxn.Amount`) into a settled `inspection_earning` transaction and mark the escrow `"settled"` within a single `db.Transaction`. 4. Enforced strict rejection (HTTP 400) on report submissions lacking valid held escrow. 5. Verified via automated end-to-end test (`test_inspection_earnings_integrity.js`) confirming all negative security guards and positive atomic settlement. |

