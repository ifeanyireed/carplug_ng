"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSavedVehicles } from "@/context/SavedVehiclesContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Trash2,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Fuel,
  Settings2,
  CarFront,
  Loader2,
  Lock,
  Heart,
} from "lucide-react";

export default function GaragePage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { savedVehicles, savedCount, isLoading, removeSaved } = useSavedVehicles();

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    await removeSaved(id);
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
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 tracking-[-0.055em]">
              My Garage &amp; Saved Cars
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
            {savedVehicles.length > 0 && (
              <Link
                href="/buyer/compare"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
              >
                <span>Compare All ({savedVehicles.length})</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Unauthenticated View: Prompt to sign in */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Sign In to View Your Saved Cars
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                Only authenticated users can bookmark and sync saved vehicles across all devices. Sign in to review your saved inventory and track inspection statuses.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Sign In to Account
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-neutral-900 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Price Drop Alert Banner */}
            {savedVehicles.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      Real-Time Cloud Synchronization
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      All {savedVehicles.length} saved vehicle(s) synced with your verified {user?.role || "buyer"} profile.
                    </div>
                  </div>
                </div>
                <Link
                  href="/buyer/search"
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <span>Add More</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
                </Link>
              </div>
            )}

            {/* Outer White Card Enclosing Garage Cars */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
              {isLoading ? (
                <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
                  <span className="text-xs font-semibold">Synchronizing your saved vehicles from database...</span>
                </div>
              ) : savedVehicles.length === 0 ? (
                <div className="text-center py-16 px-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Heart className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Your Saved List is Empty
                  </h3>
                  <p className="text-xs text-gray-500 mb-5">
                    Click the heart icon on any vehicle while browsing the marketplace to save it to your garage and track its inspection score.
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
                  {savedVehicles.map((car) => {
                    const badgeText =
                      car.priceRating === "deal"
                        ? "Great Price"
                        : car.trustTier === 5
                        ? "Platform Verified"
                        : "Inspected";
                    const badgeBg = car.trustTier === 5 ? "bg-blue-600" : "bg-[#16a34a]";

                    return (
                      <div
                        key={car.id}
                        className="group bg-white rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col"
                      >
                        {/* Card Image Area */}
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                          <Image
                            src={car.images?.[0] || "/images/cars/car18.jpeg"}
                            alt={`${car.title} (${car.year})`}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Top Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span
                              className={`inline-block px-3 py-1 text-[11px] font-medium text-white ${badgeBg} rounded-full tracking-tight shadow-sm`}
                            >
                              {badgeText}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={(e) => handleRemove(e, car.id)}
                            aria-label="Remove from saved cars"
                            title="Remove from saved cars"
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Car Title & Year */}
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-[-0.04em] group-hover:text-black">
                              {car.title} ({car.year})
                            </h3>

                            {/* Specs Row */}
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
