"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Vehicle } from "@/data/mockStore";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { Search, X, Plus, Check, SlidersHorizontal } from "lucide-react";

interface VehiclePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicleId: string) => void;
  alreadyComparedIds: string[];
  vehicles: Vehicle[];
}

export function VehiclePickerModal({
  isOpen,
  onClose,
  onSelectVehicle,
  alreadyComparedIds,
  vehicles,
}: VehiclePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>("all");

  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => !alreadyComparedIds.includes(v.id));
  }, [vehicles, alreadyComparedIds]);

  const filteredVehicles = useMemo(() => {
    let result = availableVehicles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.trim?.toLowerCase().includes(q) ||
          v.bodyType?.toLowerCase().includes(q)
      );
    }

    if (conditionFilter !== "all") {
      result = result.filter((v) => v.condition === conditionFilter);
    }

    if (bodyTypeFilter !== "all") {
      result = result.filter((v) => v.bodyType === bodyTypeFilter);
    }

    return result;
  }, [availableVehicles, searchQuery, conditionFilter, bodyTypeFilter]);

  if (!isOpen) return null;

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Select Vehicle to Compare
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose an available car from the live inventory to view side-by-side specs
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
            aria-label="Close vehicle selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, trim (e.g. Mercedes C300, Porsche, Corolla)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Filter:
            </span>
            <button
              onClick={() => {
                setConditionFilter("all");
                setBodyTypeFilter("all");
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                conditionFilter === "all" && bodyTypeFilter === "all"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Available ({availableVehicles.length})
            </button>
            <button
              onClick={() => setConditionFilter(conditionFilter === "Foreign Used (Tokunbo)" ? "all" : "Foreign Used (Tokunbo)")}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                conditionFilter === "Foreign Used (Tokunbo)"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tokunbo
            </button>
            <button
              onClick={() => setConditionFilter(conditionFilter === "Brand New" ? "all" : "Brand New")}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                conditionFilter === "Brand New"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Brand New
            </button>
            <button
              onClick={() => setConditionFilter(conditionFilter === "Nigerian Used" ? "all" : "Nigerian Used")}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                conditionFilter === "Nigerian Used"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Nigerian Used
            </button>
            <button
              onClick={() => setBodyTypeFilter(bodyTypeFilter === "SUV" ? "all" : "SUV")}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                bodyTypeFilter === "SUV"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              SUV
            </button>
            <button
              onClick={() => setBodyTypeFilter(bodyTypeFilter === "Sedan" ? "all" : "Sedan")}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                bodyTypeFilter === "Sedan"
                  ? "bg-neutral-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sedan
            </button>
          </div>
        </div>

        {/* Vehicles List Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-gray-100">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-semibold text-gray-700">No matching vehicles found</p>
              <p className="text-xs text-gray-400">
                Try loosening your search terms or clearing the condition filters.
              </p>
            </div>
          ) : (
            filteredVehicles.map((car) => (
              <div
                key={car.id}
                onClick={() => {
                  onSelectVehicle(car.id);
                  onClose();
                }}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3.5 hover:bg-gray-50/80 rounded-2xl px-2 sm:px-3 -mx-2 sm:-mx-3 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-18 h-14 sm:w-20 sm:h-15 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80">
                    <Image
                      src={car.images[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679189/carplug/cars/car18.jpg"}
                      alt={car.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 truncate group-hover:text-blue-600 transition">
                      {car.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">
                        {formatNaira(car.price)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-500 font-medium">{car.condition}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-500">{car.mileage.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                      <PriceRatingBadge rating={car.priceRating} size="sm" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVehicle(car.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>{filteredVehicles.length} of {availableVehicles.length} available cars</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-neutral-800 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
