"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  Car,
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Wrench,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function DealerVehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const vehicles = MOCK_VEHICLES.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Showroom Inventory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your active dealership stock, view inspection status, and monitor lead views
          </p>
        </div>

        <Link
          href="/dealer/vehicles/new"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your inventory by make, model or VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {vehicles.length} active listings
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Vehicle Details</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Asking Price</th>
                <th className="p-4">Trust Tier</th>
                <th className="p-4">Health Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 line-clamp-1">
                          {car.title}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          VIN: {car.vin}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px]">
                      {car.condition}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-extrabold text-neutral-900">
                      {formatNaira(car.price)}
                    </div>
                    <PriceRatingBadge rating={car.priceRating} size="sm" />
                  </td>

                  <td className="p-4">
                    <TrustTierBadge tier={car.trustTier} size="sm" />
                  </td>

                  <td className="p-4">
                    {car.healthScore ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                        {car.healthScore}% Certified
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Pending Inspection</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/buyer/vehicles/${car.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-neutral-900 transition"
                        title="View Public Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dealer/vehicles/new`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-neutral-900 transition"
                        title="Edit Vehicle"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
