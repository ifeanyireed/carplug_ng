"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import {
  fetchDealerSubscription,
  upgradeDealerSubscription,
  DealerSubscriptionResponse,
} from "@/services/api";

export default function DealerSubscriptionPage() {
  const [subData, setSubData] = useState<DealerSubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSubscription() {
      try {
        const data = await fetchDealerSubscription();
        if (!isMounted) return;
        if (data) {
          setSubData(data);
        }
      } catch (err) {
        console.warn("Failed to load dealer subscription:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlan = subData?.subscription?.plan || "Pro Shop";
  const currentPlanNormalized = currentPlan.toLowerCase();

  const plans = [
    {
      id: "basic",
      name: "Basic Shop",
      price: 25000,
      period: "per month",
      listings: "Up to 15 active listings",
      features: [
        "Standard search placement",
        "Basic dashboard analytics",
        "Public storefront URL",
        "WhatsApp lead forwarding",
      ],
      current: currentPlanNormalized.includes("basic"),
    },
    {
      id: "pro",
      name: "Pro Shop",
      price: 65000,
      period: "per month",
      listings: "Up to 60 active listings",
      features: [
        "Priority search & map placement",
        "Verified buyer lead access",
        "Full showroom telemetry analytics",
        "Inspection bundle discounts (10% off)",
        "Dedicated phone support",
      ],
      current: currentPlanNormalized.includes("pro"),
      badge: currentPlanNormalized.includes("pro") ? "Current Active Plan" : undefined,
    },
    {
      id: "premium",
      name: "Premium Shop",
      price: 150000,
      period: "per month",
      listings: "Unlimited listings",
      features: [
        "Featured homepage placement & banner",
        "Unlimited inventory capacity",
        "Priority concierge lead dispatch",
        "Dedicated account manager",
        "Bulk inspection pricing (25% off)",
      ],
      current: currentPlanNormalized.includes("premium") || currentPlanNormalized.includes("enterprise"),
      badge: currentPlanNormalized.includes("premium") ? "Current Active Plan" : undefined,
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
        <span className="text-xs font-semibold">Loading subscription & billing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              ● Active &amp; In Good Standing
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-neutral-800">
              {activeCount} of {limit >= 9999 ? "Unlimited" : limit} listings active
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900">
            Dealer Shop Subscription &amp; Billing
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Next renewal date: <b className="text-neutral-900">{expiresDate}</b> via Paystack auto-debit
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400">Current Plan Rate</span>
          <div className="text-2xl font-black text-neutral-900">₦{currentPrice.toLocaleString()} / mo</div>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grace Period & Fair Billing Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Verza 7-Day Grace Period Protection: </span>
          If your card payment fails on renewal, your shop enters a 7-day grace period where your inventory remains safe. We notify you 3 days before any auto-charge.
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {p.badge}
              </div>
            )}

            <div>
              <h3 className="font-bold text-base text-neutral-900">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-neutral-900">
                  ₦{p.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">/ mo</span>
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
  );
}
