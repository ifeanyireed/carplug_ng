# ANTIGRAVITY FIX PROMPT — Carplug / Verza Production Readiness

## How to use this file

Read this document in full before writing any code. Work through phases **in order**. Do not skip ahead, do not batch phases together, and do not start Phase 2 until Phase 1 is complete and verified.

**Run all commands from the repository root** (the directory containing both `backend/` and `web_app/`), even though this file may be located inside a subfolder.

After **every** numbered fix, run:

```bash
cd backend && go build ./... && go vet ./... && cd ..
cd web_app && npx eslint . && npx next build && cd ..
```

Both must pass before moving to the next item. Report the output.

---

## Project state

- **Monorepo:** `backend/` (Go 1.26 + Gin + GORM + MySQL) and `web_app/` (Next.js 16 App Router + React 19 + Tailwind 4)
- **Current state:** feature-complete for MVP scope; frontend builds clean (0 ESLint errors, 43 routes); authorization and payment integrity have been hardened over several prior passes
- **Goal:** close the blockers preventing production deployment
- **Deployment target:** frontend on Vercel, backend on a separate host (Railway/Render/Fly — _not_ Vercel)

A full audit exists at `PRODUCTION_AUDIT.md`. Read it for context on any item below.

---

## Rules

1. **Inspect before modifying.** Open and read every file you are about to change, in full. Do not edit from memory or assumption.
2. **Preserve existing functionality.** These are targeted fixes, not a refactor. If a change would alter behaviour beyond what is described, stop and report instead.
3. **No new dependencies** unless a fix explicitly calls for one. Only Phase 2, item 8 introduces one, and only if you choose the library route.
4. **Fix systematically, not blindly.** Each item states _why_ it matters. If the code you find does not match the description, stop and report the discrepancy rather than forcing the change.
5. **Check for regressions.** After each phase, confirm nothing else broke — especially authorization checks and payment flows, which prior passes deliberately hardened.
6. **Report honestly.** After each phase: what you changed (file list), what you verified, what you could not fix, and anything that looked wrong but was outside the described scope.
7. **Do not touch** anything marked "DO NOT DO" at the bottom.

---

# PHASE 1 — DEPLOYMENT BLOCKERS

## 1.1 — CRITICAL: Remove anonymous admin account creation

**File:** `backend/controllers/auth_controller.go`, function `Register()`, approximately lines 66–78

**What is wrong:** The role-assignment switch grants `admin` under two conditions, both exploitable by an anonymous attacker:

- A hardcoded fallback secret `"carplug-admin-secret-2026"` is used when `ADMIN_SECRET` is unset. That literal is committed to a **public** repository, so anyone can read it and register as admin.
- Any email ending `@carplug.ng` is granted admin **without any email-ownership verification** — the role is assigned before the OTP is even sent, and `IsVerified` is `false` at that point.

An admin can approve payouts (real money), read every user's KYC documents, and bypass all ownership checks.

**Required change:** Replace the entire `case string(models.RoleAdmin):` branch so admin is never self-assignable:

```go
case string(models.RoleAdmin):
    // Admin accounts are never self-provisioned via the public
    // registration endpoint. Silently downgrade to buyer.
    role = string(models.RoleBuyer)
```

Then remove the now-unused `AdminKey` field from the `RegisterRequest` struct. Remove the `"os"` import **only if** nothing else in the file uses it — check first.

**Verification (run these, paste real output):**

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"T1","email":"t1@carplug.ng","password":"testpass123","role":"admin"}'
# user.role MUST be "buyer"

curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"T2","email":"t2@example.com","password":"testpass123","role":"admin","adminKey":"carplug-admin-secret-2026"}'
# user.role MUST be "buyer"
```

---

## 1.2 — CRITICAL: Provide an admin provisioning path

**Files:** new — `backend/cmd/createadmin/main.go`

**Why:** After 1.1 there is **no way to create an admin account**. This must exist before deployment or the admin panel is permanently inaccessible.

**Required change:** Create a small CLI that promotes an existing user to admin by email. It should load config the same way the server does, connect to the database, look the user up, and update the role. Fail clearly if the user does not exist.

```go
package main

