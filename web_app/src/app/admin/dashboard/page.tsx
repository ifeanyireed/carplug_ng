"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  Car,
  Store,
  Wrench,
  Banknote,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { fetchAdminMetrics, AdminMetrics } from "@/services/api";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        const data = await fetchAdminMetrics();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err) {
        console.warn("Failed to load admin metrics:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const formatNaira = (amount: number) => {
    if (amount >= 1e6) {
      return `₦${(amount / 1e6).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const tier3Percentage = metrics && metrics.totalVehicles > 0
    ? Math.round((metrics.tier3PlusVehicles / metrics.totalVehicles) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
            Platform Governance Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
            Verza Trust Engine Administration
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time telemetry across inventory, KYC verification queues, technician dispatches, and financial settlements
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Refreshing..." : "Refresh KPIs"}</span>
        </button>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Live Listings</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : (metrics?.totalVehicles ?? 0)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {tier3Percentage}% at Tier 3 or higher
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Active Dealer Shops</span>
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : (metrics?.totalDealers ?? 0)}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold block">
            Verified Showrooms Active
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Inspections Completed</span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : (metrics?.completedInspections ?? 0)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Of {metrics?.totalInspections ?? 0} Dispatched Jobs
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pending KYC Verifications</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-amber-400 mt-1" /> : (metrics?.pendingVerifications ?? 0)}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold block">
            Requires admin document audit
          </span>
        </div>
      </div>

      {/* Secondary Financial & Activity Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Total Transaction Volume</span>
            <div className="text-xl font-black text-neutral-900 mt-0.5">
              {formatNaira(metrics?.totalVolume ?? 0)}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Escrow: {formatNaira(metrics?.escrowVolume ?? 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Inbound Leads & Concierge</span>
            <div className="text-xl font-black text-neutral-900 mt-0.5">
              {metrics?.totalLeads ?? 0}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">
              CRM inquiries active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Vehicle Swaps & Trade-ins</span>
            <div className="text-xl font-black text-neutral-900 mt-0.5">
              {metrics?.totalSwaps ?? 0}
            </div>
            <span className="text-[11px] text-purple-600 font-medium">
              Swap requests logged
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Access Governance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-neutral-900">Verification Queue</h3>
            </div>
            <Link
              href="/admin/verifications"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Queue ({metrics?.pendingVerifications ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Audit customs Single Goods Declarations (SGD), dealer CAC licenses, and technician trade test certifications.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-neutral-900">Listings Moderation</h3>
            </div>
            <Link
              href="/admin/listings"
              className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Moderate Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Review algorithmic anomaly flags for pricing discrepancies, duplicate VIN detections, and suspend suspect listings.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-neutral-900">Financial Ledger</h3>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Inspect inspection escrow reserves, dealer subscription billing history, and technician payout disbursements.
          </p>
        </div>
      </div>
    </div>
  );
}
