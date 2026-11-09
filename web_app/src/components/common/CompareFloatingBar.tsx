"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCompare, MAX_COMPARE_LIMIT } from "@/context/CompareContext";
import { fetchVehicles } from "@/services/api";
import { Vehicle } from "@/data/mockStore";
import { ArrowRight, X, Scale, Trash2 } from "lucide-react";

export function CompareFloatingBar() {
  const pathname = usePathname();
  const { compareIds, compareCount, removeFromCompare, clearCompare } = useCompare();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Do not show on the compare page itself
  const isComparePage = pathname === "/buyer/compare";

  useEffect(() => {
    if (compareIds.length === 0) return;
    let isMounted = true;
    fetchVehicles().then((data) => {
      if (isMounted && data) {
        setVehicles(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [compareIds]);

  if (compareCount === 0 || isComparePage) {
    return null;
  }

  const selectedVehicles = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean) as Vehicle[];

  return (
    <aside
      aria-label="Vehicle comparison tray"
      className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-40 max-w-xl w-full sm:w-auto bg-neutral-900/95 backdrop-blur-md text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Header & Badges */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Compare Tray</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-mono">
                  {compareCount}/{MAX_COMPARE_LIMIT}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                {compareCount === 1 ? "Pick at least 1 more" : "Ready to compare"}
              </p>
            </div>
          </div>

          {/* Mobile Clear Button */}
          <button
            onClick={clearCompare}
            className="sm:hidden text-gray-400 hover:text-white p-1"
            title="Clear all"
            aria-label="Clear all compared vehicles"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail slots */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {selectedVehicles.map((car) => (
            <div
              key={car.id}
              className="relative group w-12 h-10 rounded-xl bg-neutral-800 overflow-hidden border border-white/15 shrink-0"
              title={car.title}
            >
              <Image
                src={car.images[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679189/carplug/cars/car18.jpg"}
                alt={car.title}
                fill
                className="object-cover"
                sizes="48px"
              />
              <button
                type="button"
                onClick={() => removeFromCompare(car.id)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                title={`Remove ${car.title}`}
                aria-label={`Remove ${car.title} from comparison`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty placeholder slots up to 4 */}
          {Array.from({ length: Math.max(0, MAX_COMPARE_LIMIT - compareCount) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-12 h-10 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-[10px] text-gray-500 shrink-0 font-mono"
            >
              +{idx + compareCount + 1}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0 sm:ml-2">
          <Link
            href="/buyer/compare"
            className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-gray-100 text-neutral-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95"
          >
            <span>Compare {compareCount > 1 ? "Now" : "Tray"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={clearCompare}
            className="hidden sm:inline-flex p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Clear all"
            aria-label="Clear all compared vehicles"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
