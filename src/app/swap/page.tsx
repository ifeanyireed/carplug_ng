"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_VEHICLES, Vehicle } from "@/data/mockStore";
import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Fuel,
  Settings2,
  CarFront,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  FileCheck,
} from "lucide-react";

export default function CarSwapPage() {
  // Trade-In Car State
  const [currentYear, setCurrentYear] = useState(2017);
  const [currentMake, setCurrentMake] = useState("Toyota");
  const [currentModel, setCurrentModel] = useState("Camry");
  const [currentCondition, setCurrentCondition] = useState("Nigerian Used");
  const [currentMileage, setCurrentMileage] = useState(74000);
  const [mechanicalHealth, setMechanicalHealth] = useState("Good");

  // Selected Upgrade Target Car from Inventory
  const [selectedTargetId, setSelectedTargetId] = useState<string>(MOCK_VEHICLES[0].id);

  // Scheduling State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-09-10");
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  // Dynamic Algorithmic Appraisal Calculation for Current Car
  const estimatedAppraisal = useMemo(() => {
    let base = 12000000;
    if (currentMake === "Toyota") base = 14500000;
    if (currentMake === "Lexus") base = 19000000;
    if (currentMake === "Mercedes-Benz") base = 26000000;
    if (currentMake === "Honda") base = 13500000;

    // Year adjustment
    const yearDiff = currentYear - 2015;
    base += yearDiff * 900000;

    // Condition
    if (currentCondition === "Foreign Used (Tokunbo)") {
      base *= 1.35;
    }

    // Mileage deduction
    if (currentMileage > 80000) base *= 0.9;

    // Health deduction
    if (mechanicalHealth === "Needs Minor Service") base *= 0.92;
    if (mechanicalHealth === "Needs Major Work") base *= 0.82;

    return Math.round(base / 100000) * 100000;
  }, [currentYear, currentMake, currentModel, currentCondition, currentMileage, mechanicalHealth]);

  const targetCar = MOCK_VEHICLES.find((v) => v.id === selectedTargetId) || MOCK_VEHICLES[0];

  // 5% Verza Trade-in Discount Incentive
  const platformDiscount = Math.round(targetCar.price * 0.05);
  const netDifference = Math.max(0, targetCar.price - estimatedAppraisal - platformDiscount);

  const getFuelIcon = (type: string) => {
    switch (type) {
      case "Electric":
      case "Hybrid":
        return <Zap className="w-3.5 h-3.5 text-black stroke-[2]" />;
      default:
        return <Fuel className="w-3.5 h-3.5 text-black stroke-[2]" />;
    }
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verza Guaranteed Car Swap &amp; Trade-In Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em]">
            Swap Your Car for an Upgrade &amp; Pay a Discounted Difference
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Trade in your existing vehicle directly for verified showroom inventory. Benefit from an algorithmic fair equity appraisal plus a <strong>5% Verza platform trade-in subsidy</strong> off your new car.
          </p>
        </div>

        {/* 3 Step Process Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Appraise Current Vehicle",
              desc: "Provide specs & condition. Our valuation engine calculates instant equity backed by Lagos & Abuja dealer transactions.",
            },
            {
              step: "02",
              title: "Pick Your Verified Upgrade",
              desc: "Select any inspected vehicle from our verified dealer lots. Get a 5% Verza trade-in discount deducted automatically.",
            },
            {
              step: "03",
              title: "Dual Audit & Handover",
              desc: "A certified technician audits your car on-site. Once confirmed, keys and title exchange simultaneously at the dealer lot.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-2 relative overflow-hidden"
            >
              <div className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                Step {item.step}
              </div>
              <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Section 1: Interactive Appraisal Form */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">Step 1 of 3</span>
              <h2 className="text-2xl font-medium text-gray-900 tracking-[-0.04em]">
                Appraise Your Current Vehicle (Trade-In)
              </h2>
            </div>
            <div className="text-xs text-gray-500">Instant AI valuation benchmark</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input fields */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Vehicle Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                >
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2010].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Make</label>
                <select
                  value={currentMake}
                  onChange={(e) => setCurrentMake(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                >
                  {["Toyota", "Lexus", "Mercedes-Benz", "Honda", "Ford", "Hyundai", "BMW"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Model &amp; Trim</label>
                <input
                  type="text"
                  value={currentModel}
                  onChange={(e) => setCurrentModel(e.target.value)}
                  placeholder="e.g. Camry LE, Corolla, RX350"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Condition</label>
                <select
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                >
                  <option value="Nigerian Used">Nigerian Used (Registered)</option>
                  <option value="Foreign Used (Tokunbo)">Foreign Used (Tokunbo)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Current Mileage (Miles)</label>
                <input
                  type="number"
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Engine &amp; Mechanical Condition</label>
                <select
                  value={mechanicalHealth}
                  onChange={(e) => setMechanicalHealth(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                >
                  <option value="Good">Excellent / Sound Engine &amp; AC</option>
                  <option value="Needs Minor Service">Good (Needs minor brake/bushing service)</option>
                  <option value="Needs Major Work">Fair (Noticeable faults / body respray)</option>
                </select>
              </div>
            </div>

            {/* Appraisal Output Card */}
            <div className="lg:col-span-4 bg-gray-50 border border-gray-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Trade-In Equity</span>
                </span>
                <div className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
                  ₦{(estimatedAppraisal / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Estimated trade-in cash value for your {currentYear} {currentMake} {currentModel}. Backed by recent transaction comps.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200/80 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Market Benchmark</span>
                  <span className="font-semibold text-gray-900">₦{((estimatedAppraisal * 0.95) / 1000000).toFixed(1)}M - ₦{((estimatedAppraisal * 1.05) / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Swap Eligibility</span>
                  <span>100% Eligible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Choose Your Upgrade Car */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">Step 2 of 3</span>
              <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-[-0.055em]">
                Choose Your Desired Upgrade Car
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Select from verified showroom stock to calculate your discounted cash top-up
              </p>
            </div>
            <span className="text-xs text-gray-500 font-medium">Showing verified dealer inventory</span>
          </div>

          {/* Vehicle Cards Grid using the exact Explore all vehicles styling */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
              {MOCK_VEHICLES.map((car) => {
                const isSelected = selectedTargetId === car.id;
                const badgeText = car.priceRating === "deal" ? "Great Price" : car.trustTier === 5 ? "Platform Verified" : "Inspected";
                const badgeBg = car.trustTier === 5 ? "bg-blue-600" : "bg-[#16a34a]";

                return (
                  <div
                    key={car.id}
                    onClick={() => setSelectedTargetId(car.id)}
                    className={`group bg-white rounded-xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 ring-2 ring-neutral-900 shadow-md"
                        : "border-gray-200/80 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Card Image Area */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                      <Image
                        src={car.images[0] || "/images/cars/car18.jpeg"}
                        alt={`${car.title} (${car.year})`}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badge (Fully Rounded Corners) */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className={`inline-block px-3 py-1 text-[11px] font-medium text-white ${badgeBg} rounded-full tracking-tight shadow-sm`}>
                          {badgeText}
                        </span>
                        {isSelected && (
                          <span className="inline-block px-3 py-1 text-[11px] font-semibold text-white bg-black rounded-full shadow-sm">
                            Selected Upgrade ✓
                          </span>
                        )}
                      </div>

                      {/* Carousel Pagination Dots */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Car Title & Year */}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-[-0.04em] group-hover:text-black">
                          {car.title} ({car.year})
                        </h3>

                        {/* Specs Pill Row (Black color and font-medium) */}
                        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 text-xs sm:text-[13px] font-medium text-black">
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

                      {/* Pricing & CTA Divider */}
                      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight">
                            ₦{(car.price / 1000000).toFixed(1)}M
                          </span>
                        </div>

                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                          isSelected ? "bg-neutral-900 text-white" : "text-gray-700 bg-gray-100"
                        }`}>
                          {isSelected ? "Selected" : "Select for Swap"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Trade-In Financial Equation & Booking */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-5">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase">Step 3 of 3</span>
            <h2 className="text-2xl font-medium text-gray-900 tracking-[-0.04em]">
              Swap Agreement &amp; Discounted Balance Due
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Transparent equity calculation with verified trade-in subsidy and escrow protection.
            </p>
          </div>

          {swapSubmitted ? (
            <div className="text-center py-16 px-4 max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Car Swap Booking Initiated!</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Thank you, <strong>{fullName || "Valued Customer"}</strong>. Your request to swap your <strong>{currentYear} {currentMake} {currentModel}</strong> for the <strong>{targetCar.title}</strong> has been routed to our verification team and the dealer lot.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 text-left space-y-1.5 font-mono">
                <div>Swap Reference: #SWAP-{Math.floor(100000 + Math.random() * 900000)}</div>
                <div>Your Trade-In Equity: ₦{(estimatedAppraisal / 1000000).toFixed(1)}M</div>
                <div>Verza Platform Subsidy (5%): -₦{(platformDiscount / 1000000).toFixed(1)}M</div>
                <div>Discounted Net Top-Up Due: ₦{(netDifference / 1000000).toFixed(1)}M</div>
                <div>Technician Inspection Scheduled: {preferredDate}</div>
              </div>
              <button
                onClick={() => setSwapSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition"
              >
                Configure Another Swap
              </button>
            </div>
          ) : (
            <form onSubmit={handleSwapSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Financial Calculation Breakdown (7 cols) */}
              <div className="lg:col-span-7 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                  Exchange Balance Breakdown
                </h3>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">New Target Vehicle</span>
                      <div className="text-[11px] text-gray-500">{targetCar.title}</div>
                    </div>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      ₦{targetCar.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-800 font-medium">
                    <div>
                      <span>Less Your Trade-In Appraisal</span>
                      <div className="text-[11px] text-gray-500">{currentYear} {currentMake} {currentModel}</div>
                    </div>
                    <span className="font-mono font-bold">
                      -₦{estimatedAppraisal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-blue-700 font-medium">
                    <div className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verza Swap Incentive Discount (5% Platform Subsidy)</span>
                    </div>
                    <span className="font-mono font-bold">
                      -₦{platformDiscount.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-900 uppercase">Discounted Net Top-Up Due</div>
                      <div className="text-[11px] text-gray-500">To be paid via secure escrow upon physical exchange</div>
                    </div>
                    <div className="text-2xl font-black text-blue-600 font-mono">
                      ₦{netDifference.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Financing note */}
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <div className="text-blue-900 font-medium">
                    Prefer monthly payments? Split your net top-up:
                  </div>
                  <div className="font-bold text-blue-700 font-mono">
                    ~₦{(netDifference / 36).toFixed(0)}/mo for 36 mos
                  </div>
                </div>
              </div>

              {/* Handover & Contact Details (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                  Book Dual-Inspection &amp; Exchange
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chukwuma Reed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Phone Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 803 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Preferred Inspection &amp; Swap Date</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-black focus:outline-none font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <span>Submit Car Swap Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free cancellation before technician physical dispatch</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
