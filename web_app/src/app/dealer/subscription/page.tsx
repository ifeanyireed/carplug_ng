"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function DealerSubscriptionPage() {
  const [activePlan, setActivePlan] = useState<string>("pro");

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
      current: false,
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
      current: true,
      badge: "Current Active Plan",
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
      current: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              ● Active & In Good Standing
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900">
            Dealer Shop Subscription & Billing
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Next renewal date: <b className="text-neutral-900">September 28, 2026</b> via Paystack auto-debit
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400">Current Plan Rate</span>
          <div className="text-2xl font-black text-neutral-900">₦65,000 / mo</div>
        </div>
      </div>

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
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
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
                  className="w-full py-2.5 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl cursor-default"
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={() => alert(`Upgrading to ${p.name}`)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Switch to {p.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
