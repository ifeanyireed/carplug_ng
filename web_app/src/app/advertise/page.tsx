"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Layers,
  Award,
  Calendar,
  DollarSign,
} from "lucide-react";

interface AdFormat {
  id: string;
  name: string;
  tag: string;
  description: string;
  weeklyPrice: number;
  estimatedImpressions: string;
  previewImage: string;
  specs: string;
}

const AD_FORMATS: AdFormat[] = [
  {
    id: "sponsored_car",
    name: "Sponsored Vehicle Listing",
    tag: "Highest Conversion",
    description: "Pinned in top 3 slots across search results with a subtle 'Sponsored' pill. Blends natively into the Explore grid.",
    weeklyPrice: 75000,
    estimatedImpressions: "45,000 - 65,000 / week",
    previewImage: "/images/cars/car18.jpeg",
    specs: "Native Vehicle Card + Destination Link",
  },
  {
    id: "category_banner",
    name: "Category Header Leaderboard",
    tag: "High Visibility",
    description: "Prominent billboard banner positioned directly above vehicle search results and Vehicle Detail Pages.",
    weeklyPrice: 120000,
    estimatedImpressions: "85,000 - 120,000 / week",
    previewImage: "/images/cars/car17.jpeg",
    specs: "1200 x 240px (Desktop), 600 x 300px (Mobile)",
  },
  {
    id: "hero_spotlight",
    name: "Homepage Brand Spotlight",
    tag: "Maximum Reach",
    description: "Exclusive homepage takeover placement directly beneath the hero search console. Ideal for brand launches & bank auto loans.",
    weeklyPrice: 250000,
    estimatedImpressions: "180,000 - 250,000 / week",
    previewImage: "/images/cars/car15.jpeg",
    specs: "Full-width Interactive Card + Video loop support",
  },
  {
    id: "inspection_partner",
    name: "Vehicle Health Report Sponsor",
    tag: "Exclusive Fintech / Insurance",
    description: "Exclusive co-branded placement embedded in every downloadable & shareable vehicle inspection report.",
    weeklyPrice: 180000,
    estimatedImpressions: "30,000 High-Intent Buyers / week",
    previewImage: "/images/cars/car14.jpeg",
    specs: "Native CTA Banner + Direct WhatsApp / Web URL",
  },
];

