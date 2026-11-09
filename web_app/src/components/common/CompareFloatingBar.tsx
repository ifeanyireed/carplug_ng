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
      className="fixed bottom-5 right-4 sm:right-6 z-40 w-auto max-w-[calc(100vw-2rem)] sm:max-w-2xl bg-neutral-900/95 backdrop-blur-md text-white rounded-full sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl border border-white/15 transition-all duration-300 ease-out animate-in slide-in-from-bottom-5"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Left: Icon & Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Compare</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-mono">
                {compareCount}/{MAX_COMPARE_LIMIT}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              {compareCount === 1 ? "Pick 1 more" : "Ready"}
            </p>
          </div>
        </div>

        {/* Dynamic Resizable Vehicle Thumbnails (Zero scrollbar, expands dynamically) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300">
          {selectedVehicles.map((car) => (
            <div
              key={car.id}
              className="relative group w-10 h-8 sm:w-12 sm:h-9.5 rounded-xl bg-neutral-800 overflow-hidden border border-white/20 shrink-0 shadow-xs transition-all duration-300 ease-out animate-in zoom-in-75"
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
                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                title={`Remove ${car.title}`}
                aria-label={`Remove ${car.title} from comparison`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
          <Link
            href="/buyer/compare"
            className="px-3.5 py-2 bg-white hover:bg-gray-100 text-neutral-900 rounded-full sm:rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95"
          >
            <span>Compare ({compareCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={clearCompare}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full sm:rounded-xl transition cursor-pointer"
            title="Clear all"
            aria-label="Clear all compared vehicles"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
