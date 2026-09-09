import {
  Vehicle,
  DealerShop,
  Technician,
  InspectionReport,
  Lead,
  MOCK_VEHICLES,
  MOCK_SHOPS,
  MOCK_TECHNICIANS,
  MOCK_INSPECTIONS,
  MOCK_LEADS,
} from "@/data/mockStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper for raw Go models adapter
interface RawVehicle {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType: string;
  condition: Vehicle["condition"];
  mileage: number;
  transmission: Vehicle["transmission"];
  fuelType: Vehicle["fuelType"];
  engineSize?: string;
  vin: string;
  price: number;
  marketPriceMin?: number;
  marketPriceMax?: number;
  marketPriceRange?: [number, number];
  priceRating?: Vehicle["priceRating"];
  priceVerdict?: string;
  trustTier?: 1 | 2 | 3 | 4 | 5;
  trustTierLabel?: string;
  images?: string | string[];
  publicLocation?: string;
  exactLocation?: string;
  sellerId?: string;
  sellerType?: Vehicle["sellerType"];
  sellerName?: string;
  sellerPhone?: string;
  sellerRating?: number;
  customsStatus?: Vehicle["customsStatus"];
  customsDoc?: boolean;
  registrationDoc?: boolean;
  roadworthiness?: boolean;
  tintPermit?: boolean;
  policeExtracted?: boolean;
  documentsAvailable?: Vehicle["documentsAvailable"];
  healthScore?: number;
  latestInspectionId?: string;
  featured?: boolean;
  createdAt?: string;
  dateAdded?: string;
}

interface RawInspectionReport {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleVin: string;
  buyerId: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar?: string;
  technicianPhone: string;
  technicianTier: InspectionReport["technicianTier"];
  inspectionTier: InspectionReport["inspectionTier"];
  status: InspectionReport["status"];
  scheduledDate: string;
  completedDate?: string;
  overallScore: number;
  categories?: string | InspectionReport["categories"];
  technicianSummary: string;
  repairCostMin?: number;
  repairCostMax?: number;
  estimatedRepairCostRange?: [number, number];
  media?: string | InspectionReport["media"];
}

/**
 * Transforms raw backend Vehicle JSON into frontend Vehicle interface
 */
