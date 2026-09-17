"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Sparkles,
  Check,
  ArrowRight,
  ChevronRight,
  Loader2,
  Search,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  createLead,
  matchConciergeInventory,
  ConciergeMatchedVehicle,
} from "@/services/api";

export default function ConciergePage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Lagos (Island & Mainland)",
    makeModel: "",
    yearMin: "2018",
    budgetNaira: "25000000",
    condition: "Foreign Used (Tokunbo)",
    priority: "Verified Inspection & Low Mileage",
  });

  const [matches, setMatches] = useState<ConciergeMatchedVehicle[]>([]);
  const [isSearchingMatches, setIsSearchingMatches] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const handleScanInventory = async () => {
    if (!formData.makeModel.trim()) return;
    setIsSearchingMatches(true);
    setHasSearched(true);
    try {
      const results = await matchConciergeInventory({
        makeModel: formData.makeModel,
        budgetNaira: parseFloat(formData.budgetNaira) || 0,
        condition: formData.condition,
        city: formData.city,
      });
      setMatches(results);
    } catch (err) {
      console.warn("Failed to query concierge inventory:", err);
    } finally {
      setIsSearchingMatches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const noteParts = [
        `Condition: ${formData.condition}`,
        `Priority: ${formData.priority}`,
        `Min Year: ${formData.yearMin}`,
      ];
      if (selectedVehicleId) {
        noteParts.push(`Buyer noted interest in matched vehicle #${selectedVehicleId}`);
      }
      await createLead({
        buyerName: formData.name,
        buyerPhone: formData.phone,
        buyerCity: formData.city,
        vehicleTitle: formData.makeModel,
        vehiclePrice: parseFloat(formData.budgetNaira) || 0,
        type: "concierge",
        note: noteParts.join(" • "),
        status: "new",
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit concierge request";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/buyer/search" className="hover:text-blue-600">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Find It For Me (Concierge)</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-2.5 text-blue-600 mb-2 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Dedicated Buyer Concierge</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Can&apos;t find your car on the open market?
          </h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Tell us the exact make, model, budget, and condition you need. Our team matches your request against private off-market dealer lots, sends an independent technician to pre-inspect the vehicle, and presents only verified options.
          </p>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-950 text-base">
                Concierge Brief Submitted Successfully!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                A mycarsNg sourcing agent will contact you on WhatsApp/phone within 4 hours with 2-3 verified off-market matches.
              </p>
              <Link
                href="/buyer/search"
                className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
              >
                Browse Active Listings Meanwhile
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ngozi Eze"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 803 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Vehicle Make & Model Desired
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2020 Lexus RX 350 F-Sport"
                    value={formData.makeModel}
                    onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Budget (₦)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 35000000"
                    value={formData.budgetNaira}
                    onChange={(e) => setFormData({ ...formData, budgetNaira: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Condition Type
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option>Foreign Used (Tokunbo)</option>
                    <option>Brand New</option>
                    <option>Nigerian Used (First Body Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City / Delivery Location
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Lagos (Island & Mainland)">Lagos (Island & Mainland)</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Ibadan">Ibadan</option>
                  </select>
                </div>
              </div>

              {/* Sourcing Matcher Section */}
              <div className="p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/70 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Concierge Sourcing Matcher</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Instantly cross-references your brief against verified active dealer inventory before commissioning an off-market hunt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleScanInventory}
                    disabled={isSearchingMatches || !formData.makeModel.trim()}
                    className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSearchingMatches ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning Lots...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Scan Matching Lots</span>
                      </>
                    )}
                  </button>
                </div>

                {hasSearched && (
                  <div className="pt-3 border-t border-blue-100">
                    {matches.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
                          <span>
                            {matches.length} Verified Match{matches.length > 1 ? "es" : ""} Found in Dealer Inventory:
                          </span>
                          <span className="text-[11px] text-gray-500 font-normal">
                            Click to link to brief or preview
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {matches.map((item) => {
                            const isSelected = selectedVehicleId === item.id;
                            const imageSrc =
                              Array.isArray(item.images) && item.images.length > 0
                                ? item.images[0]
                                : "/images/cars/car1.jpeg";
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedVehicleId(isSelected ? null : item.id)}
                                className={`p-3 rounded-2xl border transition text-left cursor-pointer flex gap-3 ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-600 ring-2 ring-blue-600/20"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imageSrc}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                                    {item.matchScore}%
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                                      {item.title}
                                    </h4>
                                    <p className="text-xs font-black text-blue-600 mt-0.5">
                                      ₦{item.price?.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                      {item.matchReason}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                      Tier {item.trustTier}
                                    </span>
                                    <Link
                                      href={`/buyer/vehicles/${item.id}`}
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 ml-auto font-semibold"
                                    >
                                      <span>View</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/80 rounded-xl border border-blue-100 text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          No immediate public listings match these exact criteria. Submitting below triggers our private off-market scout network across 48+ certified dealer partners in Lagos and Abuja.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Brief to Sourcing Desk...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Sourcing Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
