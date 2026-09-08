export interface Vehicle {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType: string;
  condition: "Brand New" | "Foreign Used (Tokunbo)" | "Nigerian Used";
  mileage: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  engineSize: string;
  vin: string;
  price: number;
  marketPriceRange: [number, number];
  priceRating: "fair" | "deal" | "above";
  priceVerdict: string;
  trustTier: 1 | 2 | 3 | 4 | 5; // 1: Listed, 2: Docs Uploaded, 3: Platform Verified, 4: Tech Inspected, 5: Premium Verified
  trustTierLabel: string;
  images: string[];
  publicLocation: string; // e.g., "Lekki Phase 1, Lagos"
  exactLocation?: string; // Hidden until inspection/viewing booked
  sellerId: string;
  sellerType: "dealer" | "private";
  sellerName: string;
  sellerPhone: string; // Masked e.g. +234 803 *** **21
  sellerRating: number;
  customsStatus: "Fully Cleared" | "Clearing in Progress" | "Local Registration";
  documentsAvailable: {
    customsDoc: boolean;
    registrationDoc: boolean;
    roadworthiness: boolean;
    tintPermit?: boolean;
    policeExtracted?: boolean;
  };
  healthScore?: number; // 0 - 100%
  latestInspectionId?: string;
  featured?: boolean;
  dateAdded: string;
}

export interface InspectionReport {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleVin: string;
  buyerId: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar?: string;
  technicianPhone: string;
  technicianTier: "Platform Certified" | "Preferred Master" | "Standard Specialist";
  inspectionTier: "Standard" | "Premium" | "Comprehensive";
  status: "requested" | "assigned" | "in_progress" | "completed";
  scheduledDate: string;
  completedDate?: string;
  overallScore: number; // 0 - 100
  categories: {
    name: string;
    score: number;
    status: "pass" | "warning" | "fail";
    items: { label: string; status: "good" | "fair" | "defect" | "na"; note?: string }[];
  }[];
  technicianSummary: string;
  estimatedRepairCostRange?: [number, number];
  media: {
    type: "image" | "video" | "audio";
    url: string;
    caption: string;
  }[];
}

export interface DealerShop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  banner: string;
  location: string;
  address: string;
  rating: number;
  reviewCount: number;
  verifiedCAC: boolean;
  plan: "Basic Shop" | "Pro Shop" | "Premium Shop";
  activeListingsCount: number;
  phone: string;
  whatsapp: string;
  email: string;
  operatingHours: string;
  joinedDate: string;
}

export interface Technician {
  id: string;
  name: string;
  badge: "Platform Certified" | "Preferred Master" | "Standard Specialist";
  avatar: string;
  rating: number;
  completedJobs: number;
  serviceAreas: string[];
  workshopAddress: string;
  specialties: string[];
  distanceKm?: number;
  availability: "Available Today" | "Next Available Tomorrow" | "Busy";
  hourlyRate: number;
}

export interface Lead {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  type: "inspection_request" | "viewing_schedule" | "direct_inquiry" | "concierge";
  status: "new" | "routed" | "contacted" | "completed" | "cancelled";
  sellerId: string;
  technicianId?: string;
  date: string;
  note?: string;
}

