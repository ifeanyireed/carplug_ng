import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_INSPECTIONS } from "@/data/mockStore";
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default async function InspectionTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = MOCK_INSPECTIONS.find((i) => i.id === id) || MOCK_INSPECTIONS[0];

  const steps = [
    { title: "Request Booked & Escrow Funded", status: "completed", time: "10:00 AM" },
    { title: "Technician Musa Dispatched", status: "completed", time: "10:15 AM" },
    { title: "On-Site Diagnostic & Structural Scan", status: "completed", time: "11:00 AM" },
    { title: "Vehicle Health Report Filed & Verified", status: "completed", time: "12:35 PM" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/buyer/search" className="hover:text-blue-600">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Inspection Tracker</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono">{inspection.id}</span>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                ● Live Status: Report Ready
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
                {inspection.vehicleTitle}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Tier: <b className="text-neutral-900">{inspection.inspectionTier} Diagnostic</b> • Assigned to {inspection.technicianName}
              </p>
            </div>

            <Link
              href={`/buyer/inspections/${inspection.id}/report`}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition shrink-0"
            >
              <span>View Health Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stepper */}
          <div className="space-y-6 py-2">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 h-10 bg-emerald-200 mt-1" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-neutral-900">{s.title}</h4>
                    <span className="text-xs text-gray-400 font-mono">{s.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {idx === 3
                      ? "The certified inspection checklist, photos, and defect summary are now published."
                      : "Completed by platform verification engine."}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Technician Info Strip */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm">
                M
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900">
                  {inspection.technicianName} ({inspection.technicianTier})
                </div>
                <div className="text-[11px] text-gray-500">
                  Phone: {inspection.technicianPhone}
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
              Verified Audit
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
