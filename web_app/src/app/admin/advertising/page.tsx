"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Eye,
  MousePointer,
  BarChart3,
  TrendingUp,
  Sliders,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface CampaignItem {
  id: string;
  advertiser: string;
  placement: string;
  creativeImage: string;
  budget: number;
  dates: string;
  impressionsDelivered: number;
  impressionGoal: number;
  clicks: number;
  status: "Active" | "Pending Review" | "Paused" | "Completed";
  targetCity: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: "camp-01",
    advertiser: "Leadway Auto Insurance",
    placement: "Vehicle Health Report Sponsor",
    creativeImage: "/images/cars/car17.jpeg",
    budget: 360000,
    dates: "Sep 01 - Sep 15, 2026",
    impressionsDelivered: 42300,
    impressionGoal: 60000,
    clicks: 1820,
    status: "Active",
    targetCity: "Nationwide",
  },
  {
    id: "camp-02",
    advertiser: "Stanbic IBTC Auto Loans",
    placement: "Homepage Brand Spotlight",
    creativeImage: "/images/cars/car15.jpeg",
    budget: 500000,
    dates: "Sep 03 - Sep 17, 2026",
    impressionsDelivered: 112000,
    impressionGoal: 200000,
    clicks: 4680,
    status: "Active",
    targetCity: "Lagos Island & Abuja",
  },
  {
    id: "camp-03",
    advertiser: "Mobil 1 Synthetic Oil Nigeria",
    placement: "Category Header Leaderboard",
    creativeImage: "/images/cars/car18.jpeg",
    budget: 240000,
    dates: "Sep 05 - Sep 19, 2026",
    impressionsDelivered: 18500,
    impressionGoal: 100000,
    clicks: 890,
    status: "Active",
    targetCity: "Nationwide",
  },
  {
    id: "camp-04",
    advertiser: "Crown Continental Autos",
    placement: "Sponsored Vehicle Listing",
    creativeImage: "/images/cars/car13.jpeg",
    budget: 150000,
    dates: "Sep 06 - Sep 20, 2026",
    impressionsDelivered: 0,
    impressionGoal: 50000,
    clicks: 0,
    status: "Pending Review",
    targetCity: "Lagos Mainland",
  },
  {
    id: "camp-05",
    advertiser: "Autochek Spare Parts",
    placement: "Category Header Leaderboard",
    creativeImage: "/images/cars/car16.jpeg",
    budget: 120000,
    dates: "Sep 06 - Sep 13, 2026",
    impressionsDelivered: 0,
    impressionGoal: 85000,
    clicks: 0,
    status: "Pending Review",
    targetCity: "Lagos & Abuja",
  },
];

export default function AdminAdvertisingPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all");

  const handleApprove = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Active" } : c))
    );
  };

  const handleReject = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: c.status === "Active" ? "Paused" : "Active",
        };
      })
    );
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "pending") return c.status === "Pending Review";
    if (activeTab === "active") return c.status === "Active";
    return true;
  });

  const pendingCount = campaigns.filter((c) => c.status === "Pending Review").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>Advertising &amp; Sponsorship Console</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage sponsored inventory placements, approve advertiser creatives, and track real-time revenue telemetry.
          </p>
        </div>

        <Link
          href="/advertise"
          target="_blank"
          className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          View Public Media Kit →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Flights", value: campaigns.filter((c) => c.status === "Active").length, note: "Live across platforms", icon: Play },
          { label: "Pending Approvals", value: pendingCount, note: "Awaiting admin review", icon: AlertCircle },
          { label: "Delivered Impressions", value: "1,420,000+", note: "MTD Network Traffic", icon: Eye },
          { label: "Total Ad Revenue", value: "₦4,850,000", note: "MTD Gross Billing", icon: DollarSign },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{stat.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placements Occupancy & Floor Control */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Live Ad Slot Controllers</h3>
            <p className="text-xs text-gray-500">Enable or disable placements and configure weekly floor pricing</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            85% Network Occupancy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { name: "Sponsored Search Card", slot: "Search Grid Top 3", floor: "₦75,000/wk", active: true },
            { name: "Category Leaderboard", slot: "Search & VDP Top Banner", floor: "₦120,000/wk", active: true },
            { name: "Hero Brand Spotlight", slot: "Homepage Sub-Search", floor: "₦250,000/wk", active: true },
            { name: "Inspection Report Banner", slot: "Official PDF & Web Report", floor: "₦180,000/wk", active: true },
          ].map((slot, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{slot.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{slot.slot}</div>
              </div>
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-mono font-semibold text-gray-800">
                <span>{slot.floor}</span>
                <span className="text-[11px] text-blue-600 font-sans font-medium cursor-pointer hover:underline">Edit Floor</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Table & Moderation */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
        {/* Table Header / Tabs */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-neutral-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              All Campaigns ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-neutral-900 text-white"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "active"
                  ? "bg-neutral-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              Active Flights
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing {filteredCampaigns.length} campaigns
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Advertiser &amp; Placement</th>
                <th className="py-3.5 px-4">Creative Preview</th>
                <th className="py-3.5 px-4">Flight Dates &amp; Geo</th>
                <th className="py-3.5 px-4">Budget</th>
                <th className="py-3.5 px-4">Pacing (Delivered / Goal)</th>
                <th className="py-3.5 px-4">CTR</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredCampaigns.map((camp) => {
                const ctr = camp.impressionsDelivered > 0 ? ((camp.clicks / camp.impressionsDelivered) * 100).toFixed(1) : "0.0";
                const progress = camp.impressionGoal > 0 ? Math.min(100, Math.round((camp.impressionsDelivered / camp.impressionGoal) * 100)) : 0;

                return (
                  <tr key={camp.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 text-sm">{camp.advertiser}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{camp.placement}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={camp.creativeImage}
                          alt={camp.advertiser}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{camp.dates}</div>
                      <div className="text-[11px] text-gray-500">{camp.targetCity}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-gray-900">
                      ₦{camp.budget.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span>{camp.impressionsDelivered.toLocaleString()}</span>
                        <span className="text-gray-400">/ {camp.impressionGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span className="font-bold text-gray-900">{ctr}%</span>
                      <span className="text-[10px] text-gray-400 block">{camp.clicks.toLocaleString()} clicks</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          camp.status === "Active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : camp.status === "Pending Review"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {camp.status === "Pending Review" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(camp.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="Approve flight"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(camp.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="Reject flight"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(camp.id)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                        >
                          {camp.status === "Active" ? "Pause" : "Resume"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
