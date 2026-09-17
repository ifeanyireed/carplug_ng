# PRODUCTION AUDIT — Carplug / Verza (`shuddy` branch)

**Audit date:** 15 September 2026
**Commit audited:** `388709f`
**Auditor scope:** full repository — backend (Go/Gin/GORM/MySQL), frontend (Next.js 16 / React 19), configuration, deployment, security, database, performance, SEO, accessibility, testing.

---

## 0. A correction before we start

The audit brief referenced **MongoDB, Mongoose, Vite, and Express**. This project uses **none of them**.

| Brief assumed | Reality |
|---|---|
| MongoDB / Mongoose | **MySQL + GORM** |
| Express (Node) | **Go 1.26 + Gin** |
| Vite | **Next.js 16.3.2 (App Router, Turbopack)** |

This is not a nitpick. The single largest finding in this audit exists *because* the backend is Go rather than Node, and it is a hard deployment blocker. Any audit answering the brief as written would have missed it.

---

## 1. Executive Summary

The application is substantially more mature than a typical pre-launch codebase. Authorization is real and enforced server-side, payment integrity has been deliberately hardened, credentials previously leaked to git history have been scrubbed and rotated, the frontend builds clean with zero ESLint errors across 43 routes, and the domain modelling is genuinely thoughtful for the Nigerian used-car market.

It is also **not deployable in its current form**, for reasons that have nothing to do with code quality:

1. **The Go backend cannot run on Vercel at all.** Vercel is a serverless platform. `cmd/server/main.go` is a long-running HTTP server with `ListenAndServe`, a connection pool, and SIGTERM graceful shutdown. There is no adapter, no `api/` serverless handler, no `vercel.json` build config for Go. Deploying this repo to Vercel gets you a working frontend talking to nothing.
2. **There is a live privilege-escalation path that grants any anonymous internet user full admin.** It is a two-line code path in the registration handler, and the secret it depends on is committed to a public repository.
3. **`vercel.json` is a zero-byte file**, which is not valid JSON and will fail the build before anything else is evaluated.
4. **Database auto-migration and auto-seeding both default to `true`**, so a production deployment that forgets two environment variables will alter its own schema and insert fake dealerships into the live database.

Items 2–4 are each fixable in under an hour. Item 1 is an infrastructure decision, not a bug, and needs to be made before anything ships.

---

## 2. Production Readiness Score

| Category | Score | Notes |
|---|---|---|
| Functionality | 78 / 100 | Core flows built and wired; Paystack not actually integrated; email verification not enforced |
| Security | 34 / 100 | Authorization model is strong; one critical escalation path and no rate limiting drag this down hard |
| Backend | 76 / 100 | Clean structure, real ownership checks, atomic ledger writes; missing headers, limits, observability |
| Frontend | 82 / 100 | Builds clean, 0 lint errors, real error states; missing 404/error boundaries |
| Database | 62 / 100 | Sound schema and indexes; auto-migrate/seed defaults are dangerous; shared host exposure |
| Deployment readiness | 18 / 100 | Backend has no deployable target; `vercel.json` invalid; API URL falls back to localhost |
| Performance | 55 / 100 | 52 MB of images in-repo; no CDN migration; otherwise reasonable |
| UX | 74 / 100 | Good loading/error states in newer code; no 404 page; no toast system |
| Accessibility | 58 / 100 | Semantic structure decent; alt text inconsistent; focus states unverified |
| SEO | 40 / 100 | Root metadata only; no per-page metadata, robots, sitemap, OG images, canonicals |
| Code quality | 80 / 100 | Consistent patterns, good separation; stray docs and dead files |
| Testing | 12 / 100 | Two unit test files total; zero coverage of payments, auth flows, or authorization |

### **Overall: 56 / 100 — ❌ NOT READY FOR PRODUCTION**

This is not a judgement on the quality of the work. It reflects four specific blockers, three of which are quick fixes and one of which is an architecture decision you have not made yet.

---

## 3. CRITICAL Issues

### C-1 — Anonymous admin account creation (privilege escalation)

**Location:** `backend/controllers/auth_controller.go`, `Register()`, lines 66–78

**Issue:** The registration endpoint grants `admin` role under two conditions, either of which is trivially satisfiable by an anonymous attacker:

```go
adminSecret := os.Getenv("ADMIN_SECRET")
if adminSecret == "" {
    adminSecret = "carplug-admin-secret-2026"   // hardcoded fallback, public repo
}
if req.AdminKey == adminSecret || strings.HasSuffix(trimmedEmail, "@carplug.ng") {
    role = string(models.RoleAdmin)
}
```

**Two independent exploits:**

1. **The hardcoded fallback secret is in a public GitHub repository.** Unlike `JWT_SECRET` and `DB_PASSWORD` — both of which correctly `log.Fatal` if unset in production — `ADMIN_SECRET` has no such guard. If the variable is not set in the production environment, the committed literal becomes the live admin key. A single `POST /api/auth/register` with `{"role":"admin","adminKey":"carplug-admin-secret-2026"}` returns a valid admin JWT.

2. **The `@carplug.ng` email-suffix check requires no proof of email ownership.** Registration sets `IsVerified: false` and dispatches an OTP asynchronously, but the role is assigned *immediately and unconditionally*, before any verification. An attacker registers `anything@carplug.ng` — an address they do not own and never need to access — and receives an admin token in the registration response. Note that `carplug.ng` is the domain you are about to purchase, so this is not hypothetical.

**Severity: CRITICAL.** This is unauthenticated remote privilege escalation to the highest role in the system.

**Why it matters — what an admin can actually do** (verified against `routes/routes.go`):

| Endpoint | Consequence |
|---|---|
| `PATCH /api/payments/payouts/:id/status` | **Approve technician payouts — real money leaves the business** |
| `PATCH /api/verifications/:id/status` | Approve CAC/NIN KYC, setting `VerifiedCAC` / `IsVerified` trust badges |
| `GET /api/verifications` | **Read every user's submitted government ID and business documents** |
| `GET /api/payments/transactions` | Read the entire financial ledger |
| `PATCH /api/admin/listings/:id/status` | Moderate/suspend any listing |
| `PUT`/`DELETE /api/vehicles/:id` | Admin bypasses all ownership checks — edit or delete any listing |
| `PATCH /api/swaps/:id/status`, `campaigns` | Full control of swap desk and ad platform |

Combined with the (correctly fixed) payout flow, the attack chain is: register as admin → approve your own fabricated payout → real funds disbursed.

**Recommended fix:** Remove the email-suffix branch entirely. Never grant a privileged role based on an unverified email address. Remove the hardcoded fallback and hard-fail in production like the other secrets. Better still, remove admin self-registration from the public endpoint altogether — provision admins via a CLI command or a direct database insert.

**Implementation:**

```go
// In Register(), replace the entire admin case with:
case string(models.RoleAdmin):
    // Admin accounts are never self-provisioned through the public
    // registration endpoint. Downgrade silently.
    role = string(models.RoleBuyer)
```

Then remove `AdminKey` from `RegisterRequest`. Provision the first admin with a one-off command (`backend/cmd/createadmin/main.go`) run manually against the production database, or promote an existing user with a direct SQL `UPDATE`.

If you genuinely need a keyed path, at minimum add to `config.go` alongside the existing guards:

```go
if AppConfig.GinMode == "release" && os.Getenv("ADMIN_SECRET") == "" {
    log.Fatal("[Config] ADMIN_SECRET must be set in production")
}
```

**Verification:**
```bash
curl -X POST $API/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"T","email":"t@carplug.ng","password":"testpass123","role":"admin"}'
# → response user.role MUST be "buyer", never "admin"

curl -X POST $API/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"T","email":"t2@x.com","password":"testpass123","role":"admin","adminKey":"carplug-admin-secret-2026"}'
# → response user.role MUST be "buyer"
```
Then audit existing data before launch: `SELECT id, email, role FROM users WHERE role = 'admin';` — confirm every row is one you created deliberately.

