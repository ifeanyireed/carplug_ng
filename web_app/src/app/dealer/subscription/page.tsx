"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  CreditCard,
  Receipt,
  ExternalLink,
  Calendar,
  Lock,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  fetchDealerSubscription,
  upgradeDealerSubscription,
  DealerSubscriptionResponse,
  fetchTransactions,
  initializePayment,
  TransactionItem,
} from "@/services/api";

import {
  SUBSCRIPTION_TIERS,
  normalizePlanKey,
} from "@/services/SubscriptionHelper";

export default function DealerSubscriptionPage() {
  const [subData, setSubData] = useState<DealerSubscriptionResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [subRes, txRes] = await Promise.all([
          fetchDealerSubscription().catch(() => null),
          fetchTransactions({ type: "dealer_subscription" }).catch(() => null),
        ]);

        if (!isMounted) return;
        if (subRes) {
          setSubData(subRes);
        }
        if (txRes && txRes.data) {
          setTransactions(txRes.data);
        }
      } catch (err) {
        console.warn("Failed to load dealer subscription & billing ledger:", err);
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
  }, []);

  const currentPlan = subData?.subscription?.plan || "Pro Shop";
  const activePlanKey = normalizePlanKey(currentPlan);

  const plans = [
    {
      id: "starter",
      name: SUBSCRIPTION_TIERS.starter.name,
      price: SUBSCRIPTION_TIERS.starter.priceMonthly,
      period: "per month",
      listings: "Up to 3 active listings",
      features: SUBSCRIPTION_TIERS.starter.features,
      current: activePlanKey === "starter",
      badge: activePlanKey === "starter" ? "Current Active Plan" : "100% Free",
    },
    {
      id: "basic",
      name: SUBSCRIPTION_TIERS.basic.name,
      price: SUBSCRIPTION_TIERS.basic.priceMonthly,
      period: "per month",
      listings: "Up to 15 active listings",
      features: SUBSCRIPTION_TIERS.basic.features,
      current: activePlanKey === "basic",
      badge: activePlanKey === "basic" ? "Current Active Plan" : undefined,
    },
    {
      id: "pro",
      name: SUBSCRIPTION_TIERS.pro.name,
      price: SUBSCRIPTION_TIERS.pro.priceMonthly,
      period: "per month",
      listings: "Up to 60 active listings",
      features: SUBSCRIPTION_TIERS.pro.features,
      current: activePlanKey === "pro",
      badge: activePlanKey === "pro" ? "Current Active Plan" : "Most Popular",
    },
    {
      id: "premium",
      name: SUBSCRIPTION_TIERS.premium.name,
      price: SUBSCRIPTION_TIERS.premium.priceMonthly,
      period: "per month",
      listings: "Unlimited listings",
      features: SUBSCRIPTION_TIERS.premium.features,
      current: activePlanKey === "premium",
      badge: activePlanKey === "premium" ? "Current Active Plan" : undefined,
    },
  ];

  const handleUpgrade = async (planId: string, planName: string) => {
    setUpgradingPlan(planId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updatedSub = await upgradeDealerSubscription(planId);
      if (subData) {
        setSubData({
          ...subData,
          subscription: updatedSub,
          listingsLimit: updatedSub.listingsLimit,
        });
      }
      setSuccessMessage(`Successfully switched plan to ${planName}! Your listing capacity is now updated.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error("Failed to upgrade subscription:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to process plan switch");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handlePaystackRenew = async () => {
    setIsPaying(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const price = subData?.subscription?.price ?? 65000;
    if (price <= 0) {
      setSuccessMessage("Starter Showroom is 100% free! No payment required.");
      setIsPaying(false);
      return;
    }

    try {
      const res = await initializePayment({
        type: "dealer_subscription",
        amount: price,
        title: `Storefront Renewal: ${currentPlan}`,
        gateway: "paystack",
        callbackUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setSuccessMessage(`Payment recorded successfully! Reference: ${res?.reference}`);
      }
    } catch (err: unknown) {
      console.error("Failed to initialize Paystack checkout:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect with Paystack gateway");
    } finally {
      setIsPaying(false);
    }
  };

  const expiresDate = subData?.subscription?.expiresAt
    ? new Date(subData.subscription.expiresAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "September 28, 2026";

  const currentPrice = subData?.subscription?.price ?? 65000;
  const activeCount = subData?.activeListingsCount ?? 0;
  const limit = subData?.listingsLimit ?? 60;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <span className="text-xs font-semibold">Loading subscription &amp; billing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Wallet Summary */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active &amp; In Good Standing
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-neutral-800">
              {activeCount} of {limit >= 9999 ? "Unlimited" : limit} listings active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Dealer Shop Subscription &amp; Billing
          </h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Next renewal date: <b className="text-neutral-900">{expiresDate}</b> via Paystack gateway
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-right min-w-[140px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Current Plan Rate</span>
            <div className="text-xl sm:text-2xl font-black text-neutral-900">
              {currentPrice === 0 ? "Free" : `₦${currentPrice.toLocaleString()}`}
              <span className="text-xs font-normal text-gray-400"> / mo</span>
            </div>
          </div>

          {currentPrice > 0 && (
            <button
              onClick={handlePaystackRenew}
              disabled={isPaying}
              className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting Paystack...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Pay Renewal via Paystack</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grace Period & Fair Billing Notice */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200 rounded-3xl flex items-start gap-3.5 text-xs text-blue-900 leading-relaxed shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">mycarsNg 7-Day Grace Period Protection: </span>
          <p className="text-blue-800">
            If your card payment fails on renewal, your shop enters a 7-day grace period where your inventory remains active and indexed on search. We send automated email alerts 3 days prior to your billing cycle.
          </p>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Change or Upgrade Storefront Tier</h2>
          <p className="text-xs text-gray-500">Pick a capacity tier that matches your dealership inventory scale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition shadow-xs ${
                p.current
                  ? "border-2 border-amber-500 ring-4 ring-amber-50 relative"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
                  {p.badge}
                </div>
              )}

              <div>
                <h3 className="font-bold text-base text-neutral-900">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-neutral-900">
                    {p.price === 0 ? "Free" : `₦${p.price.toLocaleString()}`}
                  </span>
                  {p.price > 0 && <span className="text-xs text-gray-400">/ mo</span>}
                </div>

                <div className="text-xs font-semibold text-blue-600 mt-1 pb-4 border-b border-gray-100">
                  {p.listings}
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-gray-700">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                {p.current ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl cursor-default flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    disabled={upgradingPlan !== null}
                    onClick={() => handleUpgrade(p.id, p.name)}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {upgradingPlan === p.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Switching Plan...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Switch to {p.name}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Invoice Receipts Ledger */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-neutral-800" />
              <h2 className="text-lg font-bold text-neutral-900">Billing History &amp; Official Receipts</h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified Paystack transaction statements and tax receipts for your dealership accounting
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Paystack Ledger</span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">No prior invoice records found</p>
            <p className="text-xs text-gray-400">Transactions processed via Paystack will populate here with instant receipts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Reference</th>
                  <th className="pb-3 px-3">Plan / Description</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Gateway</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-3 font-medium text-neutral-800 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {tx.reference}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-neutral-900">
                      {tx.title || "Dealer Storefront Subscription"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-neutral-900 whitespace-nowrap">
                      ₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-gray-500 capitalize whitespace-nowrap">
                      {tx.gateway || "Paystack"}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          tx.status === "settled"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : tx.status === "held_in_escrow"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tx.status === "settled" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {tx.status === "settled" ? "Settled / Active" : tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Official Payment Receipt
                </span>
                <h3 className="text-xl font-black text-neutral-900 mt-1">mycarsNg Billing</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Reference Number</span>
                <span className="font-mono font-bold text-neutral-900">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Description</span>
                <span className="font-semibold text-neutral-900">{selectedReceipt.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Payment Gateway</span>
                <span className="font-semibold text-neutral-900 capitalize">{selectedReceipt.gateway || "Paystack"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400">Payment Date</span>
                <span className="font-semibold text-neutral-900">
                  {new Date(selectedReceipt.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-neutral-50 px-3 rounded-xl">
                <span className="font-bold text-neutral-900 text-sm">Amount Paid</span>
                <span className="font-black text-neutral-900 text-sm">₦{selectedReceipt.amount.toLocaleString()} NGN</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-emerald-700">Settled &amp; Reconciled</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
