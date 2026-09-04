# Verza / Carplug — Complete Screen Slugs Directory

This document contains the complete inventory of all routes and screen slugs across all dedicated user types and public surfaces, mapped directly from [Carplug-Product-Blueprint.html](./Carplug-Product-Blueprint.html).

---

## 1. Public & Discovery Routes

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Landing Page / Home** | `/` | Hero search, curated rails (Platform Verified, Deals Near You), make row, category tiles |
| **Public Dealer Storefront** | `/shops/[slug]` | Branded dealer landing page, lot address, rating, active inventory grid, and CAC verification |

---

## 2. Buyer Portal (`/buyer/*`)

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Search & Discovery** | `/buyer/search` | Search results with Grid/Map toggle, Trust-Tier badges, price rating chips, and Nigerian market filter drawer (Tokunbo/Nigerian Used, customs, ownership) |
| **Vehicle Detail Page** | `/buyer/vehicles/[id]` | High-res photo gallery, Trust Tier indicator, price rating meter, documentation checklist, Request Inspection CTA, and masked seller contact |
| **Price Intelligence View** | `/buyer/vehicles/[id]#price-intelligence` | Fair market valuation bell curve, comparable Lagos/Abuja sales range, and defect depreciation notes |
| **Vehicle History & Docs** | `/buyer/vehicles/[id]#history` | Nigerian customs clearance release status, registration history, and accident disclosure |
| **Vehicle Compare Sheet** | `/buyer/compare` | Side-by-side comparison across saved cars: specs, trust ladders, price ratings, and health scores |
| **Garage (Saved Cars)** | `/buyer/garage` | Buyer's saved vehicles, custom collections, and price-drop notification alerts |
| **Clustered District Map** | `/buyer/map` | Privacy-masked area clusters (Lekki, Ikeja, Victoria Island, Abuja) with preview drawers |
| **Book Inspection: Choose Tier** | `/buyer/inspections/book/[vehicleId]` | Tier selection: Standard (₦25k), Premium (₦45k), Comprehensive (₦75k) |
| **Book Inspection: Choose Tech** | `/buyer/inspections/book/[vehicleId]/technicians` | Nearby certified technicians ranked by proximity, rating, and availability |
| **Inspection Live Tracker** | `/buyer/inspections/[id]/tracker` | Multi-stage status stepper: matched → dispatched → on-site diagnostic → report verified |
| **Vehicle Health Report** | `/buyer/inspections/[id]/report` | Shareable official report: 60-point mechanical subsystem scores, photos/video, and plain-language mechanic verdict |
| **Messages & Masked Chat** | `/buyer/messages` | Buyer message inbox with masked contact numbers |
| **Vehicle-Scoped Chat Thread** | `/buyer/messages/[id]` | In-platform chat thread scoped to a single vehicle with trust context banner |
| **Find It For Me (Concierge)** | `/buyer/concierge` | Custom sourcing brief: budget (₦), make/model, condition, city, and inspection priority |
| **Imported Cars Portal** | `/buyer/imports` | Direct USA/Canada/Dubai sourcing catalog with transparent landing cost and 35% customs tariff calculator |

---

## 3. Dealer Portal (`/dealer/*`)

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Dealer Dashboard** | `/dealer/dashboard` | Showroom KPIs (active listings, inbound leads, inspection requests, revenue), recent inquiries, and quick actions |
| **Showroom Inventory** | `/dealer/vehicles` | Inventory management table with trust tiers, price scores, views, and quick edit links |
| **Add Vehicle Wizard** | `/dealer/vehicles/new` | 10-step wizard: specs, condition, public zone vs exact address, customs upload, photos, pricing, fault disclosure, pre-inspection dispatch |
| **Buyer Lead Inbox** | `/dealer/leads` | Filterable lead board: inspection requests, viewing schedules, and direct inquiries |
| **Shop Profile & Settings** | `/dealer/shop` | Public brand name, tagline, showroom address, opening hours, and CAC verification settings |
| **Plan & Subscription** | `/dealer/subscription` | Shop plan management (Basic ₦25k, Pro ₦65k, Premium ₦150k), Paystack auto-renewal, and 7-day grace period status |
| **Dealer Messages** | `/dealer/messages` | Customer inquiry chat with masked buyer contact protection |

---

## 4. Private Seller Portal (`/seller/*`)

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Seller Dashboard** | `/seller/dashboard` | Personal listing performance, weekly view counts, buyer garage saves, and lead alerts |
| **Identity Verification (KYC)** | `/seller/onboard` | NDPR-compliant identity verification (NIN slip, Voter's Card, Driver's License) before listing goes live |
| **My Listings Manager** | `/seller/listings` | Personal vehicle manager with status, views, price updates, and upgrade to Tier 4 inspection CTA |
| **Sell My Car (Valuation)** | `/seller/sell` | Algorithmic valuation estimator (Naira range) and instant cash offer requests from verified dealers |
| **Seller Messages** | `/seller/messages` | Direct buyer inquiry chat with masked contact protection |

---

## 5. Technician Portal (`/technician/*`)

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Technician Dashboard** | `/technician/dashboard` | Monthly earnings wallet, completed jobs counter, acceptance SLA, and active job in progress launcher |
| **Inspection Jobs List** | `/technician/inspections` | Active dispatches, scheduled lot appointments, and completed certified audits |
| **Audit Checklist** | `/technician/inspections/[id]/checklist` | Mobile-first 60-point category checklist (Engine, Transmission, Suspension, Brakes, Undercarriage, OBD-II scan) |
| **Report Composer** | `/technician/inspections/[id]/composer` | Media uploader (photos, audio voice notes), overall health score (0-100%), plain-language verdict, and repair budget estimate |
| **Earnings & Wallet** | `/technician/earnings` | Fee split history, completed audit settlements, and bank transfer tracking |
| **Certifications & Setup** | `/technician/onboard` | Mechanical credentials, garage workshop base, service coverage radius, and diagnostic gear inventory |

---

## 6. Admin Console (`/admin/*`)

| Screen Name | Route Slug | Purpose & Key Features |
|---|---|---|
| **Admin Overview** | `/admin/dashboard` | Global platform metrics: live listings by trust tier, active dealer shops, inspection volume, and pending queues |
| **Verification Queue** | `/admin/verifications` | Audit and approve/reject customs single-goods declarations (SGD), seller NINs, and technician certifications |
| **Lead Routing Board** | `/admin/leads` | Inbound buyer demand telemetry, algorithmic technician matching, and manual dispatch overrides |
| **Listings Moderation** | `/admin/listings` | Automated anomaly detection: ghost listings, duplicate VINs, unrealistic pricing, and reverse image match alerts |
| **Payments & Escrow** | `/admin/payments` | Financial ledger: inspection escrow deposits, technician bank payouts, and monthly dealer subscription auto-charges |

---

## 7. Role-Based Navigation Summary

| User Type | Dedicated Prefix | Primary Landing Screen |
|---|---|---|
| **Buyer / Public** | `/buyer/*` | `/buyer/search` |
| **Dealer** | `/dealer/*` | `/dealer/dashboard` |
| **Private Seller** | `/seller/*` | `/seller/dashboard` |
| **Technician** | `/technician/*` | `/technician/dashboard` |
| **Admin** | `/admin/*` | `/admin/dashboard` |
