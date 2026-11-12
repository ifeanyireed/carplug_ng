"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { Vehicle } from "@/data/mockStore";
import { fetchSellerListings, deleteSellerListing } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Loader2,
  RefreshCw,
  Car,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Deletion modal & execution states
  const [listingToDelete, setListingToDelete] = useState<Vehicle | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setDeleteError(null);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      try {
        const data = await fetchSellerListings();
        if (!isMounted) return;

        // Ensure user sees only their vehicles if generic marketplace data returned
        let userListings = data;
        if (user?.id) {
          const cleanId = user.id.replace("usr-", "");
          const filtered = data.filter(
            (v) =>
              v.sellerId === user.id ||
              v.sellerId === cleanId ||
              (v.sellerType === "private" && (!v.sellerId || v.sellerId === user.id))
          );
          if (filtered.length > 0) {
            userListings = filtered;
          }
        }
        setListings(userListings);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to fetch seller listings from API:", err);
        setListings([]);
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
  }, [user?.id, refreshIndex]);

  const confirmDelete = async () => {
    if (!listingToDelete) return;

    const carId = listingToDelete.id;
    const carTitle = listingToDelete.title;

    setIsDeletingId(carId);
    setDeleteError(null);

    try {
      await deleteSellerListing(carId);
      // Remove listing from state
      setListings((prev) => prev.filter((c) => c.id !== carId));
      setListingToDelete(null);
      setSuccessNotification(`"${carTitle}" was successfully deleted from your listings.`);

      // Auto-clear notification after 5 seconds
      setTimeout(() => {
        setSuccessNotification((prev) => (prev?.includes(carTitle) ? null : prev));
      }, 5000);
    } catch (err: unknown) {
      console.error("Failed to delete seller vehicle listing:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete listing. Please try again.";
      setDeleteError(errorMessage);
    } finally {
      setIsDeletingId(null);
    }
  };

  const totalPortfolioValue = useMemo(() => {
    const total = listings.reduce((acc, car) => acc + (car.price || 0), 0);
    return `₦${(total / 1000000).toFixed(1)}M`;
  }, [listings]);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neutral-900" : ""}`} />
          </button>
          <Link
            href="/seller/sell"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotification(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Delete Error Banner */}
      {deleteError && !listingToDelete && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="p-1 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-100/60 transition cursor-pointer"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listings Container */}
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
                      src={listing.images?.[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg"}
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

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/buyer/vehicles/${listing.id}`}
                    className="px-3.5 py-2 bg-white border border-gray-200 text-neutral-900 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                  >
                    View Public Page
                  </Link>
                  <Link
                    href={`/dealer/vehicles/new?edit=${listing.id}`}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-neutral-900 rounded-xl text-xs font-bold transition"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    href={`/buyer/inspections/book/${listing.id}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Advance to Tier 4 (Inspect)
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setListingToDelete(listing);
                    }}
                    disabled={isDeletingId === listing.id}
                    className="px-3 py-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-gray-500 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Delete Listing"
                  >
                    {isDeletingId === listing.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {listingToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">Delete Vehicle Listing?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to permanently delete this listing from the marketplace? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Target Vehicle Summary */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
              <div className="w-14 h-11 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative">
                <Image
                  src={listingToDelete.images?.[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg"}
                  alt={listingToDelete.title}
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-neutral-900 truncate">
                  {listingToDelete.title}
                </h4>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  ₦{(listingToDelete.price / 1000000).toFixed(1)}M • {listingToDelete.condition || "Vehicle"}
                </div>
              </div>
            </div>

            {/* Modal Error State */}
            {deleteError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingId) {
                    setListingToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={Boolean(isDeletingId)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-800 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(isDeletingId)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isDeletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Listing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
