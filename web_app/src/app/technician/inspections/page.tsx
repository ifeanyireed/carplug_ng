"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { InspectionReport, MOCK_INSPECTIONS } from "@/data/mockStore";
import { fetchTechnicianMeInspections, fetchInspections } from "@/services/api";
import { Loader2, RefreshCw } from "lucide-react";

export default function TechnicianInspectionsListPage() {
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchJobs() {
      try {
        const data = await fetchTechnicianMeInspections();
        if (!isMounted) return;
        if (data && data.length > 0) {
          setInspections(data);
        } else {
          // Fallback to all inspections or mock
          const fallback = await fetchInspections();
          if (!isMounted) return;
          setInspections(fallback && fallback.length > 0 ? fallback : MOCK_INSPECTIONS);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to fetch inspections from API, using cached:", err);
        setInspections(MOCK_INSPECTIONS);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return inspections;
    return inspections.filter((i) => i.status === statusFilter);
  }, [inspections, statusFilter]);

  const stats = useMemo(() => {
    const completed = inspections.filter((i) => i.status === "completed").length;
    const active = inspections.length - completed;
    return { completed, active, total: inspections.length };
  }, [inspections]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Inspection Jobs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Active dispatches, scheduled lot appointments, and completed certified audits • {stats.active} active / {stats.completed} completed
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neutral-900" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            statusFilter === "all"
              ? "bg-neutral-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All Jobs ({stats.total})
        </button>
        <button
          onClick={() => setStatusFilter("requested")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            statusFilter === "requested"
              ? "bg-neutral-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Dispatches Pending
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            statusFilter === "completed"
              ? "bg-neutral-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <span className="text-xs font-semibold">Loading inspection jobs from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 bg-white border border-gray-200 rounded-3xl text-center text-xs text-gray-500">
          No inspection jobs found matching this status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((insp) => (
            <div
              key={insp.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      insp.status === "completed"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    {insp.status === "completed" ? "✓ Report Verified" : "● In Progress"}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-neutral-800">
                    {insp.inspectionTier} Tier
                  </span>
                  {insp.overallScore > 0 && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-bold text-emerald-700">
                        Score: {insp.overallScore}%
                      </span>
                    </>
                  )}
                </div>
                <h3 className="font-bold text-base text-neutral-900">{insp.vehicleTitle}</h3>
                <p className="text-xs text-gray-500 font-mono">VIN: {insp.vehicleVin}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/technician/inspections/${insp.id}/checklist`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl transition"
                >
                  Audit Checklist
                </Link>
                <Link
                  href={`/buyer/inspections/${insp.id}/report`}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
                >
                  View Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
