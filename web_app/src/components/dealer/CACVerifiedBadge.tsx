"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Building2, X, ExternalLink, Award } from "lucide-react";

interface CACVerifiedBadgeProps {
  verifiedCAC: boolean;
  cacRegistrationNumber?: string;
  dealerName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CACVerifiedBadge: React.FC<CACVerifiedBadgeProps> = ({
  verifiedCAC,
  cacRegistrationNumber,
  dealerName = "Verified Dealership",
  className = "",
  size = "md",
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!verifiedCAC) return null;

  const rcNumber = cacRegistrationNumber || "RC-1849204";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-semibold transition cursor-pointer shadow-2xs group ${sizeClasses[size]} ${className}`}
        title="Click to view Corporate Affairs Commission (CAC) verification details"
      >
        <ShieldCheck className={`${iconSizes[size]} text-emerald-600 group-hover:scale-110 transition-transform`} />
        <span>CAC Certified</span>
        <span className="text-emerald-600/80 font-mono text-[10px] hidden sm:inline">
          ({rcNumber})
        </span>
      </button>

      {/* Verification Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-800/40 px-2 py-0.5 rounded-md">
                      Official Verification
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    CAC Registered Dealership
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Business Entity:</span>
                  <span className="font-bold text-gray-900">{dealerName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Registration Number:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {rcNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Registry:</span>
                  <span className="font-semibold text-gray-900">
                    Corporate Affairs Commission (CAC) Nigeria
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Verification Status:</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified & Active
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <b className="text-gray-900">Physical Lot Audited:</b> Verified dealer with active physical showroom premises and registered automotive dealership license.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <b className="text-gray-900">Buyer Protection:</b> All vehicle transactions and escrow deposits made through mycarsNg are backed by our verified escrow engine.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  Close Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
