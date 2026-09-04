"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  ShoppingBag,
  Bell,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function GaragePage() {
  const [savedCars, setSavedCars] = useState(MOCK_VEHICLES.slice(0, 3));

  const handleRemove = (id: string) => {
    setSavedCars((prev) => prev.filter((c) => c.id !== id));
  };

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar savedCount={savedCars.length} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/buyer/search" className="hover:text-blue-600">
                Marketplace
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Buyer Garage</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <span>My Garage & Saved Vehicles</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Track price drops, inspection updates, and seller activity on your shortlisted cars
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/compare"
              className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold border border-blue-200 rounded-xl text-xs hover:bg-blue-100 transition"
            >
              Compare All ({savedCars.length})
            </Link>
          </div>
        </div>

        {/* Price Drop Alert Banner */}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                Price Drop Alert: 2020 Toyota Camry XSE
              </div>
              <div className="text-[11px] text-emerald-800">
                Seller reduced asking price by ₦700,000 yesterday.
              </div>
            </div>
          </div>
          <Link
            href="/buyer/vehicles/v-toyota-camry-2020"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View Deal →
          </Link>
        </div>

        {/* Saved Cars Grid */}
        {savedCars.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto mt-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-neutral-900 mb-1">
              Your Garage is Empty
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Save vehicles as you search to receive real-time inspection alerts and price drop notices.
            </p>
            <Link
              href="/buyer/search"
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
            >
              Discover Vehicles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {savedCars.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={car.images[0] || "/images/cars/audi-a4.webp"}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                    </div>
                    <button
                      onClick={() => handleRemove(car.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-red-600 transition"
                      title="Remove from garage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] text-gray-400 font-medium">
                      {car.publicLocation} • {car.condition}
                    </div>
                    <Link
                      href={`/buyer/vehicles/${car.id}`}
                      className="font-bold text-neutral-900 text-base hover:text-blue-600 transition line-clamp-1"
                    >
                      {car.title}
                    </Link>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-lg font-black text-neutral-900">
                        {formatNaira(car.price)}
                      </div>
                      <PriceRatingBadge rating={car.priceRating} size="sm" />
                    </div>

                    {car.healthScore && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-800 font-medium">Inspection Status:</span>
                        <span className="font-bold text-emerald-900">
                          {car.healthScore}% Certified Health
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    href={`/buyer/vehicles/${car.id}`}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-center text-xs font-semibold transition"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/buyer/inspections/book/${car.id}`}
                    className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 rounded-xl text-xs transition"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