// Usage: go run ./cmd/createadmin -email someone@example.com
// Promotes an existing, already-registered user to the admin role.
```

Implement it using `config.LoadConfig()`, `config.InitDB(cfg)`, and a GORM update on `models.User`. Print the resulting user's id, email, and role on success.

**Verification:** Register a normal user, run the command against that email, then log in as them and confirm the JWT contains `role: admin` and `/api/admin/metrics` returns 200.

---

## 1.3 — CRITICAL: Delete the empty `vercel.json`

**File:** `web_app/vercel.json` — currently **0 bytes**

**Why:** An empty file is not valid JSON. Vercel parses it before building and the deployment fails.

**Required change:** Replace the empty file with valid content that also adds frontend security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**Verification:** `python3 -m json.tool web_app/vercel.json` parses without error.

---

## 1.4 — CRITICAL: Invert `AUTO_MIGRATE` / `AUTO_SEED` defaults

**File:** `backend/config/config.go`, approximately lines 79–80

**What is wrong:** Both default to `"true"`. A production deployment missing these two variables will run `ALTER TABLE` across 15 models on every boot **and** insert fabricated dealerships and vehicles into the live database.

**Required change:**

```go
AutoMigrate: getEnv("AUTO_MIGRATE", "false") == "true",
AutoSeed:    getEnv("AUTO_SEED", "false") == "true",
```

Then add a hard guard after the existing `JWT_SECRET` check, so seeding can never run in production regardless of the flag:

```go
if AppConfig.GinMode == "release" && AppConfig.AutoSeed {
    log.Fatal("[Config] CRITICAL: AUTO_SEED must never be enabled in production (GIN_MODE=release)")
}
```

**Verification:** Run the server with neither variable set. Boot logs must show **neither** `Running schema migrations` **nor** `[Seed] Seeding initial`. Then set `GIN_MODE=release AUTO_SEED=true` and confirm it refuses to start.

---

## 1.5 — CRITICAL: Stop the API URL falling back to localhost

**File:** `web_app/src/services/api.ts`, line 14

**What is wrong:** `NEXT_PUBLIC_API_URL` falls back to `http://localhost:8080/api`. These values are inlined at **build time**. If the variable is not set in Vercel before the first build, every production visitor's browser calls their own machine — and the mock-data fallbacks (see 1.6) make this look like it partially works.

**Required change:**

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error(
          "NEXT_PUBLIC_API_URL must be set for production builds",
        );
      })()
    : "http://localhost:8080/api");
```

**Verification:** `cd web_app && npx next build` succeeds locally (dev fallback applies). Then `NODE_ENV=production npx next build` **without** the variable set should fail with that error message.

---

## 1.6 — CRITICAL: Disable mock-data fallbacks in production

**File:** `web_app/src/services/api.ts` — multiple functions

**What is wrong:** Several fetch functions catch failures and return data from `mockStore` / `mockCars`. In production this means a backend outage shows users **fabricated listings with invented dealer names and phone numbers**, presented as real, with no error indication. This is worse than an outright failure.

**Required change:** Inspect `api.ts` and find every fallback returning mock data. Gate each one:

```ts
} catch (err) {
  if (process.env.NODE_ENV !== "production") {
    return MOCK_VEHICLES; // dev convenience only
  }
  throw err;
}
```

Callers already handle thrown errors in most pages (the inspection booking flow was fixed this way previously). Where a caller does **not** handle a thrown error, report it — do not invent UI without checking the existing error-state patterns in that page.

**Report:** list every function you changed and every caller that lacks error handling.

**Verification:** Build succeeds. Stop the backend, run the frontend in production mode, and confirm pages show error states rather than fake cars.

---

# PHASE 2 — PRE-DEPLOYMENT HARDENING

## 2.1 — Add rate limiting

**Files:** new `backend/middleware/rate_limit.go`; modify `backend/routes/routes.go`

**Why:** No endpoint has any rate limit. Login allows unlimited password guessing. The OTP 5-attempt cap is stored per-OTP-record, so `resend-otp` → 5 guesses → repeat brute-forces a 6-digit code. Registration and image upload allow unbounded database growth and Cloudinary/Brevo quota exhaustion.

**Required change:** Implement IP-based limiting. Prefer a simple in-memory token bucket (no new dependency) — **but it must not leak memory**: include a background sweep that evicts expired buckets, or use `github.com/ulule/limiter/v3` if you prefer a maintained implementation.

Apply:

```go
auth.POST("/login",          middleware.RateLimit(5,  time.Minute),    controllers.Login)
auth.POST("/register",       middleware.RateLimit(3,  time.Minute),    controllers.Register)
auth.POST("/verify-otp",     middleware.RateLimit(10, time.Minute),    controllers.VerifyOTP)
auth.POST("/resend-otp",     middleware.RateLimit(3,  10*time.Minute), controllers.ResendOTP)
auth.POST("/reset-password", middleware.RateLimit(5,  10*time.Minute), controllers.ResetPassword)
uploads.POST("/images",      middleware.RateLimit(20, time.Minute),    controllers.UploadImages)
```

Check the exact route-group variable names in `routes.go` before editing — do not assume they match the above.

**Verification:**

```bash
for i in $(seq 1 8); do
  curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:8080/api/auth/login \
    -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"wrong"}'
