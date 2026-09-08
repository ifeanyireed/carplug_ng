import React from "react";
import Link from "next/link";
import { MOCK_TECHNICIANS, MOCK_INSPECTIONS } from "@/data/mockStore";
import {
  Wrench,
  Star,
  CheckCircle,
  Clock,
  Wallet,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  const tech = MOCK_TECHNICIANS[0]; // Musa Danladi

  return (
    <div className="space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {tech.badge}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{tech.rating} Rating</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              Welcome back, {tech.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Service Base: {tech.workshopAddress} ({tech.serviceAreas.join(", ")})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/technician/inspections/insp-001/checklist"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>Open Active Checklist</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Monthly Payout Earnings</span>
          <div className="text-2xl font-black text-neutral-900">₦485,000</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            18 jobs completed this month
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Completed All-Time</span>
          <div className="text-2xl font-black text-neutral-900">{tech.completedJobs}</div>
          <span className="text-[11px] text-blue-600 font-semibold">
            Top 5% in Lagos Region
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Acceptance SLA</span>
          <div className="text-2xl font-black text-neutral-900">&lt; 15 mins</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            100% On-Time Arrival
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Trust Dispute Rate</span>
          <div className="text-2xl font-black text-neutral-900">0.0%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Zero audited discrepancies</span>
        </div>
      </div>

      {/* Active Inspection Task */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-base text-neutral-900">
              Active Job in Progress
            </h2>
          </div>
          <span className="text-xs font-semibold text-blue-600">
            Comprehensive Tier (₦35,000 Payout Split)
          </span>
        </div>

        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-base text-neutral-900">
              2021 Lexus RX 350 F-Sport AWD
            </h3>
            <p className="text-gray-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>Reed Motors Lot • Plot 14 Admiralty Way, Lekki Phase 1</span>
            </p>
            <p className="text-gray-500 font-mono">VIN: 2T2HZMCA4MC189402</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/technician/inspections/insp-001/checklist"
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>Resume Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/technician/inspections/insp-001/composer"
              className="px-4 py-2.5 bg-white border border-gray-200 text-neutral-900 font-semibold text-xs rounded-xl hover:bg-gray-50 transition"
            >
              Compose Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
