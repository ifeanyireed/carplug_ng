"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Wrench,
  ShieldCheck,
  Percent,
  Clock,
  CarFront,
  DollarSign,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface SwapRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  currentCar: string;
  currentCarImage: string;
  appraisedEquity: number;
  targetCar: string;
  targetCarPrice: number;
  platformDiscount: number;
  netTopUp: number;
  status: "Pending Audit" | "In Audit" | "Dealer Accepted" | "Completed";
  scheduledDate: string;
  assignedTech: string;
}

const INITIAL_SWAPS: SwapRequest[] = [
  {
    id: "swap-101",
    customerName: "Chukwuma Reed",
    customerPhone: "+234 803 291 0021",
    currentCar: "2017 Toyota Camry LE (74k mi)",
    currentCarImage: "/images/cars/car13.jpeg",
    appraisedEquity: 15000000,
    targetCar: "2021 Lexus RX 350 F-Sport",
    targetCarPrice: 38500000,
    platformDiscount: 1925000,
    netTopUp: 21575000,
    status: "In Audit",
    scheduledDate: "Sep 08, 2026",
    assignedTech: "Engr. Tunde Adeleke",
  },
  {
    id: "swap-102",
    customerName: "Fatima Al-Hassan",
    customerPhone: "+234 812 884 1932",
    currentCar: "2018 Toyota Corolla LE (82k mi)",
    currentCarImage: "/images/cars/car1.jpeg",
    appraisedEquity: 13500000,
    targetCar: "2020 Toyota Camry XSE V6",
    targetCarPrice: 24800000,
    platformDiscount: 1240000,
    netTopUp: 10060000,
    status: "Pending Audit",
    scheduledDate: "Sep 09, 2026",
    assignedTech: "Unassigned",
  },
  {
    id: "swap-103",
    customerName: "Obinna Eze",
    customerPhone: "+234 901 332 4410",
    currentCar: "2016 Mercedes-Benz C300 (58k mi)",
    currentCarImage: "/images/cars/car17.jpeg",
    appraisedEquity: 22000000,
    targetCar: "2022 Mercedes-Benz GLE 450",
    targetCarPrice: 68000000,
    platformDiscount: 3400000,
    netTopUp: 42600000,
    status: "Dealer Accepted",
    scheduledDate: "Sep 07, 2026",
    assignedTech: "Engr. Chidi Okafor",
  },
  {
    id: "swap-104",
    customerName: "David Adeleke",
    customerPhone: "+234 802 119 7734",
    currentCar: "2015 Honda Accord EX-L (66k mi)",
    currentCarImage: "/images/cars/car16.jpeg",
    appraisedEquity: 14000000,
    targetCar: "2019 Honda Accord Sport",
    targetCarPrice: 21500000,
    platformDiscount: 1075000,
    netTopUp: 6425000,
    status: "Completed",
    scheduledDate: "Sep 03, 2026",
    assignedTech: "Engr. Tunde Adeleke",
  },
];

export default function AdminSwapsPage() {
  const [swaps, setSwaps] = useState<SwapRequest[]>(INITIAL_SWAPS);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active">("all");

  const handleApprove = (id: string) => {
    setSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Dealer Accepted" } : s))
    );
  };

  const handleDispatchTech = (id: string) => {
    setSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "In Audit", assignedTech: "Engr. Chidi Okafor" } : s))
    );
  };

  const filteredSwaps = swaps.filter((s) => {
    if (filterTab === "pending") return s.status === "Pending Audit";
    if (filterTab === "active") return s.status === "In Audit" || s.status === "Dealer Accepted";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
            <span>Car Swap &amp; Trade-In Escrow Desk</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit trade-in vehicle equity, verify dealer acceptance, validate the 5% platform discount, and arbitrate physical exchange escrow.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          Escrow Active &bull; 100% Title Verification
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Swap Flights", value: "3 In Pacing", note: "Dual audits scheduled", icon: ArrowLeftRight },
          { label: "Pending Approvals", value: "2 Lots", note: "Awaiting appraisal sign-off", icon: Clock },
          { label: "Exchange GMV (MTD)", value: "₦148.5M", note: "Completed trades", icon: DollarSign },
          { label: "Avg Trade-In Discount", value: "5.0%", note: "Verza Platform Subsidy", icon: Percent },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{kpi.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swaps Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === "all" ? "bg-neutral-900 text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              All Requests ({swaps.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === "pending" ? "bg-neutral-900 text-white" : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              Pending Audit
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === "active" ? "bg-neutral-900 text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              Active Exchange
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing {filteredSwaps.length} trade-ins
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Current Trade-In Car</th>
                <th className="py-3.5 px-4">Appraised Equity</th>
                <th className="py-3.5 px-4">Target Upgrade</th>
                <th className="py-3.5 px-4">5% Subsidy</th>
                <th className="py-3.5 px-4">Net Top-Up Due</th>
                <th className="py-3.5 px-4">Technician Audit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredSwaps.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900 text-sm">{item.customerName}</div>
                    <div className="text-[11px] text-gray-500">{item.customerPhone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-gray-900">{item.currentCar}</div>
                    <span className="text-[10px] text-gray-400">VIN verified</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-gray-900">
                    ₦{(item.appraisedEquity / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-blue-700">{item.targetCar}</div>
                    <div className="text-[11px] text-gray-500">₦{(item.targetCarPrice / 1000000).toFixed(1)}M asking</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-emerald-700 font-semibold">
                    -₦{(item.platformDiscount / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-gray-900 text-sm">
                    ₦{(item.netTopUp / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900 font-medium">{item.assignedTech}</div>
                    <div className="text-[10px] text-gray-500">Slot: {item.scheduledDate}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === "Completed"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : item.status === "Dealer Accepted"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : item.status === "In Audit"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {item.status === "Pending Audit" ? (
                      <button
                        onClick={() => handleDispatchTech(item.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Dispatch Tech
                      </button>
                    ) : item.status === "In Audit" ? (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Approve Exchange
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-normal">Escrow Verified</span>
                    )}
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
