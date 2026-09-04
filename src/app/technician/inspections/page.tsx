"use client";

import React from "react";
import Link from "next/link";
import { MOCK_INSPECTIONS } from "@/data/mockStore";
import { Wrench, CheckCircle2, MapPin, ArrowRight } from "lucide-react";

export default function TechnicianInspectionsListPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">Inspection Jobs</h1>
        <p className="text-xs text-gray-500 mt-1">
          Active dispatches, scheduled lot appointments, and completed certified audits
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_INSPECTIONS.map((insp) => (
          <div
            key={insp.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                  {insp.status === "completed" ? "✓ Report Verified" : "In Progress"}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-neutral-800">
                  {insp.inspectionTier} Tier
                </span>
              </div>
              <h3 className="font-bold text-base text-neutral-900">{insp.vehicleTitle}</h3>
              <p className="text-xs text-gray-500 font-mono">VIN: {insp.vehicleVin}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/technician/inspections/${insp.id}/checklist`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl transition"
              >
                Audit Checklist
              </Link>
              <Link
                href={`/buyer/inspections/${insp.id}/report`}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
              >
                View Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
