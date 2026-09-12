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
- `/admin/listings` — Moderation queue for submitted vehicles with algorithmic anomaly detection.
- `/admin/leads` — Master platform inquiry CRM.
- `/admin/swaps` — Master swap request queue with equity approval workflows.
- `/admin/advertising` — Campaign management and creative approval.
- `/admin/verifications` — Customs document and CAC badge manual verification.
- `/admin/payments` — Escrow and payment ledger.

### 2.7 Account Settings & Role Workspace (`/settings`)
- `/settings` — User Profile, Password & Security Console:
  - **Profile Details**: Live editor for user name and phone number with verification.
  - **Security & Password**: Secure password update with current password bcrypt validation.
  - **Role Workspace**: Portal launchers and **1-Click Role Upgrade** cards for buyers to activate Private Seller or Dealership Hub accounts.

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
  - `setAuthToken(token: string)`: Persists JWT in client-side storage (`localStorage` key: `verza_auth_token`).
  - `getAuthToken()`: Safely retrieves the stored JWT token with SSR/window checks.
  - `clearAuthToken()`: Clears the stored JWT on logout.
  - `getAuthHeaders()`: Injects `{ Authorization: "Bearer <token>" }` into fetch request options when an active session exists.
  - `registerUser(payload)`: Submits new registration to `POST /api/auth/register`, caches returned token, and returns user profile.
  - `loginUser(payload)`: Authenticates user credentials via `POST /api/auth/login`, caches token, and returns user profile.
  - `fetchMe()`: Queries `GET /api/auth/me` with Bearer auth to restore the active user session.
  - `updateProfile(payload)`: Submits updated user profile details to `PUT /api/auth/profile`.
  - `changePassword(payload)`: Submits current and new password to `PUT /api/auth/password`.
  - `upgradeUserRole(role)`: Submits role upgrade request (`"seller" | "dealer" | "technician"`) to `PATCH /api/auth/role`. Immediately updates `verza_auth_token` and `verza_auth_user` in `localStorage` without a page refresh.
- **1-Click Role Upgrade Integration**:
  - **AuthContext**: Exposes `upgradeRole(role)` which awaits `upgradeUserRole`, updates reactive `user` and `token` state, and keeps the user signed in on their same email.
  - **Vehicle Creation Wizard Guard**: At Step 10 of `/dealer/vehicles/new/page.tsx`, checks if `user?.role === 'buyer'`. Displays an informative upgrade banner, dynamically labels the CTA as *"Activate Free Seller Account & Publish"*, executes `upgradeRole("seller")`, and publishes the vehicle with `sellerType: "private"` in a single continuous action.
  - **RoleGuard 1-Click Upgrade**: When buyers navigate to restricted seller or dealer portals, `RoleGuard.tsx` presents direct *"Activate Free Seller Account"* and *"Activate Dealership Showroom"* buttons, granting instant access without account switching.
  - **Navbar Discovery**: Displays dynamic *"Become a Seller"* links in desktop user menu and mobile drawer for buyer accounts.
- **Saved Vehicles & Garage API**:
  - `fetchSavedVehicles()`: Retrieves all full vehicle objects saved to the user's garage.
  - `fetchSavedVehicleIds()`: Retrieves list of string IDs for quick bookmark state check on cards.
  - `saveVehicle(vehicleId)`: Adds vehicle to saved collection.
  - `removeSavedVehicle(vehicleId)`: Removes vehicle from saved collection.
  - `toggleSavedVehicle(vehicleId)`: Optimistically toggles saved state with backend synchronization.
- **Cloudinary Image Upload**:
  - `uploadVehicleImages(files: File[])`: Packages files into a `FormData` envelope (`images` field) and dispatches multipart request to `POST /api/upload/images` with JWT authorization. Returns array of secure HTTPS Cloudinary image URLs.
- **Brevo OTP Email Verification & Password Recovery**:
  - `verifyOTP(payload)`: Submits 6-digit verification code to `POST /api/auth/verify-otp`, verifies email ownership, and refreshes auth token.
  - `resendOTP(payload)`: Dispatches a fresh code to `POST /api/auth/resend-otp` (governed by a 60-second cooldown timer).
  - `forgotPassword(payload)`: Dispatches recovery OTP to `POST /api/auth/forgot-password`.
  - `resetPassword(payload)`: Submits recovery code and new password to `POST /api/auth/reset-password`.
