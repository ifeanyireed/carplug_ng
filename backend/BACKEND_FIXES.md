# TASK: Implement Authentication, Authorization, and User Management in Go Backend

## Project Context

- **Repository**: Carplug Nigeria (Verza) monorepo
- **Target Folder**: `backend/` (Go 1.22+, Gin Web Framework, GORM, MySQL)
- **Reference Documents**:
  - `backend/BACKEND_FIXES.md` (Priority 1: Authentication & Authorization)
  - `web_app/src/components/modals/AuthModal.tsx` (Matching frontend auth requirements)

---

## Objective

Implement a secure, token-based (JWT) authentication and role-based access control (RBAC) system for the backend API, replacing demo/open endpoints with guarded routes while keeping marketplace browsing public.

---

## Detailed Specifications

### 1. Dependencies & Config

1. Ensure the following standard packages are installed in `backend/`:
   - `golang.org/x/crypto/bcrypt` (for password hashing)
   - `github.com/golang-jwt/jwt/v5` (for standard JWT signing and parsing)
   - `github.com/google/uuid` (for unique user ID generation if not already present)
2. In `backend/config/config.go`:
   - Add `JWTSecret` (string, loaded from env `JWT_SECRET`, fallback to a secure default in dev, but flag missing secret in production)
   - Add `JWTExpirationHours` (int, default to `72` hours)
   - Add `JWT_SECRET=your_jwt_secret_key_here` to `backend/.env.example` and `backend/.env`.

### 2. User Model (`backend/models/user.go`)

Create the `User` model with GORM tags and JSON serialization:

- `ID` (string, PK, e.g., UUID or `usr_...`)
- `Name` (string, VARCHAR(150), required)
- `Email` (string, VARCHAR(150), UNIQUE, required, INDEX)
- `Phone` (string, VARCHAR(50), optional)
- `PasswordHash` (string, VARCHAR(255), `json:"-"` - NEVER exposed in JSON)
- `Role` (string, VARCHAR(50), default `"buyer"`) — allowed values: `"buyer"`, `"seller"`, `"dealer"`, `"technician"`, `"admin"`
- `Avatar` (string, VARCHAR(255), optional)
- `IsVerified` (bool, default `false`)
- `CreatedAt` (time.Time)
- `UpdatedAt` (time.Time)

Register `&models.User{}` in `backend/config/database.go` inside `db.AutoMigrate(...)`.

### 3. JWT Utility Helper (`backend/utils/jwt.go` or `backend/config/jwt.go`)

- Define `JWTClaims` extending `jwt.RegisteredClaims` with:
  - `UserID` (string)
  - `Email` (string)
  - `Role` (string)
- Implement `GenerateToken(user *models.User, secret string, expiryHours int) (string, error)`
- Implement `ValidateToken(tokenString string, secret string) (*JWTClaims, error)`

### 4. Auth Controller (`backend/controllers/auth_controller.go`)

Implement the following handlers with proper error handling and status codes:

1. `POST /api/auth/register`:
   - Accepts JSON: `{ "name": "...", "email": "...", "password": "...", "phone": "...", "role": "buyer" }`
   - Validates email format and minimum password length (min 6 characters)
   - Checks for duplicate email (returns 409 Conflict if already registered)
   - Hashes password with `bcrypt.DefaultCost`
   - Sets default role to `"buyer"` if omitted or invalid (only allow admin assignment through migration/admin endpoint)
   - Saves user to DB and returns: `{ "status": "success", "token": "...", "user": { ...safe fields without password... } }`
2. `POST /api/auth/login`:
   - Accepts JSON: `{ "email": "...", "password": "..." }`
   - Queries user by email
   - Compares hash using `bcrypt.CompareHashAndPassword`
   - On success, generates and returns token + sanitized user object
   - On failure, returns 401 Unauthorized (`"invalid credentials"`)
3. `GET /api/auth/me`:
   - Protected endpoint returning the profile of the caller extracted from the token context

### 5. Middleware (`backend/routes/middleware.go`)

1. **`AuthMiddleware(secret string)`**:
   - Reads `Authorization: Bearer <token>` header
   - Validates JWT signature and expiration
   - Sets `c.Set("userID", claims.UserID)`, `c.Set("userEmail", claims.Email)`, `c.Set("userRole", claims.Role)`
   - Returns 401 Unauthorized if missing, malformed, or expired
2. **`RequireRoles(allowedRoles ...string)`**:
   - Reads `userRole` from context
   - Returns 403 Forbidden if the user's role is not in `allowedRoles`
3. **CORS check**:
   - Ensure `backend/routes/routes.go` CORS middleware allows the `Authorization` header and handles OPTIONS preflight correctly.

### 6. Route Protection Strategy (`backend/routes/routes.go`)

Apply auth selectively based on marketplace security requirements:

- **Public (No Auth Required)**:
  - `GET /api/health`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/vehicles`, `GET /api/vehicles/:id`
  - `GET /api/dealers`, `GET /api/dealers/:id`, `GET /api/dealers/:id/inventory`
  - `GET /api/technicians`, `GET /api/technicians/:id`
  - `POST /api/leads` (public inquiries)
- **Protected (Requires `AuthMiddleware`)**:
  - `GET /api/auth/me`
  - `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id`
  - `POST /api/dealers`
  - `POST /api/inspections`, `PATCH /api/inspections/:id/status`
  - `GET /api/leads`, `PATCH /api/leads/:id/status`
  - `POST /api/swaps`, `PATCH /api/swaps/:id/status`
  - `POST /api/campaigns`, `PATCH /api/campaigns/:id/status`

---

## Verification & Sanity Checks

Before completing the task, run and confirm:

1. `cd backend && go mod tidy`
2. `cd backend && go build ./... && go vet ./...` (must compile with 0 errors)
3. Start server with `go run cmd/server/main.go` and test with curl or http client:
   - `POST /api/auth/register` returns 201 with JWT token
   - `POST /api/auth/login` with correct credentials returns 200 with JWT token
   - `GET /api/auth/me` with Bearer token returns the user profile
   - `POST /api/vehicles` without Bearer token correctly returns 401 Unauthorized
