import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchDealerBySlugOrId, fetchDealerInventory } from "@/services/api";
import { CACVerifiedBadge } from "@/components/dealer/CACVerifiedBadge";
import { DealerWhatsAppButton } from "@/components/dealer/DealerWhatsAppButton";
import { ShopInventoryFilter } from "@/components/dealer/ShopInventoryFilter";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await fetchDealerBySlugOrId(slug);
  if (!shop) {
    return {
      title: "Dealership Showroom",
      description: "Verified dealership showroom on mycarsNg.",
    };
  }

  const title = `${shop.name} - Verified Dealership Showroom`;
  const description =
    shop.tagline ||
    `Explore verified automotive inventory from ${shop.name} in ${shop.location || "Nigeria"}. Verified dealership on mycarsNg.`;
  const ogImage = shop.logo || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679254/carplug/brand/logo.png";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | mycarsNg`,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | mycarsNg`,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicShopStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await fetchDealerBySlugOrId(slug);
  if (!shop) {
    notFound();
  }
  const shopVehicles = (await fetchDealerInventory(shop.id)) || [];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-10">
        {/* Storefront Hero Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                {shop.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                    {shop.name}
                  </h1>
                  <CACVerifiedBadge
                    verifiedCAC={shop.verifiedCAC}
                    cacRegistrationNumber={shop.cacRegistrationNumber}
                    dealerName={shop.name}
                    size="md"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">{shop.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{shop.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{shop.reviewCount} verified reviews</span>
                  <span>•</span>
                  <span>Member since {shop.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <DealerWhatsAppButton
                phone={shop.whatsapp || shop.phone}
                dealerId={shop.id}
                dealerName={shop.name}
                label="Chat on WhatsApp"
                size="md"
              />

              <Link
                href="/buyer/concierge"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
              >
                Inquire With Dealer
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{shop.operatingHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Listings inspected with Trust Badges</span>
            </div>
          </div>
        </div>

        {/* Storefront Active Inventory with In-Store Filtering */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-[-0.055em]">
                Showroom Inventory
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {shopVehicles.length} verified vehicles available on physical lot
              </p>
            </div>

            <div className="text-xs text-gray-500 font-medium hidden sm:block">
              Verified by mycarsNg Inspection Engine
            </div>
          </div>

          {/* Dynamic Filter & Grid Component */}
          <ShopInventoryFilter vehicles={shopVehicles} shop={shop} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
