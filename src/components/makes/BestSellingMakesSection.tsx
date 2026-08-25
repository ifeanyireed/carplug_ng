"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface BestSellingMake {
  id: string;
  name: string;
  startingPrice: string;
  image: string;
  imageAlt: string;
  logo: string;
  logoAlt: string;
  logoClass?: string;
  gridSpan: "top" | "bottom";
}

const BEST_SELLING_MAKES: BestSellingMake[] = [
  {
    id: "bmw",
    name: "BMW",
    startingPrice: "from $50K",
    image: "/images/cars/car19.jpeg",
    imageAlt: "White BMW M6 Coupe",
    logo: "/images/brands/bmw.svg",
    logoAlt: "BMW Logo",
    gridSpan: "top",
  },
  {
    id: "toyota",
    name: "Toyota",
    startingPrice: "from $50K",
    image: "/images/cars/car20.jpeg",
    imageAlt: "White Toyota C-HR",
    logo: "/images/brands/toyota.png",
    logoAlt: "Toyota Logo",
    gridSpan: "top",
  },
  {
    id: "mercedes",
    name: "Mercedes - Benz",
    startingPrice: "from $40K",
    image: "/images/cars/car12.jpeg",
    imageAlt: "White Mercedes-Benz C-Class",
    logo: "/images/brands/mercedes.png",
    logoAlt: "Mercedes-Benz Logo",
    gridSpan: "bottom",
  },
  {
    id: "lexus",
    name: "Lexus",
    startingPrice: "from $50K",
    image: "/images/cars/car11.jpeg",
    imageAlt: "Green Mini Cooper in City",
    logo: "/images/brands/lexus.png",
    logoAlt: "Lexus Logo",
    gridSpan: "bottom",
  },
  {
    id: "ford",
    name: "Ford",
    startingPrice: "from $60K",
    image: "/images/cars/car10.jpeg",
    imageAlt: "Grey Ford Ranger Pickup",
    logo: "/images/brands/ford.svg",
    logoAlt: "Ford Logo",
    gridSpan: "bottom",
  },
];

interface BestSellingMakesSectionProps {
  onSelectMake?: (makeName: string) => void;
}

export const BestSellingMakesSection = ({
  onSelectMake,
}: BestSellingMakesSectionProps) => {
  const topMakes = BEST_SELLING_MAKES.filter((m) => m.gridSpan === "top");
  const bottomMakes = BEST_SELLING_MAKES.filter((m) => m.gridSpan === "bottom");

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Section Header with 2-Column Split */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-[-0.055em] leading-[1.1]">
            Exploring best selling
            <br />
            cars makes
          </h2>
        </div>
        <div className="md:max-w-md">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed tracking-tight">
            Corporate entities should engage in strategic initiatives to boost
            brand visibility and connect with their audiences. This includes
            digital marketing, community outreach, and innovative partnerships
            that reflect their values.
          </p>
        </div>
      </div>

      {/* Seamless Grid (No Gap/Padding between cars) */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200/80 shadow-sm">
        {/* Top Row: 2 Large Cards (BMW, Toyota) with 0 Gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {topMakes.map((make) => (
            <div
              key={make.id}
              onClick={() => onSelectMake?.(make.name)}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden group cursor-pointer"
            >
              {/* Vehicle Background Image */}
              <Image
                src={make.image}
                alt={make.imageAlt}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10 pointer-events-none" />

              {/* Card Bottom Meta (Logos Standing Alone Without Circular Wrappers) */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Standalone Brand Logo */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
                    <Image
                      src={make.logo}
                      alt={make.logoAlt}
                      width={32}
                      height={32}
                      className={`object-contain max-h-7 w-auto drop-shadow-md ${
                        make.logoClass || ""
                      }`}
                    />
                  </div>

                  {/* Brand Name & Price */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight leading-tight drop-shadow-sm">
                      {make.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/85 font-normal">
                      {make.startingPrice}
                    </p>
                  </div>
                </div>

                {/* Arrow Action Link */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row: 3 Medium Cards (Mercedes-Benz, Lexus, Ford) with 0 Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {bottomMakes.map((make) => (
            <div
              key={make.id}
              onClick={() => onSelectMake?.(make.name)}
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden group cursor-pointer"
            >
              {/* Vehicle Background Image */}
              <Image
                src={make.image}
                alt={make.imageAlt}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10 pointer-events-none" />

              {/* Card Bottom Meta (Logos Standing Alone Without Circular Wrappers) */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Standalone Brand Logo */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 relative flex items-center justify-center shrink-0">
                    <Image
                      src={make.logo}
                      alt={make.logoAlt}
                      width={28}
                      height={28}
                      className={`object-contain max-h-6 w-auto drop-shadow-md ${
                        make.logoClass || ""
                      }`}
                    />
                  </div>

                  {/* Brand Name & Price */}
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white tracking-tight leading-tight drop-shadow-sm">
                      {make.name}
                    </h3>
                    <p className="text-xs text-white/85 font-normal">
                      {make.startingPrice}
                    </p>
                  </div>
                </div>

                {/* Arrow Action Link */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
