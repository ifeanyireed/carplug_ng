# Carplug (Verza) — Authorization & Cleanup Fix Guide

This is the third pass. Read this in full before making changes. Priority 0
is a real, currently-exploitable gap (any logged-in user can modify/delete
any other user's data) — treat it as hard-blocking, same tier as the
credential leak from the last pass, even though it requires a registered
account to exploit rather than being fully public.

Verification after every priority section:

```bash
cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build
```

---

## Priority 0 — Wire up authorization (roles + ownership)

The JWT auth, `User` model, and `RequireRoles` middleware are all built and
working — the gap is that nothing in `routes.go` or the controllers actually
uses them for authorization, only authentication. Right now "logged in" is
the only check; "logged in as the right role, and modifying your own
resource" is not enforced anywhere.

### 0.1 Apply `RequireRoles` in `routes.go`

Add role restrictions to the routes that need them. Use the existing
`middleware.RequireRoles(...)` (delete the unused duplicate wrapper in
`routes/middleware.go` first — see Priority 3.4 — or just call
`middleware.RequireRoles` directly to match how `AuthMiddleware` is already
called):

```go
vehicles.POST("", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.CreateVehicle)
vehicles.PUT("/:id", authMiddleware, controllers.UpdateVehicle)   // ownership check inside handler, see 0.2
vehicles.DELETE("/:id", authMiddleware, controllers.DeleteVehicle) // ownership check inside handler

dealers.POST("", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.CreateDealer)

inspections.POST("", authMiddleware, middleware.RequireRoles("buyer", "admin"), controllers.CreateInspection)
inspections.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("technician", "admin"), controllers.UpdateInspectionStatus)

leads.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("seller", "dealer", "admin"), controllers.UpdateLeadStatus)

swaps.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("admin"), controllers.UpdateSwapStatus)

campaigns.POST("", authMiddleware, middleware.RequireRoles("dealer", "admin"), controllers.CreateCampaign)
campaigns.PATCH("/:id/status", authMiddleware, middleware.RequireRoles("admin"), controllers.UpdateCampaignStatus)
```

`PUT`/`DELETE` on `/vehicles/:id` deliberately don't get a role restriction
here — ownership (0.2) is the real check, since a seller and a dealer both
need to edit their own listings.

### 0.2 Add ownership checks inside handlers

`UpdateVehicle` and `DeleteVehicle` in `vehicle_controller.go` need to check
the authenticated user against the resource before mutating it:

```go
func UpdateVehicle(c *gin.Context) {
    id := c.Param("id")
    db := config.GetDB()

    var existing models.Vehicle
    if err := db.First(&existing, "id = ?", id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
        return
    }

    userID := c.GetString("userID")
    role := c.GetString("userRole")
    if role != "admin" && existing.SellerID != userID {
        c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to modify this listing"})
        return
    }

    // ...rest unchanged
}
```

Same pattern for `DeleteVehicle` (check before the `db.Delete` call, not
after). Apply the equivalent to:

- `UpdateInspectionStatus` — check `existing.TechnicianID == userID` (or admin)
- `UpdateLeadStatus` — check the lead's associated `SellerID`/`DealerID` (or admin)
- Any other `PATCH .../status` or `PUT`/`DELETE` handler with an owner-like
  field on the model

### 0.3 Set `SellerID` from the authenticated user, not the request body

`CreateVehicle` currently trusts whatever `sellerId` is in the JSON payload
(or leaves it unset). This lets an authenticated user create a listing that
claims to belong to someone else. Fix:

```go
func CreateVehicle(c *gin.Context) {
    var vehicle models.Vehicle
    if err := c.ShouldBindJSON(&vehicle); err != nil { /* ... */ }

    vehicle.SellerID = c.GetString("userID") // always from the token, never trust the body
    if vehicle.ID == "" {
        vehicle.ID = "v-" + strconv.FormatInt(time.Now().UnixNano(), 36)
    }
    // ...
}
```

Apply the same "ID from token, not body" fix anywhere else a resource is
created with an owner/creator field (dealers, inspections, leads if
applicable).

### 0.4 Confirm before moving on

Manually verify with two test accounts (one buyer, one seller) using
curl/Postman: register both, create a vehicle as the seller, then try to
`PUT`/`DELETE` it using the buyer's token — confirm you get a 403, not a 200. This is the actual acceptance test for this section, not just a clean
build.

---

## Priority 1 — Frontend: fix the 18 new lint errors

### 1.1 `set-state-in-effect` (6 files)

`dealer/dashboard/page.tsx`, `dealer/vehicles/page.tsx`,
`seller/listings/page.tsx`, `technician/inspections/page.tsx`,
`components/layout/Navbar.tsx`, `components/modals/AuthModal.tsx`.

All follow the same broken pattern:

```tsx
useEffect(() => {
  let isMounted = true;
  loadDashboardData(); // <- flagged: calls setState synchronously in effect body
  return () => {
    isMounted = false;
  };
}, []);
```

The `isMounted` flag is declared but never actually used to guard the state
updates inside `loadDashboardData`. Fix both the lint error and the
underlying unmount-safety gap together — move the mounted-check into the
function itself:

```tsx
useEffect(() => {
  let isMounted = true;

  async function load() {
    const data = await fetchDashboardData();
    if (isMounted) {
      setDashboardData(data);
    }
  }
  load();

  return () => {
    isMounted = false;
  };
}, []);
```

`Navbar.tsx`'s case (`setIsMounted(true)` directly in the effect) is simpler
— that one's just tracking client-mount for hydration purposes, so wrap it
in a no-op microtask or restructure to avoid the direct call; check what
`isMounted` is actually gating there before changing it, since it may be a
legitimate SSR-hydration guard rather than a data-fetch pattern.

### 1.2 `no-explicit-any` (9 instances)

`components/explore/ExploreVehiclesSection.tsx` (7 instances, lines 144-177),
`components/common/SaveVehicleButton.tsx` (1), `dealer/vehicles/new/page.tsx` (1).

These are almost certainly typing gaps from the new API response handling.
Check `src/services/api.ts` for the actual return types of the relevant
fetch functions and use those instead of `any` — the types likely already
exist (`AuthUser`, `Vehicle`, etc.) and just aren't imported/applied at
these call sites.

---

## Priority 2 — Harden the JWT secret requirement

`config.go` currently only logs a warning if `JWT_SECRET` is left at its
dev default in production — it should hard-fail, the same way `DB_PASSWORD`
does, since a known secret lets anyone forge a valid token for any role,
including admin:

```go
if AppConfig.GinMode == "release" && (os.Getenv("JWT_SECRET") == "" || AppConfig.JWTSecret == "verza_carplug_dev_jwt_secret_2026_super_secure_key") {
    log.Fatal("[Config] JWT_SECRET must be set to a strong, non-default value in production")
}
```

---

## Priority 3 — Small cleanups

3.1. Raise password minimum from 6 to 8 characters in `RegisterRequest`
binding tag and the manual length check in `auth_controller.go`.

3.2. Restrict the `folder` param in `UploadImages` (`upload_controller.go`)
to a small allowlist (e.g. `carplug/vehicles`, `carplug/avatars`,
`carplug/inspections`) instead of accepting any client-supplied string.

3.3. Confirm the MySQL password was actually rotated in Hostinger (if not
already done from the last pass) — it's still present in this branch's
git history (`git log --all -p -- backend/config/config.go` still
shows it). History cleanup (`git filter-repo`) remains a good-to-do,
lower priority than rotation itself.

3.4. Delete `backend/routes/middleware.go` — it wraps
`middleware.AuthMiddleware`/`RequireRoles` but `routes.go` calls the
`middleware` package directly, so this file is dead code that could
confuse the next person looking for where auth is wired.

3.5. Run `npx eslint . --fix` in `web_app` and continue clearing the
remaining unused-import warnings — same rule as before: don't delete
`scrollIndex` (`BrowseByType.tsx`) without flagging it, it's still
unaddressed from two passes ago and still looks like an unfinished
carousel feature, not dead code.

---

## Do NOT do yet

- No password reset flow, no email verification, no OAuth — still out of
  scope per the original auth spec.
- No migration off `localStorage` for the JWT to httpOnly cookies — that's
  a real hardening step worth doing eventually, but it's an architecture
  change (needs a Next.js route-handler proxy layer) that should be its own
  scoped task, not bundled into an authorization-gap fix. Flag it back to
  Shuddy as the next security conversation to have once this pass is done.

---

## Definition of done

- [ ] Two-account manual test (Priority 0.4) passes: non-owner gets 403
- [ ] `RequireRoles` actually referenced from `routes.go`
- [ ] Every `PUT`/`DELETE`/status-update handler with an owner field checks
      it before mutating
- [ ] `CreateVehicle` (and equivalents) set the owner ID from the JWT, not
      the request body
- [ ] `npx eslint .` in `web_app` → 0 errors
- [ ] `npx next build` → clean
- [ ] `go build ./...` / `go vet ./...` → clean
- [ ] JWT_SECRET hard-fails on default value in release mode
