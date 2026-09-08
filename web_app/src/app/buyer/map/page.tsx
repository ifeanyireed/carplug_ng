"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES, Vehicle } from "@/data/mockStore";
import {
  MapPin,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  Lock,
} from "lucide-react";

export default function MapDiscoveryPage() {
  const [activeDistrict, setActiveDistrict] = useState<string>("Lekki");
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(MOCK_VEHICLES[0]);

  const districts = [
    { name: "Lekki", label: "Lekki Phase 1 & Ikate", count: 18, coords: "Lagos East" },
    { name: "Ikeja", label: "Ikeja GRA & Allen", count: 14, coords: "Lagos Mainland" },
    { name: "Victoria Island", label: "Victoria Island & Ikoyi", count: 9, coords: "Lagos Island" },
    { name: "Surulere", label: "Surulere & Yaba", count: 6, coords: "Lagos Central" },
    { name: "Abuja", label: "Garki & Maitama", count: 11, coords: "FCT Abuja" },
  ];

  const districtVehicles = MOCK_VEHICLES.filter((v) =>
    v.publicLocation.toLowerCase().includes(activeDistrict.toLowerCase())
  );

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* District Selector Header */}
        <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-neutral-900">Privacy Cluster Zones:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {districts.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      setActiveDistrict(d.name);
                      const match = MOCK_VEHICLES.find((v) =>
                        v.publicLocation.toLowerCase().includes(d.name.toLowerCase())
                      );
                      setSelectedCar(match || null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      activeDistrict === d.name
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {d.name} ({d.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Exact dealer addresses masked for privacy</span>
            </div>
          </div>
        </div>

        {/* Map Canvas + Slide Drawer */}
        <div className="flex-1 relative min-h-[600px] bg-[#E5E9EC] flex">
          {/* Simulated Map Visual Surface */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6">
            {/* Visual Grid Lines and District Markers */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2A6BE0_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 text-center max-w-lg p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {activeDistrict} District Cluster
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Displaying {districtVehicles.length} verified listings in this zone. Select a vehicle below or tap a hotspot pin to view pre-purchase records.
                </p>
              </div>

              {/* Hotspot Pins Simulation */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {districtVehicles.map((car, i) => (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCar(car)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedCar?.id === car.id
                        ? "bg-blue-600 text-white border-blue-700 shadow-md scale-105"
                        : "bg-white text-neutral-800 border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{car.make} {car.model}</span>
                    <span className="text-[10px] opacity-80">{formatNaira(car.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Selected Vehicle Card Drawer */}
          {selectedCar && (
            <div className="w-full sm:w-96 bg-white border-l border-gray-200 p-6 flex flex-col justify-between shadow-2xl z-20">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Zone Vehicle Preview
                  </div>
                  <button
                    onClick={() => setSelectedCar(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative aspect-[16/10] rounded-2xl bg-gray-100 overflow-hidden">
                  <img
                    src={selectedCar.images[0] || "/images/cars/car18.jpeg"}
                    alt={selectedCar.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <TrustTierBadge tier={selectedCar.trustTier} size="sm" />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{selectedCar.publicLocation}</span>
                  </div>
                  <h4 className="font-bold text-base text-neutral-900 leading-snug">
                    {selectedCar.title}
                  </h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-2xl font-black text-neutral-900">
                      {formatNaira(selectedCar.price)}
                    </div>
                    <PriceRatingBadge rating={selectedCar.priceRating} size="sm" />
                  </div>
                </div>

                {selectedCar.healthScore && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold">
                      Health Score: {selectedCar.healthScore}% Certified
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Independent technician pre-inspection completed.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/buyer/vehicles/${selectedCar.id}`}
                  className="block w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-center text-xs font-semibold transition"
                >
                  View Full Vehicle Blueprint
                </Link>
                <Link
                  href={`/buyer/inspections/book/${selectedCar.id}`}
                  className="block w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-center text-xs font-semibold transition"
                >
                  Order Independent Inspection
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
