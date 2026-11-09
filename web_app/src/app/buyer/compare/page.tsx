"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { Vehicle } from "@/data/mockStore";
import { fetchVehicles } from "@/services/api";
import { useCompare, MAX_COMPARE_LIMIT } from "@/context/CompareContext";
import { VehiclePickerModal } from "@/components/compare/VehiclePickerModal";
import {
  X,
  Plus,
  ChevronRight,
  Scale,
  Trash2,
  SlidersHorizontal,
  ArrowRight,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Car,
  Fuel,
  Gauge,
  FileCheck,
  Sparkles,
} from "lucide-react";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    compareIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    setCompareIds,
  } = useCompare();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // 1. Fetch available inventory
  useEffect(() => {
    let isMounted = true;
    fetchVehicles().then((data) => {
      if (isMounted) {
        const list = data || [];
        setVehicles(list);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Parse query parameters (?ids=v1,v2 or ?add=v3)
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    const addParam = searchParams.get("add");

    if (idsParam) {
      const parsedIds = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_COMPARE_LIMIT);
      if (parsedIds.length > 0) {
        setCompareIds(parsedIds);
      }
    } else if (addParam) {
      addToCompare(addParam.trim());
    }
  }, [searchParams, setCompareIds, addToCompare]);

  // Fallback seed: if vehicles loaded and no cars selected in compareIds
  useEffect(() => {
    if (!isLoading && vehicles.length > 0 && compareIds.length === 0) {
      // Pick first 2 verified vehicles as initial showcase
      const initial = vehicles.slice(0, 2).map((v) => v.id);
      setCompareIds(initial);
    }
  }, [isLoading, vehicles, compareIds.length, setCompareIds]);

  // Keep URL updated with active compared IDs
  useEffect(() => {
    if (compareIds.length > 0) {
      const currentQuery = searchParams.get("ids");
      const nextQuery = compareIds.join(",");
      if (currentQuery !== nextQuery) {
        router.replace(`/buyer/compare?ids=${nextQuery}`, { scroll: false });
      }
    }
  }, [compareIds, router, searchParams]);

  const comparedCars = useMemo(() => {
    return compareIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter(Boolean) as Vehicle[];
  }, [compareIds, vehicles]);

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  const handleSelectVehicleFromModal = (vehicleId: string) => {
    addToCompare(vehicleId);
  };

  // Helper to test if a given row values differ across compared cars
  const hasDifference = (extractor: (car: Vehicle) => string | number | undefined) => {
    if (comparedCars.length <= 1) return false;
    const first = extractor(comparedCars[0]);
    return comparedCars.some((car) => extractor(car) !== first);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/buyer/search" className="hover:text-blue-600 transition">
                Marketplace
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-neutral-900">Side-by-Side Comparison</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Vehicle Comparison Matrix
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Evaluating mechanical condition, verified trust tiers, customs clearance, and market pricing for up to 4 vehicles simultaneously.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {comparedCars.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    highlightDifferences
                      ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                  title="Toggle highlight for distinct specifications"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Highlight Differences</span>
                </button>

                <button
                  type="button"
                  onClick={clearCompare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 hover:text-rose-600 border border-gray-200 rounded-xl text-xs font-semibold hover:border-rose-200 transition"
                  title="Remove all cars from comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}

            {comparedCars.length < MAX_COMPARE_LIMIT && (
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle ({comparedCars.length}/{MAX_COMPARE_LIMIT})</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto mt-8 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
          </div>
        ) : comparedCars.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-lg mx-auto mt-8 shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Scale className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neutral-900">
                No vehicles selected for comparison
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Add up to 4 vehicles from our verified Nigerian &amp; Tokunbo inventory to evaluate specs and pricing side-by-side.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Pick From Inventory
              </button>
              <Link
                href="/buyer/search"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-800 rounded-xl text-xs font-bold transition"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          /* Full Comparison Table */
          <div className="mt-8 overflow-x-auto pb-4">
            <div className="inline-block min-w-full align-middle">
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      {/* Metric Name Column Header */}
                      <th className="p-4 sm:p-5 w-44 sm:w-56 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/95 backdrop-blur-xs z-10 border-r border-gray-200">
                        <div className="flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                          <span>Vehicle Spec / Metric</span>
                        </div>
                      </th>

                      {/* Compared Vehicle Columns */}
                      {comparedCars.map((car) => (
                        <th
                          key={car.id}
                          className="p-4 sm:p-5 w-64 sm:w-72 align-top border-r border-gray-100 last:border-r-0 bg-white"
                        >
                          <div className="relative group">
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeFromCompare(car.id)}
                              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                              title={`Remove ${car.title} from compare`}
                              aria-label={`Remove ${car.title}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Hero Image */}
                            <div className="aspect-[16/10] rounded-2xl bg-gray-100 overflow-hidden mb-3 relative border border-gray-100">
                              <Image
                                src={car.images[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679189/carplug/cars/car18.jpg"}
                                alt={car.title}
                                fill
                                sizes="280px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Title & Price */}
                            <h3 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition">
                              {car.title}
                            </h3>
                            <div className="text-xl font-black text-neutral-900 mt-1">
                              {formatNaira(car.price)}
                            </div>

                            {/* Verification & Rating Badges */}
                            <div className="mt-2.5 flex flex-col gap-1.5">
                              <TrustTierBadge tier={car.trustTier} size="sm" />
                              <PriceRatingBadge rating={car.priceRating} size="sm" />
                            </div>
                          </div>
                        </th>
                      ))}

                      {/* Add Slot Column if < 4 vehicles */}
                      {comparedCars.length < MAX_COMPARE_LIMIT && (
                        <th className="p-4 sm:p-5 w-64 sm:w-72 align-top bg-gray-50/40">
                          <button
                            type="button"
                            onClick={() => setIsPickerOpen(true)}
                            className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-gray-300 hover:border-neutral-900 bg-white/60 hover:bg-white flex flex-col items-center justify-center p-6 text-center transition group cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-neutral-900 group-hover:text-white text-gray-500 flex items-center justify-center transition shadow-xs mb-3">
                              <Plus className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="font-bold text-xs text-neutral-900">
                              + Add Another Vehicle
                            </span>
                            <span className="text-[11px] text-gray-400 mt-1">
                              Slot {comparedCars.length + 1} of {MAX_COMPARE_LIMIT} available
                            </span>
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-xs">
                    {/* SECTION: TRUST & VERIFICATION */}
                    <tr className="bg-gray-100/60">
                      <td
                        colSpan={comparedCars.length + (comparedCars.length < MAX_COMPARE_LIMIT ? 2 : 1)}
                        className="py-2.5 px-4 sm:px-5 font-bold text-[11px] text-neutral-900 uppercase tracking-wider"
                      >
                        1. Trust &amp; Certified Inspection
                      </td>
                    </tr>

                    {/* Trust Ladder */}
                    <tr className={highlightDifferences && hasDifference((c) => c.trustTier) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Trust Verification Ladder
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <div className="space-y-1">
                            <span className="font-bold text-neutral-900">
                              {car.trustTierLabel}
                            </span>
                            <div className="text-[11px] text-gray-500">
                              Tier {car.trustTier} of 5 Platforms Standard
                            </div>
                          </div>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Health Score */}
                    <tr className={highlightDifferences && hasDifference((c) => c.healthScore) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Technician Health Score
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          {car.healthScore ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                                <span>{car.healthScore}% Certified</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${car.healthScore}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Pre-inspection pending</span>
                          )}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* SECTION: PRICING & MARKET INTELLIGENCE */}
                    <tr className="bg-gray-100/60">
                      <td
                        colSpan={comparedCars.length + (comparedCars.length < MAX_COMPARE_LIMIT ? 2 : 1)}
                        className="py-2.5 px-4 sm:px-5 font-bold text-[11px] text-neutral-900 uppercase tracking-wider"
                      >
                        2. Market Pricing &amp; Valuation
                      </td>
                    </tr>

                    {/* Asking Price */}
                    <tr className={highlightDifferences && hasDifference((c) => c.price) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Asking Price
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <span className="text-base font-black text-neutral-900">
                            {formatNaira(car.price)}
                          </span>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Market Fair Range */}
                    <tr className={highlightDifferences && hasDifference((c) => c.marketPriceRange?.[0]) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Market Fair Price Range
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 text-gray-700">
                          {car.marketPriceRange ? (
                            <span className="font-medium text-neutral-900">
                              {formatNaira(car.marketPriceRange[0])} &ndash; {formatNaira(car.marketPriceRange[1])}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Price Verdict */}
                    <tr className={highlightDifferences && hasDifference((c) => c.priceRating) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Price Verdict
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <p className="text-[11px] text-gray-600 leading-relaxed italic">
                            &quot;{car.priceVerdict || "Fair transaction benchmark for model year and specification."}&quot;
                          </p>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* SECTION: VEHICLE SPECS & CONDITION */}
                    <tr className="bg-gray-100/60">
                      <td
                        colSpan={comparedCars.length + (comparedCars.length < MAX_COMPARE_LIMIT ? 2 : 1)}
                        className="py-2.5 px-4 sm:px-5 font-bold text-[11px] text-neutral-900 uppercase tracking-wider"
                      >
                        3. Condition, History &amp; Powertrain
                      </td>
                    </tr>

                    {/* Condition */}
                    <tr className={highlightDifferences && hasDifference((c) => c.condition) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Condition Category
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <span className="font-bold text-neutral-900 px-2.5 py-1 bg-gray-100 rounded-lg">
                            {car.condition}
                          </span>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Year & Model */}
                    <tr className={highlightDifferences && hasDifference((c) => c.year) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Year of Manufacture
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 font-medium text-neutral-900">
                          {car.year}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Mileage */}
                    <tr className={highlightDifferences && hasDifference((c) => c.mileage) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Odometer Mileage
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 font-bold text-neutral-900">
                          {car.mileage.toLocaleString()} miles
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Powertrain */}
                    <tr className={highlightDifferences && hasDifference((c) => `${c.engineSize}-${c.transmission}`) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Engine &amp; Transmission
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <div className="font-semibold text-neutral-900">{car.engineSize}</div>
                          <div className="text-[11px] text-gray-500">{car.transmission} &bull; {car.fuelType}</div>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Body Type */}
                    <tr className={highlightDifferences && hasDifference((c) => c.bodyType) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Body Style
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 font-medium text-neutral-900">
                          {car.bodyType}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Customs Clearance */}
                    <tr className={highlightDifferences && hasDifference((c) => c.customsStatus) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Customs Clearance
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{car.customsStatus}</span>
                          </span>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* VIN */}
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        VIN Identifier
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 font-mono text-[11px] text-gray-600">
                          {car.vin ? `${car.vin.slice(0, 8)}••••${car.vin.slice(-4)}` : "Verified Private"}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* SECTION: SELLER & ACTIONS */}
                    <tr className="bg-gray-100/60">
                      <td
                        colSpan={comparedCars.length + (comparedCars.length < MAX_COMPARE_LIMIT ? 2 : 1)}
                        className="py-2.5 px-4 sm:px-5 font-bold text-[11px] text-neutral-900 uppercase tracking-wider"
                      >
                        4. Dealership &amp; Direct Actions
                      </td>
                    </tr>

                    {/* Location */}
                    <tr className={highlightDifferences && hasDifference((c) => c.publicLocation) ? "bg-amber-50/50" : ""}>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Showroom Location
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0 text-neutral-900 font-medium">
                          {car.publicLocation}
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Seller Name */}
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Seller / Dealer
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <span className="font-bold text-neutral-900">{car.sellerName}</span>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            {car.sellerType === "dealer" ? "Verified Dealership" : "Private Individual"}
                          </div>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>

                    {/* Direct Actions */}
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-gray-600 sticky left-0 bg-white z-10 border-r border-gray-200">
                        Action
                      </td>
                      {comparedCars.map((car) => (
                        <td key={car.id} className="p-4 sm:p-5 border-r border-gray-100 last:border-r-0">
                          <div className="space-y-2">
                            <Link
                              href={`/buyer/vehicles/${car.id}`}
                              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-center font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span>View Full Listing</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/buyer/messages/${car.id}`}
                              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-neutral-800 rounded-xl text-center font-semibold text-xs transition block"
                            >
                              Contact Seller
                            </Link>
                          </div>
                        </td>
                      ))}
                      {comparedCars.length < MAX_COMPARE_LIMIT && <td className="bg-gray-50/30" />}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Vehicle Picker Modal */}
      <VehiclePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectVehicle={handleSelectVehicleFromModal}
        alreadyComparedIds={compareIds}
        vehicles={vehicles}
      />

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
          <div className="text-xs text-gray-400 font-medium">Loading comparison matrix...</div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
