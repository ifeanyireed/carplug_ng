"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Camera, Mic, Upload, CheckCircle2, ArrowRight, Save } from "lucide-react";

export default function ReportComposerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [verdict, setVerdict] = useState(
    "Exceptional mechanical condition overall. Engine, transmission, and hybrid auxiliary system tested in top quartile. Front lower control arm bushings show slight superficial wear typical of 28k miles on rough roads — budget approximately ₦80k-₦120k for OEM bushings within the next year. Clean title and Tin Can customs docs confirmed genuine."
  );
  const [overallScore, setOverallScore] = useState(92);
  const [repairLow, setRepairLow] = useState("80000");
  const [repairHigh, setRepairHigh] = useState("140000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">
          File Vehicle Health Report
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          2021 Lexus RX 350 F-Sport AWD • Inspection #insp-001
        </p>

        {submitted ? (
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">
              Vehicle Health Report Filed &amp; Verified!
            </h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Your report has been stamped with the Tier 5 certification seal. The buyer has been notified and funds released to your wallet.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/buyer/inspections/insp-001/report"
                className="px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl"
              >
                Preview Public Health Report
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Overall Mechanical Health Score (0 - 100%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-extrabold text-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Plain-Language Verdict Summary (for non-mechanic buyers)
              </label>
              <textarea
                rows={5}
                required
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Repair Budget Min (₦)
                </label>
                <input
                  type="number"
                  value={repairLow}
                  onChange={(e) => setRepairLow(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Repair Budget Max (₦)
                </label>
                <input
                  type="number"
                  value={repairHigh}
                  onChange={(e) => setRepairHigh(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-900">
                Attach Diagnostic Photos & Voice Note
              </div>
              <p className="text-[11px] text-gray-400">
                Engine bay, OBD-II scanner screen, undercarriage rails, tire gauges
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Submit & Publish Vehicle Health Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