done; echo
# Expect: 401 401 401 401 401 429 429 429
```

---

## 2.2 — Add security headers middleware

**File:** `backend/routes/routes.go`

**Required change:** Add a `SecurityHeaders()` middleware and register it **before** `CORSMiddleware`:

```go
func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
        c.Writer.Header().Set("X-Frame-Options", "DENY")
        c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        if config.AppConfig.GinMode == "release" {
            c.Writer.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
        }
        c.Next()
    }
}
```

**Verification:** `curl -I http://localhost:8080/api/health` shows the three non-HSTS headers.

---

## 2.3 — Add a global request body size limit

**File:** `backend/routes/routes.go`

**Why:** Only the upload endpoint limits body size. Every other endpoint will read an unbounded payload into memory before validation rejects it.

**Required change:** Add middleware applying a 1 MB cap, **excluding** the upload path which legitimately needs 50 MB:

```go
func BodyLimit(max int64) gin.HandlerFunc {
    return func(c *gin.Context) {
        if !strings.HasPrefix(c.Request.URL.Path, "/api/upload") {
            c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, max)
        }
        c.Next()
    }
}
```

Register with `r.Use(BodyLimit(1 << 20))`.

**Verification:** Post a >1 MB JSON body to `/api/auth/login` → expect `413`, not a hang or `500`. Confirm image upload still accepts a large file.

---

## 2.4 — Enable TLS on the database connection

**File:** `backend/config/database.go`, the DSN construction

**Required change:** Add `tls=preferred` to the DSN query parameters. `preferred` (not `true`) so local development against a non-TLS MySQL still works.

**Verification:** Server connects successfully locally and in production.

---

## 2.5 — Enforce email verification on content and money actions

**Files:** new `backend/middleware/require_verified.go`; modify `backend/routes/routes.go`

**Why:** The entire OTP system works but `IsVerified` gates nothing. Anyone can list vehicles, message users, and initiate payments without owning a working email address.

**Required change:** Add middleware that loads the user and rejects unverified accounts with a machine-readable code:

```go
c.JSON(http.StatusForbidden, gin.H{
    "error": "Please verify your email address to continue",
    "code":  "EMAIL_NOT_VERIFIED",
})
```

Apply to, at minimum: `POST /vehicles`, `POST /leads`, `POST /inspections`, `POST /conversations`, `POST /payments/initialize`, `PATCH /auth/upgrade-role`. Apply **after** `authMiddleware` in the chain.

Do **not** gate browsing, login, or the OTP endpoints themselves.

**Frontend:** in `web_app/src/services/api.ts`, detect `code === "EMAIL_NOT_VERIFIED"` and surface it distinctly so the UI can prompt a resend. Follow the existing error-parsing pattern already in `createInspection` — read it first and match the style rather than inventing a new one.

**Verification:** Register, skip verification, `POST /api/vehicles` → `403` with `EMAIL_NOT_VERIFIED`. Verify via OTP, retry → success.

---

## 2.6 — Enforce escrow uniqueness at the database level

**File:** `backend/models/inspection.go`

**Why:** Preventing one escrow transaction from funding two inspections is currently a query-then-write check in application code. Under concurrent requests, two inspections could claim the same escrow.

**Required change:** Change the `EscrowTransactionID` tag from `index` to a unique index:

```go
EscrowTransactionID string `gorm:"size:64;uniqueIndex" json:"escrowTransactionId,omitempty"`
```

**Important:** confirm this does not break existing rows where the column is empty — MySQL permits multiple `NULL`s in a unique index but **not** multiple empty strings. If existing rows have `""`, this migration will fail. Check first and report before applying; the safe alternative is a partial/conditional unique constraint or normalising empty values to `NULL`.

**Verification:** Attempt to create two inspections with the same `escrowTransactionId` → the second fails.

---

