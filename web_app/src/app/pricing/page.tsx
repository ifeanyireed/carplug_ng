"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
} from "@/services/SubscriptionHelper";
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
  Building2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function PricingPage() {
  const { user, openAuthModal } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tiers: SubscriptionTier[] = [
    SUBSCRIPTION_TIERS.starter,
    SUBSCRIPTION_TIERS.basic,
    SUBSCRIPTION_TIERS.pro,
    SUBSCRIPTION_TIERS.premium,
  ];

  const handleCtaClick = (tierId: string) => {
    if (user) {
      window.location.href = "/dealer/subscription";
    } else {
      openAuthModal("signup");
    }
  };

  const faqs = [
    {
      q: "Is the Starter Showroom tier truly 100% free?",
      a: "Yes! There are no hidden fees or payment requirements to get started. You can register your dealership, complete your CAC verification, and list up to 3 live vehicles indefinitely with direct WhatsApp buyer lead forwarding.",
    },
    {
      q: "How do I earn the 'Platform Verified Dealership' badge?",
      a: "Upload your Corporate Affairs Commission (CAC) business registration document and showroom address. Once verified by our compliance team (typically within 24 hours), the blue Verified badge appears on your showroom profile and all your listings.",
    },
    {
      q: "What happens when my inventory exceeds my plan quota?",
      a: "When you reach your active listing quota, you'll be prompted to upgrade to the next tier in your Dealer Dashboard. Your existing listings remain live and active while you decide to upgrade.",
    },
    {
      q: "What payment methods are supported for paid plans?",
      a: "We support all major Nigerian payment options through Paystack, including Mastercard, Visa, Verve, instant bank transfer, and USSD.",
    },
    {
      q: "Can I switch or cancel my plan at any time?",
      a: "Yes. You can upgrade, downgrade, or cancel your renewal at any time directly from your Dealer Hub. If you cancel, your plan remains active until the end of the paid billing period with our 7-day grace period guarantee.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col selection:bg-neutral-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-gray-200/80 bg-white">
          <div className="absolute inset-0 bg-radial-gradient from-emerald-50/50 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold mb-6 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Transparent Showroom Subscriptions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Scale Your Dealership With Nigeria&apos;s #1 Verified Auto Network
            </h1>

            <p className="mt-5 text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Start 100% free with no credit card required. Upgrade as your car lot grows to unlock high-intent buyer inquiries, priority search ranking, and trade-in deals.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 sm:mt-10 inline-flex items-center gap-3 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-gray-600 hover:text-neutral-900"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-gray-600 hover:text-neutral-900"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-20 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const price =
                billingCycle === "annual"
                  ? Math.round(tier.priceAnnual / 12)
                  : tier.priceMonthly;

              const isPopular = Boolean(tier.popular);

              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                    isPopular
                      ? "border-2 border-emerald-500 ring-4 ring-emerald-50 shadow-lg sm:-translate-y-2"
                      : "border border-gray-200/90 hover:border-gray-300 hover:shadow-md shadow-xs"
                  }`}
                >
                  {tier.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap ${
                        isPopular ? "bg-emerald-600" : "bg-neutral-900"
                      }`}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-neutral-900">
                        {tier.name}
                      </h3>
                      {tier.id === "starter" && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                          Free Forever
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1 min-h-[32px] leading-relaxed">
                      {tier.tagline}
                    </p>

                    <div className="mt-5 pb-5 border-b border-gray-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-neutral-900 tracking-tight">
                          {price === 0 ? "₦0" : `₦${price.toLocaleString()}`}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          / month
                        </span>
                      </div>
                      {billingCycle === "annual" && tier.priceAnnual > 0 && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                          ₦{tier.priceAnnual.toLocaleString()} billed annually
                        </p>
                      )}
                      <p className="text-xs font-bold text-blue-600 mt-2">
                        {tier.listingsLimit >= 9999
                          ? "Unlimited vehicle listings"
                          : `Up to ${tier.listingsLimit} active listings`}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Included Features
                      </p>
                      <ul className="space-y-2.5">
                        {tier.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-gray-700 leading-snug"
                          >
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      type="button"
                      onClick={() => handleCtaClick(tier.id)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        isPopular
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                          : tier.id === "starter"
                          ? "bg-neutral-900 hover:bg-neutral-800 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-neutral-900"
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Compare Plan Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Every tier is engineered to maximize conversion and protect dealer integrity.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="py-4 px-6 font-bold text-gray-900 w-1/3">Feature</th>
                    <th className="py-4 px-4 font-bold text-center text-gray-900">Starter (Free)</th>
                    <th className="py-4 px-4 font-bold text-center text-gray-900">Basic</th>
                    <th className="py-4 px-4 font-bold text-center text-emerald-700 bg-emerald-50/50">Pro</th>
                    <th className="py-4 px-4 font-bold text-center text-gray-900">Premium Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Active Listings Capacity</td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700">3 Cars</td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700">15 Cars</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/50">60 Cars</td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Verified CAC Showroom Badge</td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Public Digital Showroom URL</td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Priority Search &amp; Map Placement</td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Car Swap &amp; Trade-In Lead Alerts</td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Inspection Bundle Discount</td>
                    <td className="py-3.5 px-4 text-center text-gray-400">None</td>
                    <td className="py-3.5 px-4 text-center text-gray-400">None</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/50">10% Off</td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">25% Off</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-gray-900">Homepage Spotlight Showcase</td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions &amp; Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-neutral-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-neutral-900" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="bg-neutral-900 text-white py-14 sm:py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-4">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Join Over 150+ Verified Showrooms Nationwide</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
              Ready to Expand Your Dealership Footprint?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-3 max-w-xl mx-auto">
              Set up your showroom in less than 2 minutes. Start completely free today with no obligations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleCtaClick("starter")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Create Free Showroom
              </button>
              <Link
                href="/shops"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition text-center"
              >
                Browse Verified Showrooms
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
