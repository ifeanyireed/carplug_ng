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

Configuration is loaded in `backend/config/config.go` with safe fallbacks.

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | string | `8080` | Port for the HTTP API server |
| `GIN_MODE` | string | `debug` | Gin runtime mode (`debug` or `release`) |
| `ALLOWED_ORIGINS` | string | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated CORS origins |
| `DB_HOST` | string | `srv2113.hstgr.io` | Cloud MySQL host address |
| `DB_PORT` | string | `3306` | Cloud MySQL port |
| `DB_USER` | string | `u721451974_carplug_ng` | Cloud MySQL user |
| `DB_PASSWORD` | string | `*REDACTED` | Cloud MySQL password |
| `DB_NAME` | string | `u721451974_carplug_ng_db` | Cloud MySQL database schema name |
| `DB_CHARSET` | string | `utf8mb4` | Character encoding |
| `AUTO_MIGRATE` | bool | `true` | Runs GORM AutoMigrate on startup when `true` |
| `AUTO_SEED` | bool | `true` | Populates mock catalog if tables are empty |

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

---

## 4. API Endpoints Reference

All routes are grouped under `/api`.

### 4.1 System & Health
- `GET /api/health` — Returns status, database connection state, uptime, and host.

### 4.2 Vehicles
- `GET /api/vehicles` — Query params: `make`, `model`, `bodyType`, `condition`, `minTrustTier`, `trustTier`, `priceRating`, `sellerId`, `featured`, `minPrice`, `maxPrice`, `q`, `sortBy` (`trust`, `price_asc`, `price_desc`, `featured`).
- `GET /api/vehicles/:id` — Retrieve a single vehicle by ID.
- `POST /api/vehicles` — Create a new vehicle listing (JSON body).
- `PUT /api/vehicles/:id` — Update vehicle listing.
- `DELETE /api/vehicles/:id` — Delete vehicle listing.

### 4.3 Dealers
- `GET /api/dealers` — List all registered dealer shops.
- `GET /api/dealers/:id` — Get dealer profile by either slug or ID.
- `GET /api/dealers/:id/inventory` — Get all vehicles for a dealer.
- `POST /api/dealers` — Register a new dealer shop.

### 4.4 Technicians
- `GET /api/technicians` — List all certified technicians (filter `area`).
- `GET /api/technicians/:id` — Get technician by ID.

### 4.5 Inspections
- `GET /api/inspections` — List inspections (filter `status`, `buyerId`, `vehicleId`).
- `GET /api/inspections/:id` — Full inspection report with checklist categories.
- `POST /api/inspections` — Book an inspection request.
- `PATCH /api/inspections/:id/status` — Update inspection status (`{"status": "..."}`).

### 4.6 Leads & Inquiries
- `GET /api/leads` — List leads (filter `sellerId`, `status`, `type`).
- `POST /api/leads` — Submit lead/inquiry.
- `PATCH /api/leads/:id/status` — Update lead status (`{"status": "..."}`).

### 4.7 Swaps & Trade-Ins
- `GET /api/swaps` — List swap requests (filter `status`).
- `POST /api/swaps` — Submit car swap trade-in application.
- `PATCH /api/swaps/:id/status` — Update swap status (`{"status": "..."}`).

### 4.8 Campaigns
- `GET /api/campaigns` — List advertising campaigns.
- `POST /api/campaigns` — Create advertising campaign.
- `PATCH /api/campaigns/:id/status` — Update campaign status.

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
