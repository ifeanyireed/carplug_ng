"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { Vehicle, MOCK_VEHICLES } from "@/data/mockStore";
import { fetchVehicles } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Plus, Loader2, RefreshCw, Car } from "lucide-react";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchSellerListings() {
      try {
        const data = await fetchVehicles();
        if (!isMounted) return;
        // Filter for seller's vehicles or private seller listings
        const userListings = data.filter(
          (v) => (user?.id && v.sellerId === user.id) || v.sellerType === "private"
        );
        setListings(userListings.length > 0 ? userListings : [MOCK_VEHICLES[3]]);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to fetch seller listings from API:", err);
        setListings([MOCK_VEHICLES[3]]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSellerListings();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshIndex]);

  const totalPortfolioValue = useMemo(() => {
    const total = listings.reduce((acc, car) => acc + (car.price || 0), 0);
    return `₦${(total / 1000000).toFixed(1)}M`;
  }, [listings]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">My Car Listings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review status, edit pricing, or upgrade your listing&apos;s Trust Tier • {listings.length} vehicle(s) listed ({totalPortfolioValue})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition flex items-center justify-center disabled:opacity-50"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neutral-900" : ""}`} />
          </button>
          <Link
            href="/seller/sell"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
            <span className="text-xs font-semibold">Loading your active listings...</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Car className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-neutral-900">No vehicles listed yet</div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Get an instant market estimate and list your car to thousands of verified buyers in Lagos and Abuja.
            </p>
            <Link
              href="/seller/sell"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Sell a Car</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative">
                    <Image
                      src={listing.images?.[0] || "/images/cars/car1.jpeg"}
                      alt={listing.title}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">{listing.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="font-bold text-neutral-900">
                        ₦{(listing.price / 1000000).toFixed(1)}M
                      </span>
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
                    href={`/dealer/vehicles/new?edit=${listing.id}`}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-neutral-900 rounded-xl text-xs font-bold"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    href={`/buyer/inspections/book/${listing.id}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    Advance to Tier 4 (Inspect)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