// ==================== MOCK DATA COLLECTIONS ====================

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v-lexus-rx350-2021",
    title: "2021 Lexus RX 350 F-Sport AWD",
    year: 2021,
    make: "Lexus",
    model: "RX 350",
    trim: "F-Sport",
    bodyType: "SUV",
    condition: "Foreign Used (Tokunbo)",
    mileage: 28400,
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "3.5L V6",
    vin: "2T2HZMCA4MC189402",
    price: 34500000,
    marketPriceRange: [32000000, 36000000],
    priceRating: "fair",
    priceVerdict: "Fair market valuation based on verified recent Lekki/Ikeja sales of Tokunbo F-Sport trims.",
    trustTier: 5,
    trustTierLabel: "Premium Verified",
    images: [
      "/images/cars/car15.jpeg",
      "/images/cars/car17.jpeg",
      "/images/cars/car18.jpeg",
    ],
    publicLocation: "Lekki Phase 1, Lagos",
    exactLocation: "Plot 14 Admiralty Way, Lekki",
    sellerId: "dealer-reed-motors",
    sellerType: "dealer",
    sellerName: "Reed Motors Lagos",
    sellerPhone: "+234 803 ••• ••41",
    sellerRating: 4.9,
    customsStatus: "Fully Cleared",
    documentsAvailable: {
      customsDoc: true,
      registrationDoc: true,
      roadworthiness: true,
      tintPermit: true,
      policeExtracted: true,
    },
    healthScore: 92,
    latestInspectionId: "insp-001",
    featured: true,
    dateAdded: "2026-08-28",
  },
  {
    id: "v-toyota-camry-2020",
    title: "2020 Toyota Camry XSE V6 (Panoramic Roof)",
    year: 2020,
    make: "Toyota",
    model: "Camry",
    trim: "XSE V6",
    bodyType: "Sedan",
    condition: "Foreign Used (Tokunbo)",
    mileage: 32400,
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "2.5L 4-Cylinder",
    vin: "4T1B11HK5LU821903",
    price: 24800000,
    marketPriceRange: [25500000, 28000000],
    priceRating: "deal",
    priceVerdict: "Below comparable market range — ₦1.8m lower than average Tokunbo XSE listings.",
    trustTier: 4,
    trustTierLabel: "Technician Inspected",
    images: [
      "/images/cars/car13.jpeg",
      "/images/cars/car16.jpeg",
    ],
    publicLocation: "Ikeja GRA, Lagos",
    exactLocation: "Isaac John Street, Ikeja",
    sellerId: "dealer-crown-autos",
    sellerType: "dealer",
    sellerName: "Crown Continental Autos",
    sellerPhone: "+234 812 ••• ••88",
    sellerRating: 4.7,
    customsStatus: "Fully Cleared",
    documentsAvailable: {
      customsDoc: true,
      registrationDoc: true,
      roadworthiness: true,
    },
    healthScore: 84,
    latestInspectionId: "insp-002",
    featured: true,
    dateAdded: "2026-09-01",
  },
  {
    id: "v-mercedes-gle450-2022",
    title: "2022 Mercedes-Benz GLE 450 4MATIC AMG-Line",
    year: 2022,
    make: "Mercedes-Benz",
    model: "GLE-Class",
    trim: "450 4MATIC",
    bodyType: "SUV",
    condition: "Foreign Used (Tokunbo)",
    mileage: 19800,
    transmission: "Automatic",
    fuelType: "Hybrid",
    engineSize: "3.0L Turbo Inline-6 EQ Boost",
    vin: "4JGDA5JB6NB310492",
    price: 68000000,
    marketPriceRange: [65000000, 71000000],
    priceRating: "fair",
    priceVerdict: "Price aligns with low mileage and documented customs duties cleared at Tin Can port.",
    trustTier: 4,
    trustTierLabel: "Technician Inspected",
    images: [
      "/images/cars/car17.jpeg",
      "/images/cars/car15.jpeg",
    ],
    publicLocation: "Victoria Island, Lagos",
    exactLocation: "Ahmadu Bello Way, VI",
    sellerId: "dealer-reed-motors",
    sellerType: "dealer",
    sellerName: "Reed Motors Lagos",
    sellerPhone: "+234 803 ••• ••41",
    sellerRating: 4.9,
    customsStatus: "Fully Cleared",
    documentsAvailable: {
      customsDoc: true,
      registrationDoc: false,
      roadworthiness: true,
    },
    healthScore: 88,
    latestInspectionId: "insp-003",
    featured: true,
    dateAdded: "2026-09-02",
  },
  {
    id: "v-toyota-corolla-2018",
    title: "2018 Toyota Corolla LE (First Body)",
    year: 2018,
    make: "Toyota",
    model: "Corolla",
    trim: "LE",
    bodyType: "Sedan",
    condition: "Nigerian Used",
    mileage: 82000,
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "1.8L 4-Cylinder",
    vin: "2T1BURHE7JC982103",
    price: 13500000,
    marketPriceRange: [12000000, 14000000],
    priceRating: "fair",
    priceVerdict: "Standard Nigerian-used pricing for single-owner vehicle with factory original paint.",
    trustTier: 3,
    trustTierLabel: "Platform Verified",
    images: [
      "/images/cars/car1.jpeg",
      "/images/cars/car2.jpeg",
    ],
    publicLocation: "Surulere, Lagos",
    sellerId: "seller-babatunde",
    sellerType: "private",
    sellerName: "Babatunde O.",
    sellerPhone: "+234 901 ••• ••33",
    sellerRating: 4.5,
    customsStatus: "Local Registration",
    documentsAvailable: {
      customsDoc: false,
      registrationDoc: true,
      roadworthiness: true,
    },
    healthScore: 78,
    featured: false,
    dateAdded: "2026-08-25",
  },
  {
    id: "v-ford-explorer-2017",
    title: "2017 Ford Explorer Limited 4WD",
    year: 2017,
    make: "Ford",
    model: "Explorer",
    trim: "Limited",
    bodyType: "SUV",
    condition: "Foreign Used (Tokunbo)",
    mileage: 63000,
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "3.5L V6",
    vin: "1FM5K8F84HGA29104",
    price: 18500000,
    marketPriceRange: [16500000, 17800000],
    priceRating: "above",
    priceVerdict: "Listed ₦700k above median. Seller negotiable subject to technician pre-purchase report.",
    trustTier: 2,
    trustTierLabel: "Documents Uploaded",
    images: [
      "/images/cars/car14.jpeg",
      "/images/cars/car3.jpeg",
    ],
    publicLocation: "Garki 2, Abuja",
    sellerId: "seller-emeka",
    sellerType: "private",
    sellerName: "Emeka K.",
    sellerPhone: "+234 802 ••• ••19",
    sellerRating: 4.2,
    customsStatus: "Fully Cleared",
    documentsAvailable: {
      customsDoc: true,
      registrationDoc: false,
      roadworthiness: false,
    },
    featured: false,
    dateAdded: "2026-09-03",
  },
  {
    id: "v-honda-accord-2019",
    title: "2019 Honda Accord Sport 1.5T",
    year: 2019,
    make: "Honda",
    model: "Accord",
    trim: "Sport",
    bodyType: "Sedan",
    condition: "Foreign Used (Tokunbo)",
    mileage: 38900,
    transmission: "Automatic",
    fuelType: "Petrol",
    engineSize: "1.5L Turbo",
    vin: "1HGCP2F87KA109384",
    price: 21500000,
    marketPriceRange: [21000000, 23500000],
    priceRating: "deal",
    priceVerdict: "Attractive valuation for Tokunbo Accord Sport. Clean Carfax verified.",
    trustTier: 5,
    trustTierLabel: "Premium Verified",
    images: [
      "/images/cars/car16.jpeg",
      "/images/cars/car18.jpeg",
    ],
    publicLocation: "Port Harcourt, Rivers",
    sellerId: "dealer-crown-autos",
    sellerType: "dealer",
    sellerName: "Crown Continental Autos",
    sellerPhone: "+234 812 ••• ••88",
    sellerRating: 4.7,
    customsStatus: "Fully Cleared",
    documentsAvailable: {
      customsDoc: true,
      registrationDoc: true,
      roadworthiness: true,
    },
    healthScore: 94,
    latestInspectionId: "insp-004",
    featured: true,
    dateAdded: "2026-09-02",
  }
];

