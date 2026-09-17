"use client";

import React, { useState, useEffect } from "react";
import { fetchSwaps, updateSwapStatus } from "@/services/api";
import {
  ArrowLeftRight,
  Percent,
  Clock,
  DollarSign,
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

export default function AdminSwapsPage() {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active">("all");

  useEffect(() => {
    let isMounted = true;
    fetchSwaps().then((data) => {
      if (isMounted) {
        setSwaps((data as SwapRequest[]) || []);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (id: string) => {
    setSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Dealer Accepted" } : s))
    );
    try {
      await updateSwapStatus(id, "Dealer Accepted");
    } catch (err) {
      console.warn("Failed to update swap status on backend:", err);
    }
  };

  const handleDispatchTech = async (id: string) => {
    setSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "In Audit", assignedTech: "Engr. Chidi Okafor" } : s))
    );
    try {
      await updateSwapStatus(id, "In Audit");
    } catch (err) {
      console.warn("Failed to update swap status on backend:", err);
    }
  };

  const filteredSwaps = swaps.filter((s) => {
    if (filterTab === "pending") return s.status === "Pending Audit";
    if (filterTab === "active") return s.status === "In Audit" || s.status === "Dealer Accepted";
    return true;
  });

  const pendingCount = swaps.filter((s) => s.status === "Pending Audit").length;
  const activeCount = swaps.filter((s) => s.status === "In Audit" || s.status === "Dealer Accepted").length;
  const totalGmv = swaps.filter((s) => s.status === "Completed").reduce((sum, s) => sum + (s.targetCarPrice || 0), 0);

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
          { label: "Active Swap Flights", value: `${activeCount} In Pacing`, note: "Dual audits scheduled", icon: ArrowLeftRight },
          { label: "Pending Approvals", value: `${pendingCount} Lots`, note: "Awaiting appraisal sign-off", icon: Clock },
          { label: "Exchange GMV (MTD)", value: `₦${(totalGmv / 1000000).toFixed(1)}M`, note: "Completed trades", icon: DollarSign },
          { label: "Avg Trade-In Discount", value: "5.0%", note: "mycarsNg Platform Subsidy", icon: Percent },
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading swap records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSwaps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <ArrowLeftRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-neutral-800">No Swap Requests</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pending car swap and trade-in appraisals will be listed here.</p>
                  </td>
                </tr>
              ) :
                filteredSwaps.map((item) => (
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
