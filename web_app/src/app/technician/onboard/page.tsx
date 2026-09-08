"use client";

import React, { useState } from "react";
import { Award, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";

export default function TechnicianOnboardingPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">
          Technician Certification & Credentials
        </h1>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Verza technicians are independently vetted mechanical specialists. Upload your trade qualifications and garage details to qualify for platform dispatches.
        </p>

        {submitted ? (
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">
              Application Under Admin Review
            </h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Our engineering team verifies trade certifications and garage references within 48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mechanical Certification / Trade Accreditation
              </label>
              <input
                type="text"
                required
                defaultValue="ASE Certified Master Auto Technician / NABTEB"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Physical Workshop / Garage Base Address
              </label>
              <input
                type="text"
                required
                defaultValue="Block 8 Autocare Center, Maroko, Lekki, Lagos"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Primary Coverage Zones
              </label>
              <input
                type="text"
                required
                defaultValue="Lekki Phase 1, Victoria Island, Ikoyi, Ajah"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Diagnostic Equipment Owned
              </label>
              <textarea
                rows={3}
                defaultValue="Autel MaxiSys Ultra OBD-II scanner, Digital paint thickness meter, Battery & alternator load tester, Compression gauge."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Submit Credentials for Verification
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
