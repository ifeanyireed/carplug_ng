import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_SHOPS, MOCK_VEHICLES } from "@/data/mockStore";
import {
  Store,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Award,
  ChevronRight,
} from "lucide-react";

export default async function PublicShopStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = MOCK_SHOPS.find((s) => s.slug === slug) || MOCK_SHOPS[0];
  const shopVehicles = MOCK_VEHICLES.filter((v) => v.sellerId === shop.id);

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Storefront Hero Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                {shop.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
                    {shop.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CAC Certified</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{shop.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1 font-bold text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{shop.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{shop.reviewCount} customer reviews</span>
                  <span>•</span>
                  <span>Member since {shop.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/buyer/concierge"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
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

        {/* Storefront Active Inventory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              Showroom Inventory ({shopVehicles.length} Vehicles)
            </h2>
            <div className="text-xs text-gray-500">
              Verified by Verza Discovery &amp; Verification Engine
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopVehicles.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-gray-400 font-medium">
                      {car.publicLocation} • {car.condition}
                    </div>
                    <Link
                      href={`/buyer/vehicles/${car.id}`}
                      className="font-bold text-neutral-900 text-sm hover:text-blue-600 transition line-clamp-1"
                    >
                      {car.title}
                    </Link>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="text-base font-extrabold text-neutral-900">
                        {formatNaira(car.price)}
                      </div>
                      <PriceRatingBadge rating={car.priceRating} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/buyer/vehicles/${car.id}`}
                    className="block w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-center text-xs font-semibold transition"
                  >
                    View Vehicle Blueprint
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