---

### C-2 — The Go backend cannot be deployed to Vercel

**Location:** `backend/cmd/server/main.go`; absence of any serverless entrypoint or Go build config

**Issue:** Vercel runs stateless, ephemeral serverless functions. This backend is a conventional long-lived server:

- `srv.ListenAndServe()` binding a port, with `ReadTimeout`/`WriteTimeout`/`IdleTimeout`
- A process-global `*gorm.DB` connection pool (`SetMaxOpenConns(10)`, `SetConnMaxLifetime`) initialised once at boot
- `signal.Notify(quit, SIGINT, SIGTERM)` graceful shutdown
- `AutoMigrate` executed at startup

None of this maps onto Vercel's execution model. There is no `api/` directory with Go serverless handlers, no `vercel.json` routing Go functions, and no adapter. The `web_app/` frontend deploys to Vercel fine; the backend simply has nowhere to go.

**Severity: CRITICAL** — as a deployment blocker, not a code defect. The backend code is correct; it is correct *for a platform you are not currently planning to use*.

**Recommended fix — pick one:**

**Option A (recommended): deploy the backend separately.** Frontend on Vercel, Go backend on a platform built for long-running containers:
- **Railway** or **Render** — simplest, Git-push deploy, both detect Go automatically, free/cheap tiers, managed TLS
- **Fly.io** — good if you want a region close to Nigerian users (`lhr` or `jnb` beat US-East for Lagos latency)
- **A VPS** (Hostinger, since you already have one) — most control, most operational burden; you manage TLS, systemd, restarts

This requires **no code changes to the backend at all**. Add a `Dockerfile` or let the platform's Go buildpack handle it.

Minimal `Dockerfile`:
```dockerfile
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/api ./cmd/server

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=build /bin/api /bin/api
EXPOSE 8080
CMD ["/bin/api"]
```

**Option B: rewrite the backend as Vercel Go serverless functions.** Do not do this. It means restructuring every route into individual handlers, replacing the connection pool with per-invocation connections (which will exhaust your MySQL connection limit under load), removing graceful shutdown, and moving migrations out of boot. Weeks of work to make a working system worse.

**Verification:** After deploying, `curl https://api.yourdomain.com/api/health` returns `200` with `{"status":"ok"}`, and the response arrives from your backend host, not a Vercel edge 404.

---

### C-3 — `vercel.json` is a zero-byte file

**Location:** `web_app/vercel.json` — 0 bytes

**Issue:** An empty file is not valid JSON. Vercel parses `vercel.json` before the build begins; a parse failure aborts the deployment with an error that does not obviously point at an empty file.

**Severity: CRITICAL** — hard deployment blocker, trivially fixable.

**Recommended fix:** Delete it. Next.js on Vercel requires no `vercel.json` for a standard App Router project — framework detection, build command, and output directory are all automatic.

```bash
rm web_app/vercel.json
```

If you later need one (for headers, redirects, or region pinning), create it with actual content. A useful starting version that also addresses **H-3** (security headers on the frontend):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

**Verification:** `cat web_app/vercel.json | python -m json.tool` parses without error, or the file does not exist.

---

### C-4 — `AUTO_MIGRATE` and `AUTO_SEED` default to `true`

**Location:** `backend/config/config.go`, lines 79–80

```go
AutoMigrate: getEnv("AUTO_MIGRATE", "true") == "true",
AutoSeed:    getEnv("AUTO_SEED", "true") == "true",
```

**Issue:** Both default to enabled. `.env.example` correctly documents them as `false`, but `.env.example` is a template — it has no effect on a deployed environment. If either variable is missing from the production environment (an easy omission when configuring a new host), then on **every single boot and restart**:

- `AutoMigrate` runs `DB.AutoMigrate(...)` across 15 models, issuing `ALTER TABLE` against the live database. GORM's AutoMigrate adds columns and indexes but never drops them, so it is not maximally destructive — but unreviewed schema changes executing automatically against production, on every restart, is not acceptable.
- `AutoSeed` calls `models.SeedInitialData(DB)`, which inserts fictional dealerships ("Reed Motors Lagos", "Crown Continental Autos"), fake vehicles, and fake technicians with fabricated phone numbers and ratings.

The seed function is guarded by `if count == 0` per table, which limits the blast radius — it will not duplicate into a populated database. But a freshly provisioned production database *is* empty, which is precisely when this fires. Your first real users would browse a marketplace of fake dealers.

**Severity: CRITICAL** — unreviewed schema mutation plus fabricated data in a live production database, triggered by an omission rather than an action.

**Recommended fix:** Invert the defaults so the safe behaviour is the one you get by forgetting.

```go
AutoMigrate: getEnv("AUTO_MIGRATE", "false") == "true",
AutoSeed:    getEnv("AUTO_SEED", "false") == "true",
```

Add a hard guard against seeding production regardless of the flag:

```go
if AppConfig.GinMode == "release" && AppConfig.AutoSeed {
    log.Fatal("[Config] AUTO_SEED must never be enabled in production (GIN_MODE=release)")
}
```

Longer term, migrations belong in a versioned tool (`golang-migrate`, `atlas`) run as an explicit deploy step, not at application boot. That is a Phase 4 improvement, not a launch blocker — inverting the defaults is sufficient for now.

**Verification:** Deploy with neither variable set; confirm the boot log shows neither `Running schema migrations` nor `[Seed] Seeding initial...`. Then `SELECT COUNT(*) FROM dealer_shops;` → `0` on a fresh production database.

---

## 4. HIGH-Severity Issues

### H-1 — No rate limiting on any endpoint

**Location:** `backend/routes/routes.go` — no limiter middleware exists anywhere in the codebase (verified by search).

**Issue:** Every endpoint accepts unlimited requests from a single IP. Specifically exposed:

- **`POST /api/auth/login`** — unlimited password guessing. bcrypt's cost provides some throttling but is not a defence against a distributed or patient attacker.
- **`POST /api/auth/verify-otp`** and **`/reset-password`** — the 5-attempt cap is stored *per OTP record*, and `POST /api/auth/resend-otp` issues a fresh record. An attacker can loop resend → 5 guesses → resend against a 6-digit space (1,000,000 combinations). The resend path has a cooldown check, but combined with unlimited requests this is a real account-takeover vector on password reset.
- **`POST /api/auth/register`** — unlimited account creation; database flooding and Brevo email-quota exhaustion.
- **`POST /api/upload/images`** — 50 MB per request, unlimited requests, straight to your paid Cloudinary quota.

**Severity: HIGH** — direct path to account takeover and cost exhaustion.

**Recommended fix:** Add IP-based rate limiting middleware. `github.com/ulule/limiter/v3` has a Gin adapter; a simple in-memory token bucket is adequate for a single-instance deployment.

```go
// backend/middleware/rate_limit.go
func RateLimit(requests int, window time.Duration) gin.HandlerFunc {
    type bucket struct{ count int; reset time.Time }
    var mu sync.Mutex
    buckets := make(map[string]*bucket)

    return func(c *gin.Context) {
        ip := c.ClientIP()
        mu.Lock()
        b, ok := buckets[ip]
        if !ok || time.Now().After(b.reset) {
            b = &bucket{count: 0, reset: time.Now().Add(window)}
            buckets[ip] = b
        }
        b.count++
        exceeded := b.count > requests
        mu.Unlock()

        if exceeded {
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, please try again later"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

Apply tightly to auth, generously elsewhere:
```go
auth.POST("/login",        middleware.RateLimit(5,  time.Minute),      controllers.Login)
auth.POST("/register",     middleware.RateLimit(3,  time.Minute),      controllers.Register)
auth.POST("/verify-otp",   middleware.RateLimit(10, time.Minute),      controllers.VerifyOTP)
auth.POST("/resend-otp",   middleware.RateLimit(3,  10*time.Minute),   controllers.ResendOTP)
auth.POST("/reset-password", middleware.RateLimit(5, 10*time.Minute),  controllers.ResetPassword)
uploads.POST("/images",    middleware.RateLimit(20, time.Minute),      controllers.UploadImages)
```

Note: a `map` that only grows will leak memory over months of uptime. Add a periodic sweep goroutine, or use the `limiter` library which handles eviction.

**Verification:** `for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/api/auth/login -d '{"email":"a@b.com","password":"wrong"}' -H 'Content-Type: application/json'; done` → first 5 return `401`, remainder return `429`.

---

### H-2 — `NEXT_PUBLIC_API_URL` silently falls back to localhost

**Location:** `web_app/src/services/api.ts`, line 14

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
```