export const MOCK_INSPECTIONS: InspectionReport[] = [
  {
    id: "insp-001",
    vehicleId: "v-lexus-rx350-2021",
    vehicleTitle: "2021 Lexus RX 350 F-Sport AWD",
    vehicleVin: "2T2HZMCA4MC189402",
    buyerId: "user-chidi",
    technicianId: "tech-musa",
    technicianName: "Musa Danladi",
    technicianPhone: "+234 803 555 0192",
    technicianTier: "Preferred Master",
    inspectionTier: "Comprehensive",
    status: "completed",
    scheduledDate: "2026-09-02T10:00:00Z",
    completedDate: "2026-09-02T12:35:00Z",
    overallScore: 92,
    categories: [
      {
        name: "Engine & Powertrain",
        score: 95,
        status: "pass",
        items: [
          { label: "Engine Oil Level & Quality", status: "good", note: "Clean synthetic oil, recent change" },
          { label: "Coolant & Hoses", status: "good" },
          { label: "Transmission Fluid & Shift Response", status: "good", note: "Smooth shift through all 8 gears" },
          { label: "OBD-II Computer Diagnostic", status: "good", note: "Zero active trouble codes" },
          { label: "Engine Mounts", status: "good" },
        ],
      },
      {
        name: "Suspension & Steering",
        score: 85,
        status: "warning",
        items: [
          { label: "Front Lower Control Arm Bushings", status: "fair", note: "Minor hairline cracking, replacement due in ~15,000km" },
          { label: "Shock Absorbers & Struts", status: "good" },
          { label: "Steering Rack & Tie Rods", status: "good" },
          { label: "Wheel Bearings", status: "good" },
        ],
      },
      {
        name: "Brakes & Wheels",
        score: 90,
        status: "pass",
        items: [
          { label: "Front Brake Pads", status: "good", note: "7.5mm remaining (approx 75%)" },
          { label: "Rear Brake Pads", status: "good", note: "6.0mm remaining" },
          { label: "Tire Tread Depth & Age", status: "good", note: "2023 Michelin CrossClimate, 6mm even wear" },
        ],
      },
      {
        name: "Body & Undercarriage",
        score: 96,
        status: "pass",
        items: [
          { label: "Chassis & Frame Rails", status: "good", note: "Original straight rails, zero weld repairs" },
          { label: "Paint Thickness Gauge Scan", status: "good", note: "Factory 4.5 - 5.2 mils on all metal panels" },
          { label: "Undercarriage Rust & Corrosion", status: "good", note: "Dry climate car, clean underbody" },
        ],
      },
      {
        name: "Electrical & AC",
        score: 94,
        status: "pass",
        items: [
          { label: "Air Conditioning Cooling Rate", status: "good", note: "Cools to 6.2°C within 3 minutes" },
          { label: "Infotainment & Touch Controls", status: "good" },
          { label: "Sunroof & Window Regulators", status: "good" },
        ],
      }
    ],
    technicianSummary: "Exceptional specimen. Engine, transmission, and auxiliary systems tested in top quartile. Front lower control arm bushings show slight superficial wear typical of 28k miles on rough roads — budget approximately ₦80k-₦120k for OEM bushings within the next year. Clean title and Tin Can customs docs confirmed genuine.",
    estimatedRepairCostRange: [80000, 140000],
    media: [
      { type: "image", url: "/images/cars/car15.jpeg", caption: "Engine bay top-down view" },
      { type: "image", url: "/images/cars/car16.jpeg", caption: "Undercarriage rail inspection" },
    ],
  },
  {
    id: "insp-002",
    vehicleId: "v-toyota-camry-2020",
    vehicleTitle: "2020 Toyota Camry XSE Panoramic",
    vehicleVin: "4T1B11HK5LU821903",
    buyerId: "user-amina",
    technicianId: "tech-kunle",
    technicianName: "Kunle Adeleke",
    technicianPhone: "+234 813 440 9921",
    technicianTier: "Platform Certified",
    inspectionTier: "Premium",
    status: "completed",
    scheduledDate: "2026-09-01T14:00:00Z",
    completedDate: "2026-09-01T15:45:00Z",
    overallScore: 84,
    categories: [
      {
        name: "Engine & Transmission",
        score: 88,
        status: "pass",
        items: [
          { label: "Engine Diagnostics", status: "good" },
          { label: "Transmission Operation", status: "good" },
        ]
      },
      {
        name: "Suspension & Brakes",
        score: 76,
        status: "warning",
        items: [
          { label: "Front Stabilizer Links", status: "defect", note: "Rattling over speed bumps; needs prompt replacement" },
          { label: "Rear Shocks", status: "fair" },
        ]
      },
      {
        name: "Body & Electronics",
        score: 88,
        status: "pass",
        items: [
          { label: "Panoramic Sunroof Rail", status: "good" },
          { label: "Body Panels", status: "good", note: "Front bumper resprayed cleanly" },
        ]
      }
    ],
    technicianSummary: "Solid mechanical baseline. Front stabilizer bar links require replacement (budget ₦45,000 for pair). Front bumper was resprayed for cosmetic stone chips, but chassis rails and radiator support are 100% factory original.",
    estimatedRepairCostRange: [45000, 75000],
    media: [
      { type: "image", url: "/images/cars/car13.jpeg", caption: "Stabilizer link inspection" }
    ]
  }
];

