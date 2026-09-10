# Carplug (Verza) Backend + Monorepo Fix Guide

Audience: this file is written **to an AI coding agent** (Antigravity CLI)
working in this repo. Follow it top to bottom, in order. Priority 0 is
hard-blocking — do not touch Priority 1+ until every Priority 0 item is done
and confirmed, because Priority 0 is an active credential leak, not a code
quality issue.

Verification after every priority section:
```bash
cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build
```
All four must be clean before moving to the next section.

---

## Priority 0 — Active credential leak (STOP AND DO THIS FIRST)

Real production MySQL credentials for a live Hostinger database are committed
to this repo in plaintext, in three files:

- `backend/config/config.go` (as hardcoded fallback default values)
- `backend/.env.example` (should be a placeholder template, has real values)
- `backend/documentation.md` (in a markdown table)

**Human step, not for the agent to do:** Shuddy must rotate the MySQL
password in the Hostinger control panel before or immediately after this
section runs. No code change here fixes the leak by itself — the old
password is already public and stays valid until it's rotated at the source.
The agent should pause and confirm with Shuddy that rotation has happened (or
is happening in parallel) before continuing past this section.

### 0.1 Remove hardcoded credentials from `config.go`
`backend/config/config.go` — the `LoadConfig()` function currently does:
```go
DBHost:     getEnv("DB_HOST", "srv2113.hstgr.io"),
DBUser:     getEnv("DB_USER", "u721451974_carplug_ng"),
DBPassword: getEnv("DB_PASSWORD", "*REDACTED"),
DBName:     getEnv("DB_NAME", "u721451974_carplug_ng_db"),
```
**Fix:** remove the real values from every fallback. Fallbacks for
non-secret fields (host, user, db name) can stay as empty strings; the
password fallback must never contain a real or plausible-looking value.
Better: make the app refuse to start if `DB_PASSWORD` is unset, rather than
silently falling back to anything:
```go
DBPassword: getEnv("DB_PASSWORD", ""),
// ...after AppConfig is built:
if AppConfig.DBPassword == "" {
    log.Fatal("[Config] DB_PASSWORD is required and was not set")
}
```

### 0.2 Fix `.env.example`
`backend/.env.example` currently has the real password and real DB user
committed. Replace every real value with an obvious placeholder:
```
DB_HOST=your_db_host_here
DB_PORT=3306
DB_USER=your_db_user_here
DB_PASSWORD=your_db_password_here
DB_NAME=your_db_name_here
```
This file is meant to be a safe template that ships in the public repo —
treat every value in it as if it will be seen by a stranger, because it will.

### 0.3 Redact `documentation.md`
`backend/documentation.md` has the same real credentials in its config table.
Replace the `DB_PASSWORD` row's value with `***` (redacted) and double check
no other row leaks the real user/host if you'd rather keep those private too
(host/user are lower risk than password but still worth reconsidering for a
public repo).

### 0.4 Confirm nothing else leaks it
Run this and confirm zero results before marking Priority 0 done:
```bash
grep -rn "REDACTED" . --exclude-dir=.git
```
(Note: the string will still exist in git history on this branch —
history rewriting is a separate, lower-priority cleanup step. It does not
block moving on, since the password will already be rotated per the human
step above, but flag it to Shuddy as a follow-up: `git filter-repo` or
BFG Repo-Cleaner can scrub it from history if he wants a fully clean repo.)

---

## Priority 1 — No authentication on any endpoint

Every route in `backend/routes/routes.go` — including `POST`, `PUT`, `PATCH`,
`DELETE` on vehicles, dealers, inspections, leads, swaps, and campaigns — is
completely open. Anyone with the API URL can create, edit, or delete any
record with no identity check at all. This is the single biggest gap between
"demo backend" and "real backend."

This is a bigger task than a quick patch — scope it as its own piece of work
rather than rushing it into this pass:

1. **Add a `User` model** (doesn't exist anywhere in `backend/models/` right
   now) — needs at minimum: id, email/phone, password hash, role
   (buyer/seller/dealer/technician/admin), created/updated timestamps.
2. **Add auth endpoints**: register, login, and a way to issue a JWT (the
   project profile already lists JWT/OTP auth as part of the standard stack —
   reuse that pattern rather than inventing a new one).
