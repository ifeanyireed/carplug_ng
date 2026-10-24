import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  Scale,
  FileText,
  Lock,
  AlertTriangle,
  CreditCard,
  Building2,
  Wrench,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service & Marketplace Conditions | mycarsNg",
  description:
    "Read the official terms and conditions for buyers, private sellers, verified dealerships, and certified technicians on mycarsNg (Carplug Nigeria).",
};

export default function TermsOfServicePage() {
  const lastUpdated = "October 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Platform Roles & Eligibility" },
    { id: "listings", title: "3. Vehicle Listings & Title Representations" },
    { id: "customs", title: "4. Nigerian Customs & SGD Duty Declarations" },
    { id: "inspections-escrow", title: "5. Certified Inspections & Escrow Protocol" },
    { id: "subscriptions", title: "6. Dealership Subscriptions & Listing Quotas" },
    { id: "swaps", title: "7. Car Swap & Valuation Comps" },
    { id: "disputes", title: "8. Dispute Resolution & Governing Law" },
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
          <span className="text-neutral-900 font-semibold">Terms of Service</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Master User Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Terms of Service &amp; Marketplace Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            Welcome to <b>mycarsNg</b> (operating as Carplug Nigeria). This document governs your access to and use of our automotive marketplace, certified inspection escrow engine, dealership management system, and swap pipeline.
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
              <span>Compliant with NDPA 2023 &amp; Nigerian Commercial Law</span>
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
            <section id="acceptance" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
              </div>
              <p>
                By accessing, registering an account, booking an inspection, listing a vehicle, or submitting a purchase inquiry on <b>mycarsNg</b> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to all terms, you must discontinue using our services immediately.
              </p>
              <p>
                We reserve the right to revise or modify these terms at any time. Material changes will be communicated via your registered email address or through an announcement on the Platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">2. Platform Roles &amp; Eligibility</h2>
              </div>
              <p>
                To create an account or transact on the Platform, you must be at least 18 years old and possess the legal capacity to enter into binding agreements in the Federal Republic of Nigeria.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>
                  <b>Buyers:</b> Individuals seeking verified Tokunbo (foreign-used) or Nigerian-used vehicles with transparent pricing and certified inspection histories.
                </li>
                <li>
                  <b>Private Sellers:</b> Individual vehicle owners listing personal cars. Sellers must undergo National Identification Number (NIN) KYC verification to list.
                </li>
                <li>
                  <b>Dealerships:</b> Registered commercial showrooms. Dealerships must provide Corporate Affairs Commission (CAC) registration documentation and Tax Identification Numbers (TIN) to unlock showroom badges.
                </li>
                <li>
                  <b>Certified Technicians:</b> ASE-certified or trade-tested automotive inspectors conducting standardized 150-point diagnostics.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="listings" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">3. Vehicle Listings &amp; Title Representations</h2>
              </div>
              <p>
                Every seller and dealership represents and warrants that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>They hold good, valid, and marketable title to the listed vehicle with legal right to sell or transfer ownership.</li>
                <li>The vehicle identification number (VIN), mileage, and vehicle history disclosed in the listing are true, complete, and un-tampered.</li>
                <li>The vehicle is free and clear of all police extracts, liens, bank pledges, theft reports, or salvage fraud.</li>
              </ul>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <b>Odometer &amp; Identity Tampering:</b> Any intentional manipulation of vehicle mileage or misrepresentation of registration documents will result in immediate permanent account termination and referral to the Economic and Financial Crimes Commission (EFCC) and Nigeria Police Force.
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="customs" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">4. Nigerian Customs &amp; SGD Duty Declarations</h2>
              </div>
              <p>
                All imported vehicles (Tokunbo) listed on the Platform must carry genuine Nigeria Customs Service (NCS) Single Goods Declaration (SGD) documentation, C-Number references, and assessment receipts.
              </p>
              <p>
                The Platform provides automated and manual Customs document verification queues. While mycarsNg verifies SGD authenticity against verified databases, ultimate legal liability for unpaid import tariffs or forged clearance papers rests strictly with the listing seller.
              </p>
            </section>

            {/* Section 5 */}
            <section id="inspections-escrow" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">5. Certified Inspections &amp; Escrow Protocol</h2>
              </div>
              <p>
                To eliminate auto fraud in Nigeria, mycarsNg enforces a multi-tier escrow protection mechanism for third-party vehicle inspections:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>
                  <b>Escrow Deposit:</b> Inspection fees (₦25,000 Standard, ₦45,000 Premium Diagnostic, ₦75,000 Comprehensive Audit) paid by the buyer are held in secure platform escrow via Paystack.
                </li>
                <li>
                  <b>Disbursement:</b> Funds are only released to the certified technician after their verified 150-point report, diagnostic scan codes, and high-resolution undercarriage media are completed and validated.
                </li>
                <li>
                  <b>Cancellations &amp; Rescheduling:</b> A buyer may reschedule or cancel an audit with full refund up to 3 hours prior to technician dispatch. Once a technician has mobilized, a mobilization fee of ₦5,000 applies.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="subscriptions" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">6. Dealership Subscriptions &amp; Listing Quotas</h2>
              </div>
              <p>
                Dealership subscription plans are centrally governed under our listing quotas:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li><b>Starter Plan:</b> Free tier allowing up to 3 concurrent active listings.</li>
                <li><b>Basic Showroom:</b> ₦25,000/month allowing up to 15 concurrent active listings.</li>
                <li><b>Pro Showroom:</b> ₦65,000/month allowing up to 60 concurrent active listings with priority ranking.</li>
                <li><b>Premium Enterprise:</b> ₦150,000/month allowing unlimited listings, dedicated concierge support, and branded storefront banners.</li>
              </ul>
              <p className="text-xs text-gray-500">
                Attempts to publish inventory exceeding active subscription quotas will trigger a <code>403 QUOTA_EXCEEDED</code> block until the showroom upgrades or archives older stock.
              </p>
            </section>

            {/* Section 7 */}
            <section id="swaps" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Scale className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">7. Car Swap &amp; Valuation Comps</h2>
              </div>
              <p>
                Automated algorithmic market valuations and top-up figures generated by our swap engine are based on econometric comps (make, model, year, condition, and mileage).
              </p>
              <p>
                These figures constitute indicative appraisals. Final swap trade-in values and physical exchange agreements are finalized directly between the buyer, seller, and dealership following mandatory physical inspection.
              </p>
            </section>

            {/* Section 8 */}
            <section id="disputes" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Scale className="w-5 h-5 text-neutral-900" />
                <h2 className="text-xl font-bold">8. Dispute Resolution &amp; Governing Law</h2>
              </div>
              <p>
                These Terms of Service are governed by and construed in accordance with the substantive laws of the Federal Republic of Nigeria.
              </p>
              <p>
                Any dispute, claim, or controversy arising out of or relating to platform transactions shall first be submitted to good-faith mediation via the <b>mycarsNg Dispute Resolution Desk</b> (<code>disputes@mycars.ng</code>). If unresolved within 30 days, disputes shall be submitted to the exclusive jurisdiction of the High Court of Lagos State.
              </p>

              <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                Questions regarding our Terms? Contact our legal team at{" "}
                <a href="mailto:legal@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                  legal@mycars.ng
                </a>{" "}
                or visit our headquarters at Plot 14 Admiralty Way, Lekki Phase 1, Lagos State, Nigeria.
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
