# Carplug Nigeria

Carplug is a comprehensive automotive marketplace and trust-infrastructure platform for Nigeria, connecting buyers, verified dealers, private sellers, and ASE-certified vehicle technicians.

## Repository Architecture

The codebase is structured as a monorepo containing:

- **[`web_app/`](./web_app)**: Next.js 16 (React 19, TypeScript, Tailwind CSS) web application and buyer/seller/dealer/technician portals.
- **[`backend/`](./backend)**: High-performance Go (Golang) REST API powered by GORM and MySQL with connection pooling, automated migrations, and seed data.

## Getting Started

### 1. Web Application (`web_app`)
```bash
cd web_app
npm install
npm run dev
```
Runs at [http://localhost:3000](http://localhost:3000).

### 2. Go Backend API (`backend`)
```bash
cd backend
go run cmd/server/main.go
```
Runs at [http://localhost:8080](http://localhost:8080).

Database credentials and environment variables are managed via `backend/.env` (see `backend/.env.example`).