export const MOCK_SHOPS: DealerShop[] = [
  {
    id: "dealer-reed-motors",
    slug: "reed-motors-lagos",
    name: "Reed Motors Lagos",
    tagline: "Certified Tokunbo & Luxury Vehicles with Independent Trust Scoring",
    logo: "/images/dealer-logo-1.png",
    banner: "/images/cars/hero-car.webp",
    location: "Lekki Phase 1, Lagos",
    address: "Plot 14 Admiralty Way, Lekki Phase 1, Lagos State",
    rating: 4.9,
    reviewCount: 74,
    verifiedCAC: true,
    plan: "Premium Shop",
    activeListingsCount: 18,
    phone: "+234 803 500 4401",
    whatsapp: "+2348035004401",
    email: "sales@reedmotors.ng",
    operatingHours: "Mon - Sat: 8:00 AM - 6:30 PM",
    joinedDate: "January 2026"
  },
  {
    id: "dealer-crown-autos",
    slug: "crown-continental-autos",
    name: "Crown Continental Autos",
    tagline: "Direct US & Canadian Import Specialist Since 2018",
    logo: "/images/dealer-logo-2.png",
    banner: "/images/cars/hero-car.webp",
    location: "Ikeja GRA, Lagos",
    address: "12 Isaac John St, Ikeja GRA, Lagos State",
    rating: 4.7,
    reviewCount: 42,
    verifiedCAC: true,
    plan: "Pro Shop",
    activeListingsCount: 26,
    phone: "+234 812 770 8820",
    whatsapp: "+2348127708820",
    email: "info@crownautos.ng",
    operatingHours: "Mon - Sat: 8:30 AM - 6:00 PM",
    joinedDate: "March 2026"
  }
];

