import React from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  Car,
  Eye,
  Heart,
  Users,
  ShieldCheck,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export default function SellerDashboardPage() {
  const myListing = MOCK_VEHICLES[3]; // 2018 Toyota Corolla LE

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NIN Verified Seller</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Private Seller Portal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal car listing and track verified buyer views
          </p>
        </div>

        <Link
          href="/seller/sell"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>List Another Vehicle</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Total Views This Week</span>
          <div className="text-2xl font-black text-neutral-900">342</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            +18% since Platform Verified
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Buyer Garage Saves</span>
          <div className="text-2xl font-black text-neutral-900">28</div>
          <span className="text-[11px] text-blue-600 font-semibold">
            Strong buyer interest
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs text-gray-400">Inbound Messages</span>
          <div className="text-2xl font-black text-neutral-900">4</div>
          <span className="text-[11px] text-amber-600 font-semibold">
            Masked lead routing active
          </span>
        </div>
      </div>

      {/* Current Active Listing */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-neutral-900">
          Your Active Vehicle Listing
        </h2>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0">
              <img
                src={myListing.images[0]}
                alt={myListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900">{myListing.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                <span>₦{(myListing.price / 1000000).toFixed(1)}M</span>
                <span>•</span>
                <TrustTierBadge tier={myListing.trustTier} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/buyer/vehicles/${myListing.id}`}
              className="px-4 py-2 bg-white border border-gray-200 text-neutral-900 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Preview Live Listing
            </Link>
            <Link
              href="/seller/listings"
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition"
            >
              Manage Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
