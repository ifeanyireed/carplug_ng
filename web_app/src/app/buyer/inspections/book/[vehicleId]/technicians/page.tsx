import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MOCK_VEHICLES, MOCK_TECHNICIANS } from "@/data/mockStore";
import {
  Wrench,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default async function ChooseTechnicianPage({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { vehicleId } = await params;
  const sParams = await searchParams;
  const tier = (sParams.tier as string) || "premium";

  const vehicle = MOCK_VEHICLES.find((v) => v.id === vehicleId);
  if (!vehicle) notFound();

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 text-xs font-semibold mb-8">
          <Link
            href={`/buyer/inspections/book/${vehicle.id}`}
            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Tier: {tier.toUpperCase()}</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
            Step 2: Choose Technician
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">
            Step 3: Schedule & Pay
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Verified Technicians Near This Car
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Independent certified mechanics operating in <b className="text-neutral-900">{vehicle.publicLocation}</b>.
            Ranked by proximity, track record, and verified diagnostic gear.
          </p>
        </div>

        {/* Technicians List */}
        <div className="space-y-4">
          {MOCK_TECHNICIANS.map((tech) => (
            <div
              key={tech.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-sm">
                  {tech.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-neutral-900">{tech.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                      {tech.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-bold text-neutral-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{tech.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{tech.completedJobs} completed audits</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>~{tech.distanceKm} km away</span>
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 pt-1">
                    <span className="text-gray-400 font-medium">Specialties: </span>
                    <span>{tech.specialties.join(" • ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
                  {tech.availability}
                </span>

                <Link
                  href={`/buyer/inspections/insp-001/tracker`}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Select & Dispatch</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
