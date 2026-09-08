import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  Wrench,
  Check,
  ShieldCheck,
  Award,
  Clock,
  Car,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default async function ChooseInspectionTierPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const vehicle = MOCK_VEHICLES.find((v) => v.id === vehicleId);

  if (!vehicle) {
    notFound();
  }

  const tiers = [
    {
      id: "standard",
      name: "Standard Inspection",
      price: 25000,
      turnaround: "Within 24 Hours",
      features: [
        "45-point mechanical & safety audit",
        "Engine oil & cooling system leak test",
        "Transmission forward/reverse shift check",
        "Tire tread & brake pad wear assessment",
        "Nigerian customs & paper status review",
        "Digital health score & plain-text report",
      ],
      recommended: false,
    },
    {
      id: "premium",
      name: "Premium Diagnostic",
      price: 45000,
      turnaround: "Same-Day Priority (4-6 Hours)",
      features: [
        "Everything in Standard Inspection",
        "OBD-II live computer diagnostic & fault log",
        "Suspension bushing & ball-joint stress test",
        "Paint thickness gauge scan (Accident / Respray)",
        "Undercarriage chassis rail inspection video",
        "Air conditioning condenser cooling cycle test",
        "Verified Vehicle Health Report Badge",
      ],
      recommended: true,
    },
    {
      id: "comprehensive",
      name: "Comprehensive Master Audit",
      price: 75000,
      turnaround: "Priority Concierge SLA",
      features: [
        "Everything in Premium Diagnostic",
        "120-point exhaustive structural audit",
        "Master technician voice note & call consultation",
        "Itemized repair & parts budget estimate",
        "Pre-negotiation defect leverage summary",
        "Escrow purchase protection eligibility",
      ],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 text-xs font-semibold mb-8">
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
            Step 1: Choose Tier
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">
            Step 2: Choose Technician
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">
            Step 3: Schedule & Pay
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Order Independent Inspection
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Target Vehicle: <b className="text-neutral-900">{vehicle.title}</b> located in{" "}
            {vehicle.publicLocation}. Technicians operate independently from the seller.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition shadow-xs hover:shadow-md relative ${
                tier.recommended
                  ? "border-2 border-blue-600 ring-4 ring-blue-50"
                  : "border border-gray-200"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Recommended Choice
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg text-neutral-900">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-neutral-900">
                    ₦{tier.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">/ one-time</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 pb-5 border-b border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tier.turnaround}</span>
                </div>

                <div className="mt-5 space-y-3 text-xs text-gray-700">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={`/buyer/inspections/book/${vehicle.id}/technicians?tier=${tier.id}`}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    tier.recommended
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      : "bg-neutral-900 hover:bg-neutral-800 text-white"
                  }`}
                >
                  <span>Select {tier.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Escrow & Guarantee Notice */}
        <div className="mt-12 p-6 bg-white border border-gray-200 rounded-2xl max-w-3xl mx-auto flex items-start gap-4 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <h4 className="font-bold text-neutral-900 text-sm mb-1">
              Verza Inspection Escrow Guarantee
            </h4>
            <p>
              Your payment is held in secure platform escrow. Funds are only released to the technician after their completed checklist, photos, and Vehicle Health Report are uploaded and verified on your account.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
