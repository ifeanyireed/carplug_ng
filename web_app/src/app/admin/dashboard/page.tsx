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
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Shield,
  Layers,
  Database,
} from "lucide-react";
import {
  fetchAdminMetrics,
  AdminMetrics,
  fetchVerifications,
  VerificationItem,
  fetchFlaggedListings,
  FlaggedListing,
} from "@/services/api";

type TimeRange = "today" | "7d" | "30d" | "all";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [flaggedListings, setFlaggedListings] = useState<FlaggedListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [refreshIndex, setRefreshIndex] = useState<number>(0);
  const [activeChartTab, setActiveChartTab] = useState<"volume" | "escrow">("volume");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [metricsData, verifData, flaggedData] = await Promise.all([
          fetchAdminMetrics(),
          fetchVerifications({ status: "pending" }),
          fetchFlaggedListings(),
        ]);
        if (isMounted) {
          setMetrics(metricsData);
          setVerifications(verifData?.data || []);
          setFlaggedListings(flaggedData || []);
        }
      } catch (err) {
        console.warn("Failed to load admin dashboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
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

  const tier3Percentage =
    metrics && metrics.totalVehicles > 0
      ? Math.round((metrics.tier3PlusVehicles / metrics.totalVehicles) * 100)
      : 0;

  const inspectionRate =
    metrics && metrics.totalInspections > 0
      ? Math.round((metrics.completedInspections / metrics.totalInspections) * 100)
      : 0;

  // Chart weekly mock trends for visual analytics
  const weeklyTrends = [
    { label: "W1", volume: 18.2, escrow: 7.4, verifications: 14 },
    { label: "W2", volume: 24.5, escrow: 11.2, verifications: 22 },
    { label: "W3", volume: 21.0, escrow: 9.8, verifications: 19 },
    { label: "W4", volume: 28.6, escrow: 13.5, verifications: 26 },
    { label: "W5", volume: 34.2, escrow: 16.8, verifications: 31 },
    { label: "W6", volume: 41.0, escrow: 21.4, verifications: 38 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Platform Governance Console
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-semibold text-gray-500">Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mt-2 tracking-tight">
            mycarsNg Trust Engine Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Real-time telemetry across inventory, KYC verification queues, technician dispatches, and financial settlements.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-auto">
          {/* Time Range Filter */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "all", label: "All Time" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === tab.id
                    ? "bg-white text-neutral-900 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh KPIs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Live Listings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Live Listings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                (metrics?.totalVehicles ?? 0).toLocaleString()
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                +12.4%
              </span>
              <span className="text-[11px] text-gray-400">vs last period</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Tier 3+ Verified</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {tier3Percentage}%
            </span>
          </div>
        </div>

        {/* Card 2: Active Dealer Shops */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Dealer Shops
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                (metrics?.totalDealers ?? 0).toLocaleString()
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600">
                <CheckCircle2 className="w-3 h-3" />
                CAC Verified
              </span>
              <span className="text-[11px] text-gray-400">Showrooms Active</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Subscribed Tier</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Pro & Enterprise
            </span>
          </div>
        </div>

        {/* Card 3: Inspections Completed */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Inspections Dispatched
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                `${metrics?.completedInspections ?? 0} / ${metrics?.totalInspections ?? 0}`
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-600">
                {inspectionRate}% Completion Rate
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(inspectionRate, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Technician capacity</span>
              <span className="font-semibold text-gray-600">
                {metrics?.totalTechnicians ?? 0} certified
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending KYC Verifications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pending KYC Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600 tracking-tight">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              ) : (
                (metrics?.pendingVerifications ?? 0).toLocaleString()
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Clock className="w-3 h-3" />
                Action Required
              </span>
              <span className="text-[11px] text-gray-400">Customs / CAC</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Target Audit SLA</span>
            <span className="font-bold text-neutral-900">&lt; 4 Hours</span>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Velocity Strip (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Gross Transaction Volume
            </span>
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {formatNaira(metrics?.totalVolume ?? 0)}
            </div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span>Escrow Reserve:</span>
              <span className="font-bold text-neutral-800">
                {formatNaira(metrics?.escrowVolume ?? 0)}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Inbound CRM Inquiries
            </span>
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {(metrics?.totalLeads ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              <span>Concierge Routing:</span>
              <span className="font-bold text-neutral-800">92% Claimed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Vehicle Swaps & Escrow
            </span>
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {(metrics?.totalSwaps ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 font-semibold flex items-center gap-1">
              <span>Active Trade-ins:</span>
              <span className="font-bold text-neutral-800">4 In Inspection</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Operational Grid: 8 Cols (Analytics + Triage) & 4 Cols (Activity & Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Interactive Chart + Urgent Triage */}
        <div className="lg:col-span-8 space-y-5">
          {/* Visual Analytics Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Financial Settlement & Throughput Velocity
                </h3>
                <p className="text-xs text-gray-500">
                  Weekly transaction volume (Millions ₦) vs. Escrow buffer
                </p>
              </div>

              <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveChartTab("volume")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeChartTab === "volume"
                      ? "bg-white text-neutral-900 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Gross Volume
                </button>
                <button
                  onClick={() => setActiveChartTab("escrow")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    activeChartTab === "escrow"
                      ? "bg-white text-neutral-900 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Escrow Buffer
                </button>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-2">
                {weeklyTrends.map((bar, idx) => {
                  const val = activeChartTab === "volume" ? bar.volume : bar.escrow;
                  const maxVal = activeChartTab === "volume" ? 45 : 25;
                  const heightPercent = Math.round((val / maxVal) * 100);

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₦{val}M
                      </div>
                      <div className="w-full bg-gray-100 rounded-t-xl h-36 flex items-end p-1">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            activeChartTab === "volume"
                              ? "bg-emerald-600 group-hover:bg-emerald-500"
                              : "bg-blue-600 group-hover:bg-blue-500"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 group-hover:text-neutral-900">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Gross Platform Settlement
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Inspections & Escrow Protection
                  </span>
                </div>
                <span className="font-semibold text-neutral-900">Updated Real-Time</span>
              </div>
            </div>
          </div>

          {/* Urgent Triage / Actionable Queue */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  High-Priority Operational Triage
                </h3>
              </div>
              <Link
                href="/admin/verifications"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Full Queue ({verifications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {verifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-gray-700">All audit queues are clear</p>
                <p className="text-[11px] text-gray-400">
                  No pending dealer licenses, customs declarations, or trade tests requiring review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {verifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">
                            {item.entityType === "customs_sgd"
                              ? "Customs Single Goods Declaration"
                              : item.entityType === "dealer_cac"
                              ? "Dealer CAC Registration Certificate"
                              : item.entityType === "tech_license"
                              ? "Technician Trade Test Certification"
                              : item.entityType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Audit
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          ID: <span className="font-mono text-gray-700">{item.id.slice(0, 8)}...</span>
                          {item.vin && ` · VIN: ${item.vin}`} · Submitted {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/verifications"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition shadow-xs self-start sm:self-center"
                    >
                      <span>Audit Document</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Governance Gateways (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link
              href="/admin/verifications"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition group space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900 mt-2">Verification Queue</h4>
              <p className="text-xs text-gray-500 line-clamp-2">
                Customs SGDs, CAC licenses, and technician trade test audit.
              </p>
            </Link>

            <Link
              href="/admin/listings"
              className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-5 shadow-xs transition group space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900 mt-2">Listings Moderation</h4>
              <p className="text-xs text-gray-500 line-clamp-2">
                Algorithmic anomaly flags, price outliers, and duplicate VIN detection.
              </p>
            </Link>

            <Link
              href="/admin/payments"
              className="bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs transition group space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900 mt-2">Financial Ledger</h4>
              <p className="text-xs text-gray-500 line-clamp-2">
                Escrow reserves, dealer subscription billing, and technician disbursements.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column (4 cols): Live Platform Audit Log & System Telemetry */}
        <div className="lg:col-span-4 space-y-5">
          {/* Live Audit Log Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Platform Audit Stream
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  title: "Technician Trade Test Submitted",
                  actor: "Lekki Hub · Chidi O.",
                  time: "4 mins ago",
                  type: "verification",
                  badge: "KYC",
                  color: "bg-blue-50 text-blue-700 border-blue-100",
                },
                {
                  title: "Escrow Deposit Locked",
                  actor: "₦450,000 for 2021 RX350",
                  time: "18 mins ago",
                  type: "payment",
                  badge: "Escrow",
                  color: "bg-emerald-50 text-emerald-700 border-emerald-100",
                },
                {
                  title: "Dealer Tier 4 Verification",
                  actor: "Apex Autos Lagos",
                  time: "1 hour ago",
                  type: "dealer",
                  badge: "Tier 4",
                  color: "bg-purple-50 text-purple-700 border-purple-100",
                },
                {
                  title: "Suspicious VIN Alert Cleared",
                  actor: "Admin Moderation Action",
                  time: "3 hours ago",
                  type: "security",
                  badge: "Audit",
                  color: "bg-gray-100 text-gray-700 border-gray-200",
                },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{log.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${log.color}`}>
                        {log.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{log.actor}</p>
                    <span className="text-[10px] text-gray-400 block">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure & Database Health Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Infrastructure Health
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                99.98% SLA
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600">Postgres Database</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Connected (24ms)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600">Escrow Settlement Node</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Synchronized
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600">Document OCR Engine</span>
                <span className="font-semibold text-blue-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