- **Direct Messaging & Chat API**:
  - `startConversation(vehicleId, message)`: Initiates or returns active thread for a vehicle via `POST /api/conversations`.
  - `fetchConversations()`: Queries `GET /api/conversations` for user's active threads with unread counters.
  - `fetchConversationById(id)`: Queries `GET /api/conversations/:id` for thread metadata.
  - `fetchMessages(conversationId)`: Retrieves thread message stream via `GET /api/conversations/:id/messages` and marks incoming messages as read.
  - `sendMessage(conversationId, body)`: Appends message to thread via `POST /api/conversations/:id/messages`.
- **Document Verification & KYC Compliance Queue**:
  - `submitVerification(payload)`: Submits compliance audit document (`customs_sgd`, `seller_nin`, `tech_license`, `dealer_cac`) via `POST /api/verifications`.
  - `fetchMyVerifications(params)`: Queries self-scoped compliance documents via `GET /api/verifications/me`.
  - `fetchVerifications(params)`: Admin-only master audit queue query via `GET /api/verifications`.
  - `updateVerificationStatus(id, status, notes)`: Admin-only decision dispatcher via `PATCH /api/verifications/:id/status`.
- **Dealer Storefronts & Subscriptions**:
  - `fetchDealerMeShop()`: Retrieves or provisions dealership showroom profile via `GET /api/dealers/me`.
  - `updateDealerShop(id, payload)`: Modifies showroom profile, banner, hours, and contacts via `PUT /api/dealers/:id`.
  - `fetchDealerSubscription()`: Queries subscription tier, quota limits, and remaining days via `GET /api/dealers/me/subscription`.
  - `upgradeDealerSubscription(plan)`: Upgrades dealership plan via `POST /api/dealers/subscription/upgrade`.
- **Technicians & 150-Point Certified Inspections**:
  - `fetchTechnicianMeInspections(params)`: Queries assigned inspection jobs via `GET /api/technicians/me/inspections`.
  - `submitInspectionReport(id, payload)`: Publishes complete 150-point report via `POST /api/inspections/:id/report`, triggering automated Tier 5 listing upgrade.
- **Financial Ledger, Escrow & Technician Payout Wallet**:
  - `fetchTransactions(params)`: Queries platform ledger with volume totals via `GET /api/payments/transactions`.
  - `fetchWallet()`: Queries technician wallet balances (`availableCash`, `escrowHold`, `lifetimeEarnings`) via `GET /api/payments/wallet`.
  - `initializePayment(payload)`: Generates transaction reference and Paystack checkout URL via `POST /api/payments/initialize`.
  - `requestPayout(payload)`: Submits bank account details for instant technician payout via `POST /api/payments/payout`.
- **Admin Governance & Listing Moderation**:
  - `fetchAdminMetrics()`: Queries platform telemetry metrics via `GET /api/admin/metrics`.
  - `fetchFlaggedListings()`: Queries listings flagged by pricing anomaly or verification algorithms via `GET /api/admin/flagged-listings`.
  - `moderateListingStatus(id, status)`: Suspends, restores, or deletes listings via `PATCH /api/admin/listings/:id/status`.
