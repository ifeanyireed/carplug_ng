"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DealerShop } from "@/data/mockStore";
import { CACVerifiedBadge } from "@/components/dealer/CACVerifiedBadge";
import { DealerWhatsAppButton } from "@/components/dealer/DealerWhatsAppButton";
import {
  Building2,
  MapPin,
  Clock,
  Star,
  CarFront,
  ArrowUpRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface ShopsDirectoryViewProps {
  initialShops: DealerShop[];
}

const REGION_FILTERS = ["All", "Lagos", "Lekki", "Ikeja", "Victoria Island", "Abuja"];

export const ShopsDirectoryView: React.FC<ShopsDirectoryViewProps> = ({ initialShops }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [cacOnly, setCacOnly] = useState(false);

  const filteredShops = useMemo(() => {
    return initialShops.filter((shop) => {
      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = shop.name.toLowerCase().includes(q);
        const matchesLoc = (shop.location || "").toLowerCase().includes(q);
        const matchesAddr = (shop.address || "").toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesAddr) return false;
      }

      // Region filter
      if (selectedRegion !== "All") {
        const fullLoc = `${shop.location} ${shop.address}`.toLowerCase();
        if (!fullLoc.includes(selectedRegion.toLowerCase())) return false;
      }

      // CAC Only
      if (cacOnly && !shop.verifiedCAC) {
        return false;
      }

      return true;
    });
  }, [initialShops, searchTerm, selectedRegion, cacOnly]);

  const hasActiveFilters = searchTerm.trim() !== "" || selectedRegion !== "All" || cacOnly;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedRegion("All");
    setCacOnly(false);
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by dealership name, area, or city..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>

          {/* Toggle CAC only */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition select-none">
              <input
                type="checkbox"
                checked={cacOnly}
                onChange={(e) => setCacOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 rounded-xs"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CAC Certified Only</span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-gray-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Region Pills */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-gray-400 font-medium mr-1 shrink-0">Location:</span>
          {REGION_FILTERS.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full font-medium transition shrink-0 cursor-pointer ${
                selectedRegion === reg
                  ? "bg-neutral-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <b className="text-gray-900">{filteredShops.length}</b> verified dealership{filteredShops.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>All dealerships physically audited</span>
        </div>
      </div>

      {/* Dealerships Grid */}
      {filteredShops.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-16 text-center space-y-3 shadow-xs">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No Dealerships Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No verified automotive showrooms match your current search filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition mt-2 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => {
            return (
              <div
                key={shop.id}
                className="group bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-xl rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header: Initial Logo & Verification Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0 group-hover:bg-blue-600 transition-colors">
                      {shop.name.charAt(0)}
                    </div>

                    <CACVerifiedBadge
                      verifiedCAC={shop.verifiedCAC}
                      cacRegistrationNumber={shop.cacRegistrationNumber}
                      dealerName={shop.name}
                      size="sm"
                    />
                  </div>

                  {/* Dealer Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-neutral-900 tracking-tight">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {shop.tagline || "Verified Automotive Dealer"}
                    </p>
                  </div>

                  {/* Rating & Review Counts */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1 font-bold text-neutral-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{shop.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{shop.reviewCount} reviews</span>
                    <span>•</span>
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                      {shop.activeListingsCount} vehicles on lot
                    </span>
                  </div>

                  {/* Location & Hours */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{shop.address || shop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{shop.operatingHours}</span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-2.5">
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>View Full Showroom</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>

                  <DealerWhatsAppButton
                    phone={shop.whatsapp || shop.phone}
                    dealerId={shop.id}
                    dealerName={shop.name}
                    label="Chat on WhatsApp"
                    size="sm"
                    className="w-full justify-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