**Issue:** If this variable is not configured in Vercel, the production build bakes in `http://localhost:8080/api`. `NEXT_PUBLIC_*` values are inlined at **build time**, not read at runtime — setting it after deploying does nothing until you rebuild. Every visitor's browser would attempt to call *their own machine* on port 8080. Most requests fail silently; the app's mock-data fallbacks mean some pages will render fake cars rather than show an error, which is worse than an outright failure because it looks like it works.

Secondary issue: if the backend is served over plain `http` while the frontend is `https`, browsers block the requests as mixed content regardless of the URL being correct.

**Severity: HIGH** — silent, total loss of backend connectivity, partially masked by mock fallbacks.

**Recommended fix:** Fail loudly in production builds instead of falling back.

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? (() => { throw new Error("NEXT_PUBLIC_API_URL must be set in production builds"); })()
    : "http://localhost:8080/api");
```

Set `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api` in Vercel (Production scope) **before the first deploy**, and ensure the backend is served over HTTPS.

**Verification:** After deploying, open DevTools → Network on the live site and confirm XHR requests target `https://api.yourdomain.com`, not `localhost`. Also grep the built bundle: `grep -r "localhost:8080" .next/static/` → no results.

---

### H-3 — No security headers on the backend

**Location:** `backend/routes/routes.go` — `SetupRouter` sets CORS headers only.

**Issue:** No `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Content-Security-Policy` on API responses. For a JSON API the practical risk is lower than for HTML, but `X-Content-Type-Options: nosniff` in particular prevents MIME-confusion attacks on error responses, and HSTS matters once you are on a custom domain.

**Severity: HIGH** — standard hardening, expected by any security review or payment partner.

**Recommended fix:**

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
// register before CORS: r.Use(SecurityHeaders())
```

Frontend headers are covered by the `vercel.json` in **C-3**.

**Verification:** `curl -I https://api.yourdomain.com/api/health` shows all four headers.

---

### H-4 — JWT stored in `localStorage`

**Location:** `web_app/src/services/api.ts`, lines 39–44 (`verza_auth_token`)

**Issue:** Tokens in `localStorage` are readable by any JavaScript running on the origin. A single XSS bug anywhere across 43 routes — or a compromised npm dependency — exfiltrates a token valid for **72 hours** with no server-side revocation mechanism. There is no token blacklist; `logout()` only clears local storage, so a stolen token remains valid until natural expiry.

This was a knowingly-accepted trade-off earlier in development and it remains defensible for launch, given that the alternative (httpOnly cookies) requires a Next.js route-handler proxy layer and introduces CSRF considerations that the current header-based scheme avoids entirely. But it should be a **deliberate, documented** decision rather than an unexamined default, and the mitigations below are not optional.

**Severity: HIGH** — not a blocker on its own, but it amplifies the severity of any future XSS to full account takeover, including admin accounts.

**Recommended mitigations for launch (do these):**
1. Reduce `JWT_EXPIRATION_HOURS` from 72 to **12–24**. Shortens the theft window substantially at minor UX cost.
2. Add a `Content-Security-Policy` header on the frontend to reduce XSS surface.
3. Never render unsanitised user-supplied content with `dangerouslySetInnerHTML` (verified: currently not used anywhere — keep it that way).

**Post-launch (Phase 4):** migrate to httpOnly cookies set by a Next.js route handler acting as a proxy to the Go API, with the token never touching client JavaScript. This is a genuine architecture change — scope it deliberately.

**Verification:** After changing expiry, decode a fresh token at jwt.io and confirm `exp - iat` matches the new window.

---

### H-5 — Production database reachable from the public internet

**Location:** `backend/config/database.go`; Hostinger shared MySQL (`DB_HOST` per `.env`)

**Issue:** The database is a shared-hosting MySQL instance addressed by public hostname. Shared MySQL on Hostinger is typically reachable from any IP once remote access is enabled. The credentials are now correctly managed (rotated, scrubbed from git, required via env with no fallback) — but the network layer is the last line of defence, and right now it accepts connections from anywhere.

Additionally, `SetMaxOpenConns(10)` is appropriate for a single long-running instance but will become a bottleneck under real traffic, and would be catastrophic if the backend were ever run as multiple instances or serverless functions (each instance gets its own pool of 10 against a shared-hosting connection cap that is often 25–75 total).

**Severity: HIGH** — credential compromise becomes total data compromise with no network barrier; connection limits will bite under load.

**Recommended fix:**
1. In Hostinger's Remote MySQL panel, **allowlist only your backend host's outbound IP**. Railway/Render/Fly all publish static egress IPs or offer them on paid plans — get the IP before deploying and lock the database to it.
2. For real traffic, migrate off shared hosting to a managed MySQL with connection pooling (PlanetScale, Aiven, or a DigitalOcean managed database). Shared hosting is not built for an API backend's connection pattern.
3. Verify TLS is enforced on the MySQL connection — the current DSN does not specify `tls=true`. Add it:
   ```go
   dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local&tls=preferred&timeout=10s&readTimeout=30s&writeTimeout=30s", ...)
   ```

**Verification:** From an unrelated machine, `mysql -h <host> -u <user> -p` should **fail to connect** after allowlisting. Confirm the backend still connects.

---

### H-6 — Email verification is never enforced

**Location:** `backend/models/user.go` (`IsVerified`); `backend/controllers/auth_controller.go`

**Issue:** The full OTP machinery exists and works — generation, Brevo delivery, 10-minute expiry, 5-attempt cap. But `IsVerified` gates **nothing**. A user who never opens the email can immediately log in, list vehicles, message other users, request inspections, and upgrade to seller/dealer/technician. The verification flow is decorative.

**Severity: HIGH** — a marketplace where sellers need not own a working email address is a fraud and spam vector, and it undermines the trust positioning the entire product is built around.

**Recommended fix:** Decide which actions require a verified email, then enforce with middleware. Recommended minimum: browsing and login stay open; anything that creates content or touches money requires verification.

```go
func RequireVerifiedEmail() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetString("userID")
        var user models.User
        if err := config.GetDB().Where("id = ?", userID).First(&user).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "account not found"})
            c.Abort(); return
        }
        if !user.IsVerified {
            c.JSON(http.StatusForbidden, gin.H{
                "error": "Please verify your email address to continue",
                "code":  "EMAIL_NOT_VERIFIED",
            })
            c.Abort(); return
        }
        c.Next()
    }
}
```

Apply to: `POST /vehicles`, `POST /leads`, `POST /inspections`, `POST /conversations`, `POST /payments/initialize`, `PATCH /auth/upgrade-role`. The frontend should catch `EMAIL_NOT_VERIFIED` and show a "resend verification" prompt.

**Verification:** Register a new account, skip verification, attempt `POST /api/vehicles` → `403` with `EMAIL_NOT_VERIFIED`. Verify via OTP, retry → `201`.

---

### H-7 — No global request body size limit

**Location:** `backend/routes/routes.go`; only `upload_controller.go:41` sets a limit (50 MB)

**Issue:** Every other endpoint accepts an unbounded request body. A `POST /api/auth/register` with a 500 MB JSON payload is read into memory before validation rejects it. Combined with no rate limiting (**H-1**), this is a straightforward memory-exhaustion DoS.