export function adaptVehicle(raw: RawVehicle): Vehicle {
  let images: string[] = [];
  if (typeof raw.images === "string") {
    try {
      const parsed = JSON.parse(raw.images);
      images = Array.isArray(parsed) ? parsed : [raw.images];
    } catch {
      images = [raw.images];
    }
  } else if (Array.isArray(raw.images)) {
    images = raw.images;
  }

  const marketPriceRange: [number, number] = raw.marketPriceRange || [
    raw.marketPriceMin ?? 0,
    raw.marketPriceMax ?? 0,
  ];

  const documentsAvailable = raw.documentsAvailable || {
    customsDoc: Boolean(raw.customsDoc),
    registrationDoc: Boolean(raw.registrationDoc),
    roadworthiness: Boolean(raw.roadworthiness),
    tintPermit: Boolean(raw.tintPermit),
    policeExtracted: Boolean(raw.policeExtracted),
  };

  return {
    id: raw.id,
    title: raw.title,
    year: raw.year,
    make: raw.make,
    model: raw.model,
    trim: raw.trim,
    bodyType: raw.bodyType,
    condition: raw.condition || "Foreign Used (Tokunbo)",
    mileage: raw.mileage,
    transmission: raw.transmission || "Automatic",
    fuelType: raw.fuelType || "Petrol",
    engineSize: raw.engineSize || "",
    vin: raw.vin,
    price: Number(raw.price),
    marketPriceRange,
    priceRating: raw.priceRating || "fair",
    priceVerdict: raw.priceVerdict || "",
    trustTier: (raw.trustTier as Vehicle["trustTier"]) || 3,
    trustTierLabel: raw.trustTierLabel || "Platform Verified",
    images: images.length > 0 ? images : ["/images/cars/car1.jpeg"],
    publicLocation: raw.publicLocation || "Lagos, Nigeria",
    exactLocation: raw.exactLocation,
    sellerId: raw.sellerId || "",
    sellerType: raw.sellerType || "dealer",
    sellerName: raw.sellerName || "Verified Dealer",
    sellerPhone: raw.sellerPhone || "+234 800 000 0000",
    sellerRating: raw.sellerRating ?? 4.8,
    customsStatus: raw.customsStatus || "Fully Cleared",
    documentsAvailable,
    healthScore: raw.healthScore,
    latestInspectionId: raw.latestInspectionId,
    featured: raw.featured,
    dateAdded: raw.dateAdded || raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Transforms raw backend InspectionReport JSON into frontend InspectionReport interface
 */
export function adaptInspectionReport(raw: RawInspectionReport): InspectionReport {
  let categories: InspectionReport["categories"] = [];
  if (typeof raw.categories === "string") {
    try {
      categories = JSON.parse(raw.categories);
    } catch {
      categories = [];
    }
  } else if (Array.isArray(raw.categories)) {
    categories = raw.categories;
  }

  let media: InspectionReport["media"] = [];
  if (typeof raw.media === "string") {
    try {
      media = JSON.parse(raw.media);
    } catch {
      media = [];
    }
  } else if (Array.isArray(raw.media)) {
    media = raw.media;
  }

  const estimatedRepairCostRange: [number, number] | undefined =
    raw.estimatedRepairCostRange ||
    (raw.repairCostMin != null && raw.repairCostMax != null
      ? [raw.repairCostMin, raw.repairCostMax]
      : undefined);

  return {
    id: raw.id,
    vehicleId: raw.vehicleId,
    vehicleTitle: raw.vehicleTitle,
    vehicleVin: raw.vehicleVin,
    buyerId: raw.buyerId,
    technicianId: raw.technicianId,
    technicianName: raw.technicianName,
    technicianAvatar: raw.technicianAvatar,
    technicianPhone: raw.technicianPhone,
    technicianTier: raw.technicianTier || "Platform Certified",
    inspectionTier: raw.inspectionTier || "Standard",
    status: raw.status || "requested",
    scheduledDate: raw.scheduledDate,
    completedDate: raw.completedDate,
    overallScore: raw.overallScore,
    categories,
    technicianSummary: raw.technicianSummary || "",
    estimatedRepairCostRange,
    media,
  };
}

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  condition?: string;
  minTrustTier?: number | string;
  priceRating?: string;
  sortBy?: "featured" | "trust" | "price_asc" | "price_desc" | string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sellerId?: string;
  featured?: boolean;
}

// ==================== API SERVICE METHODS ====================

/**
 * Fetches vehicles from backend API with automatic fallback to mock store.
 */
export async function fetchVehicles(
  params?: VehicleSearchParams
): Promise<Vehicle[]> {
  try {
    const url = new URL(`${API_BASE_URL}/vehicles`);
    if (params) {
      if (params.make) url.searchParams.set("make", params.make);
      if (params.model) url.searchParams.set("model", params.model);
      if (params.condition && params.condition !== "all") {
        url.searchParams.set("condition", params.condition);
      }
      if (params.minTrustTier && params.minTrustTier !== "all") {
        url.searchParams.set("minTrustTier", String(params.minTrustTier));
      }
      if (params.priceRating && params.priceRating !== "all") {
        url.searchParams.set("priceRating", params.priceRating);
      }
      if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
      if (params.minPrice) url.searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice) url.searchParams.set("maxPrice", String(params.maxPrice));
      if (params.q) url.searchParams.set("q", params.q);
      if (params.sellerId) url.searchParams.set("sellerId", params.sellerId);
      if (params.featured) url.searchParams.set("featured", "true");
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const list: RawVehicle[] = json.data || [];
    return list.map(adaptVehicle);
  } catch (err) {
    console.warn("Backend API unavailable, using fallback mock data:", err);
    return MOCK_VEHICLES;
  }
}

/**
 * Fetches a single vehicle by ID.
 */
export async function fetchVehicleById(id: string): Promise<Vehicle | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: RawVehicle = await res.json();
    return adaptVehicle(json);
  } catch {
    return MOCK_VEHICLES.find((v) => v.id === id);
  }
}

