package models

import (
	"log"

	"gorm.io/gorm"
)

func SeedInitialData(db *gorm.DB) {
	// 1. Seed Dealers
	var dealerCount int64
	db.Model(&DealerShop{}).Count(&dealerCount)
	if dealerCount == 0 {
		log.Println("[Seed] Seeding initial DealerShops...")
		dealers := []DealerShop{
			{
				ID:                  "dealer-reed-motors",
				Slug:                "reed-motors-lagos",
				Name:                "Reed Motors Lagos",
				Tagline:             "Certified Tokunbo & Luxury Vehicles with Independent Trust Scoring",
				Logo:                "",
				Banner:              "/hero-car.webp",
				Location:            "Lekki Phase 1, Lagos",
				Address:             "Plot 14 Admiralty Way, Lekki Phase 1, Lagos State",
				Rating:              4.9,
				ReviewCount:         74,
				VerifiedCAC:         true,
				Plan:                "Premium Shop",
				ActiveListingsCount: 18,
				Phone:               "+234 803 500 4401",
				Whatsapp:            "+2348035004401",
				Email:               "sales@reedmotors.ng",
				OperatingHours:      "Mon - Sat: 8:00 AM - 6:30 PM",
				JoinedDate:          "January 2026",
			},
			{
				ID:                  "dealer-crown-autos",
				Slug:                "crown-continental-autos",
				Name:                "Crown Continental Autos",
				Tagline:             "Direct US & Canadian Import Specialist Since 2018",
				Logo:                "",
				Banner:              "/hero-car.webp",
				Location:            "Ikeja GRA, Lagos",
				Address:             "12 Isaac John St, Ikeja GRA, Lagos State",
				Rating:              4.7,
				ReviewCount:         42,
				VerifiedCAC:         true,
				Plan:                "Pro Shop",
				ActiveListingsCount: 26,
				Phone:               "+234 812 770 8820",
				Whatsapp:            "+2348127708820",
				Email:               "info@crownautos.ng",
				OperatingHours:      "Mon - Sat: 8:30 AM - 6:00 PM",
				JoinedDate:          "March 2026",
			},
		}
		for _, d := range dealers {
			db.FirstOrCreate(&d, DealerShop{ID: d.ID})
		}
	}

	// 2. Seed Technicians
	var techCount int64
	db.Model(&Technician{}).Count(&techCount)
	if techCount == 0 {
		log.Println("[Seed] Seeding initial Technicians...")
		techs := []Technician{
			{
				ID:              "tech-musa",
				Name:            "Musa Danladi, ASE-Cert",
				Badge:           "Preferred Master",
				Avatar:          "",
				Rating:          4.95,
				CompletedJobs:   218,
				ServiceAreas:    `["Lekki Phase 1", "Ikoyi", "Victoria Island", "Ajah"]`,
				WorkshopAddress: "Block 8 Autocare Center, Maroko, Lekki",
				Specialties:     `["Toyota / Lexus Hybrid Systems", "Mercedes-Benz Star Diagnostics", "Chassis Structural Laser Scan"]`,
				DistanceKm:      3.2,
				Availability:    "Available Today",
				HourlyRate:      15000,
			},
			{
				ID:              "tech-kunle",
				Name:            "Engr. Kunle Adeleke",
				Badge:           "Platform Certified",
				Avatar:          "",
				Rating:          4.82,
				CompletedJobs:   146,
				ServiceAreas:    `["Ikeja", "Maryland", "Magodo", "Ogba"]`,
				WorkshopAddress: "14 Mobolaji Bank Anthony Way, Ikeja",
				Specialties:     `["German Powertrains (BMW/Audi)", "Transmission Valve Body Overhauls", "OBD-II Live Telemetry"]`,
				DistanceKm:      6.8,
				Availability:    "Available Today",
				HourlyRate:      12000,
			},
			{
				ID:              "tech-emmanuel",
				Name:            "Emmanuel Chukwu",
				Badge:           "Standard Specialist",
				Avatar:          "",
				Rating:          4.70,
				CompletedJobs:   89,
				ServiceAreas:    `["Surulere", "Yaba", "Gbagada"]`,
				WorkshopAddress: "Plot 3 Western Avenue, Surulere",
				Specialties:     `["Japanese Everyday Daily Drivers", "Suspension & Braking Systems", "Pre-Purchase Document Audit"]`,
				DistanceKm:      11.4,
				Availability:    "Next Available Tomorrow",
				HourlyRate:      10000,
			},
		}
		for _, t := range techs {
			db.FirstOrCreate(&t, Technician{ID: t.ID})
		}
	}

	// 3. Seed Vehicles
	var vehicleCount int64
	db.Model(&Vehicle{}).Count(&vehicleCount)
	if vehicleCount == 0 {
		log.Println("[Seed] Seeding initial Vehicles...")
		vehicles := []Vehicle{
			{
				ID:                 "v-lexus-rx350-2021",
				Title:              "2021 Lexus RX 350 F-Sport AWD",
				Year:               2021,
				Make:               "Lexus",
				Model:              "RX 350",
				Trim:               "F-Sport",
				BodyType:           "SUV",
				Condition:          "Foreign Used (Tokunbo)",
				Mileage:            28400,
				Transmission:       "Automatic",
				FuelType:           "Petrol",
				EngineSize:         "3.5L V6",
				VIN:                "2T2HZMCA4MC189402",
				Price:              34500000,
				MarketPriceMin:     32000000,
				MarketPriceMax:     36000000,
				PriceRating:        "fair",
				PriceVerdict:       "Fair market valuation based on verified recent Lekki/Ikeja sales of Tokunbo F-Sport trims.",
				TrustTier:          5,
				TrustTierLabel:     "Premium Verified",
				Images:             `["/images/cars/car15.jpeg", "/images/cars/car17.jpeg", "/images/cars/car18.jpeg"]`,
				PublicLocation:     "Lekki Phase 1, Lagos",
				ExactLocation:      "Plot 14 Admiralty Way, Lekki",
				SellerID:           "dealer-reed-motors",
				SellerType:         "dealer",
				SellerName:         "Reed Motors Lagos",
				SellerPhone:        "+234 803 ••• ••41",
				SellerRating:       4.9,
				CustomsStatus:      "Fully Cleared",
				CustomsDoc:         true,
				RegistrationDoc:    true,
				Roadworthiness:     true,
				TintPermit:         true,
				PoliceExtracted:    true,
				HealthScore:        92,
				LatestInspectionID: "insp-001",
				Featured:           true,
			},
			{
				ID:                 "v-toyota-camry-2020",
				Title:              "2020 Toyota Camry XSE V6 (Panoramic Roof)",
				Year:               2020,
				Make:               "Toyota",
				Model:              "Camry",
				Trim:               "XSE V6",
				BodyType:           "Sedan",
				Condition:          "Foreign Used (Tokunbo)",
				Mileage:            32400,
				Transmission:       "Automatic",
				FuelType:           "Petrol",
				EngineSize:         "2.5L 4-Cylinder",
				VIN:                "4T1B11HK5LU821903",
				Price:              24800000,
				MarketPriceMin:     25500000,
				MarketPriceMax:     28000000,
				PriceRating:        "deal",
				PriceVerdict:       "Below comparable market range — ₦1.8m lower than average Tokunbo XSE listings.",
				TrustTier:          4,
				TrustTierLabel:     "Technician Inspected",
				Images:             `["/images/cars/car13.jpeg", "/images/cars/car16.jpeg"]`,
				PublicLocation:     "Ikeja GRA, Lagos",
				ExactLocation:      "Isaac John Street, Ikeja",
				SellerID:           "dealer-crown-autos",
				SellerType:         "dealer",
				SellerName:         "Crown Continental Autos",
				SellerPhone:        "+234 812 ••• ••88",
				SellerRating:       4.7,
				CustomsStatus:      "Fully Cleared",
				CustomsDoc:         true,
				RegistrationDoc:    true,
				Roadworthiness:     true,
				HealthScore:        84,
				LatestInspectionID: "insp-002",
				Featured:           true,
			},
			{
				ID:                 "v-mercedes-gle450-2022",
				Title:              "2022 Mercedes-Benz GLE 450 4MATIC AMG-Line",
				Year:               2022,
				Make:               "Mercedes-Benz",
				Model:              "GLE-Class",
				Trim:               "450 4MATIC",
				BodyType:           "SUV",
				Condition:          "Foreign Used (Tokunbo)",
				Mileage:            19800,
				Transmission:       "Automatic",
				FuelType:           "Hybrid",
				EngineSize:         "3.0L Turbo Inline-6 EQ Boost",
				VIN:                "4JGDA5JB6NB310492",
				Price:              68000000,
				MarketPriceMin:     65000000,
				MarketPriceMax:     71000000,
				PriceRating:        "fair",
				PriceVerdict:       "Price aligns with low mileage and documented customs duties cleared at Tin Can port.",
				TrustTier:          4,
				TrustTierLabel:     "Technician Inspected",
				Images:             `["/images/cars/car17.jpeg", "/images/cars/car15.jpeg"]`,
				PublicLocation:     "Victoria Island, Lagos",
				ExactLocation:      "Ahmadu Bello Way, VI",
				SellerID:           "dealer-reed-motors",
				SellerType:         "dealer",
				SellerName:         "Reed Motors Lagos",
				SellerPhone:        "+234 803 ••• ••41",
				SellerRating:       4.9,
				CustomsStatus:      "Fully Cleared",
				CustomsDoc:         true,
				RegistrationDoc:    false,
				Roadworthiness:     true,
				HealthScore:        88,
				LatestInspectionID: "insp-003",
				Featured:           true,
			},
			{
				ID:                 "v-toyota-corolla-2018",
				Title:              "2018 Toyota Corolla LE (First Body)",
				Year:               2018,
				Make:               "Toyota",
				Model:              "Corolla",
				Trim:               "LE",
				BodyType:           "Sedan",
				Condition:          "Nigerian Used",
				Mileage:            82000,
				Transmission:       "Automatic",
				FuelType:           "Petrol",
				EngineSize:         "1.8L 4-Cylinder",
				VIN:                "2T1BURHE7JC982103",
				Price:              13500000,
				MarketPriceMin:     12000000,
				MarketPriceMax:     14000000,
				PriceRating:        "fair",
				PriceVerdict:       "Standard Nigerian-used pricing for single-owner vehicle with factory original paint.",
				TrustTier:          3,
				TrustTierLabel:     "Platform Verified",
				Images:             `["/images/cars/car1.jpeg", "/images/cars/car2.jpeg"]`,
				PublicLocation:     "Surulere, Lagos",
				SellerID:           "seller-babatunde",
				SellerType:         "private",
				SellerName:         "Babatunde O.",
				SellerPhone:        "+234 901 ••• ••33",
				SellerRating:       4.5,
				CustomsStatus:      "Local Registration",
				CustomsDoc:         false,
				RegistrationDoc:    true,
				Roadworthiness:     true,
				HealthScore:        78,
				Featured:           false,
			},
		}
		for _, v := range vehicles {
			db.FirstOrCreate(&v, Vehicle{ID: v.ID})
		}
	}

	// 4. Seed Campaigns
	var campCount int64
	db.Model(&Campaign{}).Count(&campCount)
	if campCount == 0 {
		log.Println("[Seed] Seeding initial Campaigns...")
		campaigns := []Campaign{
			{
				ID:                   "camp-01",
				Advertiser:           "Leadway Auto Insurance",
				Placement:            "Vehicle Health Report Sponsor",
				CreativeImage:        "/images/cars/car17.jpeg",
				Budget:               360000,
				Dates:                "Sep 01 - Sep 15, 2026",
				ImpressionsDelivered: 42300,
				ImpressionGoal:       60000,
				Clicks:               1820,
				Status:               "Active",
				TargetCity:           "Nationwide",
			},
			{
				ID:                   "camp-02",
				Advertiser:           "Stanbic IBTC Auto Loans",
				Placement:            "Homepage Brand Spotlight",
				CreativeImage:        "/images/cars/car15.jpeg",
				Budget:               500000,
				Dates:                "Sep 03 - Sep 17, 2026",
				ImpressionsDelivered: 112000,
				ImpressionGoal:       200000,
				Clicks:               4680,
				Status:               "Active",
				TargetCity:           "Lagos & Abuja",
			},
		}
		for _, c := range campaigns {
			db.FirstOrCreate(&c, Campaign{ID: c.ID})
		}
	}

	// 5. Seed Swaps
	var swapCount int64
	db.Model(&SwapRequest{}).Count(&swapCount)
	if swapCount == 0 {
		log.Println("[Seed] Seeding initial SwapRequests...")
		swaps := []SwapRequest{
			{
				ID:               "swap-101",
				CustomerName:     "Chukwuma Reed",
				CustomerPhone:    "+234 803 291 0021",
				CurrentCar:       "2017 Toyota Camry LE (74k mi)",
				CurrentCarImage:  "/images/cars/car13.jpeg",
				AppraisedEquity:  15000000,
				TargetCar:        "2021 Lexus RX 350 F-Sport",
				TargetCarPrice:   38500000,
				PlatformDiscount: 1925000,
				NetTopUp:         21575000,
				Status:           "In Audit",
				ScheduledDate:    "Sep 08, 2026",
				AssignedTech:     "Engr. Tunde Adeleke",
			},
		}
		for _, s := range swaps {
			db.FirstOrCreate(&s, SwapRequest{ID: s.ID})
		}
	}

	// 6. Seed Transactions (Financial Ledger)
	var txnCount int64
	db.Model(&Transaction{}).Count(&txnCount)
	if txnCount == 0 {
		log.Println("[Seed] Seeding initial Transactions...")
		txns := []Transaction{
			{
				ID:        "txn-8091",
				Reference: "CP-TXN-1789001-PAYSTACK",
				UserID:    "dealer-reed-motors",
				UserName:  "Reed Motors Lagos",
				UserEmail: "sales@reedmotors.ng",
				UserRole:  "dealer",
				Type:      "dealer_subscription",
				Title:     "Dealer Subscription (Pro Shop)",
				Amount:    65000,
				Currency:  "NGN",
				Gateway:   "paystack",
				Status:    "settled",
				Notes:     "30-day Pro Showroom Plan activated via Paystack card payment",
			},
			{
				ID:        "txn-8090",
				Reference: "CP-TXN-1789002-ESCROW",
				UserID:    "usr-chidi-nwosu",
				UserName:  "Dr. Chidi Nwosu",
				UserEmail: "chidi.nwosu@gmail.com",
				UserRole:  "buyer",
				Type:      "inspection_escrow",
				Title:     "150-Point Inspection Escrow Deposit",
				Amount:    75000,
				Currency:  "NGN",
				Gateway:   "paystack",
				Status:    "held_in_escrow",
				Notes:     "Held in Carplug Secure Escrow pending technician report verification",
			},
			{
				ID:        "txn-8089",
				Reference: "CP-TXN-1789003-PAYOUT",
				UserID:    "tech-tunde-adeleke",
				UserName:  "Engr. Tunde Adeleke",
				UserEmail: "tunde.mechanic@carplug.ng",
				UserRole:  "technician",
				Type:      "tech_payout",
				Title:     "Technician Inspection Payout Settlement",
				Amount:    35000,
				Currency:  "NGN",
				Gateway:   "bank_transfer",
				Status:    "settled",
				Notes:     "Disbursed to Access Bank • 0123984712 • Babatunde Adeleke",
			},
			{
				ID:        "txn-8088",
				Reference: "CP-TXN-1789004-CROWN",
				UserID:    "dealer-crown-autos",
				UserName:  "Crown Continental Autos",
				UserEmail: "info@crownautos.ng",
				UserRole:  "dealer",
				Type:      "dealer_subscription",
				Title:     "Dealer Subscription (Pro Shop)",
				Amount:    65000,
				Currency:  "NGN",
				Gateway:   "paystack",
				Status:    "settled",
				Notes:     "30-day Pro Showroom Plan activated",
			},
			{
				ID:        "txn-8087",
				Reference: "CP-TXN-1789005-AMINA",
				UserID:    "usr-amina-bello",
				UserName:  "Amina Bello",
				UserEmail: "amina.b@yahoo.com",
				UserRole:  "buyer",
				Type:      "inspection_escrow",
				Title:     "Standard Pre-Purchase Inspection Fee",
				Amount:    45000,
				Currency:  "NGN",
				Gateway:   "paystack",
				Status:    "settled",
				Notes:     "Inspection completed and funds disbursed to technician",
			},
		}
		for _, t := range txns {
			db.FirstOrCreate(&t, Transaction{ID: t.ID})
		}
	}
}
