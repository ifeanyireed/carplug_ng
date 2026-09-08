"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Check, X, Eye } from "lucide-react";

export default function ListingsModerationPage() {
  const [flagged, setFlagged] = useState([
    {
      id: "MOD-301",
      vehicle: "2019 Toyota Highlander XLE",
      seller: "AutoDeals Ikeja",
      reason: "Suspiciously Low Price (₦11.5M vs Market ₦24M)",
      severity: "High",
      flaggedDate: "Today, 10:45 AM",
    },
    {
      id: "MOD-302",
      vehicle: "2020 Lexus ES 350",
      seller: "Private Seller (Anonymous)",
      reason: "Duplicate VIN detected across two different seller accounts",
      severity: "High",
      flaggedDate: "Yesterday",
    },
    {
      id: "MOD-303",
      vehicle: "2016 Mercedes C300",
      seller: "Lekki Luxury Cars",
      reason: "Stock dealership image detected via reverse image match",
      severity: "Medium",
      flaggedDate: "Sept 2",
    },
  ]);

  const handleResolve = (id: string) => {
    setFlagged((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-black text-neutral-900">
          Listings Moderation & Fraud Prevention
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Automated AI anomaly detection flags ghost listings, duplicate VINs, and misleading photos
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Audit ID</th>
                <th className="pb-3">Flagged Vehicle</th>
                <th className="pb-3">Seller Entity</th>
                <th className="pb-3">Flag Reason</th>
                <th className="pb-3">Risk Level</th>
                <th className="pb-3 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flagged.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-4 font-mono font-bold text-gray-500">{item.id}</td>
                  <td className="py-4 font-bold text-neutral-900">{item.vehicle}</td>
                  <td className="py-4 text-gray-600">{item.seller}</td>
                  <td className="py-4 text-neutral-800 font-medium">{item.reason}</td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        item.severity === "High"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.severity} Risk
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-[11px] transition"
                      >
                        Suspend Listing
                      </button>
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[11px] transition"
                      >
                        Dismiss Flag
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
