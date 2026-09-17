"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Ban,
  Check,
  Trash2,
} from "lucide-react";
import {
  fetchFlaggedListings,
  moderateListingStatus,
  FlaggedListing,
} from "@/services/api";

export default function ListingsModerationPage() {
  const [flagged, setFlagged] = useState<FlaggedListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "high" | "medium_low">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      try {
        const data = await fetchFlaggedListings();
        if (isMounted) {
          setFlagged(data);
        }
      } catch (err) {
        console.warn("Failed to load flagged listings:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadListings();
    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleModerate = async (
    item: FlaggedListing,
    status: "suspended" | "active" | "removed"
  ) => {
    setActionLoadingId(item.id);
    try {
      const success = await moderateListingStatus(item.vehicleId, status, item.reason);
      if (success) {
        setNotification({
          type: "success",
          text: status === "removed"
            ? `Listing for "${item.vehicle}" permanently removed.`
            : `Listing for "${item.vehicle}" marked as ${status}.`,
        });
        setFlagged((prev) => prev.filter((f) => f.id !== item.id));
      } else {
        setNotification({
          type: "error",
          text: "Failed to apply moderation action. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        text: "Network error occurred while applying moderation.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismiss = (id: string) => {
    setFlagged((prev) => prev.filter((item) => item.id !== id));
    setNotification({
      type: "success",
      text: "Flag dismissed for this review session.",
    });
  };

  const filtered = flagged.filter((item) => {
    if (activeTab === "high") return item.severity === "High";
    if (activeTab === "medium_low") return item.severity !== "High";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fraud Detection & Quality Audit</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            Listings Moderation & Fraud Prevention
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Automated anomaly detection identifies pricing irregularities, missing customs declarations, and unverified sellers
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Auditing..." : "Re-run Audit"}</span>
        </button>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-neutral-900 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All Flagged ({flagged.length})
        </button>
        <button
          onClick={() => setActiveTab("high")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "high"
              ? "bg-red-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          High Risk ({flagged.filter((f) => f.severity === "High").length})
        </button>
        <button
          onClick={() => setActiveTab("medium_low")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "medium_low"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Medium / Low Risk ({flagged.filter((f) => f.severity !== "High").length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Scanning live catalog for market anomalies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-neutral-900">All Flagged Listings Resolved</h3>
            <p className="text-xs text-gray-500 mt-1">
              No outstanding anomalies or policy violations detected in this filter view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Audit ID</th>
                  <th className="pb-3">Flagged Vehicle</th>
                  <th className="pb-3">Seller Entity</th>
                  <th className="pb-3">Flag Reason</th>
                  <th className="pb-3">Risk Level</th>
                  <th className="pb-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-mono font-bold text-gray-500">{item.id}</td>
                    <td className="py-4">
                      <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>{item.vehicle}</span>
                        <Link
                          href={`/buyer/vehicles/${item.vehicleId}`}
                          target="_blank"
                          title="View live listing"
                          className="text-gray-400 hover:text-blue-600 inline-flex"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Listed: ₦{(item.price / 1e6).toFixed(1)}M
                        {item.marketMin > 0 && (
                          <span className="text-gray-400"> (Fair: ₦{(item.marketMin / 1e6).toFixed(1)}M - ₦{(item.marketMax / 1e6).toFixed(1)}M)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 font-medium">{item.seller}</td>
                    <td className="py-4 text-neutral-800 font-medium max-w-xs">{item.reason}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold text-[11px] inline-block ${
                          item.severity === "High"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.severity === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.severity} Risk
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleModerate(item, "suspended")}
                          disabled={actionLoadingId === item.id}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>
                        <button
                          onClick={() => handleModerate(item, "removed")}
                          disabled={actionLoadingId === item.id}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1 disabled:opacity-50"
                          title="Permanently remove listing"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                        <button
                          onClick={() => handleDismiss(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[11px] transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