- **Protected Request Headers**:
  - Mutating and protected operations (`createVehicle`, `updateVehicle`, `deleteVehicle`, `createDealer`, `updateDealerShop`, `fetchDealerMeShop`, `fetchDealerSubscription`, `upgradeDealerSubscription`, `createInspection`, `updateInspectionStatus`, `submitInspectionReport`, `fetchTechnicianMeInspections`, `updateLeadStatus`, `fetchLeads`, `createSwap`, `updateSwapStatus`, `createCampaign`, `updateCampaignStatus`, `uploadVehicleImages`, `toggleSavedVehicle`, `updateProfile`, `changePassword`, `upgradeUserRole`, `startConversation`, `fetchConversations`, `sendMessage`, `submitVerification`, `fetchMyVerifications`, `fetchVerifications`, `updateVerificationStatus`, `fetchTransactions`, `fetchWallet`, `initializePayment`, `requestPayout`, `fetchAdminMetrics`, `fetchFlaggedListings`, `moderateListingStatus`) automatically include `...getAuthHeaders()` to satisfy backend RBAC requirements.

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
| **14** | 2026-09-10 | Saved Vehicles (Garage) Integration | Done | Integrated garage bookmarking across the frontend. Implemented client methods (`fetchSavedVehicles`, `fetchSavedVehicleIds`, `saveVehicle`, `removeSavedVehicle`, `toggleSavedVehicle`) in `api.ts`. Added interactive heart toggle with optimistic client updates to vehicle cards and detail views, wired `/buyer/garage/page.tsx` directly to the live backend API. |
| **15** | 2026-09-10 | Cloudinary Client & Image Whitelisting | Done | Added `uploadVehicleImages(files)` in `src/services/api.ts` sending multipart form data with JWT Bearer auth. Updated `next.config.ts` remote patterns with `res.cloudinary.com` and `images.unsplash.com` to support remote image loading without optimization errors. |
| **16** | 2026-09-10 | Dealer Vehicle Wizard Cloudinary Uploader | Done | Overhauled Step 6 of `/dealer/vehicles/new/page.tsx`. Replaced static placeholder dropzone with live multi-file drag-and-drop file selector, animated progress spinner during upload, interactive thumbnail preview gallery with "Cover Photo" primary indicator and remove actions. Wired form submission to send real Cloudinary HTTPS URLs directly into the MySQL database upon publishing. Verified with `npx tsc --noEmit` passing with 0 errors. |
| **17** | 2026-09-10 | Homepage Live Inventory & Save Resolution | Done | Fixed 404 "Vehicle not found" error on homepage bookmarking. Refactored `ExploreVehiclesSection.tsx` to dynamically query live inventory from `fetchVehicles()` and aligned fallback catalog with genuine MySQL vehicle IDs (`v-mercedes-gle450-2022`, `v-toyota-camry-2020`, `v-lexus-rx350-2021`, etc.). Switched legacy dollar prices to Naira (`₦`), dynamically linked "See Details" to `/buyer/vehicles/${car.id}`, and wired "View All" to `/buyer/search`. Synchronized `CAR_LISTINGS` in `mockCars.ts` and `SearchResultsDisplay.tsx` to prevent invalid vehicle IDs. Switched non-fatal save error logs in `SavedVehiclesContext.tsx` to `console.warn` to prevent Turbopack crash dialogs. Verified clean TypeScript compile (`tsc --noEmit`). |
| **18** | 2026-09-10 | Navbar State & Zero-Flicker Auth Hydration | Done | 1. Resolved hardcoded "2" badge on homepage garage icon: purged legacy prototype state `savedBagCount: 2` from `app/page.tsx` and `Hero.tsx`, connecting `Navbar` directly to live `SavedVehiclesContext` so the badge accurately displays 0 when empty and syncs dynamically. 2. Eliminated auth button flicker on refresh: implemented synchronous local profile caching (`verza_auth_user` in `localStorage` via `getStoredUser` / `setStoredUser` / `clearStoredUser`) in `api.ts` and hydrated `user` state immediately in `AuthContext`, rendering user avatar on first paint with zero delay. Added graceful pulse placeholder in `Navbar` for in-flight sessions. Verified clean TypeScript compile (`npx tsc --noEmit` exit code 0). |
| **19** | 2026-09-11 | SSR Hydration Safety & Turbopack Error Elimination | Done | Fixed Next.js Turbopack "Recoverable Error" (SSR hydration mismatch). Configured `AuthContext` to initialize `token: null`, `user: null`, `isLoading: true` uniformly across SSR and client initial hydration, rendering the sleek pulse skeleton without exposing "Sign In" / "Sign Up" buttons. Restored cached `storedUser` immediately in `useEffect` for zero delay. Added `suppressHydrationWarning` on `Navbar.tsx` action containers and cleaned up redundant `savedCount` prop in `garage/page.tsx`. Verified clean TypeScript compile (`npx tsc --noEmit` exit code 0). |
| **20** | 2026-09-11 | Browser Extension & Locale Hydration Hardening | Done | 1. Added `suppressHydrationWarning` to `<html>` and `<body>` in `src/app/layout.tsx` to neutralize browser extension DOM injections (Grammarly, password managers, DarkReader). 2. Enforced deterministic `en-US` locale formatting on numbers across `ExploreVehiclesSection.tsx`, `BrowseByType.tsx`, and `SearchResultsDisplay.tsx` to prevent server vs. client grouping mismatches. 3. Integrated `isMounted` state in `Navbar.tsx` to strictly match SSR virtual DOM during initial hydration before revealing client-only bookmarks and auth controls. Verified clean TypeScript compile (`npx tsc --noEmit` exit code 0). |
| **21** | 2026-09-11 | Master 7-Step Technical Roadmap | Done | Formulated comprehensive system audit across all 43+ routes and backend modules. Lodged `nextstep.md` detailing the 7 undone steps (Real-time Messaging/Chat, 150-pt Inspection/Report completion, Dealer Storefronts & Subscriptions, Vehicle Ownership & Editing, KYC & Customs Document Queue, Financial Ledger/Escrow/Wallet, Buyer Concierge & District Map Discovery). |
| **22** | 2026-09-11 | Page Refresh Auth Persistence & CORS Resilience | Done | Resolved session drop on browser page refresh. 1. Implemented client-side JWT claims parsing (`parseJwtPayload`) and local expiration detection (`isTokenExpired`) in `api.ts`, restoring active user session immediately on mount with zero flicker. 2. Updated `fetchMe()` to return `FetchMeResult` differentiating explicit HTTP 401 Unauthorized from server latency, 500 errors, or network timeouts—ensuring transient backend errors never clear the user's localStorage token. 3. Added connection retry loop (5 attempts) to remote Hostinger MySQL in `backend/config/database.go` to handle packet connection drops (`unexpected EOF`). 4. Hardened `CORSMiddleware` in `backend/routes/routes.go` to automatically permit all local development ports. Verified Next.js 16 build passes clean (38/38 routes). |
| **23** | 2026-09-11 | Priority 1.1 Lint Cleanup & Race Condition Fixes | Done | Resolved all React 19 ESLint errors (`react-hooks/set-state-in-effect`, `preserve-manual-memoization`, `no-explicit-any`). Preserved SSR-hydration guard in `Navbar.tsx` using `useSyncExternalStore`. Inlined data fetch routines inside `useEffect` across `dealer/dashboard`, `dealer/vehicles`, `seller/listings`, and `technician/inspections` using stateful `refreshIndex` triggers. Deferral wrapped `SavedVehiclesContext.tsx` reset in `queueMicrotask`. Aligned `HeroProps` onOpenAuth callback signature and expanded `SavedVehicleItem` with `CarListing` and `bodyType`. Verified `npx eslint .` (0 errors) and `npx next build` (38/38 static/dynamic routes passing with exit code 0). |
| **24** | 2026-09-11 | Roadmap Step 1: Direct Messaging & Buyer-Seller Chat Portals | Done | Wired complete chat engine: 1. Added `startConversation`, `fetchConversations`, `fetchConversationById`, `fetchMessages`, and `sendMessage` in `src/services/api.ts` with TypeScript interfaces `Conversation` and `ChatMessage`. 2. Built master-detail chat interfaces across `/buyer/messages`, `/dealer/messages`, and `/seller/messages` featuring vehicle context banner, masked identity badge, live polling (5s), unread counters, and auto-scrolling message streams. 3. Connected vehicle detail pages (`/buyer/vehicles/[id]`) "Contact Seller (Masked)" CTA directly to conversation resolution. Verified clean type check (`npx tsc --noEmit`), `npx eslint .` (0 errors), and `npx next build` passing clean. |
| **25** | 2026-09-11 | Roadmap Step 2: 150-Point Inspection & Health Report Compilation Pipeline | Done | Connected technician inspection compilation suite and dynamic booking dispatch: 1. Added `submitInspectionReport` and `fetchTechnicianMeInspections` to `src/services/api.ts`. 2. Dynamic checklist audit tool in `/technician/inspections/[id]/checklist` with live checkpoint verdicts (Pass / Advisory / Defect), notes, and `localStorage` session caching. 3. Vehicle Health Report composer in `/technician/inspections/[id]/composer` aggregating checklist results into category subsystems (Engine, Transmission, Suspension, Brakes), calculating overall health score, itemized repair budget range, and submitting report with automatic Tier 5 vehicle upgrade. 4. Interactive `DispatchTechnicianButton` on `/buyer/inspections/book/[vehicleId]/technicians` initiating live dispatch booking and routing to `/buyer/inspections/[id]/tracker`. Verified with 0 ESLint errors and Next.js 16 build passing (38/38 routes). |
| **26** | 2026-09-11 | Roadmap Step 3: Dealer Storefront Management & Subscription Portals | Done | Connected dealer showroom customization and plan upgrade workflows: 1. Added `updateDealerShop`, `fetchDealerMeShop`, `fetchDealerSubscription`, and `upgradeDealerSubscription` API methods to `src/services/api.ts`. 2. Overhauled `/dealer/shop/page.tsx` with dynamic profile data loading, live storefront settings editor (brand name, tagline, showroom address, phone, WhatsApp, email, operating hours), and success/error alert banners. 3. Overhauled `/dealer/subscription/page.tsx` displaying active plan tier, listings capacity, dynamic quota progress bar, days remaining counter, and interactive tier upgrade handlers (Basic Shop [15 cars, ₦25,000], Pro Shop [60 cars, ₦65,000], and Premium Shop [Unlimited, ₦150,000]). Verified with 0 ESLint errors and Next.js 16 build compiling all 38 routes cleanly. |
| **27** | 2026-09-11 | Roadmap Step 4: Vehicle Inventory Editing Mode & Facet Query Filters | Done | Implemented full vehicle modification and query flow: 1. Expanded `VehicleSearchParams` and `fetchVehicles` in `api.ts` with `yearMin`, `yearMax`, `year`, `bodyType`, `fuelType`, `transmission`, and `state`. 2. Transformed `/dealer/vehicles/new/page.tsx` into a dual-mode creation and editing wizard wrapped in React `<Suspense>`, reading `?edit={id}` or search params (`make`, `model`, `year`, `mileage`). Populates existing vehicle data via `fetchVehicleById(editId)` and dispatches `updateVehicle(editId, payload)` on save. 3. Updated `Edit` button on `/dealer/vehicles/page.tsx` and added `Edit Listing` button on `/seller/listings/page.tsx` routing to `/dealer/vehicles/new?edit=${id}`. 4. Connected instant valuation calculator on `/seller/sell/page.tsx` to pre-populate vehicle wizard via `List Car for Sale` CTA. Verified 0 ESLint errors and Next.js 16 build passing all 38 routes. |
| **28** | 2026-09-11 | Roadmap Step 5: KYC Compliance Queue & Document Verification Portals | Done | Integrated document verification and compliance audit system across user roles: 1. Added `VerificationItem`, `submitVerification`, `fetchVerifications`, and `updateVerificationStatus` to `src/services/api.ts`. 2. Overhauled `/admin/verifications/page.tsx` to fetch real pending documents (`customs_sgd`, `seller_nin`, `tech_license`, `dealer_cac`), with status tabs (All, Pending, Approved, Rejected), document preview links, modal audit notes dialog, and Approve/Reject action triggers. 3. Overhauled `/seller/onboard/page.tsx` with Cloudinary image upload for National Identity (NIN) / Voter's Card, submitting directly to `/api/verifications` and redirecting to seller dashboard. 4. Overhauled `/technician/onboard/page.tsx` with Cloudinary upload for Trade Test Certificate and ASE/NABTEB credentials, submitting verification to queue. Verified with 0 ESLint errors and Next.js 16 build compiling all 38 routes cleanly. |
| **29** | 2026-09-11 | Roadmap Step 6: Financial Ledger, Escrow & Technician Payout Wallet | Done | Integrated payments console and wallet withdrawal system: 1. Added `TransactionItem`, `TransactionsResponse`, `WalletResponse`, `fetchTransactions`, `fetchWallet`, `initializePayment`, and `requestPayout` to `src/services/api.ts`. 2. Overhauled `/admin/payments/page.tsx` with real-time financial ledger data, 30-day total volume counter (₦), escrow reserve counter, partner settlement counter, category filter tabs (All, Inspection Escrow, Dealer Plans, Tech Payouts), and status filter tabs (Held in Escrow, Settled, Pending). 3. Overhauled `/technician/earnings/page.tsx` with live wallet balance fetching, available cash metric, pending escrow metric, lifetime audit settlements table, and an interactive Bank Transfer Payout modal supporting commercial bank selection, account verification, and instant disbursement request. Verified with 0 ESLint errors and Next.js 16 build passing all 38 routes with exit code 0. |
| **30** | 2026-09-11 | Roadmap Step 7: Buyer Concierge Sourcing & District Map Discovery | Done | Completed final roadmap feature: 1. Connected `/buyer/concierge/page.tsx` to live `createLead` API with `type: "concierge"`, payload bundling buyer brief (name, phone, target vehicle, budget, condition, priority, city), loading spinner, and success confirmation. 2. Highlighted VIP Concierge leads in `/admin/leads/page.tsx` with high-visibility gold styling (`★ VIP Concierge`). 3. Overhauled `/buyer/map/page.tsx` with live `fetchVehicles` inventory retrieval, dynamic district count calculations (Lekki, Ikeja, Victoria Island, Surulere, Abuja), interactive vehicle hotspot pins, and drawer preview utilizing Next.js `Image` component. 4. Expanded `VehicleSearchParams` in `src/services/api.ts` with `page` and `pageSize`. Verified clean `npx eslint .` (0 errors) and Next.js 16 build passing all 38 routes with exit code 0. |
| **31** | 2026-09-11 | Admin Governance Telemetry, Live Command Dashboards & Account Settings Portal | Done | 1. Added `AdminMetrics`, `FlaggedListing`, `fetchAdminMetrics`, `fetchFlaggedListings`, `moderateListingStatus`, `updateProfile`, and `changePassword` to `src/services/api.ts`. 2. Overhauled `/admin/dashboard/page.tsx` with live telemetry KPI cards, % Tier 3+ listings, active dealer shops, completed inspections, pending verifications, and 30-day transaction volume. 3. Overhauled `/admin/listings/page.tsx` with algorithmic anomaly detection, risk badges, listing suspension, permanent removal, and dismissal. 4. Overhauled `/seller/dashboard/page.tsx` displaying live seller listings, inbound chat threads, KYC status badge, and Next.js Image rendering. 5. Overhauled `/technician/dashboard/page.tsx` displaying live wallet available cash, escrow hold, completed inspection tally, and dynamic active job resume link. 6. Created `/settings/page.tsx` account profile and security console with name/phone editor, password update with bcrypt verification, and role workspace launchers. 7. Added Account Settings link to `Navbar.tsx` and `PortalShell.tsx`. Verified clean `npx eslint .` (0 errors) and `npx next build` compiling all 39 static and dynamic routes. |
| **32** | 2026-09-11 | 1-Click Role Upgrade Architecture ("Become a Seller") | Done | Completed 1-click role upgrade feature according to `backend/prompts.md`: 1. Added `upgradeUserRole(role)` in `src/services/api.ts` saving newly signed JWT token directly into `localStorage.getItem("verza_auth_token")` with zero page reload. 2. Added `upgradeRole(role)` method in `AuthContext.tsx` dynamically updating authenticated `user` and `token` state. 3. Overhauled Step 10 of `/dealer/vehicles/new/page.tsx` checking for `user.role === 'buyer'`: displays high-visibility 1-click activation banner, swaps button label to *"Activate Free Seller Account & Publish"*, and seamlessly upgrades the user to seller before vehicle creation. 4. Updated `RoleGuard.tsx` to display 1-click *"Activate Free Seller Account"* and *"Activate Dealership Showroom"* buttons when a buyer visits seller/dealer portals, granting instant access upon upgrade. 5. Updated `/settings/page.tsx` Role Workspace tab with dedicated 1-click upgrade cards for buyers with instant activation buttons. 6. Added *"Become a Seller"* links to `Navbar.tsx` desktop user dropdown and mobile drawer for buyer accounts. Verified with clean `npx eslint .` (0 errors) and `npx next build` compiling all 39 routes with 100% success. |
| **33** | 2026-09-11 | Brevo OTP Verification Popup, Cooldown & Password Recovery Workflows | Done | Integrated Brevo email verification and password recovery across the web app: 1. Added `verifyOTP`, `resendOTP`, `forgotPassword`, and `resetPassword` to `src/services/api.ts` with updated `AuthResponse` interface. 2. Updated `AuthContext.tsx` with `AuthModalMode` (`"login" | "signup" | "verify_otp" | "forgot_password" | "reset_password"`), `verifyCode`, `resendCode`, `requestPasswordReset`, and `confirmPasswordReset`. 3. Overhauled `AuthModal.tsx` to automatically display a 6-digit OTP verification screen upon user registration, complete with 6 individual numeric input slots, auto-advance, backspace navigation, paste handling, and a 60-second resend cooldown countdown timer. 4. Implemented interactive "Forgot Password?" and "Reset Password" workflows with recovery code validation and password visibility toggling, adhering to the CarPlug design system. |
| **34** | 2026-09-12 | Priority 0: KYC Approval Trust Flag Activation & Surfacing | Done | Surfaced verified trust indicators across the frontend: 1. Updated `/dealer/shop` and `/shops/[slug]` to render `shop.verifiedCAC` badge upon dealership CAC compliance approval. 2. Surfaced `user.isVerified` trust indicators across `/seller/dashboard`, `/technician/dashboard`, and `/settings`. 3. Verified full synchronization with backend `UpdateVerificationStatus` which elevates `VerifiedCAC` and `IsVerified` upon compliance audit sign-off. |
| **35** | 2026-09-12 | Priority 1: KYC Route-Level Hardening & Self-Scoped Endpoint Split | Done | Hardened KYC verification queries across roles: 1. Added `fetchMyVerifications()` in `src/services/api.ts` wired to `GET /api/verifications/me`. 2. Updated `/seller/dashboard/page.tsx` to query `/api/verifications/me`, ensuring non-admin users receive only their own submitted verifications. 3. Reserved `fetchVerifications()` (`GET /api/verifications`) strictly for `/admin/verifications/page.tsx` with `RequireRoles("admin")` enforcement. |
| **36** | 2026-09-12 | Priority 2: CORS Localhost Security & Dev Parity | Done | Documented browser origin isolation security rationale in `backend/routes/routes.go`. Confirmed local frontend development instances on any loopback port (`http://localhost:*`, `http://127.0.0.1:*`) communicate seamlessly with backend API with zero CORS preflight rejections. |
| **37** | 2026-09-12 | Priority 3: Git History Database Credential Scrub | Done | Cleared all historical database credentials across git commit history using `git filter-repo`. Verified commit history tree cleanly matches remote `origin/shuddy` without dangling secrets. |
| **38** | 2026-09-12 | Priority 4: Asset Hygiene, Cloudinary Demo Purge & Font Optimization | Done | 1. Purged 58 unreferenced TTF fonts in `web_app/public/fonts/` (saving 19.5 MB), retaining active Geist font files in `web_app/src/fonts/` configured via Next.js `localFont`. 2. Cleared 58 unused demo sample images from Cloudinary (`wlasi06s`) using Admin API. 3. Removed unused SVG boilerplate files and `car6.jpeg`. Fixed phantom references (`hero-car.webp`, `car2.jpeg`). 4. Preserved and verified all 3 customer story videos (`story1.mp4`, `story2.mp4`, `story3.mp4`) in `web_app/public/images/stories/` and their interactive video player modal in `WhatTheySaidSection.tsx`. |
| **39** | 2026-09-12 | Lead Ownership Security & Status Validation Hardening | Done | Hardened lead status mutations: 1. Added strict validation preventing invalid status updates. 2. Enforced caller ownership checking (`lead.SellerID == userID` or dealer showroom owner, or `admin`) on `PATCH /api/leads/:id/status`. Verified via manual two-account integration test asserting HTTP 403 Forbidden on unauthorized cross-seller mutations. |
| **40** | 2026-09-12 | Full E2E User Journey Verification & Automated Technician Fee Settlement | Done | 1. Connected automatic technician fee crediting (`inspection_earning`, ₦45,000, `status = "settled"`) in `SubmitInspectionReport`. 2. Built and executed comprehensive 9-stage end-to-end integration test (`test_e2e_user_journey.js`) asserting health check, registration & Brevo OTP verification, 1-click role upgrade, vehicle creation, buyer discovery & direct chat, lead management & 403 cross-seller guard, 150-point report filing & Tier 5 auto-upgrade, KYC NIN submission & admin approval, escrow payment, wallet balance, and payout disbursement. All 9 stages passed with 100% success. |
| **41** | 2026-09-12 | Inspection Earnings Integrity & Atomic Escrow Settlement | Done | Eliminated fabricated money creation in inspection flow: 1. Added `EscrowTransactionID` to `models.InspectionReport` and automated column migration in `database.go`. 2. Restricted `POST /api/inspections` to `middleware.RequireRoles("buyer", "admin")`, strictly validated that a real `held_in_escrow` transaction exists and belongs to the buyer, blocked self-assignment as technician, and prevented duplicate escrow reuse. 3. Overhauled `SubmitInspectionReport` to atomically release the exact escrow amount (`escrowTxn.Amount`) into a settled `inspection_earning` transaction and mark the escrow `"settled"` within a single `db.Transaction`. 4. Enforced strict rejection (HTTP 400) on report submissions lacking valid held escrow. 5. Verified via automated end-to-end test (`test_inspection_earnings_integrity.js`) confirming all negative security guards and positive atomic settlement. |
| **42** | 2026-09-12 | Reconnect Inspection Booking Flow & Escrow Funding | Done | Reconnected frontend inspection booking to backend escrow requirements: 1. Updated `DispatchButton.tsx` to call `initializePayment` with exact server tier pricing (₦25k / ₦45k / ₦75k), obtain `payment.transaction.id`, and link `escrowTransactionId` in `createInspection`. 2. Removed silent fallback redirect to `insp-001` and added user-facing error message state (`dispatchError`). 3. Cleaned up duplicate `initializePayment` definition in `api.ts`. 4. Verified with `npx eslint . && npx next build` (39/39 routes) and live end-to-end test confirming real buyer inspection creation with valid `escrowTransactionId` and dynamic tracker route navigation. |