**Severity: HIGH** — trivial denial of service.

**Recommended fix:**
```go
func BodyLimit(max int64) gin.HandlerFunc {
    return func(c *gin.Context) {
        if !strings.HasPrefix(c.Request.URL.Path, "/api/upload") {
            c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, max)
        }
        c.Next()
    }
}
// r.Use(BodyLimit(1 << 20)) // 1 MB for JSON endpoints
```

**Verification:** `head -c 5000000 /dev/urandom | base64 | curl -X POST $API/api/auth/login -H 'Content-Type: application/json' --data-binary @- -w "%{http_code}"` → `413`, not a hang or `500`.

---

## 5. MEDIUM-Severity Issues

### M-1 — No `not-found.tsx`, `error.tsx`, or `global-error.tsx`

**Location:** `web_app/src/app/` — none of these files exist (the build's `/_not-found` is Next's unstyled default).

A user hitting a bad URL or triggering a render error sees a bare, unbranded Next.js page. On a consumer marketplace this reads as "site is broken."

**Fix:** Add all three. Minimum viable `not-found.tsx`:
```tsx
import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-neutral-600 mb-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white">Back to home</Link>
    </main>
  );
}
```
`error.tsx` must be a client component accepting `{ error, reset }`. `global-error.tsx` must render its own `<html>`/`<body>`.

**Verification:** Visit `/does-not-exist` on the deployed site → branded 404.

---

### M-2 — SEO is effectively absent

**Location:** `web_app/src/app/layout.tsx` (root metadata only); no `robots.ts`, `sitemap.ts`, or per-page `metadata` exports.

For a marketplace whose traffic depends on organic search for queries like "Toyota Camry Lagos," this is a significant commercial gap, not just a technical one.

Missing: per-page `metadata` (every vehicle detail page shares one generic title), `metadataBase`, Open Graph images (links shared to WhatsApp — the dominant sharing channel in Nigeria — render with no preview), `robots.txt`, `sitemap.xml`, canonical URLs, and JSON-LD structured data (`Vehicle`/`Product` schema, which drives rich results).

**Fix:** Add to `layout.tsx`:
```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: { default: "Verza — Premium Car Marketplace", template: "%s | Verza" },
  description: "...",
  openGraph: { type: "website", locale: "en_NG", siteName: "Verza", images: ["/og-default.png"] },
  robots: { index: true, follow: true },
};
```
Add `generateMetadata` to `buyer/vehicles/[id]` and `shops/[slug]`. Add `app/robots.ts` and `app/sitemap.ts`.

---

### M-3 — 52 MB of images committed to the repository

**Location:** `web_app/public/images/` — `stories/` 34 MB, `cars/` 14 MB, `articles/` 2.8 MB, `brands/` 1.3 MB

Every clone and every Vercel build transfers 52 MB. Cloudinary integration already exists (`utils/cloudinary.go`, `POST /api/upload/images`) and `next.config.ts` already allowlists `res.cloudinary.com` — the infrastructure to fix this is built and unused for static assets.

Note this is **not** a blocker: Vercel serves `/public` from its CDN, so end-user performance is acceptable. The cost is build time, repo size, and developer experience.

**Fix:** Run the existing `IMAGE_AUDIT.md` process first (identify referenced vs. orphaned), then migrate referenced images to Cloudinary and delete the rest. Phase 3 work.

---

### M-4 — Unreferenced 515 KB `image.png` in `public/`

**Location:** `web_app/public/image.png` — verified unreferenced anywhere in `src/`.

Symptomatic of asset accumulation without review. Delete it.

---

### M-5 — Internal security documentation committed to a public repository

**Location:** `backend/IMAGE_AUDIT.md`, `LEAD_OWNERSHIP_FIX.md`, `Payment fixes.md`, `REMAINING_FIXES.md`, `PAYMENT_REVIEW_CHECKLIST.md`, `nextstep.md`, `prompts.md`

These files document — in a public repository — exactly which authorization checks were missing, which endpoints had integrity gaps, how the payment ledger works, and where the weak points were. `REMAINING_FIXES.md` explicitly discusses the historical credential leak.

This is a reconnaissance gift to anyone probing the application. The fixes have landed, so the information is largely historical, but it maps the codebase's security model for free.

**Fix:** Move all internal planning/audit docs to a private location (a private repo, Notion, or a `docs/` directory excluded via `.gitignore`). Keep `README.md` and `documentation.md` if they are genuinely user-facing. Note that deleting them now leaves them in git history — they are not secrets, so a history rewrite is disproportionate; just stop adding new ones.

---

### M-6 — Prompt-injection content committed in `web_app/AGENTS.md` and `CLAUDE.md`

**Location:** `web_app/AGENTS.md`, `web_app/CLAUDE.md`

These files claim the project uses a modified Next.js with breaking changes and instruct AI coding agents to read non-existent documentation paths inside `node_modules`, framing themselves as auto-regenerated by `next dev`. This is not standard Next.js behaviour and the claim is false.

I flagged this at the very start of this project and it remains unaddressed. Any AI agent (Antigravity, Cursor, Claude Code, Copilot) that opens this repository will read these files and may act on them, wasting time chasing fabricated documentation or making changes based on false premises about the framework.

**Severity: MEDIUM** — no runtime impact, but a persistent source of agent confusion and a genuine supply-chain-adjacent concern if the content ever escalates.

**Fix:** Delete both files. If you want real agent instructions, write them yourself.

---

### M-7 — No observability: no structured logging, error tracking, or uptime monitoring

**Location:** Backend uses `log.Printf` throughout; no Sentry, no APM, no health-check monitor.

Once live, you will have no way to know that payouts are failing, that the database connection dropped at 3 a.m., or that a user hit a 500 — unless a user tells you. `GetWallet`, `SubmitInspectionReport`, and the payment paths all log critical failures to stdout, which on most hosts means they scroll past and vanish.

**Fix (Phase 3):** Add Sentry (`sentry-go` for backend, `@sentry/nextjs` for frontend — both have free tiers). Point an uptime monitor (UptimeRobot, free) at `/api/health` with alerting. Ensure your host retains logs.

---

### M-8 — Zero test coverage of the highest-risk code

**Location:** Only `backend/utils/jwt_test.go` and `backend/middleware/auth_middleware_test.go` exist.

Both are good tests. But **nothing** tests: ownership enforcement in controllers, the escrow-release atomicity, payout balance validation, webhook signature verification, role-upgrade restrictions, or any frontend behaviour. Every one of those is a place where a regression costs money or leaks data.

This project's own history is the argument: the authorization gaps, the fabricated-earnings bug, and the lead-ownership gap were all caught by manual review, and each could have been caught by a test that then prevented regression forever.

**Prioritised testing plan** (do not attempt full coverage — target the money and the gates):

| Priority | What to test | Why |
|---|---|---|
| 1 | `Register()` never returns `admin` role | Directly guards C-1; would have caught it |
| 2 | Escrow release: amount matches escrow, escrow flips to settled, both-or-neither | Guards fabricated money |
| 3 | `RequestPayout` rejects amount > balance; creates `pending` not `settled` | Guards real money leaving |
| 4 | Ownership: non-owner gets 403 on vehicle/lead/inspection updates | Guards IDOR across all resources |
| 5 | Webhook rejects invalid/missing HMAC signature | Guards payment forgery |
| 6 | `UpgradeRole` rejects `admin` as target | Guards escalation |

Go's `httptest` + an SQLite in-memory GORM instance makes these fast to write. Six tests covering the six things that can actually hurt you is worth more than 60% line coverage.

---

### M-9 — Accessibility gaps

**Location:** Various components.

