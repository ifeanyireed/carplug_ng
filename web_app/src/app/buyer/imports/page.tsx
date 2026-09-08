"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Globe,
  Ship,
  Calculator,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Plane,
} from "lucide-react";

export default function ImportedCarsPage() {
  const [origin, setOrigin] = useState<"USA" | "Canada" | "Dubai" | "UK">("USA");
  const [purchasePriceUSD, setPurchasePriceUSD] = useState<number>(18000);
  const [vehicleYear, setVehicleYear] = useState<number>(2020);

  // Approximate Nigerian customs import calculation model
  const fxRate = 1600; // ₦ per $
  const baseNaira = purchasePriceUSD * fxRate;
  const shippingNaira = origin === "Dubai" ? 1800000 : 2500000;
  const customsDutyNaira = Math.round(baseNaira * 0.35); // 35% standard import tariff
  const portClearingTerminalNaira = 1200000;
  const totalLandedCost = baseNaira + shippingNaira + customsDutyNaira + portClearingTerminalNaira;

  const formatNaira = (val: number) => {
    return `₦${(val / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/buyer/search" className="hover:text-blue-600">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Imported Cars (USA / Canada / Dubai)</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>International Sourcing & Clearing</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Source Cars Directly from USA, Canada & Dubai
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              We inspect off-shore auction lots (Copart/Manheim), handle RoRo shipping to Tin Can or Onne ports, and process full Customs Duty papers with zero surprise levies.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <Link
              href="/buyer/concierge"
              className="px-5 py-3 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition text-center"
            >
              Request Custom Import
            </Link>
          </div>
        </div>

        {/* Landing Cost Calculator */}
        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 shadow-xs space-y-8">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <Calculator className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-base text-neutral-900">
                Nigerian Landing Cost & Customs Duty Calculator
              </h3>
              <p className="text-xs text-gray-500">
                Transparent estimate including ocean freight, terminal charges, and federal customs duty
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Inputs (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Source Country
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["USA", "Canada", "Dubai", "UK"] as const).map((cntry) => (
                    <button
                      key={cntry}
                      onClick={() => setOrigin(cntry)}
                      className={`py-2 rounded-xl text-xs font-semibold transition border ${
                        origin === cntry
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cntry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Purchase Price (USD $)
                </label>
                <input
                  type="number"
                  value={purchasePriceUSD}
                  onChange={(e) => setPurchasePriceUSD(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Model Year
                </label>
                <select
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Breakdown Result (7 cols) */}
            <div className="md:col-span-7 bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Base Vehicle Cost (@ ₦{fxRate}/$)</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {formatNaira(baseNaira)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Ocean Shipping & Marine Insurance</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {formatNaira(shippingNaira)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Estimated Customs Duty (35% CET Tariff)</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {formatNaira(customsDutyNaira)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Port Handling, Demurrage Buffer & Terminal</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {formatNaira(portClearingTerminalNaira)}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-baseline justify-between">
                  <span className="font-extrabold text-sm text-neutral-900">
                    Estimated Total Landed in Lagos:
                  </span>
                  <span className="text-2xl font-black text-blue-600">
                    {formatNaira(totalLandedCost)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/buyer/concierge"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Book Sourcing with this Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
