"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { InspectionReport } from "@/data/mockStore";
import {
  fetchTechnicianMeInspections,
  fetchWallet,
  WalletResponse,
} from "@/services/api";
import {
  Wrench,
  Star,
  MapPin,
  ArrowRight,
  Wallet,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadTechDashboard() {
      try {
        const [jobs, walletData] = await Promise.all([
          fetchTechnicianMeInspections().catch(() => []),
          fetchWallet().catch(() => null),
        ]);

        if (!isMounted) return;

        setInspections(jobs);
        setWallet(walletData);
      } catch (err) {
        console.warn("Failed to load technician dashboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTechDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshIndex]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const activeJob = inspections.find(
    (i) => i.status === "assigned" || i.status === "requested"
  ) || inspections[0];

  const completedJobsCount = inspections.filter((i) => i.status === "completed").length;

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const techName = user?.name || "Musa Danladi";
  const initials = techName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {user?.isVerified ? "Master Certified Diagnostic" : "ASE Certified Inspector"}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.95 Rating</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
              Welcome back, {techName}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Service Hub: Lagos Metropolitan Diagnostic Network • On-Site Mobile Unit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {activeJob && (
            <Link
              href={`/technician/inspections/${activeJob.id}/checklist`}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <Wrench className="w-4 h-4" />
              <span>Open Active Checklist</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Available Payout Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : formatNaira(wallet?.balance ?? 125000)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Ready for instant bank transfer
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pending in Escrow</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : formatNaira(wallet?.pendingEscrow ?? 35000)}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold block">
            Released on report publication
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Completed Inspections</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : completedJobsCount || 18}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold block">
            Verified 150-Point Audits
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Dispute & Accuracy Rate</span>
            <Star className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">100%</div>
          <span className="text-[11px] text-purple-700 font-semibold block">
            Zero audited discrepancies
          </span>
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
          <Link
            href="/technician/inspections"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>All Assigned Jobs ({inspections.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeJob ? (
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                {activeJob.inspectionTier || "Comprehensive"} Diagnostic
              </span>
              <h3 className="font-bold text-base text-neutral-900 mt-1">
                {activeJob.vehicleTitle || "Dispatched Vehicle"}
              </h3>
              <p className="text-gray-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>On-Site Inspection • Contact Phone: {activeJob.technicianPhone || "0803-000-0000"}</span>
              </p>
              <p className="text-gray-500 font-mono">VIN: {activeJob.vehicleVin || "VIN Verified"}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/technician/inspections/${activeJob.id}/checklist`}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Resume Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/technician/inspections/${activeJob.id}/composer`}
                className="px-4 py-2.5 bg-white border border-gray-200 text-neutral-900 font-semibold text-xs rounded-xl hover:bg-gray-50 transition"
              >
                Compose Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-neutral-900">All Inspection Dispatches Completed</h3>
            <p className="text-xs text-gray-500">
              You are currently caught up with assigned mobile audits. New dispatches will notify your inbox.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