3. **Add an auth middleware** in `backend/routes/` that validates the JWT on
   protected routes and injects the authenticated user's ID/role into the
   Gin context.
4. **Apply it selectively**: `GET` endpoints for vehicles/dealers/technicians
   can likely stay public (it's a marketplace — browsing shouldn't require
   login). `POST`/`PUT`/`PATCH`/`DELETE` should require auth, and should
   check that the authenticated user actually owns the resource they're
   modifying (e.g. a seller can only edit/delete their own vehicle listings,
   not anyone's).

**Do not attempt this as a quick fix inside this pass.** Flag it back to
Shuddy as a scoped follow-up task once Priority 0 and 2 are done — this needs
a short design conversation (which roles need which permissions) before
code gets written.

---

## Priority 2 — CORS misconfiguration

`backend/routes/routes.go`, `CORSMiddleware`:
```go
if origin != "" {
    c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
} else {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
}
c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
```
This reflects back *any* origin sent in the request and pairs it with
`Allow-Credentials: true` — meaning any website could make a credentialed
request to this API from a visitor's browser. The `cfg.AllowedOrigins` list
already exists in `config.go` but is never actually checked here.

**Fix:**
```go
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
    allowed := make(map[string]bool, len(allowedOrigins))
    for _, o := range allowedOrigins {
        allowed[o] = true
    }
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        if allowed[origin] {
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
            c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        }
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    }
}
```
This makes it a real allowlist check instead of a reflect-everything policy.
Do this alongside Priority 1, since credentialed CORS only matters once
there's something (a JWT cookie or auth header) worth stealing.

---

## Priority 3 — Unmasked phone numbers in public responses

`GET /api/vehicles` (and by extension `GET /api/vehicles/:id`,
`/api/dealers/:id/inventory`) returns `sellerPhone` in full to any
unauthenticated caller. Same pattern likely applies to `technicianPhone` on
inspection reports and `customerPhone` on swap requests. This contradicts
the trust/safety design in the product blueprint, which calls for masked
phone numbers revealed only after a genuine contact/lead is created.

**Fix approach:** don't store masking logic in the DB — mask at the
response layer so the real number is always available internally. In
`vehicle_controller.go`'s `GetVehicles` and `GetVehicleByID`, either:
- Add a response DTO (a separate struct from `models.Vehicle`) that masks
  `SellerPhone` (e.g. `+234 80* *** **12`) for list/public views, and only
  return the real number on endpoints reached after a lead/contact is
  created, or
- Add a `MaskedPhone()` helper method and swap it in before marshaling the
  response.

This needs Priority 1 (auth) to fully make sense (masking rules will likely
depend on whether the requester is the vehicle's seller, a logged-in buyer
with an active lead, or the public) — implement a basic public/masked-always
version now, and revisit once auth exists.

---

## Priority 4 — GORM `Updates()` zero-value gotcha

`backend/controllers/vehicle_controller.go`, `UpdateVehicle`:
```go
updates.ID = id
if err := db.Model(&existing).Updates(&updates).Error; err != nil {
```
GORM's `Updates()` with a struct argument silently skips any field left at
its zero value (`false`, `0`, `""`). So a request meant to set
`featured: false`, `price: 0`, or clear any boolean flag will appear to
succeed but won't actually change that field. This will surface as a
confusing "my edit didn't save" bug the first time someone toggles
`featured` off or corrects a price to a round number matching a zero-ish
edge case.

**Fix:** bind the incoming JSON into a `map[string]interface{}` (or use
`Select()` to explicitly whitelist fields) instead of a zero-value struct,
so every field the client actually sent gets applied regardless of value:
```go
var updates map[string]interface{}
if err := c.ShouldBindJSON(&updates); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}
delete(updates, "id") // never allow the client to change the primary key
if err := db.Model(&existing).Updates(updates).Error; err != nil {
    // ...
}
```
Apply the same pattern anywhere else in the controllers that does
`.Updates(&someStruct)` with a full model struct — check
`dealer_controller.go`, `inspection_controller.go`, `swap_controller.go`,
`campaign_controller.go` for the same shape.

---

## Priority 5 — `go.mod` dependency hygiene

Every dependency in `backend/go.mod` is marked `// indirect`, including
`gin-gonic/gin` and `gorm.io/gorm` which are imported directly throughout
the codebase. This means `go mod tidy` was never run after the code was
written — it won't break the build today, but it's incorrect metadata that
will cause confusing dependency-resolution behavior later (e.g. `go mod why`
giving wrong answers, or upgrade tooling treating direct deps as transitive).

**Fix:**
```bash
cd backend && go mod tidy
```
Run this and commit the corrected `go.mod`/`go.sum`. Also note: `go.mod`
currently pins `go 1.26.4`. Confirm that's the version actually intended
(if it was meant to be `1.22` or another version, fix the `go` directive at
the top of `go.mod` — a mismatch here is what caused the build to fail in a
review sandbox pinned to 1.22).

---

## Priority 6 — `/api/health` leaks infra details publicly

`backend/controllers/health_controller.go` returns `dbHost`, `dbName`, and
raw database error strings in its JSON response, with no auth. Low severity
compared to Priority 0, but it's free reconnaissance for anyone probing the
API and shouldn't be in an unauthenticated response.

**Fix:** return only `status`, `service`, `database` (as connected/
disconnected, not the error detail), and `uptime` publicly. Gate the
host/name/error-detail fields behind a simple check (e.g. only include them
if a `DEBUG_HEALTH=true` env var is set, or once auth exists, behind an
admin-only check).

---

## Priority 7 — No pagination on list endpoints

`GET /api/vehicles` and `GET /api/leads` return every matching row with no
`limit`/`offset` or cursor support. Not urgent at current (seeded mock)
data volume, but add basic `page`/`pageSize` query params now while the
controllers are already being touched, so it's not a breaking API change
later once there's real data:
```go
page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "24"))
query = query.Offset((page - 1) * pageSize).Limit(pageSize)
```
Include the total count in the response envelope alongside `data` so the
frontend can build pagination controls.

---

## Priority 8 — Frontend leftover cleanup (from the previous pass)

`web_app` is in good shape — `eslint` shows 0 errors, `next build` is clean.
133 unused-import/unused-variable warnings remain from the Priority 3 item
in the earlier fix pass that never got finished. Same rules as before:
- Run `npx eslint . --fix` first (won't fix unused-vars but cleans up
  anything else auto-fixable).
- For each remaining unused import warning, delete just that named import.
- Do NOT delete `scrollIndex` (BrowseByType.tsx, WhatTheySaidSection.tsx) or
  `userEmail` (PortalShell.tsx / wherever it currently lives) without
  flagging to Shuddy first — these were called out last time as likely
  incomplete features, not dead code, and that's still true.

---

## Do NOT do yet (explicitly out of scope for this pass)

- No image upload endpoint / object storage integration (S3, Cloudinary,
  etc.) — `Vehicle.Images` currently only accepts pre-existing URLs via
  JSON. This is real, needed work, but scope it as its own task once auth
  (Priority 1) exists, since upload endpoints need to know who's uploading.
- No conversion of remaining frontend pages to use `src/services/api.ts`
  (only 10 of 41 pages are wired so far) — wire the rest only after backend
  auth exists, so the wiring work isn't done twice.
- No server/client component refactor on the frontend — deliberately
  deferred until the API contracts are stable (see note above).

---

## Definition of done for this pass

- [ ] Hostinger MySQL password rotated (human step, confirm with Shuddy)
- [x] `grep -rn "REDACTED" . --exclude-dir=.git` → zero results
- [x] `backend/config/config.go` has no real credential fallbacks
- [x] `backend/.env.example` has only placeholder values
- [x] `backend/documentation.md` has the password redacted
- [x] CORS middleware checks against `cfg.AllowedOrigins`, not reflect-all
- [x] `UpdateVehicle` (and equivalents) use a map or `Select()`, not a raw
      struct, so zero-value fields actually update
- [x] `go mod tidy` run, `go.mod`/`go.sum` committed clean
- [x] `/api/health` no longer leaks `dbHost`/`dbName`/error detail publicly
- [x] `go build ./...` and `go vet ./...` clean
- [x] `npx eslint .` and `npx next build` clean in `web_app`
- [x] Auth (Priority 1) scoped as its own follow-up task with Shuddy, not
      rushed into this pass
