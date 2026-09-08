# Carplug Nigeria - Backend API

Production-ready REST API built with **Go (Golang)**, **GORM**, and **MySQL**.

## Features

- **GORM ORM with MySQL**: Configured with connection pooling, automatic migrations, and seeding.
- **Gin Web Framework**: Fast, scalable HTTP router with CORS middleware.
- **RESTful Endpoints**: Complete CRUD and query filtering for:
  - Vehicles & Inventory (`/api/vehicles`)
  - Dealer Shops (`/api/dealers`)
  - Certified Technicians (`/api/technicians`)
  - Pre-Purchase Vehicle Inspections (`/api/inspections`)
  - Buyer Inquiries & Leads (`/api/leads`)
  - Car Swap & Trade-in Requests (`/api/swaps`)
  - Advertising Campaigns (`/api/campaigns`)
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
