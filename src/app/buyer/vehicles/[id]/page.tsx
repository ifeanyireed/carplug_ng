import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES, MOCK_INSPECTIONS } from "@/data/mockStore";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Wrench,
  Award,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  Share2,
  Heart,
  Car,
  ChevronRight,
  Info,
} from "lucide-react";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = MOCK_VEHICLES.find((v) => v.id === id);

  if (!vehicle) {
    notFound();
  }

  const inspection = MOCK_INSPECTIONS.find((i) => i.vehicleId === vehicle.id);

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 mt-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/buyer/search" className="hover:text-blue-600">
              Vehicles
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span>{vehicle.make}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-neutral-900 font-semibold truncate max-w-xs">
              {vehicle.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:text-neutral-900">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <Link
              href="/buyer/compare"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Add to Compare</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <TrustTierBadge tier={vehicle.trustTier} size="md" />
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                {vehicle.condition}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{vehicle.publicLocation}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {vehicle.title}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              VIN: <span className="font-mono text-neutral-700 font-semibold">{vehicle.vin}</span> • Listed {vehicle.dateAdded}
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <div className="text-3xl font-black text-neutral-900">
              {formatNaira(vehicle.price)}
            </div>
            <div className="mt-1">
              <PriceRatingBadge
                rating={vehicle.priceRating}
                marketRange={vehicle.marketPriceRange}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Gallery, Specs, Health Report & Docs (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-3 shadow-xs overflow-hidden">
              <div className="relative aspect-[16/10] rounded-2xl bg-gray-100 overflow-hidden">
                <img
                  src={vehicle.images[0] || "/images/cars/audi-a4.webp"}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-medium">
                    Verified Vehicle Photos
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {vehicle.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-600 transition cursor-pointer"
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Price Intelligence Deep Dive */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs" id="price-intelligence">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-neutral-900">
                  Price Intelligence & Market Fairness Rating
                </h3>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed mb-4">
                <p className="font-semibold text-sm mb-1">{vehicle.priceVerdict}</p>
                <p className="text-blue-700">
                  Calculated against verified transactions of comparable Tokunbo {vehicle.make} {vehicle.model} models sold across Lagos and Abuja over the last 90 days.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 block mb-0.5">Market Low</span>
                  <span className="font-extrabold text-sm text-neutral-900">
                    ₦{(vehicle.marketPriceRange[0] / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-semibold block mb-0.5">
                    This Listing
                  </span>
                  <span className="font-extrabold text-sm text-emerald-900">
                    ₦{(vehicle.price / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 block mb-0.5">Market High</span>
                  <span className="font-extrabold text-sm text-neutral-900">
                    ₦{(vehicle.marketPriceRange[1] / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Mechanical Health Score & Inspection Overview */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-neutral-900">
                    Vehicle Health Report
                  </h3>
                </div>
                {inspection && (
                  <Link
                    href={`/buyer/inspections/${inspection.id}/report`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Full 60-Point Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {inspection ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-2xl font-black">{inspection.overallScore}%</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider">Health</span>
                    </div>
                    <div className="text-xs space-y-1 text-emerald-950">
                      <div className="font-bold text-sm">
                        Inspected by {inspection.technicianName} ({inspection.technicianTier})
                      </div>
                      <p className="text-emerald-800 leading-relaxed line-clamp-2">
                        "{inspection.technicianSummary}"
                      </p>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Completed on {new Date(inspection.completedDate!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Category Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {inspection.categories.map((cat, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                          <span>{cat.name}</span>
                          <span className="text-emerald-600 font-bold">{cat.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-neutral-800">
                    No Independent Inspection on File Yet
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                    Be the first buyer to order an independent certified technician inspection before travelling.
                  </p>
                  <Link
                    href={`/buyer/inspections/book/${vehicle.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <span>Order Inspection (from ₦25,000)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Document Checklist & Nigerian Customs Clearance */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs" id="history">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-neutral-900">
                  Documentation & Customs Verification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50">
                  <span className="text-xs font-medium text-gray-700">Nigerian Customs Clearance</span>
                  {vehicle.documentsAvailable.customsDoc ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Duty Paid</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not Uploaded</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50">
                  <span className="text-xs font-medium text-gray-700">Registration Papers</span>
                  {vehicle.documentsAvailable.registrationDoc ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Original Verified</span>
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                      First Registration Due
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50">
                  <span className="text-xs font-medium text-gray-700">Roadworthiness Certificate</span>
                  {vehicle.documentsAvailable.roadworthiness ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not Available</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50">
                  <span className="text-xs font-medium text-gray-700">Police Character Extracted</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Clean Record</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Action & Trust Box (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Primary Action Box */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Listed Price
                </span>
                <div className="text-3xl font-black text-neutral-900 mt-1">
                  {formatNaira(vehicle.price)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Exclusive of inspection and transfer fees
                </p>
              </div>

              {/* Trust Tier Ladder Stepper */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                  <span>Trust Tier Progress</span>
                  <span className="text-blue-600">Level {vehicle.trustTier} of 5</span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full ${
                        lvl <= vehicle.trustTier ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="text-[11px] text-gray-600 leading-relaxed">
                  Current Status: <b className="text-neutral-900">{vehicle.trustTierLabel}</b>.
                  {vehicle.trustTier >= 4
                    ? " Certified inspection report on file. You can buy with confidence."
                    : " Request an inspection to advance this listing to Tier 4."}
                </div>
              </div>

              {/* Primary Call to Action: Book Inspection */}
              <div className="space-y-3">
                <Link
                  href={`/buyer/inspections/book/${vehicle.id}`}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-center flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Request Inspection First</span>
                </Link>

                <Link
                  href={`/buyer/messages/${vehicle.id}`}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-center flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Seller (Masked)</span>
                </Link>
              </div>

              {/* Seller Profile Mini Card */}
              <div className="pt-5 border-t border-gray-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Seller Information
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-sm">
                    {vehicle.sellerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-neutral-900 truncate">
                      {vehicle.sellerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ★ {vehicle.sellerRating} • {vehicle.sellerType === "dealer" ? "Verified Dealer" : "Private Seller"}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Phone numbers and exact lot addresses remain masked until viewing or inspection is confirmed to protect buyer privacy.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
