import React from "react";
import Link from "next/link";
import {
  Users,
  Car,
  Wrench,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
          Platform Governance Console
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
          Verza Trust Engine Administration
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor verification queues, technician dispatches, dealer subscriptions, and fraud detection flags
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Total Live Listings</span>
          <div className="text-2xl font-black text-neutral-900">428</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            68% at Tier 3 or higher
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Active Dealer Shops</span>
          <div className="text-2xl font-black text-neutral-900">60</div>
          <span className="text-[11px] text-blue-600 font-semibold">
            ₦1.8M ARR from subscriptions
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Inspections Completed</span>
          <div className="text-2xl font-black text-neutral-900">184</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Avg completion time: 3.8 hrs
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Pending Verification</span>
          <div className="text-2xl font-black text-amber-600">3</div>
          <span className="text-[11px] text-amber-700 font-semibold">
            Requires admin document audit
          </span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-neutral-900">Verification Queue</h3>
            </div>
            <Link
              href="/admin/verifications"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Open Queue (3) →
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            3 customs single-goods declarations (SGD) and 1 technician certification application are awaiting administrative review.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-neutral-900">Lead Routing Board</h3>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage Routing →
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Review algorithmic technician matching and override dispatch assignments for urgent buyer inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