export const MOCK_TECHNICIANS: Technician[] = [
  {
    id: "tech-musa",
    name: "Musa Danladi, ASE-Cert",
    badge: "Preferred Master",
    avatar: "/images/tech-musa.jpg",
    rating: 4.95,
    completedJobs: 218,
    serviceAreas: ["Lekki Phase 1", "Ikoyi", "Victoria Island", "Ajah"],
    workshopAddress: "Block 8 Autocare Center, Maroko, Lekki",
    specialties: ["Toyota / Lexus Hybrid Systems", "Mercedes-Benz Star Diagnostics", "Chassis Structural Laser Scan"],
    distanceKm: 3.2,
    availability: "Available Today",
    hourlyRate: 15000,
  },
  {
    id: "tech-kunle",
    name: "Engr. Kunle Adeleke",
    badge: "Platform Certified",
    avatar: "/images/tech-kunle.jpg",
    rating: 4.82,
    completedJobs: 146,
    serviceAreas: ["Ikeja", "Maryland", "Magodo", "Ogba"],
    workshopAddress: "14 Mobolaji Bank Anthony Way, Ikeja",
    specialties: ["German Powertrains (BMW/Audi)", "Transmission Valve Body Overhauls", "OBD-II Live Telemetry"],
    distanceKm: 6.8,
    availability: "Available Today",
    hourlyRate: 12000,
  },
  {
    id: "tech-emmanuel",
    name: "Emmanuel Chukwu",
    badge: "Standard Specialist",
    avatar: "/images/tech-emmanuel.jpg",
    rating: 4.7,
    completedJobs: 89,
    serviceAreas: ["Surulere", "Yaba", "Gbagada"],
    workshopAddress: "Plot 3 Western Avenue, Surulere",
    specialties: ["Japanese Everyday Daily Drivers", "Suspension & Braking Systems", "Pre-Purchase Document Audit"],
    distanceKm: 11.4,
    availability: "Next Available Tomorrow",
    hourlyRate: 10000,
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead-101",
    buyerName: "Dr. Chidi Nwosu",
    buyerPhone: "+234 803 ••• ••14",
    buyerCity: "Lekki, Lagos",
    vehicleId: "v-lexus-rx350-2021",
    vehicleTitle: "2021 Lexus RX 350 F-Sport AWD",
    vehiclePrice: 34500000,
    type: "inspection_request",
    status: "completed",
    sellerId: "dealer-reed-motors",
    technicianId: "tech-musa",
    date: "2026-09-02",
    note: "Requested Comprehensive inspection tier before booking on-site viewing.",
  },
  {
    id: "lead-102",
    buyerName: "Amina Bello",
    buyerPhone: "+234 812 ••• ••90",
    buyerCity: "Ikeja, Lagos",
    vehicleId: "v-toyota-camry-2020",
    vehicleTitle: "2020 Toyota Camry XSE Panoramic",
    vehiclePrice: 24800000,
    type: "viewing_schedule",
    status: "routed",
    sellerId: "dealer-crown-autos",
    date: "2026-09-03",
    note: "Would like Saturday 11am viewing appointment at Ikeja lot.",
  },
  {
    id: "lead-103",
    buyerName: "Tunde Bakare",
    buyerPhone: "+234 908 ••• ••21",
    buyerCity: "Victoria Island",
    vehicleId: "v-mercedes-gle450-2022",
    vehicleTitle: "2022 Mercedes-Benz GLE 450 4MATIC",
    vehiclePrice: 68000000,
    type: "direct_inquiry",
    status: "new",
    sellerId: "dealer-reed-motors",
    date: "2026-09-04",
    note: "Asking if customs duty can be verified directly at Tin Can command.",
  }
];
