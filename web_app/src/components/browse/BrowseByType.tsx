"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BodyTypeItem {
  id: string;
  number: string;
  name: string;
  units: number;
  image: string;
  imageAlt: string;
  imageClass?: string;
}

const BODY_TYPES: BodyTypeItem[] = [
  {
    id: "suv",
    number: "01",
    name: "SUV",
    units: 1270,
    image: "/images/cars/car5.jpeg",
    imageAlt: "White Luxury SUV",
    imageClass: "object-contain object-center scale-[2.5] translate-x-[46%] group-hover:scale-[2.56] transition-transform duration-500",
  },
  {
    id: "coupe",
    number: "02",
    name: "Coupe",
    units: 1435,
    image: "/images/cars/car4.jpeg",
    imageAlt: "Dark Sports Coupe",
    imageClass: "object-contain object-center scale-[2.7] translate-x-[52%] group-hover:scale-[2.76] transition-transform duration-500",
  },
  {
    id: "sedan",
    number: "03",
    name: "Sedan",
    units: 2455,
    image: "/images/cars/car7.jpeg",
    imageAlt: "Silver Luxury Sedan",
    imageClass: "object-contain object-center scale-[2.45] translate-x-[44%] group-hover:scale-[2.52] transition-transform duration-500",
  },
  {
    id: "jeep",
    number: "04",
    name: "Jeep",
    units: 955,
    image: "/images/cars/car3.jpeg",
    imageAlt: "Classic White Jeep 4x4",
    imageClass: "object-contain object-center scale-[2.6] translate-x-[46%] group-hover:scale-[2.66] transition-transform duration-500",
  },
  {
    id: "hatchback",
    number: "05",
    name: "Hatchback",
    units: 955,
    image: "/images/cars/car2.jpeg",
    imageAlt: "White Compact Hatchback",
    imageClass: "object-contain object-center scale-[2.5] translate-x-[46%] group-hover:scale-[2.56] transition-transform duration-500",
  },
];

interface BrowseByTypeProps {
  onSelectType?: (type: string) => void;
  selectedType?: string | null;
}

export const BrowseByType = ({
  onSelectType,
  selectedType,
}: BrowseByTypeProps) => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(BODY_TYPES.length - 1, prev + 1));
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
      {/* Header Row: Title & Standalone Navigation Arrows */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 tracking-tight">
          Browse by type
        </h2>

        {/* Standalone Minimalist Navigation Arrows */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            aria-label="Previous type"
            className="text-gray-600 hover:text-black transition p-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next type"
            className="text-gray-600 hover:text-black transition p-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* 5 Vertical Cards Grid with Reduced Gap */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-2.5">
        {BODY_TYPES.map((item) => {
          const isSelected = selectedType === item.name;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectType?.(item.name)}
              className={`group flex flex-col text-center focus:outline-none transition-all duration-200 ${
                isSelected ? "scale-[1.01]" : "hover:scale-[1.01]"
              }`}
            >
              {/* Image Box */}
              <div
                className={`relative w-full aspect-[3/4.4] sm:aspect-[3/4.6] rounded-xl overflow-hidden bg-[#ECEEF2] border transition-all duration-300 flex flex-col justify-center ${
                  isSelected
                    ? "border-neutral-900 shadow-md ring-2 ring-black/5"
                    : "border-transparent group-hover:border-gray-300 group-hover:shadow-md"
                }`}
              >
                {/* Large Watermark Number (Positioned at z-20 so it remains prominent) */}
                <div className="absolute top-2 left-3 sm:top-3 sm:left-4 z-20 pointer-events-none select-none">
                  <span className="text-6xl sm:text-7xl lg:text-[78px] font-normal text-white leading-none tracking-tighter opacity-95">
                    {item.number}
                  </span>
                </div>

                {/* Car Cutout / Graphic Centered Vertically, Shifted Right */}
                <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-[65%]">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className={item.imageClass || "object-contain object-center"}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Label & Count (Below Card Box) */}
              <div className="pt-3 pb-1">
                <div className="text-base sm:text-lg font-medium text-gray-900 tracking-tight group-hover:text-black">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 font-normal mt-0.5">
                  {item.units.toLocaleString()} units
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
