"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_LEADS, Lead } from "@/data/mockStore";
import { Users, Phone, MessageSquare, CheckCircle, Clock, Search, Filter } from "lucide-react";

export default function DealerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = leads.filter((l) => {
    if (activeFilter === "inspection") return l.type === "inspection_request";
    if (activeFilter === "viewing") return l.type === "viewing_schedule";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Buyer Lead Inbox</h1>
          <p className="text-xs text-gray-500 mt-1">
            Verified buyer inquiries and requested inspection reports routed directly to your dealership
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === "all"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveFilter("inspection")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === "inspection"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inspection Requests
          </button>
          <button
            onClick={() => setActiveFilter("viewing")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === "viewing"
                ? "bg-neutral-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Viewing Bookings
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filtered.map((lead) => (
          <div
            key={lead.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-neutral-900">
                  {lead.buyerName}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{lead.buyerCity}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                  {lead.type.replace("_", " ")}
                </span>
              </div>

              <div className="text-xs text-neutral-800 font-medium">
                Regarding: <b className="text-neutral-900">{lead.vehicleTitle}</b> (₦{(lead.vehiclePrice / 1000000).toFixed(1)}M)
              </div>

              {lead.note && (
                <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                  "{lead.note}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link
                href="/dealer/messages"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
