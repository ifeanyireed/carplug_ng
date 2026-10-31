import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Building2,
  Scale,
  PackageCheck,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Vehicle Collection Policy | mycarsNg",
  description:
    "Learn about vehicle collection, delivery arrangements, title document handovers, and why mycarsNg operates as an online marketplace rather than a vehicle fulfillment center.",
};

export default function ShippingPolicyPage() {
  const lastUpdated = "October 2026";

  const sections = [
    { id: "marketplace-model", title: "1. Marketplace Model & Fulfillment Notice" },
    { id: "collection-protocol", title: "2. Vehicle Collection & Handover Protocol" },
    { id: "inspection-recommendation", title: "3. Pre-Collection Certified Inspections" },
    { id: "title-handover", title: "4. Title Documentation & Statutory Papers" },
    { id: "interstate-delivery", title: "5. Inter-State Transport & Third-Party Haulage" },
    { id: "risk-and-title", title: "6. Passage of Risk & Title Transfer" },
    { id: "disputes", title: "7. Collection Disputes & Mediation Support" },
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
          <span className="text-neutral-900 font-semibold">Shipping &amp; Vehicle Collection Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <Truck className="w-3.5 h-3.5" />
            <span>Vehicle Handover &amp; Transport Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Shipping &amp; Vehicle Collection Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            This policy outlines how vehicle handovers, collections, title document transfers, and interstate transit are coordinated between buyers and sellers on <b>mycarsNg</b> (operating as Carplug Nigeria Technologies Ltd).
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
              <span>Compliant with Federal Competition and Consumer Protection Act (FCCPA)</span>
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
            <section id="marketplace-model" className="scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">1. Marketplace Model &amp; Fulfillment Notice</h2>
              </div>
              <p>
                <b>mycarsNg is an online vehicle marketplace and does NOT operate as a vehicle fulfillment center, logistics warehouse, or common carrier.</b>
              </p>
              <p>
                All vehicles displayed on the platform are held in the direct custody and inventory of independent vehicle owners or verified commercial dealerships. We do not maintain physical vehicle yards, storage impounds, or distribution hubs.
              </p>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Buyers arrange vehicle inspection, collection, or delivery directly with the relevant seller or showroom, subject to any separately agreed certified inspection service booked through the platform.
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="collection-protocol" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">2. Vehicle Collection &amp; Handover Protocol</h2>
              </div>
              <p>
                For direct in-person vehicle collection within the same state (e.g., Lagos, Abuja, Port Harcourt), buyers and sellers must observe the following best practices:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Verified Meeting Venue:</b> Collections should take place at the seller&apos;s verified dealership showroom or at an accredited certified inspection diagnostic center. If transacting with a private seller, choose a secure, well-lit public venue with security presence.
                </li>
                <li>
                  <b>Physical Verification:</b> The buyer must physically match the vehicle identification number (VIN) and engine serial against the vehicle chassis and the paperwork presented.
                </li>
                <li>
                  <b>Operational Walkaround:</b> Inspect tires, fluid levels, transmission engagement, electrical fixtures, air conditioning, and safety equipment before signing handover forms.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="inspection-recommendation" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">3. Pre-Collection Certified Inspections</h2>
              </div>
              <p>
                To avoid purchasing flood-damaged, frame-bent, or mechanically defective vehicles, mycarsNg strongly advises every buyer to commission a <b>Certified 150-Point Diagnostic Inspection</b> prior to vehicle collection and final payment:
              </p>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>How the Platform Inspection Protects Your Collection:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-emerald-900/90">
                  <li>An independent ASE-certified master technician conducts an on-site mechanical, OBD-II diagnostic, structural, and electrical audit.</li>
                  <li>You receive an immutable digital condition report with high-resolution undercarriage and diagnostic trouble code (DTC) logs.</li>
                  <li>You proceed with collection with complete confidence in the vehicle&apos;s true roadworthiness and fair market valuation.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="title-handover" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">4. Title Documentation &amp; Statutory Papers</h2>
              </div>
              <p>
                At the moment of vehicle collection, the seller must physically deliver all valid original documentation required for lawful ownership transfer in Nigeria:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs uppercase text-neutral-900 tracking-wider">
                    Foreign-Used (Tokunbo) Vehicles
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li>Original Nigeria Customs Service (NCS) Single Goods Declaration (SGD)</li>
                    <li>NCS Assessment Notice &amp; Bank Duty Payment Receipts</li>
                    <li>Bill of Lading and Terminal Tally delivery order</li>
                    <li>Original foreign registration / salvage title documents</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs uppercase text-neutral-900 tracking-wider">
                    Nigerian-Used Vehicles
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li>Original Vehicle License &amp; Roadworthiness Certificate</li>
                    <li>Proof of Ownership Certificate (POC)</li>
                    <li>Signed Deed of Sale &amp; Change of Ownership letter</li>
                    <li>Police CMR Information System verification extract</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="interstate-delivery" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold">5. Inter-State Transport &amp; Third-Party Haulage</h2>
              </div>
              <p>
                When a buyer purchases a vehicle located in a different state (e.g., purchasing a vehicle in Lagos for delivery to Abuja, Kano, Enugu, or Port Harcourt):
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <b>Independent Logistics Agreement:</b> Long-distance interstate flatbed delivery or vehicle haulage is arranged directly between the buyer, seller, and a reputable third-party auto logistics company.
                </li>
                <li>
                  <b>No Carrier Liability:</b> mycarsNg does not operate delivery trucks, hire haulage drivers, or insure goods in transit. The contract of carriage is strictly between the transacting parties and their chosen logistics provider.
                </li>
                <li>
                  <b>In-Transit Insurance:</b> Parties are strongly advised to secure comprehensive goods-in-transit (GIT) insurance from licensed Nigerian underwriters covering accidental road collision, fire, and hijacking during interstate transport.
                </li>
              </ul>
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-950 flex items-start gap-3 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <b>Critical Buyer Warning:</b> Never wire full vehicle purchase payments to an unverified private seller before either physically inspecting the vehicle or having a certified mycarsNg technician verify the vehicle in person.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="risk-and-title" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <PackageCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">6. Passage of Risk &amp; Title Transfer</h2>
              </div>
              <p>
                Unless otherwise explicitly agreed in writing between buyer and seller:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>
                  <b>Risk of Loss:</b> Risk of damage, theft, or deterioration remains with the seller until physical keys, vehicle possession, and original title documents are formally handed over to the buyer or their authorized carrier.
                </li>
                <li>
                  <b>Passing of Title:</b> Legal title passes to the buyer upon execution of the Deed of Sale, handover of original statutory vehicle papers, and receipt of full consideration by the seller.
                </li>
                <li>
                  <b>Post-Handover Maintenance:</b> Following successful collection, roadworthiness renewals, licensing registrations, and mechanical upkeep become the sole responsibility of the buyer.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="disputes" className="scroll-mt-24 space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-neutral-900">
                <Scale className="w-5 h-5 text-neutral-900" />
                <h2 className="text-xl font-bold">7. Collection Disputes &amp; Mediation Support</h2>
              </div>
              <p>
                If a collection or delivery dispute arises—such as a discrepancy between the advertised vehicle and the vehicle presented, or failure of a seller to furnish promised Customs SGD documentation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                <li>Do not finalize the transaction or transfer purchase funds.</li>
                <li>File an immediate complaint through our platform support desk at <code>disputes@mycars.ng</code>.</li>
                <li>Our trust and safety team will promptly investigate the listing, verify the showroom&apos;s compliance status, and apply sanctions or listing removals if misrepresentation is confirmed.</li>
              </ul>
              <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                For questions regarding vehicle handover protocols or to report delivery concerns, contact us at{" "}
                <a href="mailto:support@mycars.ng" className="text-blue-600 font-semibold hover:underline">
                  support@mycars.ng
                </a>{" "}
                or call our Lagos compliance desk at +234 1 888 6922.
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
