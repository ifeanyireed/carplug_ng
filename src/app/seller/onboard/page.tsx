"use client";

import React, { useState } from "react";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function SellerKYCOnboardPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ninNumber, setNinNumber] = useState("49201928401");
  const [documentType, setDocumentType] = useState("National Identity Card (NIN)");

  const handleKYC = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NDPR Compliant Verification</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-neutral-900 mt-2">
          Private Seller Identity Verification
        </h1>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Verza requires verified identity for private sellers before listings become discoverable. This eliminates phantom car listings and protects buyers.
        </p>

        {submitted ? (
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">
              Verification Documents Received
            </h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Your NIN details have been matched against NIMC records. Your listing is now approved for live publishing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleKYC} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ID Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              >
                <option>National Identity Card (NIN Slip)</option>
                <option>Voter's Card (INEC PVC)</option>
                <option>Nigerian International Passport</option>
                <option>FRSC Driver's License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Identification Number (NIN / Driver's Lic)
              </label>
              <input
                type="text"
                required
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Upload Photo of Document
              </label>
              <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="text-xs font-semibold text-neutral-800">
                  Tap to upload document photo
                </div>
                <p className="text-[10px] text-gray-400">JPEG, PNG or PDF up to 8MB</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Submit for Instant Identity Verification
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
