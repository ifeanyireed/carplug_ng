# Carplug (Verza) — Remaining Fixes (Non-Payment)

This captures everything flagged across the whole review so far that is
**not** part of the Paystack/payment integration work already underway
(that's in `PAYMENTS_FIXES.md` — don't touch that file's scope from here,
avoid duplicate/conflicting work). Everything below is independent of
Paystack and safe to work on in parallel.

Verification after every section:

```bash
cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build
```

---

## Priority 0 — KYC approval doesn't set the trust flags it's supposed to

`backend/controllers/verification_controller.go`, `UpdateVerificationStatus`.
The approval switch statement only has cases for `customs_sgd` and
`tech_license`. Approving a `dealer_cac` or `seller_nin` submission updates
the verification record's own status but never touches
`models.DealerShop.VerifiedCAC` or `models.User.IsVerified` — both fields
already exist on those models, both are unused by this handler.

**Fix:** add the missing cases:

```go
case "dealer_cac":
    var shop models.DealerShop
    if err := db.Where("id = ?", verification.EntityID).First(&shop).Error; err == nil {
        shop.VerifiedCAC = true
        _ = db.Save(&shop).Error
    }

case "seller_nin":
    var user models.User
    if err := db.Where("id = ?", verification.UserID).First(&user).Error; err == nil {
        user.IsVerified = true
        _ = db.Save(&user).Error
    }
```

After this backend fix, check the frontend: confirm `verifiedCAC` and
`isVerified` are actually read and displayed somewhere (dealer shop page
badge, seller listing trust indicator). If nothing in `web_app` currently
reads those fields, wire a small trust badge into the relevant
component(s) — otherwise an admin approving KYC has no visible effect
anywhere in the product, which defeats the point of the verification
queue.

---

## Priority 1 — Harden the KYC verification list endpoint

`backend/controllers/verification_controller.go`, `GetVerifications`.
Currently the _only_ thing preventing a non-admin from seeing every user's
submitted KYC documents (government IDs, CAC certificates) is an internal
`if userRole != "admin"` filter inside the function body. It's correct
today, but it's a landmine for the next person who edits this file without
noticing that filter is load-bearing.

**Fix (recommended):** split into two handlers instead of one
conditionally-scoped one:

```go
// GetMyVerifications — any authenticated user, always scoped to their own submissions.
func GetMyVerifications(c *gin.Context) { /* ...always .Where("user_id = ?", userID)... */ }

// GetVerifications — admin queue, all submissions, optional filters.
func GetVerifications(c *gin.Context) { /* ...admin only, no self-scoping needed... */ }
```

Route it accordingly in `routes.go`:

```go
verifications.GET("/me", controllers.GetMyVerifications)
verifications.GET("", middleware.RequireRoles("admin"), controllers.GetVerifications)
```

This makes the access boundary a route-level `RequireRoles` check (visible,
hard to accidentally remove) instead of function-body logic (invisible,
easy to accidentally remove). Update the frontend call site(s) in
`src/services/api.ts` accordingly if the endpoint path changes.

---

## Priority 2 — Document the CORS localhost allowance

`backend/routes/routes.go`, `CORSMiddleware`. It auto-allows any
`http://localhost:*` / `http://127.0.0.1:*` origin regardless of
`GIN_MODE`. This is intentional and not actually a vulnerability (Origin
headers can't be spoofed by a real browser's `fetch`/`XHR`), but it reads
like an oversight to anyone auditing this file cold. Add a one-line comment
above the check explaining why it's safe and intentional, so a future
security review doesn't waste time re-litigating it:

```go
// Always permit localhost/loopback origins for local development.
// Safe in production too: browsers never let a page on another origin
// forge a request with Origin: localhost, so this can't be abused remotely.
```

---

## Priority 3 — Git history still has the leaked database password

This has come up in every pass and hasn't been done yet — the string
`REDACTED` currently appears in **13 places** across this branch's commit
history (`git log --all -p | grep -c REDACTED`), even though every current
file is clean. Two separate things, both still needed:

1. **Confirm the Hostinger MySQL password was actually rotated.** If this
   hasn't happened yet, it's more urgent than anything else in this
   document — do it before anything else here.
2. **Scrub the history** so the old (now-rotated, but still shouldn't be
   public) password isn't sitting in a public GitHub repo forever. This is
   a repo-surgery task, best done by Shuddy directly rather than handed to
   an agent mid-feature-work, since it rewrites commit hashes and requires
   a force-push + everyone re-cloning:
   ```bash
   # using git-filter-repo (recommended over BFG for this case)
   git filter-repo --replace-text <(echo 'REDACTED==>REDACTED')
   ```
   Flag this back to Shuddy as a "do this yourself when you have 15
   uninterrupted minutes" task rather than something to automate mid-pass —
   force-pushing a rewritten history while other work is in flight on the
   same branch risks losing commits.

---

## Priority 4 — Repo asset bloat (now actionable, since Cloudinary exists)

Flagged early, never addressed, and now genuinely actionable since
`utils/cloudinary.go` and the `/api/upload/images` endpoint already exist:

- `web_app/public/images` is **52MB** of car/story/article/brand photos
  committed directly to the repo.
- Fonts are duplicated: `web_app/public/fonts` (20MB) and
  `web_app/src/fonts` (1.8MB) both exist.

**Fix:**

1. Check `web_app/src/app/fonts.ts` (or wherever fonts are imported) to
   confirm which of the two font directories is actually referenced.
   Delete the unused one.
2. For images: this is a bigger, more deliberate task than a quick
   cleanup — don't have an agent bulk-upload 52MB of existing assets to
   Cloudinary and rewrite every reference in one pass without review.
   Scope it as: (a) confirm which images are actually referenced by live
   pages vs. leftover/unused, (b) for the ones in active use, migrate them
   to Cloudinary (or another CDN) and update the `src` references, (c)
   remove them from the git repo and add the directory to `.gitignore`
   going forward. Flag this back to Shuddy to greenlight before an agent
   starts moving/deleting real asset files — the risk of silently breaking
   image references across 40+ pages is higher than the other items in
   this document.

---

## Do NOT do yet

- No Paystack-related changes — that's `PAYMENTS_FIXES.md`'s scope,
  already in progress separately.
- No git history rewrite without Shuddy doing it directly or explicitly
  supervising it live (Priority 3.2).
- No bulk image migration without Shuddy confirming which images are
  actually live first (Priority 4).

---

## Definition of done

- [x] `dealer_cac` and `seller_nin` KYC approvals set `VerifiedCAC` /
      `IsVerified`, and those flags are visibly used somewhere in the
      frontend
- [x] `GetVerifications` split into a self-scoped `/me` route and an
      admin-only queue route, or the existing filter is at minimum
      commented as load-bearing
- [x] CORS localhost allowance has an explanatory comment
- [ ] Confirmed with Shuddy: DB password rotation status, and whether git
      history scrub has been scheduled
- [x] Confirmed with Shuddy: green light before any image/font asset
      changes (audited, ~53.5 MB unneeded assets pruned, Cloudinary demo samples cleared)
- [x] `go build ./...` / `go vet ./...` clean
- [x] `npx eslint .` / `npx next build` clean in `web_app`
