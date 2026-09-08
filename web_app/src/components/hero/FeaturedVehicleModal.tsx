"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Play,
  ShieldCheck,
  Fuel,
  Gauge,
  Calendar,
  Sparkles,
  CheckCircle2,
  Heart,
} from "lucide-react";

interface FeaturedVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturedVehicleModal = ({
  isOpen,
  onClose,
}: FeaturedVehicleModalProps) => {
  const [isLiked, setIsLiked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#17191b] border border-white/10 rounded-xl overflow-hidden shadow-2xl text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1f2225]/80">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-red-400">
              Live Showcase
            </span>
            <span className="text-white/30">•</span>
            <span className="text-sm font-medium text-white/90">
              BMW 3-Series Coupe Custom Edition (E46)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Visual Spotlight Area */}
        <div className="relative aspect-video w-full bg-black overflow-hidden group">
          <Image
            src="/images/cars/car1.jpeg"
            alt="BMW Featured Coupe"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-black ml-0.5 text-black" />
              </div>
            </div>
          </div>

          {/* Bottom Floating Stats Bar on Video */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rojo Verified 150-Point Inspection</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                2004 BMW M3 / 3-Series Coupe
              </h3>
              <p className="text-xs text-white/70">
                Carbon Black Metallic • 48,200 miles • 6-Speed Manual • Mint Condition
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-white/60">Estimated Value</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">$38,500</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Specs Grid */}
        <div className="p-5 bg-[#16181a] border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>Engine</span>
            </div>
            <div className="text-sm font-semibold text-white">3.2L S54 I6</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>Horsepower</span>
            </div>
            <div className="text-sm font-semibold text-white">338 HP @ 7900 RPM</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Transmission</span>
            </div>
            <div className="text-sm font-semibold text-white">6-Speed Manual</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Drivetrain</span>
            </div>
            <div className="text-sm font-semibold text-white">Rear-Wheel Drive</div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-[#1f2225] border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Clean Title • 1 Owner • Full Service Records Available</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-lg border transition ${
                isLiked
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-white/10 border-white/10 text-white/80 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs sm:text-sm hover:bg-gray-200 transition active:scale-95 shadow"
            >
              View Full Vehicle Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
