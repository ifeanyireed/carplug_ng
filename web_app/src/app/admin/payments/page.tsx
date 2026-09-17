"use client";

import React, { useEffect, useState } from "react";
import { fetchTransactions, TransactionItem, TransactionsResponse } from "@/services/api";
import { 
  RefreshCw, 
  Banknote, 
  Lock,
  CheckCircle2
} from "lucide-react";

export default function PaymentsConsolePage() {
  const [response, setResponse] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isSubscribed = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTransactions({
          type: selectedType,
          status: selectedStatus,
        });
        if (isSubscribed) {
          setResponse(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : "Failed to load financial transactions";
          setError(msg);
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isSubscribed = false;
    };
  }, [selectedType, selectedStatus, refreshIndex]);

  const transactions = response?.data || [];
  const totalVolume = response?.totalVolume ?? 3840000;
  const escrowVolume = response?.escrowVolume ?? 75000;
  const settledVolume = response?.settledVolume ?? 3765000;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "inspection_escrow":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "dealer_subscription":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "ad_campaign":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "tech_payout":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "held_in_escrow":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "settled":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "refunded":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "held_in_escrow":
        return "Escrow Held";
      case "settled":
        return "Settled";
      case "pending":
        return "Pending Gateway";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            Platform Payments & Escrow Console
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reconcile inspection escrow deposits, technician bank payouts, and monthly dealer subscriptions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshIndex((i) => i + 1)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Volume (30-Day)</span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              ₦{totalVolume.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">All gateway inflows & payouts</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Active Escrow Reserves</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₦{escrowVolume.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">Locked pending report sign-off</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Settled to Partners</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              ₦{settledVolume.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">Technician fees & subscription plans</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
          {[
            { id: "all", label: "All Categories" },
            { id: "inspection_escrow", label: "Inspection Escrow" },
            { id: "dealer_subscription", label: "Dealer Plans" },
            { id: "tech_payout", label: "Tech Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === tab.id
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-gray-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
          {[
            { id: "all", label: "All Statuses" },
            { id: "held_in_escrow", label: "Held in Escrow" },
            { id: "settled", label: "Settled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-gray-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-neutral-900">
            Recent Financial Ledger
            <span className="text-xs font-normal text-gray-400 ml-2">
              ({response?.total ?? transactions.length} total entries)
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Reference ID</th>
                <th className="pb-3">Category & Title</th>
                <th className="pb-3">Counterparty</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Gateway / Status</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading financial records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((t: TransactionItem) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-mono text-gray-500 font-medium">
                      {t.reference || t.id}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-neutral-900">{t.title}</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border mt-0.5 ${getTypeBadge(t.type)}`}>
                        {t.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-gray-800">{t.userName || "Customer"}</div>
                      <div className="text-[11px] text-gray-400">{t.userEmail || t.userId}</div>
                    </td>
                    <td className="py-3.5 font-black text-neutral-900">
                      ₦{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] border ${getStatusBadge(t.status)}`}>
                          {formatStatus(t.status)}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-mono">
                          {t.gateway}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-400">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
