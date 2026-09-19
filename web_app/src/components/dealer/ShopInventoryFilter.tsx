"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/data/mockStore";
import { DealerShop } from "@/data/mockStore";
import { SaveVehicleButton } from "@/components/common/SaveVehicleButton";
import { DealerWhatsAppButton } from "@/components/dealer/DealerWhatsAppButton";
import {
  Zap,
  Fuel,
  Settings2,
  CarFront,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

interface ShopInventoryFilterProps {
  vehicles: Vehicle[];
  shop: DealerShop;
}

const BODY_TYPES = ["All", "SUV", "Sedan", "Coupe", "Truck"];
const CONDITIONS = ["All", "Brand New", "Foreign Used", "Nigerian Used"];

export const ShopInventoryFilter: React.FC<ShopInventoryFilterProps> = ({
  vehicles,
  shop,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "year_desc">("featured");

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

  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.make?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.year.toString().includes(q) ||
          v.bodyType?.toLowerCase().includes(q)
      );
    }

    // Body type filter
    if (selectedBodyType !== "All") {
      list = list.filter((v) =>
        v.bodyType?.toLowerCase().includes(selectedBodyType.toLowerCase())
      );
    }

    // Condition filter
    if (selectedCondition !== "All") {
      list = list.filter((v) => {
        const cond = (v.condition || "").toLowerCase();
        if (selectedCondition === "Foreign Used") {
          return cond.includes("foreign") || cond.includes("tokunbo");
        }
        if (selectedCondition === "Nigerian Used") {
          return cond.includes("nigerian");
        }
        if (selectedCondition === "Brand New") {
          return cond.includes("brand new") || cond.includes("new");
        }
        return true;
      });
    }

    // Sorting
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "year_desc") {
      list.sort((a, b) => b.year - a.year);
    }

    return list;
  }, [vehicles, searchTerm, selectedBodyType, selectedCondition, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedBodyType !== "All" ||
    selectedCondition !== "All" ||
    sortBy !== "featured";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBodyType("All");
    setSelectedCondition("All");
    setSortBy("featured");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* In-store Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${shop.name} inventory...`}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>

          {/* Sort & Reset Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-gray-900 focus:outline-hidden cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Year: Newest</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-gray-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Body Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-gray-400 font-medium mr-1 shrink-0">Body:</span>
            {BODY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedBodyType(type)}
                className={`px-3 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
                  selectedBodyType === type
                    ? "bg-neutral-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Condition Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-gray-400 font-medium mr-1 shrink-0">Condition:</span>
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => setSelectedCondition(cond)}
                className={`px-3 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
                  selectedCondition === cond
                    ? "bg-neutral-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Count Banner */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{filteredVehicles.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{vehicles.length}</span> vehicles on physical lot
        </div>
        {hasActiveFilters && (
          <span className="text-emerald-600 font-medium">Filters active</span>
        )}
      </div>

      {/* Vehicles Grid */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-3">
            <CarFront className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="font-bold text-base text-gray-900">No Vehicles Match Criteria</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No active listings in {shop.name}&apos;s lot match your current search or filter criteria.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition mt-2 cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4.5">
            {filteredVehicles.map((car) => {
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
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Card Image Area */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    <Image
                      src={
                        car.images[0] ||
                        "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679189/carplug/cars/car18.jpg"
                      }
                      alt={`${car.title} (${car.year})`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[11px] font-medium text-white ${badgeBg} rounded-full tracking-tight shadow-sm`}
                      >
                        {badgeText}
                      </span>
                    </div>

                    {/* Save Vehicle Heart Button */}
                    <SaveVehicleButton vehicle={car} />

                    {/* Bottom Indicator Dots */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Car Title & Year */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {car.title} ({car.year})
                      </h3>

                      {/* Specs Pill Row */}
                      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 text-xs font-medium text-black">
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

                    {/* Pricing & Fast Actions */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          {car.marketPriceRange && (
                            <span className="text-xs sm:text-sm text-rose-500 line-through font-medium">
                              ₦{(car.marketPriceRange[1] / 1000000).toFixed(1)}M
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                            {formatNaira(car.price)}
                          </span>
                        </div>

                        <Link
                          href={`/buyer/vehicles/${car.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-blue-600 transition"
                        >
                          <span>See Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
                        </Link>
                      </div>

                      {/* WhatsApp Fast CTA for this car */}
                      <DealerWhatsAppButton
                        phone={shop.whatsapp || shop.phone}
                        dealerId={shop.id}
                        dealerName={shop.name}
                        vehicleId={car.id}
                        vehicleTitle={`${car.title} (${car.year})`}
                        vehiclePrice={car.price}
                        label="Quick WhatsApp Inquiry"
                        size="sm"
                        className="w-full justify-center"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
