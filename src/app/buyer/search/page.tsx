"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES, Vehicle } from "@/data/mockStore";
import {
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Fuel,
  Gauge,
  SlidersHorizontal,
  Grid,
  Map as MapIcon,
  Check,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  Award,
} from "lucide-react";

export default function BuyerSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<number | "All">("All");
  const [selectedPriceRating, setSelectedPriceRating] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "trust">("trust");

  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter((car) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          car.title.toLowerCase().includes(q) ||
          car.make.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.publicLocation.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedCondition !== "All" && car.condition !== selectedCondition) {
        return false;
      }

      if (selectedTier !== "All" && car.trustTier < selectedTier) {
        return false;
      }

      if (selectedPriceRating !== "All" && car.priceRating !== selectedPriceRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "trust") return b.trustTier - a.trustTier;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
  }, [searchQuery, selectedCondition, selectedTier, selectedPriceRating, sortBy]);

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      {/* Top Search & Filter Bar */}
      <section className="bg-white border-b border-gray-200 pt-6 pb-5 px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search make, model, trim or location (e.g. Lexus RX 350, Lekki)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "grid"
                    ? "bg-white shadow-xs text-neutral-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <Link
                href="/buyer/map"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "map"
                    ? "bg-white shadow-xs text-neutral-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </Link>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold text-neutral-900 focus:ring-0 cursor-pointer"
              >
                <option value="trust">Sort by: Trust Tier (High to Low)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar Filters + Car Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-72 shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Nigerian Market Filters</span>
              </div>
              <button
                onClick={() => {
                  setSelectedCondition("All");
                  setSelectedTier("All");
                  setSelectedPriceRating("All");
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Reset
              </button>
            </div>

            {/* Minimum Trust Tier Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Minimum Trust Tier
              </label>
              <div className="space-y-1.5">
                {[
                  { value: "All", label: "All Listings" },
                  { value: 3, label: "Tier 3+ Platform Verified" },
                  { value: 4, label: "Tier 4+ Technician Inspected" },
                  { value: 5, label: "Tier 5 Premium Verified" },
                ].map((tier) => (
                  <button
                    key={String(tier.value)}
                    onClick={() => setSelectedTier(tier.value as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
                      selectedTier === tier.value
                        ? "bg-blue-50 text-blue-800 font-semibold border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{tier.label}</span>
                    {selectedTier === tier.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Vehicle Condition
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  "All",
                  "Foreign Used (Tokunbo)",
                  "Nigerian Used",
                  "Brand New",
                ].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-2 rounded-xl text-xs text-left font-medium transition ${
                      selectedCondition === cond
                        ? "bg-neutral-900 text-white font-semibold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Fairness Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Price Intelligence
              </label>
              <div className="space-y-1.5">
                {[
                  { value: "All", label: "All Price Ratings" },
                  { value: "deal", label: "🔥 Great Deal (Below Market)" },
                  { value: "fair", label: "🟢 Fair Market Value" },
                  { value: "above", label: "⚠️ High (Subject to Negotiation)" },
                ].map((rate) => (
                  <button
                    key={rate.value}
                    onClick={() => setSelectedPriceRating(rate.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
                      selectedPriceRating === rate.value
                        ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{rate.label}</span>
                    {selectedPriceRating === rate.value && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Sourcing Concierge Banner */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Can't find your car?</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-[11px]">
                Submit a "Find It For Me" concierge brief. We source and inspect off-market dealer lots for you.
              </p>
              <Link
                href="/buyer/concierge"
                className="inline-block mt-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-center w-full transition"
              >
                Submit Concierge Brief
              </Link>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-neutral-900">
              Verified Vehicles in Nigeria{" "}
              <span className="text-sm font-normal text-gray-500">
                ({filteredVehicles.length} results)
              </span>
            </h1>

            <div className="text-xs text-gray-500">
              Showing Trust-Scored and Customs-Documented listings
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 text-base mb-1">
                No vehicles matched your filters
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Try loosening your minimum trust tier or search query to see more listings.
              </p>
              <button
                onClick={() => {
                  setSelectedCondition("All");
                  setSelectedTier("All");
                  setSelectedPriceRating("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((car) => (
                <div
                  key={car.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
                >
                  {/* Image & Trust Badge Overlay */}
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={car.images[0] || "/images/cars/audi-a4.webp"}
                      alt={car.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        {car.condition}
                      </span>
                    </div>

                    {car.healthScore && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-neutral-900 text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Health: {car.healthScore}%</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{car.publicLocation}</span>
                        <span>•</span>
                        <span>{car.mileage.toLocaleString()} mi</span>
                      </div>

                      <Link
                        href={`/buyer/vehicles/${car.id}`}
                        className="font-bold text-neutral-900 text-sm hover:text-blue-600 transition line-clamp-1"
                      >
                        {car.title}
                      </Link>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div className="text-base font-extrabold text-neutral-900">
                          {formatNaira(car.price)}
                        </div>
                        <PriceRatingBadge rating={car.priceRating} size="sm" />
                      </div>
                    </div>

                    {/* Specs Pills */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-gray-400" />
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-gray-400" />
                        <span>{car.engineSize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{car.transmission}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/buyer/vehicles/${car.id}`}
                        className="flex-1 text-center py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/buyer/inspections/book/${car.id}`}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition"
                        title="Book Inspection"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