---

## 6. Asset & Media Registry & Optimization Standard

### 6.1 Font System Architecture
- **Location**: `web_app/src/fonts/`
- **Active Fonts**:
  - `GeistVF.woff`: Primary sans-serif font loaded via Next.js `localFont` with CSS variable `--font-geist-sans`.
  - `GeistMonoVF.woff`: Monospace font loaded via Next.js `localFont` with CSS variable `--font-geist-mono`.
- **Optimization**: Legacy `web_app/public/fonts/` directory containing 58 unreferenced TTF files (19.5 MB) was completely removed to eliminate bundle bloat and ensure zero redundant fonts are served.

### 6.2 Public Static Images & Videos
- **Location**: `web_app/public/images/`
- **Active Referenced Images**: Exactly 31 referenced image assets across car category silhouettes, feature banners, security icons, and brand graphics. Zero dangling or unreferenced images on disk.
- **Stories & Testimonial Video Assets**:
  - Located at `web_app/public/images/stories/`:
    - `story1.mp4` — Customer verification journey video
    - `story2.mp4` — Dealership inspection experience video
    - `story3.mp4` — Escrow & smooth handover video
  - Rendered dynamically via `WhatTheySaidSection.tsx` with full thumbnail poster previews, play/pause controls, and fullscreen playback modal.

### 6.3 Cloudinary Remote Media Strategy
- **Cloud Name**: `wlasi06s`
- **Root Folder**: `carplug/vehicles/` for user and dealer listing uploads.
- **Hygiene**: All default Cloudinary sample demo assets (e.g. `cld-sample-1..5`, `samples/*`, `dam/*`) were permanently purged via Cloudinary Admin API, ensuring 100% of remote storage is dedicated to legitimate CarPlug inventory.

---

## 7. Quality Assurance & Verification Matrix

Every feature addition and codebase modification must pass the two-tier verification gate run strictly from repository root:

1. **Backend Quality Gate**:
   ```bash
   cd backend
   go build ./...
   go vet ./...
   cd ..
   ```
   Ensures zero compilation errors, type mismatches, or static analysis regressions across all Go packages and controllers.

2. **Frontend Quality Gate**:
   ```bash
   cd web_app
   npx eslint .
   npx next build
   cd ..
   ```
   Ensures zero ESLint violations, zero TypeScript errors, and successful static/dynamic compilation across all 39 Next.js App Router routes.






