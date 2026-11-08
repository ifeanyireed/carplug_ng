"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarListing } from "@/data/mockCars";
import {
  SearchFilterState,
  BRANDS,
  TYPES,
  MODELS,
  PRICE_RANGES,
} from "./HeroSearchBox";
import { SaveVehicleButton } from "@/components/common/SaveVehicleButton";
import {
  ArrowUpRight,
  ArrowUp,
  Zap,
  Fuel,
  Settings2,
  CarFront,
  RotateCcw,
  SlidersHorizontal,
  X,
  Sliders,
  ChevronDown,
} from "lucide-react";

export interface SearchResultsDisplayProps {
  results: CarListing[];
  totalCount: number;
  filterSummary: string;
  activeFilters: SearchFilterState | null;
  selectedBrand: string | null;
  selectedType: string | null;
  sortBy: string;
  onClearFilters: () => void;
  onRemoveBrand: () => void;
  onRemoveType: () => void;
  onRemoveModel: () => void;
  onRemovePrice: () => void;
  onRemoveCategory: () => void;
  onRemoveOption: (optionKey: keyof SearchFilterState["options"]) => void;
  onSelectCategoryTab: (cat: SearchFilterState["category"]) => void;
  onSortChange: (sort: string) => void;
  onScrollToHero: () => void;
  onChangeBrand: (brand: string) => void;
  onChangeType: (type: string) => void;
  onChangeModel: (model: string) => void;
  onChangePrice: (price: string) => void;
}

const CATEGORY_TABS: { label: string; value: SearchFilterState["category"] }[] = [
  { label: "All Vehicles", value: "all" },
  { label: "Brand New", value: "new" },
  { label: "Tokunbo", value: "tokunbo" },
  { label: "Nigerian Used", value: "nigerian_used" },
  { label: "Used Cars", value: "used" },
];

