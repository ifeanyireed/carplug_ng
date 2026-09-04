"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DollarSign, Check, ArrowRight, TrendingUp, ShieldCheck } from "lucide-react";

export default function SellMyCarPage() {
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Corolla");
  const [year, setYear] = useState("2018");
  const [mileage, setMileage] = useState("82000");
  const [calculated, setCalculated] = useState(false);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4" />
          <span>Algorithmic Valuation & Trade-In</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Sell My Car — Instant Market Valuation
        </h1>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Get an instant fair-market valuation for your vehicle and receive competitive cash offers from verified dealer networks across Lagos and Abuja.
        </p>

        <form onSubmit={handleEstimate} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Make</label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              >
                <option>Toyota</option>
                <option>Lexus</option>
                <option>Mercedes-Benz</option>
                <option>Honda</option>
                <option>Ford</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mileage (Miles)</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
          >
            Calculate Market Value & Dealer Offers
          </button>
        </form>

        {calculated && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-4">
            <div className="text-center">
              <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">
                Projected Fair Market Value
              </span>
              <div className="text-3xl font-black text-neutral-900 mt-1">
                ₦12,500,000 – ₦13,800,000
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Based on 24 recent transactions for {year} {make} {model} in Lagos
              </p>
            </div>

            <div className="pt-4 border-t border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-700">
                <b>3 Verified Dealers</b> ready to make direct cash offers for this car.
              </div>
              <Link
                href="/seller/listings"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
              >
                Publish for Dealer Offers
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
