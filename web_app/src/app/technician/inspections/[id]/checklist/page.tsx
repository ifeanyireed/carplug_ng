"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, AlertTriangle, X, Wrench, Camera, ArrowRight, Save } from "lucide-react";

export default function TechnicianChecklistPage() {
  const [checklist, setChecklist] = useState([
    { category: "Engine & Powertrain", item: "Cold Start & Idling Sound", status: "pass", note: "Clean start, zero valve tick" },
    { category: "Engine & Powertrain", item: "Engine Oil Level & Contamination", status: "pass", note: "Clean synthetic oil" },
    { category: "Engine & Powertrain", item: "OBD-II Scan Diagnostic DTCs", status: "pass", note: "Zero active error codes" },
    { category: "Transmission", item: "Forward / Reverse Engagement Delay", status: "pass", note: "Immediate engagement" },
    { category: "Transmission", item: "Gear Shifts Under Load (Road Test)", status: "pass", note: "Smooth transition 1-8" },
    { category: "Suspension & Steering", item: "Front Lower Control Arm Bushings", status: "warning", note: "Hairline superficial cracking observed" },
    { category: "Suspension & Steering", item: "Shock Absorber Fluid Leaks", status: "pass", note: "Dry struts, no leakage" },
    { category: "Body & Paintwork", item: "Paint Thickness Mil Gauge Scan", status: "pass", note: "Original 4.5 - 5.1 mils across all panels" },
    { category: "Brakes & Tires", item: "Front Brake Pad Thickness", status: "pass", note: "7.5mm remaining (approx 75%)" },
    { category: "Interior & Electrical", item: "AC Cooling Temperature Drop", status: "pass", note: "6.2°C vent temp reached in 3 min" },
  ]);

  const toggleStatus = (index: number, newStatus: "pass" | "warning" | "fail") => {
    const updated = [...checklist];
    updated[index].status = newStatus;
    setChecklist(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Mobile-First Audit Tool
          </span>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Inspection Checklist #insp-001
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            2021 Lexus RX 350 F-Sport AWD • VIN: 2T2HZMCA4MC189402
          </p>
        </div>

        <Link
          href="/technician/inspections/insp-001/composer"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <span>Finish & Compile Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Checklist Items */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
          <span>Subsystem Checkpoint</span>
          <span>Condition Verdict</span>
        </div>

        <div className="divide-y divide-gray-100">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {item.category}
                </span>
                <div className="font-bold text-xs text-neutral-900">{item.item}</div>
                {item.note && (
                  <p className="text-[11px] text-gray-500 italic">"{item.note}"</p>
                )}
              </div>

              {/* Status Toggle Buttons */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
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
      </div>
    </div>
  );
}
