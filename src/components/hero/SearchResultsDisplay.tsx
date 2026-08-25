"use client";

import React from "react";
import Image from "next/image";
import { CarListing } from "@/data/mockCars";
import {
  Heart,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Gauge,
  Fuel,
  SlidersHorizontal,
} from "lucide-react";

interface SearchResultsDisplayProps {
  results: CarListing[];
  totalCount: number;
  filterSummary: string;
  onClearFilters: () => void;
}

export const SearchResultsDisplay = ({
  results,
  totalCount,
  filterSummary,
  onClearFilters,
}: SearchResultsDisplayProps) => {
  if (results.length === 0) {
    return (
      <div className="w-full max-w-[1360px] mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-500">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No vehicles match this specific combination</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Try adjusting your brand, type, or price filters to see available inventory.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="search-results" className="w-full max-w-[1360px] mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
            <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-md font-semibold">
              {results.length} found
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{filterSummary}</p>
        </div>

        <button
          onClick={onClearFilters}
          className="text-xs text-gray-600 hover:text-black font-semibold underline underline-offset-4 transition"
        >
          Clear filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {car.badge && (
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded text-white shadow-sm ${
                        car.badge === "Great Price"
                          ? "bg-emerald-600"
                          : "bg-teal-600"
                      }`}
                    >
                      {car.badge}
                    </span>
                  </div>
                )}

                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white transition"
                  aria-label="Save car"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {car.name} ({car.year})
                </h3>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-gray-400" />
                    {car.fuelType}
                  </span>
                  <span>•</span>
                  <span>{car.transmission}</span>
                  <span>•</span>
                  <span>{car.condition}</span>
                  <span>•</span>
                  <span>{car.type}</span>
                </div>
              </div>
            </div>

            {/* Pricing & CTA Footer */}
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                {car.originalPrice && (
                  <span className="text-xs text-red-500 line-through mr-1.5 font-medium">
                    ${car.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  ${car.price.toLocaleString()}
                </span>
              </div>

              <button className="flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-black group-hover:translate-x-0.5 transition">
                <span>See Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
