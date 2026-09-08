"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import {
  Car,
  FileCheck,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Wrench,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function AddVehicleWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [published, setPublished] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic details
    make: "Mercedes-Benz",
    model: "GLC 300",
    year: "2021",
    trim: "4MATIC AMG Line",
    bodyType: "SUV",
    // Step 2: Condition
    condition: "Foreign Used (Tokunbo)",
    // Step 3: Location
    locationZone: "Lekki Phase 1, Lagos",
    exactAddress: "Plot 14 Admiralty Way",
    // Step 4: Specs
    mileage: "32000",
    transmission: "Automatic",
    engineSize: "2.0L Turbo Inline-4",
    fuelType: "Petrol",
    // Step 5: Customs & Docs
    vin: "WDC2539841F901823",
    customsCleared: true,
    originalReceipt: true,
    // Step 6: Pricing
    askingPrice: "42000000",
    negotiable: true,
    // Step 7: Faults disclosure
    disclosedFaults: "Minor front bumper stone chips. Interior pristine.",
    // Step 8: Pre-inspection opt-in
    preInspectionOptIn: true,
  });

  const steps = [
    "Vehicle Identity",
    "Condition Category",
    "Public Zone & Location",
    "Powertrain & Mileage",
    "Customs Papers & VIN",
    "Photos & Walkaround Video",
    "Pricing & Market Valuation",
    "Fault Disclosures",
    "Pre-Inspection Dispatch",
    "Review & Publish",
  ];

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setPublished(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              10-Step Publishing Pipeline
            </span>
            <h1 className="text-2xl font-black text-neutral-900 mt-1">
              Add Vehicle to Showroom
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Listings climb the Trust Ladder as verified documentation is uploaded.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-gray-400">Step {currentStep} of 10</span>
            <div className="font-extrabold text-sm text-neutral-900 mt-0.5">
              {steps[currentStep - 1]}
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-10 gap-1.5 pt-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition ${
                idx + 1 <= currentStep ? "bg-neutral-900" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        {published ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              Vehicle Published at Tier 4!
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Your 2021 Mercedes-Benz GLC 300 is now live on the marketplace. Customs documents have been queued for administrative seal, and pre-inspection dispatch has been triggered.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/dealer/vehicles"
                className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800"
              >
                Go to Active Inventory
              </Link>
              <Link
                href="/buyer/search"
                className="px-5 py-2.5 bg-gray-100 text-neutral-900 font-semibold text-xs rounded-xl hover:bg-gray-200"
              >
                View on Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 1: Vehicle Make, Model, Year & Trim
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Trim / Edition</label>
                    <input
                      type="text"
                      value={formData.trim}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 2: Condition Classification (Nigerian Market)
                </h3>
                <div className="space-y-3">
                  {[
                    { id: "Foreign Used (Tokunbo)", desc: "Direct foreign import with port customs clearance" },
                    { id: "Nigerian Used", desc: "Registered and previously driven in Nigeria with plate history" },
                    { id: "Brand New", desc: "Zero-mileage factory fresh vehicle with manufacturer certificate" },
                  ].map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setFormData({ ...formData, condition: c.id as any })}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        formData.condition === c.id
                          ? "bg-blue-50/70 border-blue-500 shadow-xs"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-bold text-sm text-neutral-900">{c.id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 3: Public Privacy Zone vs Exact Lot Address
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Public Zone (Shown on Marketplace Search)
                    </label>
                    <input
                      type="text"
                      value={formData.locationZone}
                      onChange={(e) => setFormData({ ...formData, locationZone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Exact Showroom Address (Masked until inspection/viewing booked)
                    </label>
                    <input
                      type="text"
                      value={formData.exactAddress}
                      onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 4: Mileage, Transmission & Powertrain
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Odometer Mileage (mi)</label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Engine Size</label>
                    <input
                      type="text"
                      value={formData.engineSize}
                      onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 5: Customs Documentation & VIN (Unlocks Tier 2)
                </h3>
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-xs font-bold text-neutral-900">
                    Upload Federal Customs Single Goods Declaration (SGD) & Release
                  </div>
                  <p className="text-[11px] text-gray-500">PDF, JPG or PNG up to 10MB</p>
                  <button className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold">
                    Browse File
                  </button>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 6: High-Res Photos & Walkaround Video
                </h3>
                <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-xs font-bold text-neutral-900">
                    Drag & Drop at least 8 high-resolution photos
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Front, rear, sides, interior dashboard, odometer, engine bay, and undercarriage
                  </p>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 7: Asking Price & Price Intelligence Rating
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Showroom Asking Price (₦ Naira)
                  </label>
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-extrabold text-neutral-900 focus:bg-white focus:outline-none"
                  />
                  <span className="block text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Projected Price Rating: 🟢 Fair Market Value (Median ₦40m - ₦44m)
                  </span>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 8: Transparent Fault Disclosures
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Disclose known cosmetic or mechanical defects
                  </label>
                  <textarea
                    rows={4}
                    value={formData.disclosedFaults}
                    onChange={(e) => setFormData({ ...formData, disclosedFaults: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none leading-relaxed"
                  />
                  <span className="block text-[11px] text-gray-400 mt-1">
                    Disclosing defects prevents inspection deal dropouts and elevates trust score.
                  </span>
                </div>
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 9: Pre-Inspection Dispatch (Unlocks Tier 4 & 5)
                </h3>
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
                  <Wrench className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 space-y-1">
                    <div className="font-bold text-sm">
                      Dispatch an Independent Technician to your Lot
                    </div>
                    <p className="text-blue-800 leading-relaxed">
                      Pre-inspected dealer vehicles receive 4x more viewings and sell 18 days faster on average. Verza handles technician dispatch automatically.
                    </p>
                    <label className="flex items-center gap-2 pt-2 font-bold text-neutral-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preInspectionOptIn}
                        onChange={(e) =>
                          setFormData({ ...formData, preInspectionOptIn: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Yes, dispatch pre-inspection before publishing (₦25,000 billed to shop wallet)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 10: Final Review & Publish
                </h3>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle:</span>
                    <span className="font-bold text-neutral-900">
                      {formData.year} {formData.make} {formData.model} {formData.trim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Asking Price:</span>
                    <span className="font-bold text-neutral-900">
                      ₦{Number(formData.askingPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-bold text-neutral-900">{formData.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Initial Trust Tier:</span>
                    <span className="font-bold text-blue-600">
                      {formData.preInspectionOptIn ? "Tier 4 (Technician Dispatched)" : "Tier 2"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <span>{currentStep === 10 ? "Publish Listing" : "Next Step"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