`next/image` enforces `alt` presence but not quality — several were filled with generic values during the earlier migration. Focus-visible states are not consistently defined across custom-styled buttons and inputs. Modals (`AuthModal`, `FeaturedVehicleModal`) have no verified focus trap or `Escape` handling, and no `aria-modal`/`role="dialog"`. Colour contrast on the light-grey-on-white palette (`#F7F8FA` backgrounds with `neutral-600` text) has not been measured against WCAG AA.

**Fix (Phase 3):** Run axe DevTools or Lighthouse's accessibility audit on the top five routes. Add focus traps to modals. Verify contrast ratios ≥ 4.5:1 for body text.

---

### M-10 — `RoleGuard` is client-side only

**Location:** `web_app/src/components/auth/RoleGuard.tsx`

Portal protection runs entirely in the browser. This is **not a security hole** — every corresponding backend endpoint enforces `RequireRoles` plus ownership, which I verified — but it does mean protected page *shells* render and flash before the guard resolves, and the pages exist in the client bundle regardless of role.

Acceptable for launch given real server-side enforcement. Worth noting so nobody later mistakes the client guard for the security boundary.

---

## 6. LOW-Severity Issues

| ID | Issue | Location | Fix |
|---|---|---|---|
| L-1 | Unused `onOpenAuth` prop (1 ESLint warning) | `components/hero/Hero.tsx:16` and `app/page.tsx` | Remove from interface, destructuring, and call site |
| L-2 | `RojoLogo.tsx` retains pre-rebrand name | `components/common/RojoLogo.tsx` | Rename to `VerzaLogo.tsx`, update import sites |
| L-3 | Markdown escaping glitch from file restore | `backend/PAYMENT_REVIEW_CHECKLIST.md:45` | `PAYMENTS*FIXES.md` → `PAYMENTS_FIXES.md` |
| L-4 | Duplicate `.gitignore` files with overlapping rules | root + `web_app/` | Harmless; consolidate if it ever causes confusion |
| L-5 | `go.mod` carries `go.mongodb.org/mongo-driver/v2` indirectly | `backend/go.mod` | Transitive via Cloudinary SDK; no action needed |
| L-6 | Backend `documentation.md` is 52 KB | `backend/documentation.md` | Fine, but verify it does not document internals you would rather keep private (see M-5) |
| L-7 | No `.env.example` for `web_app` | `web_app/` | Add one documenting `NEXT_PUBLIC_API_URL` |
| L-8 | Inconsistent ID generation | `uuid` in auth, `UnixNano` base36 elsewhere | Cosmetic; standardise opportunistically |

---

## 7. Security Audit Summary

### Authentication — **Mostly sound**
| Check | Status |
|---|---|
| Password hashing | ✅ bcrypt, `DefaultCost` |
| Password minimum length | ✅ 8 chars, enforced twice (binding tag + explicit check) |
| Account enumeration on login | ✅ Generic "invalid email or password" for both cases |
| Password hash exposure | ✅ `json:"-"` on `PasswordHash`; verified never serialised |
| JWT signing | ✅ HMAC via `golang-jwt/v5`, secret required in production |
| Token expiry | ⚠️ 72h — too long given localStorage (**H-4**) |
| Token revocation | ❌ None — no blacklist; logout is client-side only |
| Brute-force protection | ❌ None (**H-1**) |
| Email verification enforcement | ❌ Built but never enforced (**H-6**) |
| OTP security | ✅ 6-digit, 10-min expiry, 5-attempt cap ⚠️ resend loop bypasses the cap (**H-1**) |
| Admin provisioning | ❌ **CRITICAL** (**C-1**) |

### Authorization — **Genuinely strong**
Verified by reading every controller: ownership checks are present and correct on `UpdateVehicle`, `DeleteVehicle`, `UpdateLeadStatus`, `UpdateInspectionStatus`, `SubmitInspectionReport`, and all conversation endpoints. Dealer-shop ownership is resolved correctly (not just raw ID comparison). `RequireRoles` is applied at route level. `CreateVehicle` sets `SellerID` from the token, never the body. `UpgradeRole` correctly refuses `admin`.

**No IDOR found.** This is the strongest part of the codebase, and it got there through deliberate iteration.

### Input security
| Check | Status |
|---|---|
| SQL injection | ✅ GORM parameterised throughout; no raw string concatenation found |
| Request validation | ✅ Gin binding tags + explicit checks on critical paths |
| XSS | ✅ React escapes by default; `dangerouslySetInnerHTML` not used anywhere |
| CSRF | ✅ N/A — bearer tokens in headers, not cookies |
| Oversized requests | ❌ (**H-7**) |
| File upload validation | ✅ 50 MB cap, folder allowlist, MIME accept list |

### Secrets — **Clean, with one exception**
Verified: no live secrets in tracked files. `.env.example` is fully placeholdered. `.gitignore` correctly excludes `.env` at both levels. Git history was scrubbed on both `main` and `shuddy` (confirmed: zero matches across all refs). `DB_PASSWORD`, `DB_HOST`, `DB_USER`, `DB_NAME`, and `JWT_SECRET` all hard-fail if unset in production.

**The exception is `ADMIN_SECRET`** — hardcoded fallback, no production guard (**C-1**).

---

## 8. Database Audit

**Architecture:** MySQL 8 via GORM, 15 models, connection pooling with retry-on-boot (5 attempts, 2s backoff). Soft deletes on `User`. Indexes on foreign keys and `Role`. `Email` has a unique index.

| Check | Status |
|---|---|
| Connection retry logic | ✅ 5 attempts with backoff |
| Pool configuration | ⚠️ `MaxOpenConns(10)` — fine for one instance, bottleneck under load (**H-5**) |
| Connection encryption | ❌ DSN does not set `tls=preferred` (**H-5**) |
| Network exposure | ❌ Shared-host MySQL, no IP allowlist (**H-5**) |
| Schema migration strategy | ❌ `AutoMigrate` at boot, defaults to on (**C-4**) |
| Seeding safety | ❌ Defaults to on; guarded only by `count == 0` (**C-4**) |
| Unique constraints | ✅ Email unique; escrow-to-inspection uniqueness enforced in application logic |
| Transaction usage | ✅ Escrow release wraps 4 writes in `db.Transaction` — correct and atomic |
| Race conditions | ⚠️ Escrow double-use is guarded by a query-then-write pattern, not a DB constraint. Under concurrent requests two inspections could theoretically claim one escrow. Add a unique index on `inspection_reports.escrow_transaction_id` to close this at the database level. |
| Query efficiency | ✅ `GetWallet` uses DB-side `SUM()`; pagination on list endpoints |
| Sensitive data at rest | ⚠️ KYC document URLs stored plainly; Cloudinary URLs are unguessable but publicly accessible if leaked. Consider signed URLs for KYC assets. |

**Verdict:** The schema and query layer are production-appropriate. The *operational* configuration (migration strategy, network exposure, shared hosting) is not.

---

## 9. Vercel Deployment Audit

| Question | Answer |
|---|---|
| Is the structure Vercel-compatible? | **Frontend yes, backend no** (**C-2**) |
| Can the frontend deploy correctly? | Yes — set Root Directory to `web_app` in project settings |
| Can the backend deploy correctly? | **No.** Go/Gin long-running server; needs Railway/Render/Fly/VPS |
| Does the Express architecture need changing? | N/A — there is no Express |
| Build command correct? | Yes — `next build`, auto-detected |
| Output directory correct? | Yes — `.next`, auto-detected |
| Is SPA fallback needed? | No — App Router handles routing natively |
| Environment variables correctly referenced? | ⚠️ One critical gap (**H-2**) |
| Will serverless execution cause problems? | For the frontend, no. The 3 dynamic routes (`ƒ`) are server-rendered on demand — fine. |
| Will CORS need to change? | **Yes** — `ALLOWED_ORIGINS` must include your production domain(s) |
| Will API URLs need to change? | **Yes** (**H-2**) |
| Will auth work after deployment? | Yes — bearer tokens are origin-independent, no cookie/domain issues |
| Are MongoDB connections suitable? | N/A — MySQL, and it is not serverless, so pooling is fine |
| Local filesystem assumptions? | ✅ None found — uploads go to Cloudinary, not disk |
| Node-specific incompatibilities? | ✅ None in the frontend |

