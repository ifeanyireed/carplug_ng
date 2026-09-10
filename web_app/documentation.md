# Carplug Nigeria (Verza) - Frontend Documentation

This document serves as the single source of truth for the Carplug Nigeria frontend web application (`web_app`). All architecture details, portals, routing structure, UI standards, audit fixes, and backend integration progress must be documented here.

---

## 1. System Architecture & Tech Stack

- **Framework**: [Next.js 15+ App Router](https://nextjs.org/)
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom automotive design tokens and dark mode palette
- **Icons**: [Lucide React](https://lucide.dev/) (`lucide-react`)
- **Type System**: Strict TypeScript (`strict: true` in `tsconfig.json`)
- **State & Data Layer**: Service client layer (`src/services/api.ts`) with typed adapters and offline mock store fallbacks (`src/data/mockStore.ts`)

```
                         web_app (Next.js App Router)
                                      │
  ┌───────────────┬───────────────────┼───────────────────┬────────────────┐
  ▼               ▼                   ▼                   ▼                ▼
Public / Buyer  Seller Portal       Dealer Portal       Technician       Admin Portal
(/, /shops,     (/seller/dashboard, (/dealer/dashboard, (/technician/   (/admin/...)
 /buyer/search,  /seller/listings,   /dealer/vehicles,   dashboard,
 /buyer/...)     /seller/sell)       /dealer/leads)      /inspections)
  │               │                   │                   │                │
  └───────────────┴───────────────────┼───────────────────┴────────────────┘
                                      │
                                      ▼
                           src/services/api.ts
                       (Adapters + Fallbacks)
                                      │
                                      ▼ HTTP/JSON
                         Go Backend API (Port 8080)
```

---

## 2. Portals & Page Routing Directory

The application is structured into 6 primary portals and public flows across 43+ routes:

### 2.1 Public Marketplace & Buyer Flow
- `/` — Homepage: Hero search, trust tier showcase, featured vehicles, curated categories, swap teaser.
- `/buyer/search` — High-performance vehicle catalog with multi-facet filters (Make, Model, Condition, Trust Tier, Price Rating, Price Slider, Sort).
- `/buyer/vehicles/[id]` — Detailed vehicle presentation: 150-point inspection summary, customs documentation status, transparent price rating breakdown, seller info, and direct booking CTAs.
- `/buyer/compare` — Side-by-side vehicle comparison across specs, price ratings, and trust tiers.
- `/buyer/inspections/book/[vehicleId]` — Step-by-step inspection booking wizard.
- `/buyer/inspections/book/[vehicleId]/technicians` — Technician picker with distance, ratings, and certifications.
- `/buyer/inspections/[id]/report` — Full interactive inspection certificate with checklist scores.
- `/buyer/inspections/[id]/tracker` — Live inspection progress tracking.
- `/buyer/garage` — Saved vehicles, tracked searches, and active inspection requests.
- `/buyer/map` — District-level Lagos vehicle map explorer.
- `/buyer/concierge` — VIP managed car search request service.
- `/buyer/messages` — Direct inquiry chat with dealers and private sellers.

### 2.2 Public Value-Added Services
- `/swap` — Car swap & trade-in equity calculator: Select current vehicle specs, calculate instant appraisal value, pick target car, compute net top-up with platform discount, and book an inspection audit.
- `/advertise` — Platform advertising: Hero placement, sponsored cards, audience targeting (Lagos, Abuja, PH), campaign budgeting, and checkout.
- `/shops/[slug]` — Certified dealer storefront with brand banner, CAC verification badge, operating hours, ratings, and live inventory.

### 2.3 Seller Portal (`/seller`)
- `/seller/onboard` — Seller verification and profile registration.
- `/seller/dashboard` — Active listing stats, inquiry count, and quick actions.
- `/seller/listings` — Management of user listings with inspection status.
- `/seller/sell` — Multi-step vehicle listing wizard with document upload prompts.
- `/seller/messages` — Direct chat with prospective buyers.

### 2.4 Dealer Portal (`/dealer`)
- `/dealer/dashboard` — Dealership analytics: impressions, inventory value, lead counts, and subscription status.
- `/dealer/vehicles` — Full vehicle stock management with filter by availability and verification status.
- `/dealer/vehicles/new` — Comprehensive dealer vehicle listing creation wizard.
- `/dealer/leads` — Lead management CRM: buyer contact details, vehicle of interest, and inquiry status.
- `/dealer/shop` — Dealer storefront settings, banner, operating hours, and CAC verification info.
- `/dealer/subscription` — Dealer tier management (`Basic Shop`, `Verified Dealer Pro`, `Enterprise Fleet`).
- `/dealer/messages` — Inquiries and buyer conversation threads.

### 2.5 Technician Portal (`/technician`)
- `/technician/onboard` — ASE/technician onboarding, certifications, and service area selection.
- `/technician/dashboard` — Assigned inspection appointments, completed jobs, and average rating.
- `/technician/inspections` — Inspection job list with status filtering.
- `/technician/inspections/[id]/checklist` — 150-point mobile-friendly checklist (Engine, OBD-II, Transmission, Body/Frame, Interior, Electrical).
- `/technician/inspections/[id]/composer` — Final inspection report generator and photo uploader.
- `/technician/earnings` — Payout tracking and completed job commission logs.

### 2.6 Admin Portal (`/admin`)
- `/admin/dashboard` — Platform overview: Gross vehicle volume, active listings, active inspections, open disputes.
- `/admin/listings` — Moderation queue for submitted vehicles.
- `/admin/leads` — Master platform inquiry CRM.
- `/admin/swaps` — Master swap request queue with equity approval workflows.
- `/admin/advertising` — Campaign management and creative approval.
- `/admin/verifications` — Customs document and CAC badge manual verification.
- `/admin/payments` — Escrow and payment ledger.

---

## 3. Frontend Fixes & Audit Log (Priority 0–5)

Based on the [FRONTEND_FIXES.md](file:///C:/Users/SHUDDY/Desktop/carplug_ng/web_app/FRONTEND_FIXES.md) specification:

| Priority | Issue | Files Affected | Resolution |
| :--- | :--- | :--- | :--- |
| **0.1** | `Math.random()` during render | `swap/page.tsx`, `advertise/page.tsx` | Moved reference generation into state (`useState`) populated during form submission handlers. |
| **0.2** | `useMemo` dependency mismatch | `swap/page.tsx` | Removed unused `currentModel` from appraisal computation dependency array. |
| **1.0** | TypeScript `any` assertions | `buyer/search/page.tsx`, `dealer/vehicles/new/page.tsx` | Replaced `as any` casts with strict union types (`TierFilter`, `PriceRatingFilter`, `Vehicle["condition"]`). |
| **2.0** | Unescaped JSX entities | 10 pages | Replaced raw unescaped `'` and `"` with `&apos;`, `&quot;`, or clean JSX string literals. |
| **3.0** | Unused imports / variables | Various pages | Cleaned up unused imports to reduce bundle overhead. |
| **5.0** | Brand Name Migration | `layout.tsx`, `AuthModal.tsx`, `RojoLogo.tsx` | Fully rebranded legacy "ROJO" references to "Verza" / "Carplug". |

---

## 4. API Service Architecture (`src/services/api.ts`)

The service layer provides typed client functions that interface with the Go backend:
- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api`).
- **Data Adapters**:
  - `adaptVehicle(RawVehicle)`: Normalizes JSON string fields (e.g. `images`, `documentsAvailable`), parses dates, and formats numbers to match the frontend `Vehicle` type.
  - `adaptInspectionReport(RawInspectionReport)`: Normalizes JSON `categories` and `media`.
- **Resilience & Fallbacks**: If the backend is temporarily unreachable or times out (5s abort signal), queries automatically log a warning and fall back to `src/data/mockStore.ts`.
- **Authentication & Token Management**:
  - `setAuthToken(token: string)`: Persists JWT in client-side storage (`localStorage` key: `carplug_auth_token`).
  - `getAuthToken()`: Safely retrieves the stored JWT token with SSR/window checks.
  - `clearAuthToken()`: Clears the stored JWT on logout.
  - `getAuthHeaders()`: Injects `{ Authorization: "Bearer <token>" }` into fetch request options when an active session exists.
  - `registerUser(payload)`: Submits new registration to `POST /api/auth/register`, caches returned token, and returns user profile.
  - `loginUser(payload)`: Authenticates user credentials via `POST /api/auth/login`, caches token, and returns user profile.
  - `fetchMe()`: Queries `GET /api/auth/me` with Bearer auth to restore the active user session.
- **Protected Request Headers**:
  - Mutating operations (`createVehicle`, `updateVehicle`, `deleteVehicle`, `createDealer`, `createInspection`, `updateInspectionStatus`, `updateLeadStatus`, `fetchLeads`, `createSwap`, `updateSwapStatus`, `createCampaign`, `updateCampaignStatus`) automatically include `...getAuthHeaders()` to satisfy backend RBAC requirements.

---

## 5. Frontend Integration Changelog & Step Tracker

| Step | Date | Component / Page | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **01** | 2026-09-08 | Audit & Bug Fixes | Done | Resolved Priority 0–5 items (`Math.random()`, `any` casts, unescaped entities, Verza branding). |
| **02** | 2026-09-08 | API Service Layer | Done | Created initial `src/services/api.ts` with vehicle, dealer, tech, inspection adapters. |
| **03** | 2026-09-09 | Documentation Setup | Done | Created `web_app/documentation.md` for continuous step tracking and architecture documentation. |
| **04** | 2026-09-09 | Full API Client Expansion | Done | Implemented complete CRUD and mutation suite in `src/services/api.ts` (vehicles, dealers, technicians, inspections, leads, swaps, campaigns, health check). |
| **05** | 2026-09-09 | Buyer Search Integration | Done | Wired `/buyer/search/page.tsx` to `fetchVehicles(params)` with live multi-facet filters (make, model, condition, trust tier, price, sorting). |
| **06** | 2026-09-09 | Vehicle Details Integration | Done | Wired `/buyer/vehicles/[id]/page.tsx` to `fetchVehicleById(id)` and `fetchInspectionById()`. |
| **07** | 2026-09-09 | Dealer Storefront Integration | Done | Wired `/shops/[slug]/page.tsx` to `fetchDealerBySlugOrId()` and `fetchDealerInventory()`. |
| **08** | 2026-09-09 | Swap & Advertising Integration | Done | Wired `/swap/page.tsx` to `fetchVehicles()` & `createSwap()`, and `/advertise/page.tsx` to `createCampaign()`. |
| **09** | 2026-09-09 | CRM & Listing Wizards | Done | Wired `/admin/leads/page.tsx` & `/dealer/leads/page.tsx` to `fetchLeads()` & `updateLeadStatus()`, `/admin/swaps/page.tsx` to `fetchSwaps()` & `updateSwapStatus()`, `/admin/advertising/page.tsx` to `fetchCampaigns()` & `updateCampaignStatus()`, and `/dealer/vehicles/new/page.tsx` to `createVehicle()`. |
| **10** | 2026-09-09 | Production Build Verification | Done | Compiled clean build with `npx next build` (Next.js 16 + Turbopack). All 43 routes static and dynamic builds verified with 0 TypeScript/ESLint errors. |
| **11** | 2026-09-10 | Priority 8 Frontend Cleanup | Done | Cleaned over 120 unused imports and variables across 20+ routes while preserving intentional stubs (`scrollIndex` in `BrowseByType.tsx`/`WhatTheySaidSection.tsx`, `userEmail` in `PortalShell.tsx`). Verified `npx eslint .` and `npx next build` pass with exit code 0. |
| **12** | 2026-09-10 | Auth Client & Bearer Headers | Done | Implemented client-side JWT token management (storage, retrieval, clear, auth headers generator) and added auth methods (registerUser, loginUser, fetchMe). Injected Bearer token authorization headers across all mutating API calls (vehicles, dealers, leads, inspections, swaps, campaigns). Verified 0 ESLint errors and clean TypeScript type-check. |
| **13** | 2026-09-10 | AuthContext, AuthModal & RoleGuard Portals | Done | Created React AuthContext and AuthProvider for global session management with lazy token hydration. Wired AuthModal to real login/register APIs with role selection (buyer, seller, dealer, technician), loading spinner, and server error alert banners. Updated Navbar with dynamic user profile badge, portal links, and logout. Built RoleGuard component protecting /admin/*, /dealer/*, /seller/*, and /technician/* routes against unauthorized roles and unauthenticated callers. Updated PortalShell with user initials avatar, email tooltip, and logout button. Verified 0 ESLint errors and successful Next.js 16 build for all 43 routes. |