export const SearchResultsDisplay = ({
  results,
  totalCount,
  filterSummary,
  activeFilters,
  selectedBrand,
  selectedType,
  sortBy,
  onClearFilters,
  onRemoveBrand,
  onRemoveType,
  onRemoveModel,
  onRemovePrice,
  onRemoveCategory,
  onRemoveOption,
  onSelectCategoryTab,
  onSortChange,
  onScrollToHero,
  onChangeBrand,
  onChangeType,
  onChangeModel,
  onChangePrice,
}: SearchResultsDisplayProps) => {
  const [showStickyCapsule, setShowStickyCapsule] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const resultsEl = document.getElementById("search-results");
      if (!resultsEl) return;
      const rect = resultsEl.getBoundingClientRect();
      if (rect.top < -120 && rect.bottom > 220) {
        setShowStickyCapsule(true);
      } else {
        setShowStickyCapsule(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getFuelIcon = (type: string) => {
    switch (type) {
      case "Electric":
      case "Hybrid":
        return <Zap className="w-3.5 h-3.5 text-black stroke-[2]" />;
      default:
        return <Fuel className="w-3.5 h-3.5 text-black stroke-[2]" />;
    }
  };

  const effectiveBrand =
    selectedBrand ||
    (activeFilters?.brand && activeFilters.brand !== "All Brands" && activeFilters.brand !== "All"
      ? activeFilters.brand
      : null);

  const effectiveType =
    selectedType ||
    (activeFilters?.type && activeFilters.type !== "All Types" && activeFilters.type !== "All"
      ? activeFilters.type
      : null);

  const currentBrand = effectiveBrand || "All Brands";
  const currentType = effectiveType || "All Types";
  const currentModel = activeFilters?.model || "All Models";
  const currentPrice = activeFilters?.price || "Any Price";
  const currentCategory = activeFilters?.category || "all";

  const availableModels = (currentBrand && MODELS[currentBrand]) ? MODELS[currentBrand] : ["All Models"];

  // Build list of active filter chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (effectiveBrand) {
    activeChips.push({
      id: "brand",
      label: `Make: ${effectiveBrand}`,
      onRemove: onRemoveBrand,
    });
  }

  if (effectiveType) {
    activeChips.push({
      id: "type",
      label: `Type: ${effectiveType}`,
      onRemove: onRemoveType,
    });
  }

  if (activeFilters?.model && activeFilters.model !== "All Models" && activeFilters.model !== "All") {
    activeChips.push({
      id: "model",
      label: `Model: ${activeFilters.model}`,
      onRemove: onRemoveModel,
    });
  }

  if (activeFilters?.price && activeFilters.price !== "Any Price") {
    activeChips.push({
      id: "price",
      label: `Budget: ${activeFilters.price}`,
      onRemove: onRemovePrice,
    });
  }

  if (activeFilters?.category && activeFilters.category !== "all") {
    const catLabels: Record<string, string> = {
      new: "Brand New",
      used: "Used",
      tokunbo: "Tokunbo",
      nigerian_used: "Nigerian Used",
    };
    activeChips.push({
      id: "category",
      label: `Condition: ${catLabels[activeFilters.category] || activeFilters.category}`,
      onRemove: onRemoveCategory,
    });
  }

  if (activeFilters?.options?.hotDeals) {
    activeChips.push({
      id: "hotDeals",
      label: "Hot Deals",
      onRemove: () => onRemoveOption("hotDeals"),
    });
  }
  if (activeFilters?.options?.videoAds) {
    activeChips.push({
      id: "videoAds",
      label: "Video Ads",
      onRemove: () => onRemoveOption("videoAds"),
    });
  }
  if (activeFilters?.options?.trustedDealers) {
    activeChips.push({
      id: "trustedDealers",
      label: "Trusted Dealers",
      onRemove: () => onRemoveOption("trustedDealers"),
    });
  }
  if (activeFilters?.options?.rojoCertified) {
    activeChips.push({
      id: "rojoCertified",
      label: "mycarsNg Certified",
      onRemove: () => onRemoveOption("rojoCertified"),
    });
  }
  if (activeFilters?.options?.warranty) {
    activeChips.push({
      id: "warranty",
      label: "Warranty",
      onRemove: () => onRemoveOption("warranty"),
    });
  }

  return (
    <section id="search-results" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-28">
      {/* Section Header with Proximity Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-[-0.04em]">
              Search Results
            </h2>
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-black rounded-full tracking-tight shadow-xs">
              {results.length} found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {filterSummary ? (
              <>
                Active filters: <span className="font-medium text-gray-800">{filterSummary}</span>
              </>
            ) : (
              `Showing available vehicles matching your criteria (${totalCount} in stock)`
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          {/* Refine in Hero Button */}
          <button
            type="button"
            onClick={onScrollToHero}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium transition shadow-2xs group cursor-pointer"
            title="Scroll up to adjust all search inputs in the Hero banner"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover:-translate-y-0.5" />
            <span>Hero Filter</span>
          </button>

          {/* Full Catalog Link */}
          <Link
            href="/buyer/search"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium transition shadow-xs"
          >
            <span>Full Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-black transition tracking-tight group cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover:-rotate-45" />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Complete Proximity Refinement Strip: Condition Tabs + Brand, Type, Model, Price Range Dropdowns + Sort */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 mb-5 shadow-sm space-y-4">
        
        {/* Row 1: Condition Tabs & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
          {/* Quick Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-semibold text-gray-500 mr-1 shrink-0">Condition:</span>
            {CATEGORY_TABS.map((tab) => {
              const isActive = currentCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onSelectCategoryTab(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-black text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200/70 text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Sliders className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-medium bg-gray-50 hover:bg-gray-100/90 text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer transition"
            >
              <option value="featured">Featured Deals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest</option>
            </select>
          </div>
        </div>

        {/* Row 2: Brand Name, Body Type, Model, and Price Range Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Brand Name / Make Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Brand / Make
            </label>
            <div className="relative">
              <select
                value={currentBrand}
                onChange={(e) => onChangeBrand(e.target.value)}
                className="w-full text-xs font-medium bg-gray-50/90 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black cursor-pointer transition shadow-2xs truncate"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Body Type Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Body Type
            </label>
            <div className="relative">
              <select
                value={currentType}
                onChange={(e) => onChangeType(e.target.value)}
                className="w-full text-xs font-medium bg-gray-50/90 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black cursor-pointer transition shadow-2xs truncate"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Model Selector (Dynamic based on selected brand) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Model
            </label>
            <div className="relative">
              <select
                value={currentModel}
                onChange={(e) => onChangeModel(e.target.value)}
                className="w-full text-xs font-medium bg-gray-50/90 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black cursor-pointer transition shadow-2xs truncate"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Price Range
            </label>
            <div className="relative">
              <select
                value={currentPrice}
                onChange={(e) => onChangePrice(e.target.value)}
                className="w-full text-xs font-medium bg-gray-50/90 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black cursor-pointer transition shadow-2xs truncate"
              >
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

      </div>

      {/* Active Filter Chips with Individual ✕ Removal */}
      {activeChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mr-1">
            Active filters:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200/80 text-gray-800 border border-gray-200/60 transition group"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="w-3.5 h-3.5 rounded-full hover:bg-gray-300/80 flex items-center justify-center transition cursor-pointer text-gray-500 hover:text-black"
                title={`Remove ${chip.label}`}
              >
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-black font-medium underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Zero Results State */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-500">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No vehicles match this specific combination
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Try adjusting the Make, Type, Model, or Budget dropdowns above, or reset filters to see all cars.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onScrollToHero}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Refine in Hero
            </button>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-xl transition shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Outer White Card Enclosing the Cars Grid */
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 lg:p-7 shadow-sm">
          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {results.map((car) => {
              return (
                <div
                  key={car.id}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Card Image Area */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    <Image
                      src={car.image}
                      alt={`${car.name} (${car.year})`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badge */}
                    {car.badge && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-block px-3 py-1 text-[11px] font-medium text-white bg-[#16a34a] rounded-full tracking-tight shadow-sm">
                          {car.badge}
                        </span>
                      </div>
                    )}

                    {/* Favorite Heart Button */}
                    <SaveVehicleButton vehicle={car} />

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
                        {car.name} ({car.year})
                      </h3>

                      {/* Specs Pill Row */}
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
                          <span className="text-black">{car.condition}</span>
                        </div>
                        <span className="text-gray-300 font-normal">•</span>
                        <span className="text-black">{car.type}</span>
                      </div>
                    </div>

                    {/* Pricing & CTA Divider */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        {car.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                            ₦{car.originalPrice.toLocaleString("en-US")}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                          ₦{car.price.toLocaleString("en-US")}
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
      )}

      {/* Floating Sticky Proximity Capsule (Appears on deep scroll) */}
      {showStickyCapsule && (
        <aside
          aria-label="Search filter quick actions"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 text-white backdrop-blur-xl border border-white/20 px-4 sm:px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 sm:gap-4 transition-all duration-300"
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{results.length} found</span>
          </div>
          <div className="h-3.5 w-px bg-white/20" />
          <button
            type="button"
            onClick={onScrollToHero}
            className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white font-medium transition cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Hero Filter</span>
          </button>
          <div className="h-3.5 w-px bg-white/20" />
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition cursor-pointer"
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </aside>
      )}
    </section>
  );
};
