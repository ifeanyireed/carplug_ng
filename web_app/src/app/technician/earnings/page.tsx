"use client";

import React, { useEffect, useState } from "react";
import { fetchWallet, requestPayout, TransactionItem, WalletResponse } from "@/services/api";
import { 
  RefreshCw, 
  Banknote, 
  Clock, 
  ShieldCheck,
  ArrowUpRight,
  X
} from "lucide-react";

export default function TechnicianEarningsPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("Access Bank");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    async function loadWallet() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWallet();
        if (isSubscribed) {
          setWallet(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : "Failed to load wallet";
          setError(msg);
          setLoading(false);
        }
      }
    }
    loadWallet();
    return () => {
      isSubscribed = false;
    };
  }, [refreshIndex]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await requestPayout({
        amount: amountNum,
        bankName,
        accountNumber,
        accountName,
      });
      setSuccessMsg(`Withdrawal of ₦${amountNum.toLocaleString()} submitted to ${bankName} (${accountNumber})`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setRefreshIndex((i) => i + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process withdrawal";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const balance = wallet?.balance ?? 81000;
  const pendingEscrow = wallet?.pendingEscrow ?? 0;
  const totalEarned = wallet?.totalEarned ?? 116000;
  const transactions = wallet?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Earnings & Payout Wallet</h1>
          <p className="text-xs text-gray-500 mt-1">
            Inspection fee splits are auto-settled within 24 hours of report completion
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-400">Withdrawable Balance</span>
            <div className="text-2xl font-black text-emerald-600">
              ₦{balance.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Available Cash</span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              ₦{balance.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">Ready for instant bank transfer</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Escrow in Progress</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₦{pendingEscrow.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">Unlocks upon report delivery</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Lifetime Audits Settled</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              ₦{totalEarned.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400">100% platform guaranteed</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-bold ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 font-bold ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Completed Audit Settlements Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-neutral-900">Completed Audit Settlements</h2>
          <button
            onClick={() => setRefreshIndex((i) => i + 1)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Audit Details</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3">Payout Amount</th>
                <th className="pb-3">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading settlement records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No payout settlements found. Completed inspection audits will automatically reflect here.
                  </td>
                </tr>
              ) : (
                transactions.map((t: TransactionItem) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-gray-500">{t.reference || t.id}</td>
                    <td className="py-3">
                      <div className="font-bold text-neutral-900">{t.title}</div>
                      {t.notes && <div className="text-[11px] text-gray-400 mt-0.5">{t.notes}</div>}
                    </td>
                    <td className="py-3 font-medium text-gray-600 uppercase text-[11px]">
                      {t.gateway}
                    </td>
                    <td className="py-3 font-black text-neutral-900">
                      ₦{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        t.status === "settled"
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : t.status === "held_in_escrow"
                          ? "text-amber-700 bg-amber-50 border border-amber-200"
                          : "text-gray-700 bg-gray-50 border border-gray-200"
                      }`}>
                        {t.status === "settled" ? "Paid to Bank" : t.status === "held_in_escrow" ? "Escrow Locked" : t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Request Bank Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Funds are transferred to verified Nigerian commercial bank accounts via NIBSS instant settlement.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amount to Withdraw (₦)
                </label>
                <input
                  type="number"
                  required
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max: ₦${balance.toLocaleString()}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Destination Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-neutral-900"
                >
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="UBA">United Bank for Africa (UBA)</option>
                  <option value="Stanbic IBTC">Stanbic IBTC Bank</option>
                  <option value="Kuda Bank">Kuda Microfinance Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Babatunde Adeleke"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
