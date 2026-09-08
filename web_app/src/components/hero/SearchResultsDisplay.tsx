"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarListing } from "@/data/mockCars";
import {
  Heart,
  ArrowUpRight,
  Zap,
  Fuel,
  Settings2,
  CarFront,
  RotateCcw,
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
  filterSummary,
  onClearFilters,
}: SearchResultsDisplayProps) => {
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

  if (results.length === 0) {
    return (
      <div id="search-results" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-10 sm:p-14 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-500">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No vehicles match this specific combination
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Try adjusting your brand, type, or price filters to see available inventory.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-5 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-xl transition shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="search-results" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 tracking-[-0.055em]">
              Search Results
            </h2>
            <span className="inline-block px-3 py-1 text-[11px] font-medium text-white bg-black rounded-full tracking-tight shadow-sm">
              {results.length} found
            </span>
          </div>
          {filterSummary && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Active filter: <span className="font-medium text-gray-800">{filterSummary}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 stroke-[2] transition-transform group-hover:-rotate-45" />
          <span>Clear filters</span>
        </button>
      </div>

      {/* Outer White Card Enclosing the Cars Grid */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
        {/* Vehicles Grid with Tighter Padding/Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
          {results.map((car) => {
            const isFav = !!favorites[car.id];

            return (
              <div
                key={car.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Card Image Area */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={car.image}
                    alt={`${car.name} (${car.year})`}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badge (Fully Rounded Corners) */}
                  {car.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-block px-3 py-1 text-[11px] font-medium text-white bg-[#16a34a] rounded-full tracking-tight shadow-sm">
                        {car.badge}
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
                      {car.name} ({car.year})
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
                        <span className="text-sm sm:text-base text-rose-500 line-through font-medium">
                          ${car.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight">
                        ${car.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href="/buyer/vehicles/v-lexus-rx350-2021"
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
  );
};
