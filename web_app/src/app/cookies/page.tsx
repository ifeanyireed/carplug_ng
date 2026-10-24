import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Cookie,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Lock,
  Settings,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy & Tracking Preferences | mycarsNg",
  description:
    "Understand how mycarsNg uses cookies and local browser storage to manage authentication sessions, saved vehicles, and parametric search preferences.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "October 2026";

  const cookieTypes = [
    {
      category: "Strictly Necessary Cookies",
      badge: "Always Active",
      badgeClass: "bg-emerald-100 text-emerald-800",
      description:
        "Essential for core platform operations. These cookies enable secure JWT user authentication, CSRF token validation, Paystack checkout session tokens, and route protection.",
      examples: [
        { name: "token / auth_token", purpose: "Maintains your secure logged-in session" },
        { name: "csrf_token", purpose: "Guards against cross-site request forgery attacks" },
        { name: "paystack_session", purpose: "Tracks active inspection and plan payments" },
      ],
    },
    {
      category: "Functional & Preferences Cookies",
      badge: "Personalization",
      badgeClass: "bg-blue-100 text-blue-800",
      description:
        "Enable personalized marketplace features, remember your selected district geolocation (e.g. Lekki Phase 1 vs Ikeja GRA), and synchronize your Saved Garage vehicles.",
      examples: [
        { name: "carplug_saved_ids", purpose: "Maintains your favorited vehicle list" },
        { name: "preferred_district", purpose: "Remembers your default showroom filter" },
        { name: "demo_role_selection", purpose: "Stores local developer demo role states" },
      ],
    },
    {
      category: "Performance & Analytics Cookies",
      badge: "Telemetry",
      badgeClass: "bg-purple-100 text-purple-800",
      description:
        "Collect aggregated, non-identifying telemetry regarding search query volume, vehicle detail page load latency, and API responsiveness to help us optimize speed across 3G/4G/5G Nigerian networks.",
      examples: [
        { name: "_pk_id / _telemetry", purpose: "Anonymous page performance and error rates" },
        { name: "bandwidth_tier", purpose: "Optimizes image resolution for mobile data savers" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-400">Legal</span>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Cookie Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
            <Cookie className="w-3.5 h-3.5" />
            <span>Browser Storage &amp; Cookies</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Cookie Policy &amp; Tracking Notice
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            This Cookie Policy explains what cookies and local browser storage technologies are used on <b>mycarsNg</b>, why we use them, and how you can manage your preferences.
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              <span>Effective Date: </span>
              <b className="text-neutral-900">January 01, 2026</b>
              <span className="mx-2">•</span>
              <span>Last Revised: </span>
              <b className="text-neutral-900">{lastUpdated}</b>
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant with NDPR &amp; Global Privacy Standards</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="space-y-10 bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs text-sm sm:text-[15px] text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>What Are Cookies?</span>
            </h2>
            <p>
              Cookies are small text files downloaded to your device when you visit a website. They allow the platform to recognize your browser, maintain active login state across page reloads, and remember your search preferences so you don&apos;t have to re-enter filters on every browse.
            </p>
            <p>
              We also use browser <code>localStorage</code> and <code>sessionStorage</code> for fast client-side performance, such as caching saved cars and maintaining temporary draft listings.
            </p>
          </section>

          {/* Section 2: Detailed Breakdown Table */}
          <section className="space-y-6 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <span>Categories of Cookies We Use</span>
            </h2>

            <div className="space-y-6">
              {cookieTypes.map((c, i) => (
                <div
                  key={i}
                  className="p-5 sm:p-6 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-neutral-900">{c.category}</h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${c.badgeClass}`}
                    >
                      {c.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600">{c.description}</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="pb-2 font-semibold">Cookie / Storage Key</th>
                          <th className="pb-2 font-semibold">Purpose &amp; Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                        {c.examples.map((ex, j) => (
                          <tr key={j} className="text-gray-700">
                            <td className="py-2 font-semibold text-neutral-900 pr-4 whitespace-nowrap">
                              {ex.name}
                            </td>
                            <td className="py-2 font-sans text-gray-600">{ex.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Managing Preferences */}
          <section className="space-y-3 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Managing Your Cookie Settings</span>
            </h2>
            <p>
              Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies or notify you when a cookie is set:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 text-xs sm:text-sm">
              <li>
                <b>Google Chrome:</b> Settings &rarr; Privacy &amp; Security &rarr; Third-party cookies.
              </li>
              <li>
                <b>Apple Safari:</b> Preferences &rarr; Privacy &rarr; Manage Website Data.
              </li>
              <li>
                <b>Mozilla Firefox:</b> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection.
              </li>
              <li>
                <b>Mobile Browsers:</b> Adjust privacy settings in Chrome Mobile or iOS Safari settings under &quot;Block All Cookies&quot;.
              </li>
            </ul>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
              <b>Important Notice:</b> If you disable strictly necessary cookies, key platform capabilities—including logging into your dashboard, saving vehicles, booking inspections, and paying via Paystack—may not function correctly.
            </div>
          </section>

          {/* Section 4: Contact */}
          <section className="space-y-3 pt-6 border-t border-gray-100 text-xs text-gray-500">
            <p>
              If you have any questions about our use of cookies or tracking technologies, please contact our compliance desk at{" "}
              <a href="mailto:privacy@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                privacy@mycars.ng
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
