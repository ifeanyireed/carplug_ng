"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_VEHICLES, Vehicle } from "@/data/mockStore";
import {
  ArrowUpRight,
  Heart,
  Zap,
  Fuel,
  Settings2,
  CarFront,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

export default function BuyerSearchPage() {
  const [activeTab, setActiveTab] = useState<"all" | "tokunbo" | "nigerian_used" | "brand_new">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<"all" | "3" | "4" | "5">("all");
  const [selectedPriceRating, setSelectedPriceRating] = useState<"all" | "deal" | "fair">("all");
  const [sortBy, setSortBy] = useState<"featured" | "trust" | "price_asc" | "price_desc">("featured");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const handleFavoriteClick = (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => ({ ...prev, [carId]: !prev[carId] }));
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

  const getCarBadge = (car: Vehicle) => {
    if (car.priceRating === "deal") {
      return { text: "Great Price", bg: "bg-[#16a34a]" };
    }
    if (car.trustTier === 5) {
      return { text: "Platform Verified", bg: "bg-blue-600" };
    }
    if (car.trustTier === 4) {
      return { text: "Inspected", bg: "bg-[#16a34a]" };
    }
    if (car.priceRating === "fair") {
      return { text: "Good Deal", bg: "bg-[#16a34a]" };
    }
    if (car.featured) {
      return { text: "Hot Deal", bg: "bg-rose-600" };
    }
    return null;
  };

  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter((car) => {
      // Condition Tab Filter
      if (activeTab === "tokunbo" && car.condition !== "Foreign Used (Tokunbo)") {
        return false;
      }
      if (activeTab === "nigerian_used" && car.condition !== "Nigerian Used") {
        return false;
      }
      if (activeTab === "brand_new" && car.condition !== "Brand New") {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          car.title.toLowerCase().includes(q) ||
          car.make.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.publicLocation.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Trust Tier Filter
      if (selectedTier !== "all") {
        const minTier = parseInt(selectedTier, 10);
        if (car.trustTier < minTier) return false;
      }

      // Price Rating Filter
      if (selectedPriceRating !== "all" && car.priceRating !== selectedPriceRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "trust") return b.trustTier - a.trustTier;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0; // featured (mock order)
    });
  }, [activeTab, searchQuery, selectedTier, selectedPriceRating, sortBy]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1">
        {/* Section Header (Matches ExploreVehiclesSection) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 tracking-[-0.055em]">
              Explore all vehicles
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verified Nigerian Used & Tokunbo cars with authenticated documentation and certified inspections.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/buyer/compare"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition tracking-tight group"
            >
              <span>Compare Cars</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/buyer/map"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
            >
              <span>Interactive Map</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Outer White Card Enclosing Toggle & Cars Grid */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm space-y-6">
          {/* Category Filter Toggle & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Toggle (Exact #ECEEF2 pill container from ExploreVehiclesSection) */}
            <div className="inline-flex bg-[#ECEEF2] p-1 rounded-xl overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Categories
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tokunbo")}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "tokunbo"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tokunbo (Foreign Used)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nigerian_used")}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "nigerian_used"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Nigerian Used
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("brand_new")}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "brand_new"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Brand New
              </button>
            </div>

            {/* Sleek Search Input */}
            <div className="relative flex-1 lg:max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search make, model, trim or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F7F8FA] border border-gray-200/80 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-400 transition"
              />
            </div>
          </div>

          {/* Secondary Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 text-xs font-medium">Trust Tier:</span>
              <div className="inline-flex bg-[#ECEEF2] p-0.5 rounded-lg">
                {[
                  { id: "all", label: "All Tiers" },
                  { id: "3", label: "Tier 3+ Verified" },
                  { id: "4", label: "Tier 4+ Inspected" },
                  { id: "5", label: "Tier 5 Premium" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id as any)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      selectedTier === t.id
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-gray-400 text-xs font-medium ml-2">Price Rating:</span>
              <div className="inline-flex bg-[#ECEEF2] p-0.5 rounded-lg">
                {[
                  { id: "all", label: "All" },
                  { id: "deal", label: "Great Price" },
                  { id: "fair", label: "Fair Market" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPriceRating(p.id as any)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      selectedPriceRating === p.id
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort selection & Results count */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-medium">
                {filteredVehicles.length} vehicles
              </span>
              <div className="inline-flex items-center gap-1.5 bg-[#ECEEF2] px-3 py-1.5 rounded-lg">
                <SlidersHorizontal className="w-3 h-3 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-medium text-gray-900 focus:ring-0 cursor-pointer p-0 pr-4"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="trust">Sort: Trust Tier</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicles Grid with Tighter Padding/Gap (Exact matching ExploreVehiclesSection) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
            {filteredVehicles.map((car) => {
              const isFav = !!favorites[car.id];
              const badge = getCarBadge(car);

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
                    {badge && (
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`inline-block px-3 py-1 text-[11px] font-medium text-white ${badge.bg} rounded-full tracking-tight shadow-sm`}
                        >
                          {badge.text}
                        </span>
                      </div>
                    )}

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleFavoriteClick(e, car.id)}
                      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition active:scale-90"
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          isFav ? "fill-rose-500 text-rose-500" : "text-white"
                        }`}
                      />
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

                    {/* Pricing & CTA Divider (Same font size & medium weight for prices, larger See Details icon) */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        {car.marketPriceRange && (
                          <span className="text-sm sm:text-base text-rose-500 line-through font-medium">
                            ₦{(car.marketPriceRange[1] / 1000000).toFixed(1)}M
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight">
                          ₦{(car.price / 1000000).toFixed(1)}M
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

            {filteredVehicles.length === 0 && (
              <div className="col-span-full text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No vehicles found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  We couldn't find any vehicles matching your current criteria. Try resetting your filters.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedTier("all");
                    setSelectedPriceRating("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-medium transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
