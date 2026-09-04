"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  ShoppingBag,
  Trash2,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Fuel,
  Settings2,
  CarFront,
} from "lucide-react";

export default function GaragePage() {
  const [savedCars, setSavedCars] = useState(MOCK_VEHICLES.slice(0, 3));

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedCars((prev) => prev.filter((c) => c.id !== id));
  };

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
      <Navbar savedCount={savedCars.length} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 tracking-[-0.055em]">
              My Garage & Saved Cars
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track real-time inspection updates, price movements, and verified documentation for your shortlisted cars.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/buyer/search"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition tracking-tight group"
            >
              <span>Explore Marketplace</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/buyer/compare"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
            >
              <span>Compare All ({savedCars.length})</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Price Drop Alert Banner */}
        <div className="p-4 sm:p-5 bg-white border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                Price Drop Alert: 2020 Toyota Camry XSE
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Seller reduced asking price by ₦700,000 yesterday.
              </div>
            </div>
          </div>
          <Link
            href="/buyer/vehicles/v-toyota-camry-2020"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>

        {/* Outer White Card Enclosing Garage Cars */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
          {savedCars.length === 0 ? (
            <div className="text-center py-16 px-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Your Garage is Empty
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Save vehicles as you search to receive real-time inspection alerts and price drop notices.
              </p>
              <Link
                href="/buyer/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-medium transition"
              >
                <span>Discover Vehicles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
              {savedCars.map((car) => {
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

                      {/* Remove Button with glassmorphic styling */}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, car.id)}
                        aria-label="Remove from garage"
                        title="Remove from garage"
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
