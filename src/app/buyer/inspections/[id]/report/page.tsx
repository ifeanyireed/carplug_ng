import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_INSPECTIONS } from "@/data/mockStore";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  Share2,
  Printer,
  Calendar,
  Award,
  ArrowLeft,
  DollarSign,
} from "lucide-react";

export default async function VehicleHealthReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = MOCK_INSPECTIONS.find((i) => i.id === id) || MOCK_INSPECTIONS[0];

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Link
              href={`/buyer/vehicles/${report.vehicleId}`}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
              title="Back to vehicle"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[11px] text-gray-500 font-mono uppercase">
                Official Report #{report.id}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                Vehicle Health Report
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
            <Link
              href={`/buyer/vehicles/${report.vehicleId}`}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
            >
              Back to Vehicle Listing
            </Link>
          </div>
        </div>

        {/* Report Overview Card */}
        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          {/* Top Score Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                <span className="text-3xl font-black">{report.overallScore}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">Health</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Grade A Condition
                  </span>
                  <span className="text-xs text-gray-500">
                    Inspected {new Date(report.completedDate!).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900">{report.vehicleTitle}</h2>
                <p className="text-xs text-gray-500 font-mono">VIN: {report.vehicleVin}</p>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 md:border-l border-emerald-200/60 pt-4 md:pt-0 md:pl-6">
              <div className="text-xs text-gray-500">Certified Verifier</div>
              <div className="font-bold text-sm text-neutral-900 mt-0.5">
                {report.technicianName}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                {report.technicianTier}
              </div>
            </div>
          </div>

          {/* Plain-Language Technician Recommendation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Plain-Language Mechanic Verdict
            </h3>
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-neutral-900 leading-relaxed italic">
              "{report.technicianSummary}"
            </div>
            {report.estimatedRepairCostRange && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-semibold text-amber-900">
                  Estimated Repair / Maintenance Budget Needed:
                </span>
                <span className="font-bold text-amber-900 text-sm">
                  {formatNaira(report.estimatedRepairCostRange[0])} –{" "}
                  {formatNaira(report.estimatedRepairCostRange[1])}
                </span>
              </div>
            )}
          </div>

          {/* Subsystem Checklist Breakdowns */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Detailed Mechanical Subsystem Breakdown
            </h3>

            <div className="space-y-4">
              {report.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">{cat.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.status === "pass"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cat.status === "pass" ? "Passed" : "Advisory"}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">{cat.score}%</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {cat.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-2.5 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <div className="font-medium text-gray-800">{item.label}</div>
                          {item.note && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {item.note}
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.status === "good"
                              ? "text-emerald-700 bg-emerald-100/70"
                              : "text-amber-700 bg-amber-100/70"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
