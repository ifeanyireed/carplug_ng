"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSearchBox, SearchFilterState } from "./HeroSearchBox";
import { FeaturedVehicleModal } from "./FeaturedVehicleModal";
import { Play } from "lucide-react";

interface HeroProps {
  onSearch?: (filters: SearchFilterState) => void;
  onOpenAuth?: (mode: "login" | "signup") => void;
  savedCount?: number;
}

export const Hero = ({
  onSearch,
  onOpenAuth,
  savedCount = 2,
}: HeroProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative w-full">
      {/* Full-bleed Hero Visual Area spanning continuous background from top down under search form */}
      <div className="relative w-full min-h-[660px] md:min-h-[720px] lg:min-h-[92vh] xl:min-h-[100dvh] overflow-hidden bg-neutral-900 flex flex-col justify-between pb-6 sm:pb-8 lg:pb-10 xl:pb-12">
        
        {/* Background Image: Clean car1.jpeg edge-to-edge covering hero and area under form */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/images/cars/car1.jpeg"
            alt="BMW Sports Coupe Hero"
            fill
            priority
            className="object-cover object-[center_32%] sm:object-[center_34%] lg:object-[center_36%]"
          />

          {/* Subtle lighting gradients matching UI5 aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Top Floating Navbar Section */}
        <div className="relative z-20 w-full">
          <Navbar
            onOpenAuth={onOpenAuth}
            savedCount={savedCount}
            onOpenSaved={() => {}}
          />
        </div>

        {/* Bottom-Aligned Hero Content & Search Box Group (tightly coupled directly above the form) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto flex flex-col gap-3.5 sm:gap-4">
          
          {/* Headline + Featured Vehicles Row (sitting tightly directly above form) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            {/* Headline (Bottom Left) - Medium font weight matching UI5 */}
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-medium text-white tracking-[-0.02em] leading-[1.12] drop-shadow-sm">
                Check out your
                <br />
                next cool ride!
              </h1>
            </div>

            {/* Featured Vehicles Play Badge (Bottom Right) */}
            <div className="flex justify-start md:justify-end pb-0.5">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="group flex items-center gap-3 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15 hover:border-white/30 pl-2 pr-4 py-2 rounded-xl transition-all duration-200 shadow-lg active:scale-95 text-left"
              >
                {/* White Play Button Circle */}
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow group-hover:scale-105 transition-transform shrink-0">
                  <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-medium text-white tracking-tight">
                    Featured Vehicles
                  </div>
                  <div className="text-[11px] text-white/70 font-normal">
                    Watch video or learn more
                  </div>
                </div>
              </button>
            </div>

          </div>

          {/* Search & Filter Box */}
          <HeroSearchBox onSearch={onSearch} />

        </div>

      </div>

      {/* Video Modal */}
      <FeaturedVehicleModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </section>
  );
};
