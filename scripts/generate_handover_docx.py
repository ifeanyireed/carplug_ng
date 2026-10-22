#!/usr/bin/env python3
"""
Carplug Nigeria (mycars.ng) - Handover & Operational Testing Guide Generator
Generates a professional, beautifully styled .docx document for stakeholder and developer handover.
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Set background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    # Remove existing shading if present
    for child in list(tc_pr):
        if child.tag.endswith('shd'):
            tc_pr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    """Set inner padding for a table cell (in twips: 20 twips = 1 pt)."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC", sz="4"):
    """Set cell borders with light clean gray lines."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{top}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{left}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{bottom}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{right}"/>'
        f'</w:tcBorders>'
    )
    tc_pr.append(tc_borders)

def format_table(table, col_widths, col_alignments=None):
    """Format table with clean borders, header background, and zebra striping."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    num_cols = len(col_widths)
    
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        bg_color = "0F172A" if is_header else ("F8FAFC" if i % 2 == 1 else "FFFFFF")
        
        # Prevent row splitting across pages
        tr_pr = row._tr.get_or_add_trPr()
        tr_pr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            tr_pr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        
        for col_idx, cell in enumerate(row.cells):
            cell.width = col_widths[col_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
            
            border_color = "1E293B" if is_header else "E2E8F0"
            set_cell_borders(cell, top=border_color, bottom=border_color, left=border_color, right=border_color)
            
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.15
                if col_alignments and col_idx < len(col_alignments):
                    p.alignment = col_alignments[col_idx]
                for run in p.runs:
                    if is_header:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        run.font.size = Pt(9.5)
                    else:
                        run.font.size = Pt(9)
                        run.font.color.rgb = RGBColor(30, 41, 59)

def add_callout(doc, text, title="NOTE", border_color="0284C7", bg_color="F0F9FF"):
    """Adds a stylish callout box with a colored left accent border."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=200, right=160)
    
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tc_pr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    run_title = p.add_run(f"[{title}] ")
    run_title.font.bold = True
    run_title.font.size = Pt(9.5)
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    
    run_text = p.add_run(text)
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = RGBColor(51, 65, 85)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_document():
    doc = Document()
    
    # Page Setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
        # Header & Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("Carplug Nigeria (mycars.ng) — Handover & Testing Guide | Confidential")
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)
        
    # Styles Setup
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    
    # -------------------------------------------------------------
    # COVER / HEADER BLOCK
    # -------------------------------------------------------------
    # Add Logo if present
    logo_path = os.path.abspath("logo_full.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.abspath("mycarNG-color.png")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_logo.paragraph_format.space_before = Pt(0)
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.add_run().add_picture(logo_path, width=Inches(2.2))
        
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("Carplug Nigeria (mycars.ng)")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Comprehensive Platform Handover & Operational Verification Guide")
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(15)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(13, 148, 136) # Teal 600
    
    # Document Metadata Box
    meta_table = doc.add_table(rows=4, cols=2)
    meta_widths = [Inches(2.0), Inches(4.5)]
    meta_data = [
        ("Document Version", "v1.0 (Production Handover Final)"),
        ("Architecture Scope", "Full Monorepo (Next.js 16 Web App + Go 1.26 Gin REST/WebSocket Backend)"),
        ("Target Environments", "Dev: https://mycarsng-api-dev.onrender.com | Prod: AWS / Neon / Docker"),
        ("Key Integrations", "Paystack (Escrow & Subscriptions), Cloudinary (Media), Brevo (OTP Auth)"),
    ]
    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.text = label
        c1.text = val
    format_table(meta_table, meta_widths)
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(8)
    p_spacer.paragraph_format.space_after = Pt(8)
    
    add_callout(
        doc,
        "This guide defines the exhaustive operational test matrix required to verify platform stability, business logic enforcement, cryptographic payment reconciliation, and multi-tenant security before production handover.",
        title="EXECUTIVE HANDOVER DIRECTIVE",
        border_color="0D9488",
        bg_color="F0FDFA"
    )

    # -------------------------------------------------------------
    # SECTION 1: ARCHITECTURE OVERVIEW & MONOREPO TOPOLOGY
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r = h1.add_run("1. System Architecture & Monorepo Topology")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run(
        "Carplug Nigeria is engineered as an institutional trust-infrastructure and automotive commerce portal for Nigeria. "
        "The codebase is split into two specialized sub-systems within a unified git repository:"
    )
    
    bp1 = doc.add_paragraph(style='List Bullet')
    r1 = bp1.add_run("web_app/ (Frontend Portal): ")
    r1.font.bold = True
    bp1.add_run("Built with Next.js 16.3 (App Router, Turbopack, React 19, TypeScript, Tailwind CSS). It serves the public vehicle marketplace, dedicated dealer storefronts, private seller portals, technician inspection consoles, buyer garage/comparison tools, and the super-admin moderation suite.")

    bp2 = doc.add_paragraph(style='List Bullet')
    r2 = bp2.add_run("backend/ (Core API & Real-Time Engine): ")
    r2.font.bold = True
    bp2.add_run("High-performance Golang 1.26 HTTP service powered by Gin, GORM ORM, Gorilla WebSocket, and PostgreSQL/MySQL connection pooling. Enforces atomic transaction ledgers, escrow holds, cryptographic Paystack webhooks, Brevo transactional emails, and automated vehicle trust tiering.")

    # -------------------------------------------------------------
    # SECTION 2: PRE-SEEDED TEST CREDENTIALS MATRIX
    # -------------------------------------------------------------
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)
    r = h2.add_run("2. Pre-Verified Test Accounts Reference")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    doc.add_paragraph(
        "All test accounts are pre-configured in PostgreSQL with is_verified = true and use a standardized bcrypt-hashed password for verification across all five platform roles. All demo accounts can also be activated instantly via the Auth Modal 1-click pills."
    )
    
    acc_table = doc.add_table(rows=7, cols=5)
    acc_widths = [Inches(1.2), Inches(1.8), Inches(1.1), Inches(1.2), Inches(1.2)]
    acc_headers = ["Role", "Email Address", "Password", "Entity / Profile", "Key Dashboard Route"]
    for idx, text in enumerate(acc_headers):
        acc_table.rows[0].cells[idx].text = text
        
    acc_data = [
        ("Super Admin", "mycarsnigeria@gmail.com", "Carplug2026!", "Super Administrator", "/admin/dashboard"),
        ("Dealer 1", "carsplug0@gmail.com", "Carplug2026!", "Dew Autos (Lekki Phase 1)", "/dealer/dashboard"),
        ("Dealer 2", "dealer.crown@mycars.ng", "Carplug2026!", "Crown Continental (Ikeja)", "/dealer/dashboard"),
        ("Private Seller", "seller.babatunde@mycars.ng", "Carplug2026!", "Babatunde Olumide (Surulere)", "/seller/dashboard"),
        ("Technician", "tech.musa@mycars.ng", "Carplug2026!", "Musa Danladi, ASE-Cert", "/technician/dashboard"),
        ("Verified Buyer", "buyer.chidi@mycars.ng", "Carplug2026!", "Dr. Chidi Nwosu", "/buyer/garage"),
    ]
    for row_idx, row_vals in enumerate(acc_data, start=1):
        for col_idx, val in enumerate(row_vals):
            acc_table.rows[row_idx].cells[col_idx].text = val
    format_table(acc_table, acc_widths)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SECTION 3: MASTER OPERATIONAL HANDOVER TEST MATRIX (12 FLOWS)
    # -------------------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(16)
    h3.paragraph_format.space_after = Pt(6)
    r = h3.add_run("3. Master Operational Handover Test Matrix (12 Flows)")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    flows = [
        {
            "id": "FLOW 01",
            "title": "Authentication, Onboarding & Role-Based Access Control (RBAC)",
            "desc": "Validates the complete signup, OTP verification, demo switching, and route protection mechanisms.",
            "steps": [
                ("1.1 Registration & Brevo OTP", "Register new user at /auth/register with valid email. Verify system generates 6-digit numeric OTP and triggers Brevo transactional email. Test OTP submission at /auth/verify-otp.", "User marked is_verified=true; JWT issued; redirect to dashboard."),
                ("1.2 Privilege Escalation Defense", "Submit registration payload containing role: 'admin'. Verify server silently downgrades role to 'buyer'.", "Admin role cannot be self-provisioned via public signup."),
                ("1.3 1-Click Demo Switcher", "Click quick-login role pills on AuthModal (Super Admin, Dealer, Tech, etc.).", "Form auto-fills valid credentials and authenticates into correct portal."),
                ("1.4 Route Guards & RBAC", "Attempt accessing /admin/* as a buyer or /dealer/* as a seller.", "RoleGuard intercepts and redirects with permission error banner."),
            ]
        },
        {
            "id": "FLOW 02",
            "title": "Vehicle Discovery, Parametric Search & Valuation Comps",
            "desc": "Tests marketplace browse, cascading hero filters, price comps, and comparison tools.",
            "steps": [
                ("2.1 Hero Category Filters", "Toggle tabs on homepage: All, Brand New, Tokunbo, Nigerian Used. Select Make/Model and price bracket (e.g. ₦15M-₦30M).", "Search results filter instantly and scroll smoothly to #search-results."),
                ("2.2 Parametric Search Page", "Navigate to /buyer/search. Filter by body type, transmission, fuel type, and price sliders.", "Inventory updates via reactive query params; pagination works seamlessly."),
                ("2.3 Fair-Price Intelligence", "Open vehicle details page (/buyer/vehicles/[id]). Verify price verdict badge.", "Comps engine displays 'Great Deal', 'Fair Price', or 'High' with market min/max."),
                ("2.4 Saved Favorites", "Click heart icon on listing cards while logged in. Open /saved.", "Vehicle adds to saved queue; toggling heart removes vehicle immediately."),
                ("2.5 Side-by-Side Comparison", "Select 2-3 vehicles and navigate to /buyer/compare.", "Renders comparative specs matrix (mileage, engine, trust tier, customs)."),
            ]
        },
        {
            "id": "FLOW 03",
            "title": "Private Seller Vehicle Listing & Ownership Security",
            "desc": "Tests algorithmic price estimation to listing conversion, image uploads, and multi-tenant security.",
            "steps": [
                ("3.1 Algorithmic Sell Flow", "Log in as seller.babatunde@mycars.ng. Go to /seller/sell. Input make, model, year, mileage.", "Calculates instant estimated market value and opens listing creation form."),
                ("3.2 Cloudinary Photo Upload", "Upload 3+ vehicle images in sell form.", "Images upload to Cloudinary; thumbnails render; secure URLs bound to vehicle."),
                ("3.3 Listing Publication", "Complete vehicle details and submit.", "Vehicle created with status 'active' and appears in /seller/listings."),
                ("3.4 Cross-Tenant Ownership Check", "Attempt editing another seller's vehicle via PUT /api/vehicles/:id using Babatunde's token.", "Server returns 403 Forbidden; prevents unauthorized vehicle tampering."),
            ]
        },
        {
            "id": "FLOW 04",
            "title": "Dealer Storefronts, Showrooms & Centrally Managed Subscription Quotas",
            "desc": "Validates public directory, dedicated shop profiles, quota enforcement, and Paystack tier upgrades.",
            "steps": [
                ("4.1 Public Dealers Directory", "Navigate to /dealers.", "Displays list of certified dealerships with verified CAC badges, ratings, and vehicle counts."),
                ("4.2 Dealer Storefront (/shops/[slug])", "Navigate to /shops/reed-motors-lagos.", "Renders showroom banner, physical address, business hours, and live lot inventory."),
                ("4.3 Showroom Profile Editor", "Log in as carsplug0@gmail.com. Open /dealer/shop. Edit showroom tagline and WhatsApp number.", "Updates persist to backend and reflect immediately on the public storefront."),
                ("4.4 Centralized Quota Enforcement", "Verify subscription limits in SubscriptionHelper.ts: Starter (3), Basic (15), Pro (60), Premium (Unlimited). Test adding 4th vehicle on Starter.", "UI blocks posting and displays upgrade modal when quota limit is reached."),
                ("4.5 Paystack Plan Upgrade", "Upgrade plan in /dealer/subscription. Complete Paystack checkout.", "Paystack webhook reconciles payment and updates dealer tier and quotas."),
                ("4.6 WhatsApp Lead Telemetry", "Click 'Chat on WhatsApp' on showroom or car card.", "Click logs lead in backend with type: 'whatsapp_click' and opens WhatsApp."),
            ]
        },
        {
            "id": "FLOW 05",
            "title": "Car Swaps & Trade-In Auto-Routing Pipeline",
            "desc": "Tests trade-in valuation appraisal, net top-up formula, and CRM lead dispatching.",
            "steps": [
                ("5.1 Swap Request Submission", "Go to /swap. Input current vehicle (2018 Toyota Corolla) and target car (2021 Lexus RX 350).", "Calculates appraised equity, platform discount, and net top-up amount."),
                ("5.2 Dealership CRM Auto-Routing", "Submit trade-in form.", "Backend automatically creates CRM lead (type: 'car_swap_tradein') assigned to target vehicle dealer."),
                ("5.3 Admin Swap Moderation", "Log in as Super Admin. Navigate to /admin/swaps.", "Pending swap displays with trade-in breakdown; admin can approve or reject."),
            ]
        },
        {
            "id": "FLOW 06",
            "title": "Certified 150-Point Inspection, Escrow Deposit & Tier 5 Upgrade",
            "desc": "The primary trust workflow: Escrow funding, technician checklist audit, and automated trust badge promotion.",
            "steps": [
                ("6.1 Escrow Payment Initialization", "Buyer books inspection on vehicle. System calls POST /payments/initialize (amount: ₦45,000).", "Paystack payment initializes; transaction status set to 'held_in_escrow'."),
                ("6.2 Technician Dispatch Queue", "Log in as tech.musa@mycars.ng. Open /technician/inspections.", "Assigned inspection appears with vehicle VIN, location, and customer contact."),
                ("6.3 Digital 150-Point Checklist", "Open /technician/inspections/[id]/checklist. Complete categories (Engine, Transmission, Suspension, Electrical, Body, Interior).", "Checklist auto-saves category ratings and estimated repair budgets."),
                ("6.4 Report Submission & Atomic Actions", "Submit final report via POST /inspections/:id/report.", "Atomically inside one DB transaction: 1. Releases escrow to Musa's wallet; 2. Upgrades vehicle to Trust Tier 5 ('150-Point Certified'); 3. Sets vehicle health score (e.g. 88/100)."),
                ("6.5 Tech Wallet & Payout", "Open /technician/earnings. Request bank payout.", "Available balance reflects earnings; payout requests route to admin ledger."),
            ]
        },
        {
            "id": "FLOW 07",
            "title": "In-App Direct Messaging & Real-Time WebSocket Engine",
            "desc": "Validates instant buyer-to-seller negotiation, unread tracking, and connection resilience.",
            "steps": [
                ("7.1 Direct Thread Initialization", "On listing detail (/buyer/vehicles/[id]), click 'Contact Seller (Masked)'.", "Creates or resumes conversation thread and redirects to /buyer/messages?c={id}."),
                ("7.2 Real-Time WebSocket Delivery", "Open Buyer in primary window and Dealer in incognito. Send chat message.", "Gorilla WebSocket gateway broadcasts message instantly without browser refresh."),
                ("7.3 Persistence & Unread Badges", "Refresh browser.", "Message history loads from database; sidebar badges update unread counts."),
            ]
        },
        {
            "id": "FLOW 08",
            "title": "KYC Compliance & Document Verification Queue",
            "desc": "Tests document uploads (NIN, CAC, SGD Customs) and compliance approval side-effects.",
            "steps": [
                ("8.1 Document Uploads", "Submit seller NIN at /seller/onboard or CAC at /dealer/shop. Upload document image.", "Document uploads to Cloudinary; status queued as 'pending' in verification table."),
                ("8.2 Admin Audit Queue", "Log in as Super Admin. Navigate to /admin/verifications.", "Displays pending queue with document preview links, VIN, and applicant info."),
                ("8.3 Automated Approval Actions", "Admin clicks 'Approve' on document.", "Customs SGD -> Vehicle CustomsStatus='Fully Cleared' & Tier 3; Dealer CAC -> VerifiedCAC=true; Seller NIN -> KYCStatus='verified'."),
            ]
        },
        {
            "id": "FLOW 09",
            "title": "Financial Ledger, Webhook Verification & Payouts",
            "desc": "Tests Paystack webhook HMAC verification, double-spend prevention, and payout governance.",
            "steps": [
                ("9.1 Paystack Webhook Handling", "Dispatch charge.success event to POST /payments/webhook with x-paystack-signature header.", "HMAC SHA-512 signature validated; ledger record created/updated without duplicates."),
                ("9.2 Payment Status Callback", "Call GET /payments/verify/:reference.", "Reconciles live transaction status against Paystack API and updates internal ledger."),
                ("9.3 Master Ledger Audit", "Log in as Super Admin. Open /admin/payments.", "Ledger displays total volume, escrow held reserves, settled volume, and technician fee breakdowns."),
                ("9.4 Admin Payout Approval", "Review pending technician payout request in /admin/payments.", "Admin can approve bank disbursement or reject with compliance notes."),
            ]
        },
        {
            "id": "FLOW 10",
            "title": "VIP Concierge Sourcing & District Map Discovery",
            "desc": "Tests white-glove vehicle search requests, algorithmic matching, and district map inventory.",
            "steps": [
                ("10.1 VIP Concierge Submission", "Navigate to /buyer/concierge. Submit search brief (make, model, year, budget, specs).", "Creates VIP concierge lead with high-priority badge in admin CRM."),
                ("10.2 Algorithmic Matcher", "Verify POST /leads/concierge-match.", "Queries active inventory catalog and returns ranked vehicle matches within buyer budget."),
                ("10.3 District Map Discovery", "Open /buyer/map. Select districts (Lekki Phase 1, Victoria Island, Ikeja GRA).", "Map renders geolocation pins with dealership showroom clusters and car cards."),
            ]
        },
        {
            "id": "FLOW 11",
            "title": "Editorial Blog CMS & Advertising Campaigns",
            "desc": "Tests auto-industry news publishing, SEO slugs, and banner advertising workflows.",
            "steps": [
                ("11.1 Public Blog & Articles", "Navigate to /blog and /blog/[slug].", "Renders formatted articles, tags, category pills, read time, and social share links."),
                ("11.2 Admin Editorial CMS", "Log in as Super Admin. Navigate to /admin/blog.", "Admin can create, edit, publish, unpublish, and delete articles, categories, and tags."),
                ("11.3 Advertising Engine", "Submit ad campaign at /advertise. Review at /admin/advertising.", "Admin approves campaign banners; active campaigns render across public marketplace slots."),
            ]
        },
        {
            "id": "FLOW 12",
            "title": "Super Admin Governance, Listing Moderation & Platform Health",
            "desc": "Validates system health checks, flagged listing moderation, and error boundaries.",
            "steps": [
                ("12.1 System Health Endpoint", "Query GET /api/health.", "Returns 200 OK with database connection status and server timestamp."),
                ("12.2 Platform Metrics Dashboard", "Log in as Super Admin. Open /admin/dashboard.", "Displays live counts of active listings, registered users, escrow reserves, and monthly volume."),
                ("12.3 Listing Flagging & Moderation", "Navigate to /admin/listings. Flag suspicious vehicle or change status to 'rejected'.", "Vehicle is removed from public search results immediately."),
                ("12.4 Resilient Error Handling", "Navigate to invalid route /buyer/nonexistent or trigger simulated API error.", "Renders custom styled not-found.tsx, error.tsx, or global-error.tsx boundaries."),
            ]
        },
    ]

    for flow in flows:
        h_flow = doc.add_paragraph()
        h_flow.paragraph_format.space_before = Pt(12)
        h_flow.paragraph_format.space_after = Pt(2)
        r_f = h_flow.add_run(f"{flow['id']}: {flow['title']}")
        r_f.font.size = Pt(12.5)
        r_f.font.bold = True
        r_f.font.color.rgb = RGBColor(15, 23, 42)
        
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_before = Pt(0)
        p_desc.paragraph_format.space_after = Pt(4)
        r_desc = p_desc.add_run(flow['desc'])
        r_desc.font.size = Pt(9.5)
        r_desc.font.italic = True
        r_desc.font.color.rgb = RGBColor(71, 85, 105)
        
        table = doc.add_table(rows=len(flow['steps']) + 1, cols=3)
        widths = [Inches(1.8), Inches(2.7), Inches(2.0)]
        table.rows[0].cells[0].text = "Test Case / Action"
        table.rows[0].cells[1].text = "Procedure & Parameters"
        table.rows[0].cells[2].text = "Expected Handover Criteria"
        
        for s_idx, (c0, c1, c2) in enumerate(flow['steps'], start=1):
            table.rows[s_idx].cells[0].text = c0
            table.rows[s_idx].cells[1].text = c1
            table.rows[s_idx].cells[2].text = c2
            
        format_table(table, widths)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # SECTION 4: SECURITY, QUOTA & FAULT TOLERANCE VERIFICATION
    # -------------------------------------------------------------
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(16)
    h4.paragraph_format.space_after = Pt(6)
    r = h4.add_run("4. Security, Quotas & Architectural Invariants")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph(
        "To ensure stability and maintainability after handover, the engineering team must verify several critical architectural invariants built into the platform:"
    )

    add_callout(
        doc,
        "Subscription limits are centrally managed in web_app/src/services/SubscriptionHelper.ts (Starter: 3, Basic: 15, Pro: 60, Premium: Unlimited). The system actively enforces and displays these limits via SubscriptionService and middleware, overriding any potentially outdated database values for consistency across storefronts and dashboards.",
        title="CENTRAL SUBSCRIPTION GOVERNANCE",
        border_color="D97706",
        bg_color="FFFBEB"
    )

    sec_table = doc.add_table(rows=6, cols=3)
    sec_widths = [Inches(1.8), Inches(2.3), Inches(2.4)]
    sec_headers = ["Security Domain", "Threat / Risk Vector", "Implemented Defense Mechanism"]
    for idx, text in enumerate(sec_headers):
        sec_table.rows[0].cells[idx].text = text
        
    sec_data = [
        ("Privilege Escalation", "Public signup with admin role", "auth_controller.go forces role='buyer' for any public signup attempt."),
        ("Listing Tampering", "Seller modifying another seller's vehicle", "UpdateVehicle & DeleteVehicle enforce userID == vehicle.SellerID || role == 'admin'."),
        ("Escrow Double-Release", "Concurrent inspection completion calls", "Inspection completion and escrow release are wrapped inside one atomic DB transaction."),
        ("Webhook Forgery", "Fake Paystack charge.success calls", "Validates HMAC SHA-512 signature in x-paystack-signature header using secret key."),
        ("Brute Force / Abuse", "Automated login and OTP guessing", "Rate-limiting middleware enforces 3-5 req/min on auth endpoints with IP tracking."),
    ]
    for row_idx, row_vals in enumerate(sec_data, start=1):
        for col_idx, val in enumerate(row_vals):
            sec_table.rows[row_idx].cells[col_idx].text = val
    format_table(sec_table, sec_widths)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SECTION 5: AUTOMATED TEST SUITES EXECUTION RUNBOOK
    # -------------------------------------------------------------
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(16)
    h5.paragraph_format.space_after = Pt(6)
    r = h5.add_run("5. Automated Test Suites & Runbook")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    doc.add_paragraph(
        "Four automated test suites are committed in the repository root to allow developers and QA engineers to rapidly verify the live system state before sign-off:"
    )

    t_table = doc.add_table(rows=5, cols=3)
    t_widths = [Inches(1.8), Inches(2.2), Inches(2.5)]
    t_headers = ["Test Suite Script", "Command Line", "Verification Coverage"]
    for idx, text in enumerate(t_headers):
        t_table.rows[0].cells[idx].text = text
        
    t_data = [
        ("Phase 3 Verification", "node test_phase3.js", "Dealer directory, storefront profile by slug, inventory load, and WhatsApp lead telemetry."),
        ("Phase 4 Verification", "node test_phase4.js", "Real Paystack escrow payment initialization, webhook ingestion, transaction ledger, and technician wallet."),
        ("KYC Flow Verification", "node test_verified_flow.js", "Checks seller verification enforcement and listing creation permissions."),
        ("Go Unit & Middleware", "cd backend && go test ./...", "Runs Go unit test suite for JWT generation, auth middleware, and API handlers."),
    ]
    for row_idx, row_vals in enumerate(t_data, start=1):
        for col_idx, val in enumerate(row_vals):
            t_table.rows[row_idx].cells[col_idx].text = val
    format_table(t_table, t_widths)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SECTION 6: PRODUCTION ENVIRONMENT CONFIGURATION CHECKLIST
    # -------------------------------------------------------------
    h6 = doc.add_paragraph()
    h6.paragraph_format.space_before = Pt(16)
    h6.paragraph_format.space_after = Pt(6)
    r = h6.add_run("6. Production Environment Variables Checklist")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph(
        "Ensure all environment variables in backend/.env and web_app/.env.production are set with live production credentials prior to handover:"
    )

    env_table = doc.add_table(rows=8, cols=3)
    env_widths = [Inches(2.0), Inches(2.0), Inches(2.5)]
    env_headers = ["Variable Name", "Target Service", "Handover Instructions"]
    for idx, text in enumerate(env_headers):
        env_table.rows[0].cells[idx].text = text
        
    env_data = [
        ("DATABASE_URL", "PostgreSQL / Neon / Lakebase", "Configure production connection pool with sslmode=require."),
        ("JWT_SECRET", "Go Backend Token Signer", "Rotate to a high-entropy 64-character random string."),
        ("PAYSTACK_SECRET_KEY", "Paystack Gateway Live", "Swap sk_test_... for live secret key sk_live_..."),
        ("PAYSTACK_PUBLIC_KEY", "Paystack Inline Checkout", "Swap pk_test_... for live public key pk_live_..."),
        ("BREVO_API_KEY", "Brevo Transactional Email", "Configure Brevo API key for OTP dispatch and lead notifications."),
        ("CLOUDINARY_*", "Cloudinary Media CDN", "Provide production cloud_name, api_key, and api_secret."),
        ("SEED_DATABASE", "Go Backend Startup", "MUST BE SET TO 'false' to prevent overwriting production data on reboot."),
    ]
    for row_idx, row_vals in enumerate(env_data, start=1):
        for col_idx, val in enumerate(row_vals):
            env_table.rows[row_idx].cells[col_idx].text = val
    format_table(env_table, env_widths)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # SECTION 7: HANDOVER SIGN-OFF & ACCEPTANCE CRITERIA
    # -------------------------------------------------------------
    h7 = doc.add_paragraph()
    h7.paragraph_format.space_before = Pt(16)
    h7.paragraph_format.space_after = Pt(6)
    r = h7.add_run("7. Handover Sign-Off & Acceptance Criteria")
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    doc.add_paragraph(
        "Handover is deemed complete when the receiving technical team confirms the following criteria have been met:"
    )

    sign_checks = [
        "All 12 operational test flows have been successfully run against the target environment without errors.",
        "Automated verification test suites (test_phase3.js, test_phase4.js, test_verified_flow.js) complete with exit code 0.",
        "Subscription quotas adhere strictly to SubscriptionHelper.ts across the public pricing page and dealer dashboards.",
        "Paystack webhook secret and live keys are tested in live/staging mode with transaction ledger reconciliation.",
        "Administrative access to Cloudinary, Brevo, and the Neon/PostgreSQL production database is transferred to the client.",
    ]
    for item in sign_checks:
        bp = doc.add_paragraph(style='List Bullet')
        bp.add_run(item)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Signature Block Table
    sig_table = doc.add_table(rows=3, cols=2)
    sig_widths = [Inches(3.25), Inches(3.25)]
    sig_table.rows[0].cells[0].text = "Delivered By (Lead Engineer):"
    sig_table.rows[0].cells[1].text = "Accepted By (Product Owner / Client):"
    sig_table.rows[1].cells[0].text = "Signature: __________________________\nName: _____________________________\nDate: ______________________________"
    sig_table.rows[1].cells[1].text = "Signature: __________________________\nName: _____________________________\nDate: ______________________________"
    sig_table.rows[2].cells[0].text = "Status: READY FOR HANDOVER"
    sig_table.rows[2].cells[1].text = "Status: PENDING FINAL ACCEPTANCE"
    format_table(sig_table, sig_widths)

    output_path = os.path.abspath("Carplug_Nigeria_Handover_Testing_Guide.docx")
    doc.save(output_path)
    print(f"Document successfully generated and saved to: {output_path}")

if __name__ == "__main__":
    build_document()
