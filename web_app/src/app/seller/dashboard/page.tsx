"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { Vehicle } from "@/data/mockStore";
import {
  fetchVehicles,
  fetchConversations,
  fetchVerifications,
  Conversation,
  VerificationItem,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Plus,
  MessageSquare,
  Car,
  Loader2,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadSellerData() {
      try {
        const [allVehicles, convs, verifs] = await Promise.all([
          fetchVehicles().catch(() => []),
          fetchConversations().catch(() => []),
          fetchVerifications().catch(() => ({ data: [], total: 0, page: 1, pageSize: 10 })),
        ]);

        if (!isMounted) return;

        // Filter vehicles belonging to this seller
        const sellerCars = allVehicles.filter(
          (v) => v.sellerId === user?.id || (v.sellerType === "private" && !user?.id)
        );
        setVehicles(sellerCars.length > 0 ? sellerCars : allVehicles.slice(0, 1));
        setConversations(convs);
        setVerifications(verifs.data || []);
      } catch (err) {
        console.warn("Failed to load seller dashboard data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSellerData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshIndex]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const primaryListing = vehicles[0];
  const ninVerified = user?.isVerified || verifications.some((v) => v.entityType === "seller_nin" && v.status === "approved");
  const ninPending = verifications.some((v) => v.entityType === "seller_nin" && v.status === "pending");

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {ninVerified ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NIN Verified Seller</span>
              </span>
            ) : ninPending ? (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>KYC Pending Review</span>
              </span>
            ) : (
              <Link
                href="/seller/onboard"
                className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Identity (NIN) →</span>
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">Private Seller Portal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal vehicle listings, respond to verified buyers, and review market inquiries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/seller/sell"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>List Another Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Active Listings</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : vehicles.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {vehicles.length > 0 ? "Published on marketplace" : "No active listings"}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Inbound Chat Threads</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" /> : conversations.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message(s)` : "All messages answered"}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">KYC Status</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-0.5">
            {ninVerified ? "Verified" : ninPending ? "Under Audit" : "Unverified"}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold block">
            {ninVerified ? "Full seller trust privileges" : "Upload NIN to earn Trust Badge"}
          </span>
        </div>
      </div>

      {/* Current Active Listing */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-neutral-900">
            Your Active Vehicle Listing
          </h2>
          <Link
            href="/seller/listings"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All ({vehicles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading your listing...</p>
          </div>
        ) : primaryListing ? (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative">
                <Image
                  src={primaryListing.images[0] || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"}
                  alt={primaryListing.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">{primaryListing.title}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="font-bold text-neutral-800">₦{(primaryListing.price / 1e6).toFixed(1)}M</span>
                  <span>•</span>
                  <span>{primaryListing.mileage.toLocaleString()} km</span>
                  <span>•</span>
                  <TrustTierBadge tier={primaryListing.trustTier} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/buyer/vehicles/${primaryListing.id}`}
                className="px-4 py-2 bg-white border border-gray-200 text-neutral-900 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
              >
                Preview
              </Link>
              <Link
                href={`/dealer/vehicles/new?edit=${primaryListing.id}`}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition"
              >
                Edit Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
            <Car className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-bold text-sm text-neutral-900">No active vehicles listed</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                List your car today and get contacted directly by verified buyers.
              </p>
            </div>
            <Link
              href="/seller/sell"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Your First Car</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
