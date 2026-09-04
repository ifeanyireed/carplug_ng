"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES, Vehicle } from "@/data/mockStore";
import {
  ArrowLeft,
  X,
  Plus,
  CheckCircle2,
  Wrench,
  Fuel,
  Gauge,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function ComparePage() {
  // Default compare with 2 cars
  const [comparedIds, setComparedIds] = useState<string[]>([
    "v-lexus-rx350-2021",
    "v-toyota-camry-2020",
  ]);

  const comparedCars = comparedIds
    .map((id) => MOCK_VEHICLES.find((v) => v.id === id))
    .filter(Boolean) as Vehicle[];

  const handleRemove = (id: string) => {
    setComparedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAdd = (id: string) => {
    if (!comparedIds.includes(id) && comparedIds.length < 3) {
      setComparedIds((prev) => [...prev, id]);
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/buyer/search" className="hover:text-blue-600">
                Marketplace
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Compare Vehicles</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900">
              Side-by-Side Comparison
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Evaluating trust ratings, mechanical condition, and market pricing
            </p>
          </div>

          <Link
            href="/buyer/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Vehicles</span>
          </Link>
        </div>

        {comparedCars.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto mt-8">
            <h3 className="font-bold text-base text-neutral-900 mb-1">
              No vehicles selected for comparison
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Browse our verified discovery engine to pick vehicles to compare.
            </p>
            <Link
              href="/buyer/search"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[640px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="p-4 w-1/4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Vehicle Spec / Metric
                    </th>
                    {comparedCars.map((car) => (
                      <th key={car.id} className="p-4 w-1/3 align-top">
                        <div className="relative">
                          <button
                            onClick={() => handleRemove(car.id)}
                            className="absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition"
                            title="Remove from compare"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden mb-3">
                            <img
                              src={car.images[0] || "/images/cars/car18.jpeg"}
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">
                            {car.title}
                          </h3>
                          <div className="text-lg font-black text-neutral-900 mt-1">
                            {formatNaira(car.price)}
                          </div>
                          <div className="mt-2 flex flex-col gap-1.5">
                            <TrustTierBadge tier={car.trustTier} size="sm" />
                            <PriceRatingBadge rating={car.priceRating} size="sm" />
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs">
                  {/* Trust Ladder */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">
                      Trust Verification Tier
                    </td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4">
                        <span className="font-bold text-neutral-900">
                          {car.trustTierLabel} (Tier {car.trustTier}/5)
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Health Score */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">
                      Technician Health Score
                    </td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4">
                        {car.healthScore ? (
                          <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {car.healthScore}% Overall Health
                          </span>
                        ) : (
                          <span className="text-gray-400">Not yet inspected</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Market Range */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">
                      Market Fair Price Range
                    </td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4 text-gray-700">
                        {formatNaira(car.marketPriceRange[0])} –{" "}
                        {formatNaira(car.marketPriceRange[1])}
                      </td>
                    ))}
                  </tr>

                  {/* Condition & Origin */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">
                      Condition Category
                    </td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4 font-medium text-neutral-900">
                        {car.condition}
                      </td>
                    ))}
                  </tr>

                  {/* Mileage */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">Mileage</td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4 text-neutral-900">
                        {car.mileage.toLocaleString()} miles
                      </td>
                    ))}
                  </tr>

                  {/* Engine & Transmission */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">Powertrain</td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4 text-neutral-900">
                        {car.engineSize} • {car.transmission}
                      </td>
                    ))}
                  </tr>

                  {/* Customs & Docs */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">
                      Customs Status
                    </td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4">
                        <span className="font-semibold text-neutral-900">
                          {car.customsStatus}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Location */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">Location</td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4 text-neutral-900">
                        {car.publicLocation}
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4 font-semibold text-gray-500 bg-gray-50/30">Action</td>
                    {comparedCars.map((car) => (
                      <td key={car.id} className="p-4">
                        <Link
                          href={`/buyer/vehicles/${car.id}`}
                          className="inline-block w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-center font-bold text-xs transition"
                        >
                          View Full Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
