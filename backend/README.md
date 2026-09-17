# Carplug Nigeria - Backend API

Production-ready REST API built with **Go (Golang)**, **GORM**, and **MySQL**.

## Features

- **GORM ORM with MySQL**: Configured with connection pooling, automatic migrations, and seeding.
- **Gin Web Framework**: Fast, scalable HTTP router with CORS middleware.
- **Real-Time WebSockets (Gorilla WebSocket)**: Duplex WebSocket hub (`/api/ws`) with JWT auth, multi-client connection management, typing indicators, and real-time message broadcasts ($< 20\text{ms}$ push latency).
- **RESTful Endpoints**: Complete CRUD, RBAC, and query filtering for:
  - User Authentication & Brevo OTP (`/api/auth`)
  - Vehicles & Inventory (`/api/vehicles`)
  - Buyer-Seller Direct Messaging & Chat (`/api/conversations`)
  - Real-Time WebSocket Gateway (`/api/ws`)
  - Dealer Shops & Subscriptions (`/api/dealers`)
  - Certified Technicians & Payouts (`/api/technicians`)
  - Pre-Purchase Vehicle Inspections (`/api/inspections`)
  - Buyer Inquiries & Concierge Leads (`/api/leads`)
  - Document Verification & KYC Compliance (`/api/verifications`)
  - Financial Ledger & Escrow Transactions (`/api/payments`)
  - Saved Vehicles Garage (`/api/saved-vehicles`)
  - Cloudinary Image Uploads (`/api/upload/images`)
  - Car Swap & Trade-in Requests (`/api/swaps`)
  - Advertising Campaigns (`/api/campaigns`)
  - Admin Governance & Listing Moderation (`/api/admin`)
  - System Health & DB Ping (`/api/health`)
- **Environment Driven**: Configurable via `.env` with fallback defaults.

## Setup & Running

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Run the development server:
   ```bash
   go run cmd/server/main.go
   ```

4. Build binary:
   ```bash
   go build -o bin/server cmd/server/main.go
   ./bin/server
   ```

## Database Configuration

Credentials configured in `.env`:
- **Host**: `srv2113.hstgr.io` (Port 3306)
- **User**: `u721451974_carplug_ng`
- **Database**: `u721451974_carplug_ng_db`
- **GORM Auto-migration**: Enabled for all models on startup.
