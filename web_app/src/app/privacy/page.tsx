import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Server,
  UserCheck,
  CheckCircle2,
  Mail,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & NDPA Data Protection | mycarsNg",
  description:
    "Learn how mycarsNg (Carplug Nigeria) protects your personal data, identity documentation, and transaction records under the Nigeria Data Protection Act (NDPA 2023).",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  const sections = [
    { id: "overview", title: "1. Overview & Statutory Scope" },
    { id: "data-collected", title: "2. Categories of Data Collected" },
    { id: "usage", title: "3. How Your Information is Used" },
    { id: "masked-contact", title: "4. Masked Contact & Anti-Fraud Privacy" },
    { id: "payments", title: "5. Financial Information & Payment Security" },
    { id: "sharing", title: "6. Third-Party Disclosures & APIs" },
    { id: "rights", title: "7. Your Data Protection Rights" },
    { id: "dpo", title: "8. Data Protection Officer (DPO) Contact" },
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
          <span className="text-neutral-900 font-semibold">Privacy Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Privacy &amp; NDPA Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Privacy Policy &amp; Data Protection Notice
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            At <b>mycarsNg</b>, your privacy and trust are paramount. This policy describes how we collect, store, process, and safeguard your personal and automotive information across all web applications and APIs.
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
              <span>Registered under NDPA 2023 &amp; NDPR Guidelines</span>
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
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">1. Overview &amp; Statutory Scope</h2>
              </div>
              <p>
                This Privacy Policy complies with the <b>Nigeria Data Protection Act 2023 (NDPA)</b> and the Nigeria Data Protection Regulation (NDPR) issued by the Nigeria Data Protection Commission (NDPC).
              </p>
              <p>
                <b>mycarsNg</b> operates as both a Data Controller and Data Processor with respect to personal information gathered from vehicle buyers, individual sellers, registered showrooms, and inspection technicians within the Nigerian market.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">2. Categories of Data Collected</h2>
              </div>
              <p>
                Depending on your interaction with our marketplace, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>
                  <b>Account &amp; Profile Data:</b> Name, verified email address, phone number, role identification, and profile avatar.
                </li>
                <li>
                  <b>KYC &amp; Identity Verification Data:</b> National Identification Number (NIN) slips, international passport biodata, driver&apos;s license numbers, and biometric selfie checks.
                </li>
                <li>
                  <b>Commercial &amp; Showroom Data:</b> CAC Certificate of Incorporation, Status Reports, Tax Identification Number (TIN), business registration address, and showroom operating hours.
                </li>
                <li>
                  <b>Vehicle Documentation:</b> Vehicle Identification Numbers (VIN), chassis numbers, Single Goods Declaration (SGD) import papers, roadworthiness certificates, and police extract records.
                </li>
                <li>
                  <b>Technical &amp; Telemetry Data:</b> IP address, device fingerprint, browser client headers, operating system, and session tokens.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="usage" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Server className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">3. How Your Information is Used</h2>
              </div>
              <p>We process your data strictly under lawful legal bases:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li><b>Service Delivery:</b> Managing your vehicle listings, processing search queries, and generating instant comps.</li>
                <li><b>Fraud Mitigation:</b> Verifying seller identity and Customs SGD authenticity to protect the marketplace from cloned or stolen cars.</li>
                <li><b>Inspection Dispatch:</b> Linking buyers with certified field technicians and routing physical inspection assignments.</li>
                <li><b>Legal &amp; Regulatory Compliance:</b> Complying with statutory reporting obligations under the NDPA, EFCC guidelines, and NCS import directives.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="masked-contact" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Eye className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">4. Masked Contact &amp; Anti-Fraud Privacy</h2>
              </div>
              <p>
                To safeguard sellers from unsolicited sales calls, stalking, and off-platform fraudulent escrow scams, mycarsNg enforces a strict <b>Masked Contact Architecture</b>:
              </p>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-2">
                <p className="font-semibold">Private Seller Contact Privacy Policy:</p>
                <p>
                  Direct private seller personal mobile numbers and exact garage/residential addresses are never exposed on public vehicle listing pages. Communications are mediated via our end-to-end WebSocket chat engine or verified WhatsApp click-to-chat bridge once intent is validated.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="payments" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">5. Financial Information &amp; Payment Security</h2>
              </div>
              <p>
                All payment transactions (including inspection escrows, dealership showroom plans, and advertising campaigns) are tokenized and processed via <b>Paystack</b>, a PCI-DSS Level 1 certified payment service provider.
              </p>
              <p>
                <b>mycarsNg never stores, views, or logs full debit or credit card PANs, CVVs, or card PINs on our servers.</b> We receive only cryptographic transaction references, payment confirmation tokens, and masked bank settlement accounts for technician payouts.
              </p>
            </section>

            {/* Section 6 */}
            <section id="sharing" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Server className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">6. Third-Party Disclosures &amp; Sub-Processors</h2>
              </div>
              <p>
                We do not sell, rent, or trade your personal information to third parties. We share data only with trusted infrastructure sub-processors under binding confidentiality agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li><b>Neon Cloud PostgreSQL:</b> Managed encrypted cloud database storage.</li>
                <li><b>Cloudinary:</b> Secure CDN storage for vehicle photos and inspection condition reports.</li>
                <li><b>Brevo (Sendinblue):</b> Secure dispatch of OTP verification emails and transaction alerts.</li>
                <li><b>Paystack:</b> Real-time payment processing and HMAC webhook settlement.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="rights" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">7. Your Data Protection Rights</h2>
              </div>
              <p>Under the NDPA 2023, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>Request access to copies of personal data held on your profile.</li>
                <li>Request rectification of inaccurate vehicle ownership or identity records.</li>
                <li>Request erasure (&quot;Right to be Forgotten&quot;) of your account and personal identifiers, subject to statutory fraud prevention retention windows.</li>
                <li>Object to automated profiling or marketing communications.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="dpo" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building className="w-5 h-5 text-neutral-900" />
                <h2 className="text-xl font-bold">8. Data Protection Officer (DPO) Contact</h2>
              </div>
              <p>
                If you have questions, complaints, or wish to exercise your data rights, please contact our designated Data Protection Officer:
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                <p><b>Data Protection Office:</b> mycarsNg (Carplug Nigeria Technologies Ltd)</p>
                <p><b>Email:</b> <a href="mailto:privacy@mycars.ng" className="text-blue-600 font-semibold hover:underline">privacy@mycars.ng</a> / <a href="mailto:dpo@mycars.ng" className="text-blue-600 font-semibold hover:underline">dpo@mycars.ng</a></p>
                <p><b>Address:</b> Plot 14 Admiralty Way, Lekki Phase 1, Lagos State, Nigeria</p>
                <p><b>Regulatory Body:</b> Nigeria Data Protection Commission (NDPC), Abuja, FCT</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
