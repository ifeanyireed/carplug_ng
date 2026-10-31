import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Wrench,
  ShieldAlert,
  Building2,
  Scale,
  Clock,
  HelpCircle,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Returns and Refunds Policy | mycarsNg",
  description:
    "Review the official Returns and Refunds Policy for mycarsNg (Carplug Nigeria). Understand refund procedures for platform subscriptions, inspection fees, and private vehicle sales.",
};

export default function RefundPolicyPage() {
  const lastUpdated = "October 2026";

  const sections = [
    { id: "overview", title: "1. Scope & Regulatory Overview" },
    { id: "vehicle-purchases", title: "2. Vehicle Purchases & Private Sales" },
    { id: "subscription-refunds", title: "3. Dealership Showroom Subscriptions" },
    { id: "listing-promotions", title: "4. Listing Fees & Marketing Promotions" },
    { id: "inspection-cancellations", title: "5. Certified Inspection Services" },
    { id: "refund-timelines", title: "6. Processing Timelines & Payment Gateway" },
    { id: "disputes-complaints", title: "7. Reporting Misleading Listings & Disputes" },
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
          <span className="text-gray-400">Legal &amp; Compliance</span>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Returns &amp; Refunds Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Billing, Cancellations &amp; Refunds</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Returns and Refunds Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            This policy outlines how cancellations, refunds, and dispute procedures are handled for services provided directly by <b>mycarsNg</b> (operating as Carplug Nigeria Technologies Ltd), as well as the rules governing independent vehicle sales on our marketplace.
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
              <span>Compliant with FCCPA 2018 &amp; Nigerian Commercial Law</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
                On This Page
              </h3>
              <nav className="space-y-1 text-xs">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-neutral-900 hover:bg-gray-50 transition font-medium"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Body Content */}
          <div className="lg:col-span-3 space-y-10 bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs text-sm sm:text-[15px] text-gray-700 leading-relaxed">
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900">
                <Scale className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">1. Scope &amp; Regulatory Overview</h2>
              </div>
              <p>
                To provide transparency and maintain strict regulatory compliance with the Central Bank of Nigeria (CBN), the Federal Competition and Consumer Protection Commission (FCCPC), and anti-money laundering requirements (SCUML):
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
                <b>Fundamental Separation of Roles:</b> mycarsNg generates revenue strictly from platform software services, including paid vehicle listings, dealership showroom subscription plans, promotional marketing boosts, and certified 150-point diagnostic inspection service fees. We do not charge commissions on vehicle purchase transactions or collect purchase consideration on behalf of vehicle owners.
              </div>
            </section>

            {/* Section 2 */}
            <section id="vehicle-purchases" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold">2. Vehicle Purchases &amp; Private Sales</h2>
              </div>
              <p>
                <b>mycarsNg does not receive, collect, hold, or escrow vehicle purchase funds on behalf of vehicle owners or dealerships.</b>
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Direct Private Transactions:</b> Vehicle sale agreements, purchase price settlements, and title assignments are contracted directly between buyers and independent sellers or registered dealerships outside our platform.
                </li>
                <li>
                  <b>Returns &amp; Buybacks:</b> Because purchase funds are never held by mycarsNg, any return of a purchased vehicle, post-sale warranty repair, or refund of vehicle purchase money must be agreed upon directly between the buyer and the seller in accordance with their executed Deed of Sale and applicable provisions of the Sale of Goods Act.
                </li>
                <li>
                  <b>Mandatory Pre-Purchase Audit:</b> We strongly urge all buyers to order an independent certified diagnostic inspection and verify vehicle title papers before transferring funds to sellers.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="subscription-refunds" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">3. Dealership Showroom Subscriptions</h2>
              </div>
              <p>
                Commercial dealerships subscribe to recurring showroom plans (Starter Free, Basic, Pro, and Premium Hub) to manage active listing quotas, public showroom branding, and trade-in lead funnels:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Cancellation Policy:</b> Dealerships may cancel their subscription renewal at any time directly through the Dealer Hub settings. Upon cancellation, the plan remains fully active until the conclusion of the paid billing period.
                </li>
                <li>
                  <b>No Prorated In-Term Refunds:</b> Once a monthly or annual subscription fee is billed, fees are non-refundable for the elapsed or active billing cycle, as capacity quotas and showroom tools are provisioned immediately.
                </li>
                <li>
                  <b>7-Day Billing Error Guarantee:</b> If a dealership is inadvertently double-billed due to a payment gateway error, or experiences verified platform outage exceeding 72 hours, our billing team will issue a 100% refund of the affected charge upon prompt notification within 7 days.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="listing-promotions" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">4. Listing Fees &amp; Marketing Promotions</h2>
              </div>
              <p>For pay-per-listing options, homepage spotlight placements, and search boost campaigns:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Live Campaigns:</b> Once an advertisement or promoted listing goes live on our marketplace, the promotional fee is fully earned and non-refundable.
                </li>
                <li>
                  <b>Rejection Prior to Publication:</b> If a submitted listing is rejected during our compliance screening (for instance, failing Customs SGD documentation check or lacking required vehicle ownership proofs), any prepaid listing fee will be refunded in full within 3 to 5 business days.
                </li>
                <li>
                  <b>Fraud &amp; Policy Violations:</b> If a listing is removed following publication due to confirmed odometer tampering, vehicle theft report, fraudulent representation, or breach of our Acceptable Use Policy, no refund will be issued.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="inspection-cancellations" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">5. Certified Inspection Services</h2>
              </div>
              <p>
                Fees for on-demand 150-point certified diagnostic vehicle inspections booked through the platform are governed by the following cancellation rules:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                    Full Refund (100%)
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 pt-1">Advance Notice</h4>
                  <p className="text-xs text-gray-600">
                    Cancellations made at least <b>3 hours prior</b> to the scheduled technician dispatch window are refunded in full.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    Partial Refund
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 pt-1">Late Cancellation</h4>
                  <p className="text-xs text-gray-600">
                    If cancelled after technician has mobilized, a <b>₦5,000 mobilization fee</b> is deducted, and the balance refunded.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                    Non-Refundable
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 pt-1">Completed Audit</h4>
                  <p className="text-xs text-gray-600">
                    Once the physical 150-point diagnostic scan is completed and the digital report generated, inspection fees are non-refundable.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="refund-timelines" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">6. Processing Timelines &amp; Payment Gateway</h2>
              </div>
              <p>
                All eligible refunds for platform services are credited back to the original funding instrument used at the time of purchase:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>
                  <b>Paystack Settlement:</b> Refunds are initiated via Paystack directly to your Nigerian bank account or debit card.
                </li>
                <li>
                  <b>Turnaround Time:</b> Platform approvals are processed within 24–48 hours. Inter-bank credit settlement generally completes within <b>3 to 7 business days</b> depending on your bank&apos;s clearing cycle.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="disputes-complaints" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <HelpCircle className="w-5 h-5 text-neutral-900" />
                <h2 className="text-xl font-bold">7. Reporting Misleading Listings &amp; Disputes</h2>
              </div>
              <p>
                We provide accessible channels for users to lodge complaints, report misleading advertisements, report suspected fraudulent transactions, or query platform billing:
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                <p>
                  <b>Billing &amp; Platform Refunds:</b>{" "}
                  <a href="mailto:refunds@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                    refunds@mycars.ng
                  </a>
                </p>
                <p>
                  <b>Marketplace Complaints &amp; Disputes:</b>{" "}
                  <a href="mailto:disputes@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                    disputes@mycars.ng
                  </a>
                </p>
                <p>
                  <b>General Support Desk:</b>{" "}
                  <a href="mailto:support@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                    support@mycars.ng
                  </a>{" "}
                  | Tel: +234 1 888 6922
                </p>
                <p>
                  <b>Physical Office:</b> Plot 14 Admiralty Way, Lekki Phase 1, Lagos State, Nigeria
                </p>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                Upon receipt of a complaint, our compliance team reviews reported documentation and may restrict or remove listings, freeze vendor dashboards, or refer fraudulent actors to the appropriate authorities.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
