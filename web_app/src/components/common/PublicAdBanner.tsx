"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchCampaigns, Campaign } from "@/services/api";
import { Megaphone, ArrowUpRight, Sparkles } from "lucide-react";

interface PublicAdBannerProps {
  placement?:
    | "Homepage Brand Spotlight"
    | "Category Header Leaderboard"
    | "Vehicle Health Report Sponsor"
    | "Sponsored Vehicle Listing"
    | string;
  className?: string;
  showFallbackPromo?: boolean;
}

export function PublicAdBanner({
  placement = "Category Header Leaderboard",
  className = "",
  showFallbackPromo = true,
}: PublicAdBannerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadActiveAd() {
      try {
        const activeList = await fetchCampaigns({ status: "Active" });
        if (!isMounted) return;

        // Match by placement if specified, else pick the first active
        const matched =
          activeList.find(
            (c) =>
              c.placement.toLowerCase() === placement.toLowerCase() &&
              c.status === "Active"
          ) ||
          activeList.find((c) => c.status === "Active") ||
          null;

        setCampaign(matched);
      } catch (err) {
        console.warn("Failed to load active ad campaign:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadActiveAd();
    return () => {
      isMounted = false;
    };
  }, [placement]);

  if (loading) {
    return null; // Silent placeholder while determining active ad
  }

  // 1. Render Active Live Campaign from DB
  if (campaign) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white shadow-xs transition hover:shadow-md ${className}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
            {/* Creative thumbnail */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 border border-gray-200/80 shadow-xs">
              <Image
                src={
                  campaign.creativeImage ||
                  "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679188/carplug/cars/car17.jpg"
                }
                alt={campaign.advertiser}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Sponsored Partner</span>
                </span>
                {campaign.targetCity && (
                  <span className="text-[11px] font-semibold text-gray-500">
                    • {campaign.targetCity}
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                {campaign.advertiser}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">
                Official platform campaign: {campaign.placement}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
            <Link
              href="/advertise"
              className="text-[11px] font-medium text-gray-400 hover:text-gray-700 transition"
              title="Advertise on mycarsNg"
            >
              Advertise Here
            </Link>

            <Link
              href="/advertise"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs group"
            >
              <span>Explore Partner Offer</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Tasteful Fallback Prompt (links to /advertise)
  if (showFallbackPromo) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-5 sm:p-6 transition hover:border-gray-400 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Megaphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Featured Advertising Slot
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 font-bold uppercase">
                  Available
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Promote your dealership, auto loan, or insurance to 250,000+ verified car shoppers in Nigeria.
              </p>
            </div>
          </div>

          <Link
            href="/advertise"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto shrink-0 group"
          >
            <span>Book Placement (from ₦75,000)</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
