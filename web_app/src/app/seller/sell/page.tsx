"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, Loader2, Award, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { fetchValuationEstimate, ValuationEstimateResult } from "@/services/api";

export default function SellMyCarPage() {
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Corolla");
  const [year, setYear] = useState("2018");
  const [condition, setCondition] = useState("Foreign Used (Tokunbo)");
  const [mileage, setMileage] = useState("82000");
  const [targetPrice, setTargetPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<ValuationEstimateResult | null>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchValuationEstimate({
        make,
        model,
        year: Number(year) || 2018,
        condition,
        mileage: Number(mileage) || 80000,
        askingPrice: targetPrice ? Number(targetPrice) : undefined,
      });
      if (res) {
        setValuation(res);
      }
    } catch (err) {
      console.error("Valuation calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4" />
          <span>Algorithmic Valuation &amp; Trade-In Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Sell My Car — Dynamic Market Valuation
        </h1>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Get an instant, data-backed fair-market valuation for your vehicle based on real Nigerian automotive sales, customs duty landing indexes, and dealer cash offer benchmarks.
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
                <option>Hyundai</option>
                <option>Kia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Model</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Corolla, Camry, RX 350"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="1995"
                max="2026"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              >
                <option>Foreign Used (Tokunbo)</option>
                <option>Nigerian Used</option>
                <option>Brand New</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mileage (km)</label>
              <input
                type="number"
                min="0"
                required
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Your Target Asking Price (₦ Optional — To test price fairness)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 13000000 (leave blank to let algorithm suggest)"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>Calculate Market Valuation &amp; Dealer Cash Offers</span>
          </button>
        </form>

        {valuation && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-emerald-50/60 border border-blue-200 rounded-2xl space-y-6 animate-in fade-in duration-200">
            {/* Main Valuation Summary */}
            <div className="text-center space-y-1">
              <span className="text-xs text-blue-700 font-extrabold uppercase tracking-wider">
                Projected Fair Market Value (Retail)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                {formatNaira(valuation.marketPriceMin)} – {formatNaira(valuation.marketPriceMax)}
              </div>
              <p className="text-xs text-gray-600">
                Market Median: <b className="font-bold text-neutral-900">{formatNaira(valuation.medianPrice)}</b>
              </p>
            </div>

            {/* Verdict Card */}
            <div className="p-4 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Fairness Rating:</span>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    valuation.priceRating === "great"
                      ? "bg-emerald-100 text-emerald-800"
                      : valuation.priceRating === "high"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {valuation.priceRating === "great"
                    ? "🟢 Great Deal"
                    : valuation.priceRating === "high"
                    ? "🟠 Above Market"
                    : "🔵 Fair Market Value"}
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;{valuation.priceVerdict}&rdquo;
              </p>
            </div>

            {/* Comps Intelligence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dealer Cashout Box */}
              <div className="p-4 bg-white/90 rounded-xl border border-emerald-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Dealer Cashout</span>
                </div>
                <div className="text-lg font-black text-neutral-900">
                  {formatNaira(valuation.dealerCashOfferMin)} – {formatNaira(valuation.dealerCashOfferMax)}
                </div>
                <p className="text-[11px] text-gray-500">
                  Guaranteed buyout from verified dealerships within 24–48 hours.
                </p>
              </div>

              {/* Confidence & Comps Metric */}
              <div className="p-4 bg-white/90 rounded-xl border border-gray-200/80 space-y-1 shadow-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Comps Reliability</span>
                </div>
                <div className="text-lg font-black text-neutral-900">
                  {valuation.confidenceScore}% Confidence
                </div>
                <p className="text-[11px] text-gray-500">
                  Calibrated across {valuation.compsCount > 0 ? `${valuation.compsCount} active comps` : "Nigerian landing tariffs & FX baseline"}.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready to list at your own price?</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/seller/listings"
                  className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-900 font-semibold text-xs rounded-xl transition text-center"
                >
                  My Listings
                </Link>
                <Link
                  href={`/dealer/vehicles/new?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&mileage=${encodeURIComponent(mileage)}&condition=${encodeURIComponent(condition)}&askingPrice=${encodeURIComponent(String(valuation.medianPrice))}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1"
                >
                  <span>List for Sale (Auto-Filled)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
