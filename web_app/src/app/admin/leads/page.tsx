"use client";

import React, { useState } from "react";
import { MOCK_LEADS, MOCK_TECHNICIANS, Lead } from "@/data/mockStore";
import { GitPullRequest, Wrench, Users, Check, ArrowRight } from "lucide-react";

export default function LeadRoutingBoardPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">Lead Routing Board</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor inbound buyer requests, auto-matched technicians, and manually override assignments
        </p>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-900">{lead.buyerName}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{lead.buyerCity}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold uppercase text-[10px]">
                  {lead.type.replace("_", " ")}
                </span>
              </div>
              <div className="text-neutral-800 font-semibold">
                Target: {lead.vehicleTitle} (₦{(lead.vehiclePrice / 1000000).toFixed(1)}M)
              </div>
              <p className="text-gray-500 italic">"{lead.note}"</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right text-xs">
                <span className="text-gray-400 block text-[11px]">Matched Technician</span>
                <span className="font-bold text-neutral-900">
                  {lead.technicianId ? "Tech. Musa Danladi (98% match)" : "Auto-Routing Pending"}
                </span>
              </div>

              <button
                onClick={() => alert("Override technician modal opened")}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Override Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
