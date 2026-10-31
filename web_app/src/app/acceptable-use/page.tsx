import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Ban,
  Scale,
  Users,
  ShieldCheck,
  Building2,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | mycarsNg",
  description:
    "Review the Acceptable Use Policy for mycarsNg (Carplug Nigeria). Understand permitted marketplace conduct, seller verification rules, and prohibited activities.",
};

export default function AcceptableUsePage() {
  const lastUpdated = "October 2026";

  const sections = [
    { id: "overview", title: "1. Overview & Purpose" },
    { id: "eligibility-kyc", title: "2. Seller Verification & KYC Requirements" },
    { id: "permitted-use", title: "3. Permitted Marketplace Activities" },
    { id: "prohibited-activities", title: "4. Prohibited Activities & Listings" },
    { id: "financial-conduct", title: "5. Financial Conduct & Non-Escrow Terms" },
    { id: "enforcement", title: "6. Monitoring, Takedowns & Account Suspension" },
    { id: "reporting", title: "7. Reporting Violations & Law Enforcement" },
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
          <span className="text-neutral-900 font-semibold">Acceptable Use Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Marketplace Integrity Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Acceptable Use Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            This Acceptable Use Policy (&quot;AUP&quot;) outlines the standards of conduct, verification requirements, and prohibited behaviors for all buyers, private vehicle sellers, registered dealerships, and inspection partners on <b>mycarsNg</b> (operating as Carplug Nigeria Technologies Ltd).
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
              <span>SCUML &amp; Anti-Fraud Compliance Verified</span>
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
                <h2 className="text-xl font-bold">1. Overview &amp; Purpose</h2>
              </div>
              <p>
                <b>mycarsNg</b> operates an online vehicle marketplace connecting independent vehicle owners, licensed dealerships, certified diagnostic technicians, and prospective vehicle buyers across Nigeria.
              </p>
              <p>
                Our objective is to maintain a high-trust, fraud-resistant environment for motor vehicle discovery, valuation, and marketing. By accessing or using the platform, you agree to comply with this Acceptable Use Policy in conjunction with our{" "}
                <Link href="/terms" className="text-blue-600 underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 underline font-medium">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility-kyc" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">2. Seller Verification &amp; KYC Requirements</h2>
              </div>
              <p>
                To safeguard marketplace participants, all sellers must complete identity onboarding and verify credentials prior to publishing inventory:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Contact Verification:</b> All users must verify a valid Nigerian telephone number and active email address during account registration.
                </li>
                <li>
                  <b>Private Seller KYC:</b> Individual sellers must submit valid government-issued identification (National Identification Number [NIN] slip, International Passport, or Driver&apos;s License).
                </li>
                <li>
                  <b>Dealership Accreditation:</b> Commercial automobile dealers must provide Corporate Affairs Commission (CAC) registration documents, Tax Identification Number (TIN), and verifiable showroom premises.
                </li>
                <li>
                  <b>Vehicle Supporting Documents:</b> Sellers must supply supporting vehicle documentation for review, including Nigeria Customs Service (NCS) Single Goods Declaration (SGD) papers and assessment receipts for imported (Tokunbo) vehicles, or authentic proof of ownership and allocation records for Nigerian-used vehicles.
                </li>
              </ul>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 mt-3">
                <b>Listing Review Notice:</b> While mycarsNg conducts rigorous compliance checks on submitted documents as part of our listing review process, the platform does not represent every uploaded document as independently authenticated or every listed vehicle as physically inspected unless a certified 150-point diagnostic inspection has been commissioned.
              </div>
            </section>

            {/* Section 3 */}
            <section id="permitted-use" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">3. Permitted Marketplace Activities</h2>
              </div>
              <p>Users may access mycarsNg strictly for lawful automotive marketplace purposes, including:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>Listing genuine, unencumbered passenger cars, commercial vehicles, SUVs, and trucks with accurate title and condition.</li>
                <li>Conducting vehicle searches, comparing market valuations, and reviewing diagnostic history logs.</li>
                <li>Communicating professionally with registered sellers and verified dealerships regarding vehicle availability, specs, and viewings.</li>
                <li>Booking on-demand 150-point certified diagnostic vehicle inspections conducted by qualified master technicians.</li>
                <li>Purchasing dealership showroom subscription packages, listing promotions, and marketing boosts.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="prohibited-activities" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Ban className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold">4. Prohibited Activities &amp; Listings</h2>
              </div>
              <p>The following actions and listing practices are strictly prohibited on mycarsNg:</p>

              <div className="space-y-3">
                <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-2 text-xs text-red-950">
                  <h4 className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Automotive Fraud &amp; Deceptive Listings</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Publishing phantom listings, bait-and-switch pricing, or vehicles not in the physical possession or custody of the seller.</li>
                    <li>Listing stolen vehicles, vehicles subject to active police alerts, insurance write-offs, or unlawful seizures.</li>
                    <li>Odometer tampering, VIN falsification, or masking engine, transmission, frame, or flood defects.</li>
                    <li>Uploading fabricated, cloned, or altered Customs SGD clearance certificates or forged vehicle ownership papers.</li>
                    <li>Advertising vehicles without the legal authority, power of attorney, or consent of the legal title holder.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs text-gray-800">
                  <h4 className="font-bold text-neutral-900 text-sm">Prohibited Items &amp; Marketplace Abuse</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Listing non-automotive items, firearms, ammunition, illicit substances, counterfeit auto parts, or prohibited merchandise.</li>
                    <li>Distributing spam, repetitive mass inquiries, unauthorized promotional broadcasts, or automated bot scraping.</li>
                    <li>Circumventing platform security controls, attempting SQL injection, API exploits, or reverse-engineering systems.</li>
                    <li>Harassing, abusing, threatening, or defrauding buyers, sellers, or platform staff.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="financial-conduct" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">5. Financial Conduct &amp; Non-Escrow Terms</h2>
              </div>
              <p>
                To maintain regulatory compliance with the Central Bank of Nigeria (CBN) and SCUML:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>No Vehicle Purchase Escrow:</b> mycarsNg does not receive, collect, or hold vehicle purchase payments on behalf of vendors or dealers. We do not act as an escrow agent or custodian of funds for vehicle sales.
                </li>
                <li>
                  <b>No Wallets or Stored Value:</b> The platform does not operate buyer or seller wallets, stored-value accounts, or peer-to-peer monetary transfers.
                </li>
                <li>
                  <b>Independent Settlement:</b> All vehicle purchase transactions and ownership transfers are agreed upon and transacted directly between buyers and sellers outside our platform.
                </li>
                <li>
                  <b>Authorized Platform Fees Only:</b> Platform payments processed via our secure Paystack gateway are exclusively for services rendered directly by mycarsNg (listing fees, dealer subscription plans, promotional boosts, and certified inspection fees).
                </li>
              </ul>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <b>Scam Warning:</b> Any seller or dealer who instructs a buyer to deposit vehicle purchase funds into an alleged &quot;mycarsNg escrow bank account&quot; is acting fraudulently. Immediately report such requests to <code>compliance@mycars.ng</code>.
              </div>
            </section>

            {/* Section 6 */}
            <section id="enforcement" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">6. Monitoring, Takedowns &amp; Account Suspension</h2>
              </div>
              <p>
                mycarsNg actively monitors listings, reviews flagged content, and takes swift corrective action against non-compliant accounts:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li><b>Listing Removal:</b> We reserve the unconditional right to reject, unpublish, or permanently delete any listing that breaches this AUP or fails verification.</li>
                <li><b>Account Suspension &amp; Blacklisting:</b> Users who engage in misleading advertising, document forgery, or fraudulent activity face instant, permanent account termination and device blacklisting.</li>
                <li><b>Forfeiture of Fees:</b> In cases of account termination resulting from fraud, deceit, or criminal conduct, prepaid listing fees or subscription balances are forfeited.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="reporting" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Mail className="w-5 h-5 text-neutral-900" />
                <h2 className="text-xl font-bold">7. Reporting Violations &amp; Law Enforcement</h2>
              </div>
              <p>
                We collaborate proactively with Nigerian regulatory authorities and statutory law enforcement agencies, including the Special Control Unit Against Money Laundering (SCUML), the Economic and Financial Crimes Commission (EFCC), and the Nigeria Police Force.
              </p>
              <p>
                If you encounter a suspicious vehicle, misleading listing, or fraudulent actor, please report it immediately to our compliance department:
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                <p><b>Compliance Desk:</b> mycarsNg Trust &amp; Safety Division</p>
                <p><b>Email:</b> <a href="mailto:compliance@mycars.ng" className="text-blue-600 font-semibold hover:underline">compliance@mycars.ng</a> / <a href="mailto:disputes@mycars.ng" className="text-blue-600 font-semibold hover:underline">disputes@mycars.ng</a></p>
                <p><b>Physical Address:</b> Plot 14 Admiralty Way, Lekki Phase 1, Lagos State, Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
