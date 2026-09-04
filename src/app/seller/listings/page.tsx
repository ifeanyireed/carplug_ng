"use client";

import React from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { MOCK_VEHICLES } from "@/data/mockStore";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

export default function MyListingsPage() {
  const listing = MOCK_VEHICLES[3];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">My Car Listings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review status, edit pricing, or upgrade your listing's Trust Tier
          </p>
        </div>

        <Link
          href="/seller/sell"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Listing</span>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900">{listing.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                <span>₦{(listing.price / 1000000).toFixed(1)}M</span>
                <span>•</span>
                <TrustTierBadge tier={listing.trustTier} size="sm" />
                <span>•</span>
                <PriceRatingBadge rating={listing.priceRating} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/buyer/vehicles/${listing.id}`}
              className="px-3.5 py-2 bg-white border border-gray-200 text-neutral-900 rounded-xl text-xs font-semibold hover:bg-gray-50"
            >
              View Public Page
            </Link>
            <Link
              href={`/buyer/inspections/book/${listing.id}`}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Advance to Tier 4 (Inspect)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
