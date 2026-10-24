"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { InspectionReport } from "@/data/mockStore";
import {
  fetchTechnicianMeInspections,
  fetchWallet,
  fetchMyVerifications,
  requestPayout,
  WalletResponse,
  VerificationItem,
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
  Banknote,
  X,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [techVerification, setTechVerification] = useState<VerificationItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Manual Payout Request State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bankName, setBankName] = useState("Zenith Bank PLC");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenPayoutModal = () => {
    setPayoutMessage(null);
    setPayoutAmount(wallet?.balance ? String(wallet.balance) : "20000");
    setAccountName(user?.name || "Musa Danladi");
    setIsPayoutModalOpen(true);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      setPayoutMessage({ type: "error", text: "Please enter a valid payout amount greater than zero." });
      return;
    }
    if (wallet && amountNum > wallet.balance) {
      setPayoutMessage({
        type: "error",
        text: `Requested amount (₦${amountNum.toLocaleString()}) exceeds available balance of ₦${wallet.balance.toLocaleString()}.`,
      });
      return;
    }
    if (!accountNumber || accountNumber.trim().length < 10) {
      setPayoutMessage({ type: "error", text: "Please enter a valid 10-digit NUBAN bank account number." });
      return;
    }
    if (!accountName.trim()) {
      setPayoutMessage({ type: "error", text: "Please enter the account beneficiary name as on bank record." });
      return;
    }

    setPayoutSubmitting(true);
    setPayoutMessage(null);
    try {
      const res = await requestPayout({
        amount: amountNum,
        bankName,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });
      setPayoutMessage({
        type: "success",
        text: res.message || "Payout requested successfully! Queued for Super Admin settlement.",
      });
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        handleRefresh();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit payout request.";
      setPayoutMessage({ type: "error", text: msg });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTechDashboard() {
      try {
        const [jobs, walletData, verifs] = await Promise.all([
          fetchTechnicianMeInspections().catch(() => []),
          fetchWallet().catch(() => null),
          fetchMyVerifications({ entityType: "tech_license" }).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        setInspections(jobs);
        setWallet(walletData);
        if (verifs && verifs.data && verifs.data.length > 0) {
          setTechVerification(verifs.data[0]);
        }
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
              {techVerification?.status === "approved" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  Master Certified Diagnostic
                </span>
              ) : techVerification?.status === "pending" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  Accreditation Pending Review
                </span>
              ) : (
                <Link
                  href="/technician/onboard"
                  className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                >
                  Submit Credentials →
                </Link>
              )}
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
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-emerald-600 font-semibold block">
              Ready for instant bank transfer
            </span>
            <button
              onClick={handleOpenPayoutModal}
              disabled={(wallet?.balance ?? 0) <= 0}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
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

      {/* Manual Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Request Bank Withdrawal</h3>
                  <p className="text-xs text-gray-500">Disbursed via instant NIP settlement</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {payoutMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  payoutMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {payoutMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{payoutMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Withdrawal Amount (₦)</span>
                  <span className="text-gray-400">
                    Max: <b className="text-neutral-900">₦{(wallet?.balance ?? 0).toLocaleString()}</b>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={wallet?.balance ?? 10000000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Destination Bank</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Zenith Bank PLC">Zenith Bank PLC</option>
                    <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access Bank PLC">Access Bank PLC</option>
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                    <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                    <option value="Fidelity Bank PLC">Fidelity Bank PLC</option>
                    <option value="Opay / Paycom">Opay / Paycom</option>
                    <option value="Palmpay">Palmpay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">NUBAN Account Number (10 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 2081192834"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Beneficiary Account Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Musa Danladi"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {payoutSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Submit Withdrawal Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