/**
 * Fetches dealer shops.
 */
export async function fetchDealers(): Promise<DealerShop[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/dealers`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return MOCK_SHOPS;
  }
}

/**
 * Fetches a dealer shop by slug or ID.
 */
export async function fetchDealerBySlugOrId(
  slugOrId: string
): Promise<DealerShop | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/dealers/${slugOrId}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_SHOPS.find((s) => s.slug === slugOrId || s.id === slugOrId);
  }
}

/**
 * Fetches a dealer's inventory.
 */
export async function fetchDealerInventory(slugOrId: string): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/dealers/${slugOrId}/inventory`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const list: RawVehicle[] = json.data || [];
    return list.map(adaptVehicle);
  } catch {
    return MOCK_VEHICLES.filter((v) => v.sellerId === slugOrId);
  }
}

/**
 * Fetches technicians.
 */
export async function fetchTechnicians(): Promise<Technician[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/technicians`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return MOCK_TECHNICIANS;
  }
}

/**
 * Fetches an inspection report by ID.
 */
export async function fetchInspectionById(
  id: string
): Promise<InspectionReport | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: RawInspectionReport = await res.json();
    return adaptInspectionReport(json);
  } catch {
    return MOCK_INSPECTIONS.find((i) => i.id === id);
  }
}

/**
 * Creates a new lead / inquiry.
 */
export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${API_BASE_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Failed to create lead: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetches platform leads / inquiries.
 */
export async function fetchLeads(params?: {
  sellerId?: string;
  status?: string;
  type?: string;
}): Promise<Lead[]> {
  try {
    const url = new URL(`${API_BASE_URL}/leads`);
    if (params) {
      if (params.sellerId) url.searchParams.set("sellerId", params.sellerId);
      if (params.status) url.searchParams.set("status", params.status);
      if (params.type) url.searchParams.set("type", params.type);
    }
    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return MOCK_LEADS;
  }
}

/**
 * Updates a lead's status.
 */
export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  const res = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update lead status: ${res.statusText}`);
  return await res.json();
}

/**
 * Creates a new vehicle listing.
 */
export async function createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const payload = {
    ...vehicle,
    images: Array.isArray(vehicle.images) ? JSON.stringify(vehicle.images) : vehicle.images,
  };
  const res = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create vehicle: ${res.statusText}`);
  const raw = await res.json();
  return adaptVehicle(raw);
}

/**
 * Updates an existing vehicle listing.
 */
export async function updateVehicle(
  id: string,
  vehicle: Partial<Vehicle>
): Promise<Vehicle> {
  const payload = {
    ...vehicle,
    images: Array.isArray(vehicle.images) ? JSON.stringify(vehicle.images) : vehicle.images,
  };
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update vehicle: ${res.statusText}`);
  const raw = await res.json();
  return adaptVehicle(raw);
}

/**
 * Deletes a vehicle listing.
 */
