"use client";

import React, { useState } from "react";
import { FileCheck, Check, X, Eye, ExternalLink, ShieldCheck } from "lucide-react";

export default function VerificationQueuePage() {
  const [queue, setQueue] = useState([
    {
      id: "VER-101",
      type: "Customs SGD Declaration",
      entity: "2021 Mercedes-Benz GLC 300 (Reed Motors)",
      vin: "WDC2539841F901823",
      submitter: "Reed Motors Lagos",
      date: "Today, 11:20 AM",
      status: "pending",
    },
    {
      id: "VER-102",
      type: "Private Seller NIN Verification",
      entity: "Babatunde O. (2018 Toyota Corolla)",
      vin: "NIN: 49201928401",
      submitter: "Babatunde O.",
      date: "Today, 09:14 AM",
      status: "pending",
    },
    {
      id: "VER-103",
      type: "Technician Trade Certification",
      entity: "Emmanuel Chukwu (NABTEB Mechanical Cert)",
      vin: "Workshop: Surulere Autocenter",
      submitter: "Emmanuel Chukwu",
      date: "Yesterday",
      status: "pending",
    },
  ]);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">Document Verification Queue</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review uploaded customs documents, government IDs, and trade credentials before approving Tier upgrades
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Queue ID</th>
                <th className="pb-3">Document Category</th>
                <th className="pb-3">Associated Listing / Profile</th>
                <th className="pb-3">Submitted By</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-4 font-mono font-bold text-gray-500">{item.id}</td>
                  <td className="py-4 font-semibold text-neutral-900">{item.type}</td>
                  <td className="py-4 text-gray-700">
                    <div className="font-medium">{item.entity}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{item.vin}</div>
                  </td>
                  <td className="py-4 text-gray-600">{item.submitter}</td>
                  <td className="py-4 text-gray-400">{item.date}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(item.id, "approved")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve &amp; Upgrade</span>
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "rejected")}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
