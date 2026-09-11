"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, AlertTriangle, X, ArrowRight, ArrowLeft, Loader2, Save } from "lucide-react";
import { fetchInspectionById } from "@/services/api";
import { InspectionReport, MOCK_INSPECTIONS } from "@/data/mockStore";

interface ChecklistItem {
  category: string;
  item: string;
  status: "pass" | "warning" | "fail";
  note: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { category: "Engine & Powertrain", item: "Cold Start & Idling Sound", status: "pass", note: "Clean start, zero valve tick" },
  { category: "Engine & Powertrain", item: "Engine Oil Level & Contamination", status: "pass", note: "Clean synthetic oil level normal" },
  { category: "Engine & Powertrain", item: "OBD-II Scan Diagnostic DTCs", status: "pass", note: "Zero active error codes" },
  { category: "Engine & Powertrain", item: "Cooling System & Radiator Leaks", status: "pass", note: "Pressure test passed, no seepage" },
  { category: "Transmission", item: "Forward / Reverse Engagement Delay", status: "pass", note: "Immediate engagement under 1s" },
  { category: "Transmission", item: "Gear Shifts Under Load (Road Test)", status: "pass", note: "Smooth transition 1-8 without slip" },
  { category: "Suspension & Steering", item: "Front Lower Control Arm Bushings", status: "warning", note: "Superficial hairline cracking observed" },
  { category: "Suspension & Steering", item: "Shock Absorber Fluid Leaks & Rebound", status: "pass", note: "Dry struts, no bounce leakage" },
  { category: "Body & Paintwork", item: "Paint Thickness Mil Gauge Scan", status: "pass", note: "Original 4.5 - 5.1 mils across all panels" },
  { category: "Body & Paintwork", item: "Chassis Aprons & Frame Integrity", status: "pass", note: "Factory spot welds intact, no crumple repairs" },
  { category: "Brakes & Tires", item: "Front Brake Pad Thickness", status: "pass", note: "7.5mm remaining (approx 75%)" },
  { category: "Brakes & Tires", item: "Tire Tread Depth & Date Codes", status: "pass", note: "6mm tread depth, matched set" },
  { category: "Interior & Electrical", item: "AC Cooling Temperature Drop", status: "pass", note: "6.2°C vent temp reached in 3 min" },
  { category: "Interior & Electrical", item: "Airbag & SRS Readiness Indicator", status: "pass", note: "Self-test passes on ignition cycle" },
];

export default function TechnicianChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const [inspection, setInspection] = useState<InspectionReport | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!id) return;
      try {
        const fetched = await fetchInspectionById(id);
        if (!isMounted) return;
        if (fetched) {
          setInspection(fetched);
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

      // Check for saved draft in localStorage
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(`verza_inspection_${id}_checklist`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setChecklist(parsed);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const saveChecklistState = (items: ChecklistItem[]) => {
    if (typeof window !== "undefined" && id) {
      localStorage.setItem(`verza_inspection_${id}_checklist`, JSON.stringify(items));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const toggleStatus = (index: number, newStatus: "pass" | "warning" | "fail") => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], status: newStatus };
    setChecklist(updated);
    saveChecklistState(updated);
  };

  const updateNote = (index: number, newNote: string) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], note: newNote };
    setChecklist(updated);
    saveChecklistState(updated);
  };

  const passCount = checklist.filter((i) => i.status === "pass").length;
  const warnCount = checklist.filter((i) => i.status === "warning").length;
  const failCount = checklist.filter((i) => i.status === "fail").length;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <span className="text-xs font-semibold">Loading inspection dispatch...</span>
      </div>
    );
  }

  const title = inspection?.vehicleTitle || "Vehicle Inspection Audit";
  const vin = inspection?.vehicleVin || "VIN Not Specified";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.push("/technician/inspections")}
              className="text-gray-400 hover:text-neutral-900 transition flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Jobs</span>
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              150-Point Mobile Checklist
            </span>
            {isSaved && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Save className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Inspection #{id}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {title} • VIN: <span className="font-mono">{vin}</span>
          </p>

          <div className="flex items-center gap-3 mt-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              ✓ {passCount} Pass
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              ⚠ {warnCount} Advisory
            </span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
              ✕ {failCount} Defect
            </span>
          </div>
        </div>

        <Link
          href={`/technician/inspections/${id}/composer`}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <span>Finish & Compile Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Checklist Items */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Subsystem Checkpoint</span>
          <span>Condition Verdict</span>
        </div>

        <div className="divide-y divide-gray-100">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-1 flex-1 pr-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {item.category}
                </span>
                <div className="font-bold text-xs text-neutral-900">{item.item}</div>
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => updateNote(idx, e.target.value)}
                  placeholder="Mechanic observation note..."
                  className="w-full text-xs text-gray-600 bg-gray-50 hover:bg-white focus:bg-white border border-transparent focus:border-gray-200 rounded-lg px-2.5 py-1 transition focus:outline-none"
                />
              </div>

              {/* Status Toggle Buttons */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => toggleStatus(idx, "pass")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    item.status === "pass"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleStatus(idx, "warning")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    item.status === "warning"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Advisory</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleStatus(idx, "fail")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    item.status === "fail"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Defect</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Checklist auto-saves to your local terminal browser session.
          </span>
          <Link
            href={`/technician/inspections/${id}/composer`}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <span>Proceed to Health Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