export async function deleteVehicle(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

/**
 * Creates a new dealer shop profile.
 */
export async function createDealer(dealer: Partial<DealerShop>): Promise<DealerShop> {
  const res = await fetch(`${API_BASE_URL}/dealers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dealer),
  });
  if (!res.ok) throw new Error(`Failed to register dealer: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetches a single technician by ID.
 */
export async function fetchTechnicianById(id: string): Promise<Technician | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/technicians/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_TECHNICIANS.find((t) => t.id === id);
  }
}

/**
 * Fetches inspection reports.
 */
export async function fetchInspections(params?: {
  status?: string;
  buyerId?: string;
  vehicleId?: string;
}): Promise<InspectionReport[]> {
  try {
    const url = new URL(`${API_BASE_URL}/inspections`);
    if (params) {
      if (params.status) url.searchParams.set("status", params.status);
      if (params.buyerId) url.searchParams.set("buyerId", params.buyerId);
      if (params.vehicleId) url.searchParams.set("vehicleId", params.vehicleId);
    }
    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const list: RawInspectionReport[] = json.data || [];
    return list.map(adaptInspectionReport);
  } catch {
    return MOCK_INSPECTIONS;
  }
}

/**
 * Creates an inspection request.
 */
export async function createInspection(
  report: Partial<InspectionReport>
): Promise<InspectionReport> {
  const payload = {
    ...report,
    categories: Array.isArray(report.categories)
      ? JSON.stringify(report.categories)
      : report.categories,
    media: Array.isArray(report.media)
      ? JSON.stringify(report.media)
      : report.media,
  };
  const res = await fetch(`${API_BASE_URL}/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create inspection: ${res.statusText}`);
  const raw = await res.json();
  return adaptInspectionReport(raw);
}

/**
 * Updates an inspection's status.
 */
export async function updateInspectionStatus(
  id: string,
  status: string
): Promise<InspectionReport> {
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update inspection status: ${res.statusText}`);
  const raw = await res.json();
  return adaptInspectionReport(raw);
}

export interface SwapRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  currentCar: string;
  currentCarImage?: string;
  appraisedEquity: number;
  targetCar: string;
  targetCarPrice: number;
  platformDiscount: number;
  netTopUp: number;
  status: string;
  scheduledDate?: string;
  assignedTech?: string;
  createdAt?: string;
}

/**
 * Fetches swap trade-in requests.
 */
export async function fetchSwaps(params?: { status?: string }): Promise<SwapRequest[]> {
  try {
    const url = new URL(`${API_BASE_URL}/swaps`);
    if (params?.status) url.searchParams.set("status", params.status);
    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Submits a new swap application.
 */
export async function createSwap(
  swap: Partial<SwapRequest>
): Promise<SwapRequest> {
  const res = await fetch(`${API_BASE_URL}/swaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(swap),
  });
  if (!res.ok) throw new Error(`Failed to submit swap request: ${res.statusText}`);
  return await res.json();
}

/**
 * Updates a swap request status.
 */
export async function updateSwapStatus(
  id: string,
  status: string
): Promise<SwapRequest> {
  const res = await fetch(`${API_BASE_URL}/swaps/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update swap status: ${res.statusText}`);
  return await res.json();
}

export interface Campaign {
  id: string;
  advertiser: string;
  placement: string;
  creativeImage: string;
  budget: number;
  dates: string;
  impressionsDelivered?: number;
  impressionGoal?: number;
  clicks?: number;
  status: string;
  targetCity?: string;
  createdAt?: string;
}

/**
 * Fetches advertising campaigns.
 */
export async function fetchCampaigns(params?: { status?: string }): Promise<Campaign[]> {
  try {
    const url = new URL(`${API_BASE_URL}/campaigns`);
    if (params?.status) url.searchParams.set("status", params.status);
    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Creates an advertising campaign.
 */
export async function createCampaign(
  campaign: Partial<Campaign>
): Promise<Campaign> {
  const res = await fetch(`${API_BASE_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) throw new Error(`Failed to submit campaign: ${res.statusText}`);
  return await res.json();
}

/**
 * Updates an advertising campaign status.
 */
export async function updateCampaignStatus(
  id: string,
  status: string
): Promise<Campaign> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update campaign status: ${res.statusText}`);
  return await res.json();
}

/**
 * Checks backend health and database connectivity.
 */
export async function fetchHealth(): Promise<{
  status: string;
  database: string;
  uptime: string;
  service: string;
  currentTime: string;
}> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return await res.json();
}

