"use client";

import React, { useEffect, useState } from "react";
import { 
  fetchTransactions, 
  updatePayoutStatus, 
  TransactionItem, 
  TransactionsResponse 
} from "@/services/api";
import { 
  RefreshCw, 
  Banknote, 
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  X,
  Check,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function PaymentsConsolePage() {
  const [response, setResponse] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Manual Payout Action Modal State
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [modalMode, setModalMode] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenApprove = (t: TransactionItem) => {
    setSelectedTxn(t);
    setModalMode("approve");
    setActionNotes(`Disbursed via NIP Instant Bank Settlement REF-NIP-${Date.now().toString().slice(-8)}`);
    setActionToast(null);
  };

  const handleOpenReject = (t: TransactionItem) => {
    setSelectedTxn(t);
    setModalMode("reject");
    setActionNotes("Account name does not match BVN identity on file");
    setActionToast(null);
  };

  const handleCloseModal = () => {
    setSelectedTxn(null);
    setModalMode(null);
    setActionNotes("");
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn || !modalMode) return;

    setIsActionSubmitting(true);
    setActionToast(null);

    const targetStatus = modalMode === "approve" ? "settled" : "refunded";

    try {
      const res = await updatePayoutStatus(selectedTxn.id, {
        status: targetStatus,
        notes: actionNotes.trim(),
      });
      setActionToast({
        type: "success",
        text: res.message || `Payout marked as ${targetStatus} successfully!`,
      });
      setTimeout(() => {
        handleCloseModal();
        setRefreshIndex((i) => i + 1);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update payout status";
      setActionToast({ type: "error", text: msg });
    } finally {
      setIsActionSubmitting(false);
    }
  };

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
  const pendingPayouts = transactions.filter((t) => t.type === "tech_payout" && t.status === "pending");
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

      {/* Pending Payouts Requiring Action */}
      {pendingPayouts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-950">
                  Technician Withdrawal Requests ({pendingPayouts.length}) Pending Settlement
                </h3>
                <p className="text-xs text-amber-800">
                  Technicians have requested bank withdrawals. Verify BVN account matches before issuing settlement.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-extrabold uppercase tracking-wider self-start sm:self-auto">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingPayouts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">{p.userName}</span>
                    <span className="text-base font-black text-neutral-900">₦{p.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.title}</p>
                  {p.notes && (
                    <p className="text-[11px] font-mono text-gray-400 bg-gray-50 rounded-lg p-1.5 mt-2 border border-gray-100">
                      {p.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">{p.reference || p.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReject(p)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleOpenApprove(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve &amp; Settle</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <th className="pb-3">Category &amp; Title</th>
                <th className="pb-3">Counterparty</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Gateway / Status</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading financial records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
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
                      {t.notes && (
                        <div className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">
                          {t.notes}
                        </div>
                      )}
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
                    <td className="py-3.5 text-right">
                      {t.type === "tech_payout" && t.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenApprove(t)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(t)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] border border-rose-200 transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Payout Action Modal (Approve or Reject) */}
      {modalMode && selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    modalMode === "approve"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {modalMode === "approve" ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    {modalMode === "approve" ? "Confirm Bank Disbursement" : "Reject Withdrawal Request"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Transaction ID: <span className="font-mono text-gray-700">{selectedTxn.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionToast && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  actionToast.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {actionToast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{actionToast.text}</span>
              </div>
            )}

            {/* Payout Details Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-bold text-neutral-900">{selectedTxn.userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Disbursement Amount:</span>
                <span className="text-base font-black text-neutral-900">
                  ₦{selectedTxn.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Destination:</span>
                <span className="font-semibold text-gray-700 text-right">{selectedTxn.title}</span>
              </div>
              {selectedTxn.notes && (
                <div className="pt-2 border-t border-gray-200 text-[11px] font-mono text-gray-600">
                  {selectedTxn.notes}
                </div>
              )}
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {modalMode === "approve"
                    ? "Bank Disbursement Notes / NIP Session Reference"
                    : "Compliance Rejection Reason (Audit Log)"}
                </label>
                <input
                  type="text"
                  required
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={
                    modalMode === "approve"
                      ? "e.g. NIP Settlement REF-20261024-9182"
                      : "e.g. Account name mismatch with BVN identity on file"
                  }
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-xs ${
                    modalMode === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      : "bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                  }`}
                >
                  {isActionSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : modalMode === "approve" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Disbursement</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Rejection</span>
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