# PHASE 3 — PRE-LAUNCH POLISH

## 3.1 — Add error and not-found pages

**Files:** new `web_app/src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`

Match the existing design system (`#F7F8FA` background, `neutral-900` text, rounded-xl buttons — read an existing page first). `error.tsx` must be a client component accepting `{ error, reset }`. `global-error.tsx` must render its own `<html>` and `<body>`.

**Verification:** Visit `/does-not-exist` → branded 404.

---

## 3.2 — Add SEO fundamentals

**Files:** `web_app/src/app/layout.tsx`; new `robots.ts` and `sitemap.ts`; `generateMetadata` in `buyer/vehicles/[id]` and `shops/[slug]`

Add `metadataBase`, a title template, Open Graph defaults, and per-page metadata for the two dynamic routes. Use a placeholder domain and clearly flag in your report that it must be replaced with the real domain before launch.

---

## 3.3 — Repo hygiene

- Delete `web_app/AGENTS.md` and `web_app/CLAUDE.md`. These contain false claims that this is a modified Next.js with hidden documentation in `node_modules`, and instruct AI agents to act on it. They are not legitimate project documentation.
- Delete `web_app/public/image.png` (515 KB, verified unreferenced).
- Fix `backend/PAYMENT_REVIEW_CHECKLIST.md` line 45: `PAYMENTS*FIXES.md` → `PAYMENTS_FIXES.md` and `\_releasing*` → `_releasing_`.
- Remove the unused `onOpenAuth` prop from `web_app/src/components/hero/Hero.tsx` (interface + destructuring) and the `onOpenAuth={handleOpenAuth}` line passed to `<Hero />` in `web_app/src/app/page.tsx`. **Leave the one passed to `<Navbar />` — that one is used.**

---

## 3.4 — Add tests for the six highest-risk behaviours

**Files:** new tests under `backend/controllers/`

Use `httptest` with an in-memory SQLite GORM instance. Do not aim for coverage; cover exactly these:

1. `Register()` never returns `admin` — both the `@carplug.ng` and `adminKey` paths
2. `RequestPayout` rejects an amount exceeding computed balance, and creates `pending` not `settled`
3. Escrow release: credited amount equals the escrow amount; escrow flips to `settled`; both happen or neither
4. Ownership: a non-owner receives `403` on vehicle, lead, and inspection updates
5. `HandleWebhook` rejects a missing or invalid HMAC signature
6. `UpgradeRole` rejects `admin` as a target role

**Verification:** `cd backend && go test ./...` passes.

---

## 3.5 — Add CI

**File:** new `.github/workflows/ci.yml`

Run on push and pull request: `go build ./...`, `go vet ./...`, `go test ./...` (backend) and `npx eslint .`, `npx next build` (frontend).

---

# DO NOT DO

- **Do not attempt to deploy the Go backend to Vercel or convert it to serverless functions.** It is architecturally incompatible. The backend deploys to Railway/Render/Fly as a container. This is Shuddy's infrastructure decision, not a code change.
- **Do not migrate JWT storage from `localStorage` to httpOnly cookies.** This is a known, deliberate trade-off requiring a Next.js proxy layer. Post-launch work, scoped separately.
- **Do not migrate the 52 MB of images in `web_app/public/images/` to Cloudinary.** Requires the audit in `IMAGE_AUDIT.md` to run first, and Shuddy's explicit go-ahead.
- **Do not refactor client components to server components.** Deliberately deferred.
- **Do not replace `AutoMigrate` with a versioned migration tool.** Post-launch.
- **Do not wire a real Paystack API key or change payment settle timing.** Separate task. Note only: once a real key is connected, `dealer_subscription` and `ad_campaign` transactions must move from settling at `InitializePayment` to settling in `HandleWebhook`, or users get paid features without paying.
- **Do not rewrite git history.** Done previously; not needed again.

---

# REPORTING

After each phase, report:

1. **Files changed** — full paths
2. **What changed in each** — one line per file
3. **Verification output** — the actual command output, not a summary. For 1.1, 2.1, and 2.5 specifically, paste the real HTTP responses.
4. **Regressions checked** — confirm authorization checks and payment flows still behave correctly
5. **Could not fix** — anything you were unable to complete, and why
6. **Discrepancies** — anything where the code did not match this document's description
7. **Noticed but out of scope** — anything concerning you saw while working that is not listed here

If any item's described code does not match what you find, **stop and report rather than forcing the change.**
