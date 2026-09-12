"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { fetchInspectionById, submitInspectionReport } from "@/services/api";
import { InspectionReport, MOCK_INSPECTIONS } from "@/data/mockStore";

interface ChecklistItem {
  category: string;
  item: string;
  status: "pass" | "warning" | "fail";
  note: string;
}

export default function ReportComposerPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const [inspection, setInspection] = useState<InspectionReport | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [verdict, setVerdict] = useState(
    "Exceptional mechanical condition overall. Engine, transmission, and auxiliary systems tested in top quartile. Front lower control arm bushings show slight superficial wear typical of road conditions — budget approximately ₦80k-₦140k for OEM bushings during next service. Clean title and customs documents confirmed genuine."
  );
  const [overallScore, setOverallScore] = useState(92);
  const [repairLow, setRepairLow] = useState("80000");
  const [repairHigh, setRepairHigh] = useState("140000");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!id) return;
      try {
        const fetched = await fetchInspectionById(id);
        if (!isMounted) return;
        if (fetched) {
          setInspection(fetched);
          if (fetched.technicianSummary) {
            setVerdict(fetched.technicianSummary);
          }
          if (fetched.overallScore > 0) {
            setOverallScore(fetched.overallScore);
          }
          if (fetched.estimatedRepairCostRange) {
            setRepairLow(String(fetched.estimatedRepairCostRange[0]));
            setRepairHigh(String(fetched.estimatedRepairCostRange[1]));
          }
        } else {
          setInspection(MOCK_INSPECTIONS.find((i) => i.id === id) || MOCK_INSPECTIONS[0]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to load inspection details:", err);
        setInspection(MOCK_INSPECTIONS.find((i) => i.id === id) || MOCK_INSPECTIONS[0]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // Load draft checklist from localStorage
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(`verza_inspection_${id}_checklist`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setChecklist(parsed);
              // Calculate score estimate based on checklist pass rate
              const passes = parsed.filter((item: ChecklistItem) => item.status === "pass").length;
              const warnings = parsed.filter((item: ChecklistItem) => item.status === "warning").length;
              const calculated = Math.round(((passes + warnings * 0.5) / parsed.length) * 100);
              if (calculated > 0 && isMounted) {
                setOverallScore(calculated);
              }
            }
          }
        } catch {
          // ignore cache read errors
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const compileCategories = () => {
    if (checklist.length === 0) {
      // Return sensible standard categories if checklist was empty
      return [
        {
          name: "Engine & Powertrain",
          score: overallScore,
          status: overallScore >= 80 ? "pass" : "warning",
          items: [
            { label: "Cold Start & Compression", status: "good" as const, note: "Clean start" },
            { label: "Fluid Levels & Leaks", status: "good" as const, note: "Normal levels" },
            { label: "OBD-II Diagnostic Scan", status: "good" as const, note: "Zero active DTCs" },
          ],
        },
        {
          name: "Transmission & Drivetrain",
          score: Math.min(100, overallScore + 2),
          status: "pass",
          items: [
            { label: "Shift Response Under Load", status: "good" as const, note: "Smooth transition" },
            { label: "Torque Converter", status: "good" as const, note: "Nominal" },
          ],
        },
        {
          name: "Suspension & Steering",
          score: Math.max(70, overallScore - 6),
          status: overallScore < 85 ? "warning" : "pass",
          items: [
            { label: "Front Control Arm Bushings", status: "fair" as const, note: "Superficial hairline wear" },
            { label: "Struts & Dampers", status: "good" as const, note: "Dry, no bounce" },
          ],
        },
        {
          name: "Brakes & Tires",
          score: Math.min(100, overallScore + 1),
          status: "pass",
          items: [
            { label: "Brake Pads Thickness", status: "good" as const, note: "75% pad life remaining" },
            { label: "Tire Tread Depth", status: "good" as const, note: "6mm tread depth" },
          ],
        },
      ];
    }

    // Group checklist items by category
    const map = new Map<string, ChecklistItem[]>();
    for (const item of checklist) {
      const existing = map.get(item.category) || [];
      existing.push(item);
      map.set(item.category, existing);
    }

    const categories = [];
    for (const [categoryName, items] of map.entries()) {
      const passes = items.filter((i) => i.status === "pass").length;
      const warns = items.filter((i) => i.status === "warning").length;
      const catScore = Math.round(((passes + warns * 0.5) / items.length) * 100);
      const hasDefects = items.some((i) => i.status === "fail");
      const hasWarns = items.some((i) => i.status === "warning");

      categories.push({
        name: categoryName,
        score: catScore,
        status: (hasDefects ? "fail" : hasWarns ? "warning" : "pass") as "pass" | "warning" | "fail",
        items: items.map((i) => ({
          label: i.item,
          status: (i.status === "pass" ? "good" : i.status === "warning" ? "fair" : "defect") as
            | "good"
            | "fair"
            | "defect",
          note: i.note,
        })),
      });
    }
    return categories;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const categories = compileCategories();
      const media = [
        {
          type: "image",
          url: "/images/cars/car1.jpeg",
          caption: "Engine Bay & Structural Aprons Inspection",
        },
        {
          type: "image",
          url: "/images/cars/car2.jpeg",
          caption: "OBD-II Live Diagnostic System Scan",
        },
      ];

      await submitInspectionReport(id, {
        overallScore: Math.max(0, Math.min(100, Number(overallScore))),
        technicianSummary: verdict.trim(),
        repairCostMin: Number(repairLow) || 0,
        repairCostMax: Number(repairHigh) || 0,
        categories,
        media,
      });

      setSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`verza_inspection_${id}_checklist`);
      }
    } catch (err: unknown) {
      console.error("Failed to submit inspection report:", err);
      const msg = err instanceof Error ? err.message : "Failed to publish inspection report";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-16 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <span className="text-xs font-semibold">Loading report composer...</span>
      </div>
    );
  }

  const title = inspection?.vehicleTitle || "Target Vehicle";
  const vin = inspection?.vehicleVin || "VIN Not Specified";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.push(`/technician/inspections/${id}/checklist`)}
            className="text-gray-400 hover:text-neutral-900 transition flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
          <span className="text-gray-300">•</span>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Vehicle Health Certification
          </span>
        </div>

        <h1 className="text-2xl font-black text-neutral-900">
          Compile Vehicle Health Report
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {title} • VIN: <span className="font-mono">{vin}</span> • Inspection #{id}
        </p>

        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error submitting report</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="mt-8 p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <div>
              <h3 className="font-black text-emerald-950 text-xl">
                Vehicle Health Report Filed &amp; Certified!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto mt-2 leading-relaxed">
                This vehicle listing has been automatically upgraded to{" "}
                <b className="font-black">Tier 5 Verified • 150-Point Certified</b> with an overall health score of{" "}
                <b className="font-black">{overallScore}%</b>.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/buyer/inspections/${id}/report`}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span>Preview Public Health Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/technician/inspections"
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-neutral-900 font-bold text-xs rounded-xl hover:bg-gray-50 transition"
              >
                Back to Jobs
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                Publishing this certified report will immediately upgrade the marketplace vehicle listing to{" "}
                <b>Tier 5 Verified • 150-Point Certified</b> and unlock escrow funds.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Overall Mechanical Health Score (0 - 100%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overallScore}
                  onChange={(e) => setOverallScore(Number(e.target.value))}
                  className="w-36 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xl font-black text-neutral-900 focus:bg-white focus:outline-none"
                />
                <span className="text-xs text-gray-500">
                  Calculated based on {checklist.length > 0 ? `${checklist.length} audit points` : "standard diagnostic baseline"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Plain-Language Verdict Summary (for non-mechanic buyers)
              </label>
              <textarea
                rows={5}
                required
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none leading-relaxed"
                placeholder="Detail engine responsiveness, transmission shift quality, bushing wear, and any recommended maintenance..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Repair Budget Min (₦)
                </label>
                <input
                  type="number"
                  value={repairLow}
                  onChange={(e) => setRepairLow(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-mono"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Repair Budget Max (₦)
                </label>
                <input
                  type="number"
                  value={repairHigh}
                  onChange={(e) => setRepairHigh(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-mono"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-900">
                Diagnostic Photos &amp; Scan Evidence Included
              </div>
              <p className="text-[11px] text-gray-400">
                Engine bay, OBD-II scanner screenshot, undercarriage chassis rails, and mil gauge
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Health Report &amp; Upgrading Vehicle...</span>
                </>
              ) : (
                <>
                  <span>Submit &amp; Publish Vehicle Health Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