export default function AdvertisePage() {
  const [selectedFormat, setSelectedFormat] = useState<string>("sponsored_car");
  const [targetCity, setTargetCity] = useState<string>("all");
  const [durationWeeks, setDurationWeeks] = useState<number>(2);
  const [advertiserName, setAdvertiserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeFormat = AD_FORMATS.find((f) => f.id === selectedFormat) || AD_FORMATS[0];

  // Duration discount: 10% on 4+ weeks
  const discountRate = durationWeeks >= 4 ? 0.1 : durationWeeks >= 2 ? 0.05 : 0;
  const rawTotal = activeFormat.weeklyPrice * durationWeeks;
  const discountAmount = rawTotal * discountRate;
  const netTotal = rawTotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Verza Media &amp; Advertising Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em]">
            Reach High-Intent Car Buyers &amp; Owners Across Nigeria
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Position your brand, auto finance product, insurance package, or dealership inventory in front of pre-qualified buyers actively evaluating vehicle inspections and purchases.
          </p>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Monthly Car Searches", value: "480,000+", note: "Lagos, Abuja & PH", icon: Users },
            { label: "Avg Vehicle Inspected", value: "₦24.8M", note: "Verified Tokunbo / New", icon: Target },
            { label: "Avg Placement CTR", value: "3.8%", note: "4.2x Industry Standard", icon: TrendingUp },
            { label: "Active Verified Dealers", value: "120+ Lots", note: "Showroom Partners", icon: ShieldCheck },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-gray-400 mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</span>
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.note}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ad Formats Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-[-0.055em]">
                Premium Ad Formats &amp; Placements
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Choose the placement that matches your marketing objective
              </p>
            </div>
            <span className="text-xs text-gray-500 font-medium">All campaigns subject to admin review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AD_FORMATS.map((format) => {
              const isSelected = selectedFormat === format.id;

              return (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-neutral-900 ring-2 ring-neutral-900 shadow-md"
                      : "border-gray-200/80 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={format.previewImage}
                        alt={format.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-black/70 backdrop-blur-md">
                          {format.tag}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{format.name}</h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{format.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">
                        ₦{(format.weeklyPrice / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-gray-500"> / week</span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-700">{format.estimatedImpressions}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Campaign Booking Console */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-medium text-gray-900 tracking-[-0.04em]">
              Book Your Advertising Campaign
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure targeting, flight duration, and upload creative assets. Pay securely via Paystack.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-16 px-4 max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Campaign Submitted for Review!</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Thank you, <strong>{advertiserName || "Partner"}</strong>. Your <strong>{activeFormat.name}</strong> flight has been submitted to the Verza Admin Console. Our ad operations team will review your creative within 2 business hours and activate your flight.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 text-left space-y-1.5 font-mono">
                <div>Campaign Ref: #AD-{Math.floor(100000 + Math.random() * 900000)}</div>
                <div>Format: {activeFormat.name}</div>
                <div>Duration: {durationWeeks} Week(s)</div>
                <div>Total Budget: ₦{netTotal.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition"
              >
                Book Another Campaign
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form: Targeting & Creatives (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Selected Format Summary */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">Selected Placement</span>
                    <div className="font-bold text-gray-900 text-sm">{activeFormat.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-gray-900">
                      ₦{activeFormat.weeklyPrice.toLocaleString()} / week
                    </div>
                    <span className="text-[11px] text-gray-500">{activeFormat.specs}</span>
                  </div>
                </div>

                {/* Target Audience / City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Target Geography
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "all", label: "Nationwide (All Nigeria)" },
                      { id: "lagos_island", label: "Lagos Island (Lekki / VI)" },
                      { id: "lagos_mainland", label: "Lagos Mainland (Ikeja)" },
                      { id: "abuja", label: "Abuja FCT" },
                    ].map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => setTargetCity(city.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition ${
                          targetCity === city.id
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {city.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flight Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Flight Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { weeks: 1, label: "1 Week" },
                      { weeks: 2, label: "2 Weeks (5% off)" },
                      { weeks: 4, label: "1 Month (10% off)" },
                      { weeks: 12, label: "3 Months (15% off)" },
                    ].map((item) => (
                      <button
                        key={item.weeks}
                        type="button"
                        onClick={() => setDurationWeeks(item.weeks)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition ${
                          durationWeeks === item.weeks
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Reed"
                      value={advertiserName}
                      onChange={(e) => setAdvertiserName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand / Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Leadway Auto Insurance"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="marketing@company.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 803 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Destination URL & Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Destination Click-Through URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://yourbrand.com/campaign-landing-page"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Upload Creative Banner / Media</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50/50 transition cursor-pointer">
                      <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-gray-800">
                        Drag &amp; drop banner image, or <span className="text-blue-600">browse</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, or GIF up to 10MB ({activeFormat.specs})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Summary Card (5 cols) */}
              <div className="lg:col-span-5 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-sm">Campaign Order Summary</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Placement</span>
                      <span className="font-semibold text-gray-900">{activeFormat.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Flight Duration</span>
                      <span className="font-semibold text-gray-900">{durationWeeks} Week(s)</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Target City</span>
                      <span className="font-semibold text-gray-900 uppercase">{targetCity.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Est. Impressions</span>
                      <span className="font-semibold text-emerald-700">
                        {(parseInt(activeFormat.estimatedImpressions, 10) * durationWeeks || 90000).toLocaleString()}+
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Base Cost</span>
                      <span className="font-mono">₦{rawTotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Duration Discount ({(discountRate * 100).toFixed(0)}%)</span>
                        <span className="font-mono">-₦{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Total Amount Due</div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">
                        ₦{netTotal.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">VAT inclusive</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <span>Proceed to Paystack Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant invoice issued upon admin approval</span>
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
