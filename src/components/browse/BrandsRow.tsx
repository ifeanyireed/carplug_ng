"use client";

import React from "react";
import Image from "next/image";

interface BrandItem {
  id: string;
  name: string;
  logo: string;
  width: number;
  height: number;
  customClass?: string;
}

const BRANDS: BrandItem[] = [
  {
    id: "ford",
    name: "Ford",
    logo: "/images/brands/ford.svg",
    width: 110,
    height: 44,
  },
  {
    id: "infiniti",
    name: "Infiniti",
    logo: "/images/brands/infiniti.png",
    width: 90,
    height: 55,
  },
  {
    id: "lexus",
    name: "Lexus",
    logo: "/images/brands/lexus.png",
    width: 130,
    height: 52,
  },
  {
    id: "mitsubishi",
    name: "Mitsubishi Motors",
    logo: "/images/brands/mitsubishi.png",
    width: 95,
    height: 58,
  },
  {
    id: "toyota",
    name: "Toyota",
    logo: "/images/brands/toyota.png",
    width: 130,
    height: 48,
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    logo: "/images/brands/mercedes.png",
    width: 160,
    height: 60,
    customClass: "scale-115 sm:scale-125 max-h-14 sm:max-h-16",
  },
  {
    id: "bmw",
    name: "BMW",
    logo: "/images/brands/bmw.svg",
    width: 58,
    height: 58,
  },
];

interface BrandsRowProps {
  onSelectBrand?: (brand: string) => void;
  selectedBrand?: string | null;
}

export const BrandsRow = ({ onSelectBrand, selectedBrand }: BrandsRowProps) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4 sm:pb-6">
      <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar py-2">
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.name;
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelectBrand?.(brand.name)}
              className={`flex-1 min-w-[110px] sm:min-w-[130px] h-16 sm:h-20 flex items-center justify-center transition-all duration-200 group px-3 py-2 rounded-lg ${
                isSelected
                  ? "bg-gray-100 scale-105"
                  : "hover:bg-gray-50/80 hover:scale-105"
              }`}
              title={`Browse ${brand.name}`}
            >
              <div className="relative h-12 sm:h-14 w-full flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={brand.width}
                  height={brand.height}
                  className={`object-contain max-h-12 sm:max-h-14 w-auto grayscale contrast-125 transition-all duration-200 ${
                    isSelected
                      ? "opacity-100 brightness-75"
                      : "opacity-75 group-hover:opacity-100 group-hover:brightness-90"
                  } ${brand.customClass || ""}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
