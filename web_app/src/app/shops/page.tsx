import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchDealers } from "@/services/api";
import { ShopsDirectoryView } from "@/components/dealer/ShopsDirectoryView";
import { ShieldCheck, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Dealerships Directory | mycarsNg",
  description:
    "Browse verified automotive dealerships across Nigeria. Physical showrooms with authenticated CAC credentials and inspected inventories.",
  openGraph: {
    title: "Verified Dealerships Directory | mycarsNg",
    description:
      "Explore certified automotive hubs and verified dealerships in Lagos, Abuja, and nationwide.",
  },
};

export default async function DealershipsDirectoryPage() {
  const dealers = await fetchDealers();

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-10">
        {/* Directory Hero Banner */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xs relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
              <span>Verified Automotive Hubs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Verified Dealerships Directory
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
              Explore accredited automotive showrooms across Nigeria. Every dealership is verified
              with registered CAC documentation, physical premises inspection, and 100% inspected inventory.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center p-6 sm:p-7 rounded-3xl bg-[#F7F8FA] border border-gray-200/80 shrink-0 self-center">
            <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-700" strokeWidth={1.2} />
          </div>
        </div>

        {/* Directory Interactive Grid */}
        <ShopsDirectoryView initialShops={dealers} />
      </main>

      <Footer />
    </div>
  );
}
