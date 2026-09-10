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

---

## 4. API Endpoints Reference

All routes are grouped under `/api`.

### 4.1 Authentication & Authorization
- `POST /api/auth/register` — Public registration. Validates email format, enforces $\ge 6$ character password, checks for duplicate email (409 Conflict), hashes password using bcrypt, validates requested role (defaults to `buyer`, blocks self-assigning `admin`), and returns signed JWT token + sanitized user profile.
- `POST /api/auth/login` — Public login. Performs case-insensitive email lookup, verifies bcrypt password hash, generates signed HS256 JWT token (default 72h expiration), and returns token + sanitized user profile.
- `GET /api/auth/me` — Protected endpoint (`Authorization: Bearer <token>`). Validates token and returns authenticated user profile.

### 4.2 System & Health
- `GET /api/health` — **Public**. Returns status, database connection state, and uptime. Internal infrastructure details (`dbHost`, `dbName`, raw error traces) are concealed unless `DEBUG_HEALTH=true` is set.

### 4.3 Vehicles
- `GET /api/vehicles` — **Public**. Query params: `make`, `model`, `bodyType`, `condition`, `minTrustTier`, `trustTier`, `priceRating`, `sellerId`, `featured`, `minPrice`, `maxPrice`, `q`, `sortBy` (`trust`, `price_asc`, `price_desc`, `featured`), `page` (default: 1), `pageSize` (default: 24). Returns `{ data, total, page, pageSize }` envelope with masked seller phone numbers.
- `GET /api/vehicles/:id` — **Public**. Retrieve a single vehicle by ID (with masked seller phone number).
- `POST /api/vehicles` — **Protected** (`seller`, `dealer`, `admin`). Create a new vehicle listing (JSON body).
- `PUT /api/vehicles/:id` — **Protected** (`seller`, `dealer`, `admin`). Update vehicle listing (supports zero-value booleans and numerical fields).
- `DELETE /api/vehicles/:id` — **Protected** (`seller`, `dealer`, `admin`). Delete vehicle listing.

### 4.4 Dealers
- `GET /api/dealers` — **Public**. List all registered dealer shops.
- `GET /api/dealers/:id` — **Public**. Get dealer profile by either slug or ID.
- `GET /api/dealers/:id/inventory` — **Public**. Get all vehicles for a dealer.
- `POST /api/dealers` — **Protected** (`dealer`, `admin`). Register a new dealer shop.

### 4.5 Technicians
- `GET /api/technicians` — **Public**. List all certified technicians (filter `area`).
- `GET /api/technicians/:id` — **Public**. Get technician by ID.

### 4.6 Inspections
- `GET /api/inspections` — **Public**. List inspections (filter `status`, `buyerId`, `vehicleId`).
- `GET /api/inspections/:id` — **Public**. Full inspection report with checklist categories.
- `POST /api/inspections` — **Protected** (Authenticated user). Book an inspection request.
- `PATCH /api/inspections/:id/status` — **Protected** (`technician`, `admin`). Update inspection status (`{"status": "..."}`).

### 4.7 Leads & Inquiries
- `GET /api/leads` — **Protected** (`seller`, `dealer`, `admin`). List leads (filter `sellerId`, `status`, `type`), with `page` (default: 1) and `pageSize` (default: 50). Returns `{ data, total, page, pageSize }`.
- `POST /api/leads` — **Public**. Submit lead/inquiry.
- `PATCH /api/leads/:id/status` — **Protected** (`seller`, `dealer`, `admin`). Update lead status (`{"status": "..."}`).

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
  }
  ```

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
