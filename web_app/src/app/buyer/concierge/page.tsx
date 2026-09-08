"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sparkles, Check, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export default function ConciergePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Lagos",
    makeModel: "",
    yearMin: "2018",
    budgetNaira: "25000000",
    condition: "Foreign Used (Tokunbo)",
    priority: "Verified Inspection & Low Mileage",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            Can't find your car on the open market?
          </h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Tell us the exact make, model, budget, and condition you need. Our team matches your request against private off-market dealer lots, sends an independent technician to pre-inspect the vehicle, and presents only verified options.
          </p>

          {submitted ? (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-950 text-base">
                Concierge Brief Submitted Successfully!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                A Verza sourcing agent will contact you on WhatsApp/phone within 4 hours with 2-3 verified off-market matches.
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
                    <option>Lagos (Island & Mainland)</option>
                    <option>Abuja FCT</option>
                    <option>Port Harcourt</option>
                    <option>Ibadan</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>Submit Sourcing Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