**Critical deployment-order dependency:** `NEXT_PUBLIC_API_URL` is inlined at build time. You must deploy the **backend first**, obtain its URL, set the variable in Vercel, and *then* build the frontend. Building first and setting the variable after produces a frontend permanently pointed at localhost until you redeploy.

### Recommended deployment sequence
1. Fix C-1, C-3, C-4, H-2 in code
2. Deploy backend to Railway/Render → note its URL and static egress IP
3. Allowlist that IP in Hostinger Remote MySQL (**H-5**)
4. Set backend env vars: `GIN_MODE=release`, `AUTO_MIGRATE=false`, `AUTO_SEED=false`, `JWT_SECRET`, `ADMIN_SECRET`, DB credentials, Cloudinary, Brevo, `ALLOWED_ORIGINS`
5. Run migrations **manually, once**, against production (temporarily `AUTO_MIGRATE=true`, boot, verify schema, set back to `false`, redeploy)
6. Set `NEXT_PUBLIC_API_URL` in Vercel → deploy frontend with Root Directory `web_app`
7. Update backend `ALLOWED_ORIGINS` to the real Vercel/custom domain → redeploy backend
8. Smoke test

---

## 10. Environment Variables

| Variable | Used Where | Required? | Side | Production Action |
|---|---|---|---|---|
| `PORT` | `config.go` → `main.go` | No (default 8080) | Backend | Usually injected by host; do not hardcode |
| `GIN_MODE` | `config.go`, `routes.go`, `database.go` | **Yes** | Backend | **Set to `release`** — gates JWT guard, log level, HSTS |
| `ALLOWED_ORIGINS` | `config.go` → `CORSMiddleware` | **Yes** | Backend | Set to `https://yourdomain.com,https://www.yourdomain.com` |
| `DB_HOST` | `database.go` | **Yes** (hard-fails) | Backend | Production MySQL host |
| `DB_PORT` | `database.go` | No (3306) | Backend | — |
| `DB_USER` | `database.go` | **Yes** (hard-fails) | Backend | Production user |
| `DB_PASSWORD` | `database.go` | **Yes** (hard-fails) | Backend | **Never expose.** Rotate if ever shared |
| `DB_NAME` | `database.go` | **Yes** (hard-fails) | Backend | Production DB name |
| `DB_CHARSET` | `database.go` | No (`utf8mb4`) | Backend | — |
| `AUTO_MIGRATE` | `database.go` | **Yes in practice** | Backend | **Set `false`** — defaults to `true` (**C-4**) |
| `AUTO_SEED` | `database.go` | **Yes in practice** | Backend | **Set `false`** — defaults to `true` (**C-4**) |
| `JWT_SECRET` | `config.go`, `utils/jwt.go` | **Yes** (hard-fails in release) | Backend | **Never expose.** Generate: `openssl rand -base64 48` |
| `JWT_EXPIRATION_HOURS` | `config.go` | No (72) | Backend | **Set to 12–24** (**H-4**) |
| `ADMIN_SECRET` | `auth_controller.go` | **Yes — currently unguarded** | Backend | **See C-1.** Preferably remove the code path entirely |
| `CLOUDINARY_CLOUD_NAME` | `utils/cloudinary.go` | Yes (uploads disabled without) | Backend | Set |
| `CLOUDINARY_API_KEY` | `utils/cloudinary.go` | Yes | Backend | **Never expose** |
| `CLOUDINARY_API_SECRET` | `utils/cloudinary.go` | Yes | Backend | **Never expose** |
| `BREVO_API_KEY` | `utils/brevo.go` | Yes (OTP email fails without) | Backend | **Never expose** |
| `BREVO_SENDER_NAME` | `utils/brevo.go` | No | Backend | — |
| `BREVO_SENDER_EMAIL` | `utils/brevo.go` | **Yes** | Backend | **Must be a verified sender on your domain** or email silently fails |
| `PAYSTACK_SECRET_KEY` | `payment_controller.go` | Yes when payments go live | Backend | **Never expose.** Webhook HMAC depends on it |
| `NEXT_PUBLIC_API_URL` | `services/api.ts` | **Yes** | **Frontend** | **Set before first build** (**H-2**). Public by design — contains no secret |

**Public-prefix audit:** Only one `NEXT_PUBLIC_*` variable exists, and it correctly contains no secret. ✅ No sensitive data is exposed to the browser.

**`.gitignore` audit:** ✅ Correct. Root ignores `.env`, `backend/.env`, `web_app/.env*.local`, with `!backend/.env.example` allowlisted. `web_app/.gitignore` ignores `.env*` entirely. No `.env` file is tracked (verified).

---

## 11. Domain & DNS

### Recommended architecture
```
yourdomain.com          → Vercel (frontend, canonical)
www.yourdomain.com      → 308 redirect → yourdomain.com
api.yourdomain.com      → Railway/Render (Go backend)
```

Using a subdomain for the API rather than a path (`/api` proxied through Vercel) is the right call here: it keeps the two deployments independent, avoids proxy complexity, and since you use bearer tokens rather than cookies, there is **no cross-subdomain cookie problem** to solve.

