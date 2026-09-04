import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_SHOPS, MOCK_VEHICLES } from "@/data/mockStore";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowUpRight,
  Heart,
  Zap,
  Fuel,
  Settings2,
  CarFront,
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

  const getFuelIcon = (type: string) => {
    switch (type) {
      case "Electric":
      case "Hybrid":
        return <Zap className="w-3.5 h-3.5 text-black stroke-[2]" />;
      default:
        return <Fuel className="w-3.5 h-3.5 text-black stroke-[2]" />;
    }
  };

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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                    {shop.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CAC Certified</span>
                  </span>
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

            <div className="flex items-center gap-3">
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

        {/* Storefront Active Inventory with Explore Vehicles styling */}
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

            <div className="text-xs text-gray-500 font-medium">
              Verified by Verza Inspection Engine
            </div>
          </div>

          {/* Outer White Card Enclosing Grid */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
              {shopVehicles.map((car) => {
                const badgeText = car.priceRating === "deal" ? "Great Price" : car.trustTier === 5 ? "Platform Verified" : "Inspected";
                const badgeBg = car.trustTier === 5 ? "bg-blue-600" : "bg-[#16a34a]";

                return (
                  <div
                    key={car.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Card Image Area */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                      <Image
                        src={car.images[0] || "/images/cars/car18.jpeg"}
                        alt={`${car.title} (${car.year})`}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badge (Fully Rounded Corners) */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`inline-block px-3 py-1 text-[11px] font-medium text-white ${badgeBg} rounded-full tracking-tight shadow-sm`}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Favorite Heart Button */}
                      <button
                        type="button"
                        aria-label="Add to favorites"
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition active:scale-90"
                      >
                        <Heart className="w-4 h-4 text-white" />
                      </button>

                      {/* Carousel Pagination Dots */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Car Title & Year */}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-[-0.04em] group-hover:text-black">
                          {car.title} ({car.year})
                        </h3>

                        {/* Specs Pill Row (Black color and font-medium) */}
                        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 text-xs sm:text-[13px] font-medium text-black">
                          <div className="flex items-center gap-1 text-black">
                            {getFuelIcon(car.fuelType)}
                            <span className="text-black">{car.fuelType}</span>
                          </div>
                          <span className="text-gray-300 font-normal">•</span>
                          <div className="flex items-center gap-1 text-black">
                            <Settings2 className="w-3.5 h-3.5 text-black stroke-[2]" />
                            <span className="text-black">{car.transmission}</span>
                          </div>
                          <span className="text-gray-300 font-normal">•</span>
                          <div className="flex items-center gap-1 text-black">
                            <CarFront className="w-3.5 h-3.5 text-black stroke-[2]" />
                            <span className="text-black">
                              {car.condition === "Foreign Used (Tokunbo)" ? "Tokunbo" : car.condition}
                            </span>
                          </div>
                          <span className="text-gray-300 font-normal">•</span>
                          <span className="text-black">{car.bodyType}</span>
                        </div>
                      </div>

                      {/* Pricing & CTA Divider */}
                      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          {car.marketPriceRange && (
                            <span className="text-sm sm:text-base text-rose-500 line-through font-medium">
                              ₦{(car.marketPriceRange[1] / 1000000).toFixed(1)}M
                            </span>
                          )}
                          <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight">
                            {formatNaira(car.price)}
                          </span>
                        </div>

                        <Link
                          href={`/buyer/vehicles/${car.id}`}
                          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black transition"
                        >
                          <span>See Details</span>
                          <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
