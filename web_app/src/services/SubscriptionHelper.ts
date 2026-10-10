export interface SubscriptionTier {
  id: "starter" | "basic" | "pro" | "premium";
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  listingsLimit: number;
  popular?: boolean;
  badge?: string;
  features: string[];
  restrictions?: string[];
  ctaText: string;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    id: "starter",
    name: "Starter Showroom",
    tagline: "Ideal for new dealers establishing their digital presence.",
    priceMonthly: 0,
    priceAnnual: 0,
    listingsLimit: 3,
    features: [
      "Up to 3 active vehicle listings",
      "Official CAC Verified Dealership badge upon review",
      "Dedicated public storefront URL (mycars.ng/shops/[slug])",
      "Direct WhatsApp buyer lead forwarding",
      "Standard marketplace search placement",
      "Basic inventory & viewing analytics",
    ],
    restrictions: [
      "No priority search placement",
      "Limited to 3 live vehicles",
    ],
    ctaText: "Get Started Free",
  },
  basic: {
    id: "basic",
    name: "Basic Shop",
    tagline: "Great for boutique car dealers and growing auto lots.",
    priceMonthly: 25000,
    priceAnnual: 240000, // 20k/mo equivalent (20% off)
    listingsLimit: 15,
    features: [
      "Up to 15 active vehicle listings",
      "Verified showroom showcase page",
      "Inbound buyer inquiries routed to lead inbox",
      "Custom dealership logo & banner branding",
      "Standard search & browse visibility",
      "Weekly performance summary telemetry",
    ],
    ctaText: "Upgrade to Basic",
  },
  pro: {
    id: "pro",
    name: "Pro Shop",
    tagline: "For active dealerships looking to dominate local car searches.",
    priceMonthly: 65000,
    priceAnnual: 624000, // 52k/mo equivalent (20% off)
    listingsLimit: 60,
    popular: true,
    badge: "Most Popular",
    features: [
      "Up to 60 active vehicle listings",
      "Priority top placement in search results & district maps",
      "Trade-in & Car Swap deal notifications in your area",
      "10% discount on 150-point certified vehicle inspection packs",
      "Comprehensive CRM lead telemetry & call tracking",
      "Direct concierge buyer referrals",
      "Dedicated account phone & WhatsApp support",
    ],
    ctaText: "Choose Pro Shop",
  },
  premium: {
    id: "premium",
    name: "Premium / Enterprise Hub",
    tagline: "Unlimited power for high-volume automotive franchises & multi-lots.",
    priceMonthly: 150000,
    priceAnnual: 1440000, // 120k/mo equivalent (20% off)
    listingsLimit: 9999, // Unlimited
    badge: "Maximum Visibility",
    features: [
      "Unlimited active vehicle listings",
      "Featured homepage showroom spotlight & carousel banners",
      "Exclusive concierge buyer VIP dispatch priority",
      "25% bulk discount on certified inspection packs",
      "Multi-branch & team member manager access",
      "Custom promotions and seasonal social media spotlight",
      "Dedicated personal account manager",
    ],
    ctaText: "Scale with Premium",
  },
};

/**
 * Normalizes any string or database plan value into a canonical tier ID.
 */
export function normalizePlanKey(plan?: string | null): "starter" | "basic" | "pro" | "premium" {
  if (!plan) return "starter";
  const p = plan.toLowerCase().trim();
  if (p.includes("free") || p.includes("starter")) return "starter";
  if (p.includes("basic")) return "basic";
  if (p.includes("premium") || p.includes("enterprise") || p.includes("unlimited")) return "premium";
  if (p.includes("pro")) return "pro";
  return "starter";
}

/**
 * Centrally retrieves subscription tier details, overriding outdated database values.
 */
export function getSubscriptionTier(plan?: string | null): SubscriptionTier {
  const key = normalizePlanKey(plan);
  return SUBSCRIPTION_TIERS[key] || SUBSCRIPTION_TIERS.starter;
}

/**
 * Centrally gets listing limit for a given plan.
 */
export function getTierLimit(plan?: string | null): number {
  return getSubscriptionTier(plan).listingsLimit;
}

/**
 * Checks if a dealership can add another vehicle given their current active count.
 */
export function canAddVehicle(currentCount: number, plan?: string | null): boolean {
  const limit = getTierLimit(plan);
  return currentCount < limit;
}

/**
 * Returns formatted pricing for display.
 */
export function formatNairaPrice(amount: number): string {
  if (amount === 0) return "Free";
  return `₦${amount.toLocaleString()}`;
}