### Setup steps
1. **Vercel:** add `yourdomain.com` and `www.yourdomain.com` in Project → Domains. Set the apex as primary; Vercel auto-configures the `www` redirect.
2. **DNS records at your registrar:**
   - Apex `A` → `76.76.21.21` (or Vercel's `ALIAS`/`ANAME` if your registrar supports it — preferred)
   - `www` `CNAME` → `cname.vercel-dns.com`
   - `api` `CNAME` → your backend host's provided hostname
3. **TLS:** both Vercel and Railway/Render provision Let's Encrypt certificates automatically. Verify `api.` gets one — the frontend being HTTPS while the API is HTTP causes browsers to block every request as mixed content.
4. **Backend CORS:** set `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`. **Do not include `http://` variants.**
5. **Email:** for Brevo deliverability, add SPF, DKIM, and DMARC records for the sending domain. Without these, OTP emails land in spam and your signup flow appears broken. Brevo's dashboard provides the exact records.
6. **SEO:** set `metadataBase` to the canonical domain (**M-2**) so OG images and canonicals resolve absolutely.

**Propagation:** allow up to 48 hours, though it is usually minutes. Verify with `dig yourdomain.com` and `dig api.yourdomain.com` before assuming something is broken.

---

## 12. Error Handling & Edge Cases

| Scenario | Current behaviour | Production-quality? |
|---|---|---|
| Wrong password | `401` generic message | ✅ |
| Non-existent account | `401` same message | ✅ No enumeration |
| Duplicate registration | `409` clear message | ✅ |
| Invalid email format | `400` from `mail.ParseAddress` | ✅ |
| Missing/empty fields | `400` from binding tags | ✅ |
| Malformed JSON | `400` from Gin | ✅ |
| Expired JWT | `401` | ✅ |
| Invalid/missing JWT | `401` | ✅ |
| Unauthorized (wrong role) | `403` | ✅ |
| Non-owner resource access | `403` | ✅ Verified across controllers |
| Invalid resource ID | `404` | ✅ |
| Database unavailable at boot | 5 retries, then `log.Fatal` | ✅ |
| Database drops mid-operation | `500` with raw GORM error | ⚠️ Leaks internals — sanitise in release mode |
| Network failure (frontend) | Falls back to mock data on some routes | ❌ **Silently shows fake cars as if real.** Acceptable during development; misleading in production. Replace mock fallbacks with explicit error states before launch. |
| Inspection booking failure | Real error shown to user | ✅ Fixed |
| Brute-force login | Unlimited attempts | ❌ (**H-1**) |
| Browser refresh on protected page | `RoleGuard` re-hydrates from localStorage | ✅ |
| Direct URL to protected page | Client guard blocks; backend rejects data calls | ✅ |
| Duplicate escrow use | Application-level check | ⚠️ Not DB-enforced (see §8) |

**The mock-data fallback deserves emphasis.** In `services/api.ts`, several fetch failures fall back to `mockStore` data. In development that is a convenience. In production it means a backend outage presents users with fabricated listings, fake dealer names, and invented phone numbers — with no indication anything is wrong. Strip these fallbacks, or gate them behind `process.env.NODE_ENV !== "production"`.

---

## 13. Performance

**Must fix before launch:**
- Nothing. Current performance is acceptable for launch traffic.

**Should fix soon after:**
- **52 MB of static images** (**M-3**) — build time and repo bloat
- **Mock data bundled into the client** — `mockStore.ts` and `mockCars.ts` ship to the browser. Once fallbacks are removed (§12), tree-shake these out entirely.
- **Client-component sprawl** — 50+ of 66 components are `"use client"`. The public marketing and search pages could be server components with client islands, improving both TTFB and SEO. Deferred deliberately; revisit once API contracts stabilise.
- **`MaxOpenConns(10)`** (**H-5**) will bottleneck before the application logic does.

**Positives:** Turbopack builds in ~23 s. `next/image` used throughout with `sizes` props. Fonts are self-hosted and preloaded via `next/font`. No obvious render-blocking patterns.

---

## 14. Things You Are Currently Overlooking

These are risks nobody has raised yet, surfaced by asking what breaks when this meets real users rather than what is wrong in the code.

**1. You have no database backups.** Hostinger shared MySQL may include periodic backups — verify this, do not assume. Then verify you can actually *restore* one. An untested backup is not a backup. This is the single highest-impact item in this section: every other problem here is recoverable, and data loss is not.

**2. You have no way to know the site is down.** No uptime monitoring, no error tracking, no alerting (**M-7**). Your first indication of an outage will be a user complaint, or silence.

**3. Cloudinary and Brevo have free-tier quotas that will be hit.** With no rate limiting (**H-1**), a single malicious actor can exhaust your image storage or email send quota in an afternoon. When Brevo's quota is exhausted, OTP emails stop and *nobody can register* — a total signup outage with no error anywhere in your code.

**4. Paystack is not actually integrated.** `InitializePayment` constructs a checkout URL by hand; no Paystack API call is made. The webhook HMAC verification is correct and ready, but nothing generates real payments yet. The subscription and ad-campaign paths mark transactions `settled` immediately at creation — **once a real key is connected, that must move into the webhook handler**, or users get paid features without paying.

**5. You are handling government identity documents with no retention or privacy policy.** NIN and CAC uploads are personally identifiable information. Nigeria's NDPR imposes obligations on how this is stored, who accesses it, how long it is kept, and what happens on deletion request. You need a privacy policy and terms of service before accepting the first upload. This is a legal exposure, not a technical one.

**6. No legal pages exist at all.** No terms of service, privacy policy, or cookie notice. Paystack will ask for these during merchant onboarding.

**7. Escrow means you are holding other people's money.** Holding buyer funds pending inspection completion has regulatory implications in Nigeria (CBN payment-service regulations). Worth a conversation with someone who knows Nigerian fintech regulation before this goes live with real funds — the technical implementation being correct does not make the arrangement compliant.

**8. There is no admin account yet.** Once you fix **C-1** (as you must), there will be *no way to create one* through the API. Plan the provisioning path — a CLI command or a direct SQL `UPDATE` — **before** deploying, or you will lock yourself out of your own admin panel.

**9. Test/seed data may reach production.** If `AUTO_SEED` ever runs (**C-4**), "Reed Motors Lagos" and its fabricated ₦-priced inventory become real rows. Before launch, verify production contains zero seeded records: `SELECT * FROM dealer_shops WHERE id LIKE 'dealer-%';`

**10. The technician role is self-service with no verification gate.** One click upgrades any user to technician. Technicians perform inspections that buyers pay for and rely on. A `tech_license` KYC flow exists but gates nothing — same pattern as **H-6**. Anyone can present as a qualified vehicle inspector on your platform. This is a trust and liability problem more than a security one.

**11. No deletion or data-export path for users.** NDPR grants data subjects deletion rights. `User` has soft deletes, but nothing exposes deletion, and no cascade is defined for a deleted user's listings, messages, or transactions.

**12. Scaling: a single backend instance with 10 DB connections.** Fine for launch. But the pool is per-instance — the moment you scale to two instances you have 20 connections against a shared-hosting cap that may be lower than that. Understand your MySQL `max_connections` before scaling horizontally.

**13. No staging environment.** Every deploy goes straight to production. At minimum, use Vercel preview deployments for the frontend and a second Railway/Render service pointed at a separate database for the backend.

**14. Timezone handling.** The DSN sets `loc=Local`, meaning timestamps are interpreted in the *server's* timezone. If your host runs UTC and you reason about times in WAT (UTC+1), inspection scheduling and OTP expiry windows will be subtly off by an hour. Set `loc=UTC` explicitly and convert for display in the frontend.

**15. No CI.** Nothing runs `go build`, `go vet`, `eslint`, or `next build` on push. Every check in this audit was run manually. A minimal GitHub Actions workflow running those four commands would catch regressions before they reach a branch you deploy from.

---

## 15. Prioritised Action Plan

### Phase 1 — MUST FIX BEFORE DEPLOYMENT

| # | Issue | Location | Action | Complexity |
|---|---|---|---|---|
| 1 | **C-1** Anonymous admin creation | `auth_controller.go:66-78` | Remove email-suffix branch and hardcoded secret; remove admin from public registration | **Easy** |
| 2 | **C-2** Backend cannot deploy to Vercel | Infrastructure | Choose and provision Railway/Render/Fly; add Dockerfile | **Moderate** |
| 3 | **C-3** Empty `vercel.json` | `web_app/vercel.json` | Delete, or populate with headers config | **Easy** |
| 4 | **C-4** Auto-migrate/seed default on | `config.go:79-80` | Invert defaults; add release-mode seed guard | **Easy** |
| 5 | **H-2** API URL falls back to localhost | `services/api.ts:14` | Throw in production builds; set var in Vercel before first build | **Easy** |
| 6 | Admin provisioning path | New | CLI command or documented SQL, ready *before* deploy | **Easy** |
| 7 | Remove mock-data fallbacks in production | `services/api.ts` | Gate behind `NODE_ENV !== "production"` | **Easy** |

### Phase 2 — SHOULD FIX BEFORE DEPLOYMENT

| # | Issue | Location | Action | Complexity |
|---|---|---|---|---|
| 8 | **H-1** No rate limiting | `routes.go` + new middleware | Add IP limiter on auth, OTP, upload | **Moderate** |
| 9 | **H-5** DB network exposure + no TLS | Hostinger panel; `database.go` | IP allowlist; add `tls=preferred` | **Easy** |
| 10 | **H-3** No security headers | `routes.go` | Add `SecurityHeaders()` middleware | **Easy** |
| 11 | **H-7** No body size limit | `routes.go` | Add `BodyLimit(1MB)` | **Easy** |
| 12 | **H-4** 72h token expiry | Env var | Set `JWT_EXPIRATION_HOURS=24` | **Easy** |
| 13 | **H-6** Email verification unenforced | New middleware + routes | Gate content/money actions | **Moderate** |
| 14 | Database backups verified | Hostinger | Confirm backups exist; **test a restore** | **Easy** |
| 15 | Legal pages | `web_app` | Privacy policy, ToS (required for Paystack + NDPR) | **Moderate** |

### Phase 3 — RECOMMENDED BEFORE LAUNCH

| # | Issue | Action | Complexity |
|---|---|---|---|
| 16 | **M-1** No 404/error pages | Add `not-found.tsx`, `error.tsx`, `global-error.tsx` | Easy |
| 17 | **M-2** SEO absent | `metadataBase`, per-page metadata, robots, sitemap, OG images | Moderate |
| 18 | **M-7** No observability | Sentry both sides; UptimeRobot on `/api/health` | Easy |
| 19 | **M-8** No tests on critical paths | Write the 6 prioritised tests | Moderate |
| 20 | Technician verification gate | Require approved `tech_license` before accepting dispatches | Moderate |
| 21 | **M-5/M-6** Repo hygiene | Move internal docs private; delete `AGENTS.md`/`CLAUDE.md` | Easy |
| 22 | Escrow uniqueness at DB level | Unique index on `escrow_transaction_id` | Easy |
| 23 | **M-9** Accessibility | Lighthouse audit; modal focus traps; contrast check | Moderate |
| 24 | CI pipeline | GitHub Actions: `go build`, `go vet`, `eslint`, `next build` | Easy |

### Phase 4 — POST-LAUNCH

| # | Item | Complexity |
|---|---|---|
| 25 | **M-3** Migrate 52 MB images to Cloudinary | Moderate |
| 26 | httpOnly cookie auth migration (**H-4**) | Difficult |
| 27 | Versioned migrations (`golang-migrate`) replacing `AutoMigrate` | Moderate |
| 28 | Server-component refactor for SEO-critical pages | Difficult |
| 29 | Managed MySQL migration off shared hosting | Moderate |
| 30 | Staging environment | Moderate |
| 31 | **L-1/L-2/L-3** Cosmetic cleanup | Easy |

---

## 16. Files & Folders Reviewed

**Backend (Go)** — all 40 `.go` files read or inspected:
`cmd/server/main.go` · `config/config.go` · `config/database.go` · all 15 controllers · all 15 models · `middleware/auth_middleware.go` + test · `routes/routes.go` · `utils/{jwt,brevo,cloudinary}.go` + `jwt_test.go` · `go.mod` · `go.sum` · `.env.example` · `.gitignore` · all 9 `.md` files

**Frontend (Next.js)** — full inventory reviewed, key files read in depth:
`package.json` · `package-lock.json` · `next.config.ts` · `tsconfig.json` · `eslint.config.mjs` · `postcss.config.mjs` · `vercel.json` · `src/app/layout.tsx` · `src/app/page.tsx` · `src/app/fonts.ts` · `src/app/globals.css` · all 43 route files · all 24 components · `src/context/{AuthContext,SavedVehiclesContext}.tsx` · `src/services/api.ts` · `src/data/{mockStore,mockCars}.ts` · `public/` · `AGENTS.md` · `CLAUDE.md` · `slugs.md`

**Root:** `.gitignore` · `README.md` · git history across all refs

**Verification performed:** `npm install` · `npx eslint .` (1 warning, 0 errors) · `npx next build` (clean, 43 routes) · full-history credential scan (0 matches) · route-by-route authorization mapping · `grep` audits for rate limiting, security headers, body limits, secrets, `any` types, and `dangerouslySetInnerHTML`

**Not verified:** `go build` / `go vet` — `go.mod` requires Go 1.26.0; the audit sandbox has 1.22.2 with `proxy.golang.org` blocked. **Run both yourself before deploying.** Backend findings are from close static reading, which catches logic and security issues but not compile errors.

---

## 17. Deployment Checklist

**Pre-deploy — code**
- [ ] C-1 fixed: admin cannot be self-registered (both exploits verified closed by curl)
- [ ] C-3 fixed: `vercel.json` deleted or valid JSON
- [ ] C-4 fixed: `AUTO_MIGRATE`/`AUTO_SEED` default to `false`
- [ ] H-2 fixed: API URL throws rather than falling back in production
- [ ] Mock-data fallbacks disabled in production builds
- [ ] `go build ./...` and `go vet ./...` pass locally
- [ ] `npx eslint .` and `npx next build` pass
- [ ] Admin provisioning path written and tested locally

**Pre-deploy — infrastructure**
- [ ] Backend host chosen and provisioned (**not Vercel**)
- [ ] Backend static egress IP obtained
- [ ] Hostinger MySQL allowlisted to that IP only
- [ ] Remote connection from an unrelated machine **fails**
- [ ] Database backups confirmed **and a restore tested**
- [ ] All backend env vars set, `GIN_MODE=release`
- [ ] `JWT_SECRET` generated fresh (`openssl rand -base64 48`), never reused from dev
- [ ] `ADMIN_SECRET` set (or code path removed)
- [ ] `JWT_EXPIRATION_HOURS=24`
- [ ] Brevo sender domain verified; SPF/DKIM/DMARC records added
- [ ] Cloudinary credentials set

**Deploy sequence**
- [ ] Backend deployed; `/api/health` returns 200 over **HTTPS**
- [ ] Migrations run once manually; `AUTO_MIGRATE` returned to `false`
- [ ] Production DB verified empty of seed data
- [ ] First admin account provisioned and login verified
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel (Production scope)
- [ ] Frontend deployed with Root Directory `web_app`
- [ ] `ALLOWED_ORIGINS` updated to real domain; backend redeployed

**Domain**
- [ ] Domain purchased; DNS records added (apex, `www`, `api`)
- [ ] TLS active on **all three** hostnames
- [ ] `www` → apex redirect working
- [ ] No mixed-content warnings in console

**Smoke test on production**
- [ ] Register → OTP email arrives (check spam) → verify → login
- [ ] **Attempt admin registration both ways → both return `buyer`**
- [ ] Browse listings; confirm real data, not seeded/mock
- [ ] Vehicle detail, dealer shop, search, filters
- [ ] Create a listing as a seller; confirm it persists
- [ ] Attempt to edit another user's listing → `403`
- [ ] Book an inspection end-to-end; confirm real `escrowTransactionId`
- [ ] Send a message; confirm delivery
- [ ] Upload an image; confirm Cloudinary URL
- [ ] Password reset flow end-to-end
- [ ] Test on a real mobile device on Nigerian mobile data, not just DevTools
- [ ] Hit a 404 → branded page
- [ ] Stop the backend → confirm the frontend shows a real error, not fake cars

**Post-deployment**
- [ ] Sentry receiving events from both sides
- [ ] Uptime monitor alerting on `/api/health`
- [ ] Log retention confirmed on backend host
- [ ] `SELECT id, email, role FROM users WHERE role='admin'` → only accounts you created
- [ ] Rate limiting verified live (`429` after threshold)
- [ ] Backup schedule running

---

## 18. Final Verdict

### ❌ NOT READY FOR PRODUCTION

**Not because the application is badly built.** The authorization model is genuinely strong — I found no IDOR across fifteen controllers, ownership checks are correct and consistently applied, and the payment ledger's atomic escrow release is better engineered than most production systems I would expect at this stage. The credential leak was handled properly. The frontend builds clean. The domain modelling shows real understanding of the market.

**It is not ready because of four specific things:**

1. **C-1** is a working, unauthenticated path to full administrative control, including approval of real-money payouts and access to every user's government ID. The secret enabling it is published on GitHub. This alone makes deployment unsafe at any scale.
2. **C-2** means the backend has nowhere to deploy. This is an unmade infrastructure decision, not a defect — but nothing works until it is made.
3. **C-3** blocks the Vercel build outright.
4. **C-4** means forgetting two environment variables corrupts your production database with fake data on first boot.

Three of those four are under an hour of work each. The fourth is an afternoon of provisioning.

**Realistic path to launch:** Phase 1 in a day or two. Phase 2 in three to five days. That puts you at **🟡 READY WITH REQUIRED FIXES** within a week, which is a genuinely good position for a project of this scope.

**The one thing I would not compromise on:** do not deploy with **C-1** unfixed, even to a staging environment with a real database attached. Everything else on this list is a risk you could knowingly accept for a soft launch. That one is not.

**And the item most likely to hurt you that is not in the code at all:** verify your database backups, and test restoring one. Every other problem in this document is recoverable. Data loss is not.