"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Heart,
  Zap,
  Fuel,
  Settings2,
  CarFront,
} from "lucide-react";

export interface ExploreCar {
  id: string;
  name: string;
  year: number;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: "Great Price" | "Good Deal" | "Hot Deal" | null;
  fuelType: "Electric" | "Gasoline" | "Hybrid" | "Diesel";
  transmission: "Automatic" | "Manual";
  condition: "New" | "Used";
  bodyType: "Sedan" | "Coupe" | "SUV" | "Hatchback";
}

const VEHICLES: ExploreCar[] = [
  {
    id: "bmw-520d",
    name: "BMW 520d",
    year: 2014,
    image: "/images/cars/car18.jpeg",
    price: 49000,
    originalPrice: 59000,
    badge: "Great Price",
    fuelType: "Electric",
    transmission: "Manual",
    condition: "New",
    bodyType: "Sedan",
  },
  {
    id: "audi-a4",
    name: "Audi A4",
    year: 2015,
    image: "/images/cars/car16.jpeg",
    price: 45000,
    originalPrice: 49000,
    badge: "Good Deal",
    fuelType: "Gasoline",
    transmission: "Automatic",
    condition: "Used",
    bodyType: "Coupe",
  },
  {
    id: "merc-cclass",
    name: "Mercedes-Benz C-Class",
    year: 2016,
    image: "/images/cars/car17.jpeg",
    price: 76000,
    badge: null,
    fuelType: "Gasoline",
    transmission: "Automatic",
    condition: "Used",
    bodyType: "Sedan",
  },
  {
    id: "lexus-is250",
    name: "Lexus IS 250",
    year: 2013,
    image: "/images/cars/car15.jpeg",
    price: 38500,
    originalPrice: 42000,
    badge: null,
    fuelType: "Hybrid",
    transmission: "Automatic",
    condition: "New",
    bodyType: "SUV",
  },
  {
    id: "volvo-s60",
    name: "Volvo S60",
    year: 2017,
    image: "/images/cars/car14.jpeg",
    price: 52000,
    badge: null,
    fuelType: "Electric",
    transmission: "Automatic",
    condition: "New",
    bodyType: "SUV",
  },
  {
    id: "toyota-camry",
    name: "Toyota Camry",
    year: 2018,
    image: "/images/cars/car13.jpeg",
    price: 64000,
    badge: null,
    fuelType: "Gasoline",
    transmission: "Automatic",
    condition: "New",
    bodyType: "SUV",
  },
];

interface ExploreVehiclesSectionProps {
  onSelectCar?: (car: ExploreCar) => void;
  onToggleFavorite?: (carId: string) => void;
}

export const ExploreVehiclesSection = ({
  onSelectCar,
  onToggleFavorite,
}: ExploreVehiclesSectionProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "new" | "used">("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const handleFavoriteClick = (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [carId]: !prev[carId] }));
    onToggleFavorite?.(carId);
  };

  const filteredVehicles = VEHICLES.filter((car) => {
    if (activeTab === "new") return car.condition === "New";
    if (activeTab === "used") return car.condition === "Used";
    return true;
  });

  const getFuelIcon = (type: string) => {
    switch (type) {
      case "Electric":
      case "Hybrid":
        return <Zap className="w-3.5 h-3.5 text-black stroke-[2]" />;
      default:
        return <Fuel className="w-3.5 h-3.5 text-black stroke-[2]" />;
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 tracking-[-0.055em]">
          Explore all vehicles
        </h2>

        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Outer White Card Enclosing Toggle & Cars Grid */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 lg:p-8 shadow-sm">
        {/* Category Filter Toggle */}
        <div className="mb-6">
          <div className="inline-flex bg-[#ECEEF2] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Categories
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "new"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              New Cars
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("used")}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "used"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Used Cars
            </button>
          </div>
        </div>

        {/* Vehicles Grid with Tighter Padding/Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredVehicles.map((car) => {
            const isFav = !!favorites[car.id];
            return (
              <div
                key={car.id}
                onClick={() => onSelectCar?.(car)}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Card Image Area */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={car.image}
                    alt={`${car.name} (${car.year})`}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badge (Fully Rounded Corners) */}
                  {car.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-block px-3 py-1 text-[11px] font-medium text-white bg-[#16a34a] rounded-full tracking-tight shadow-sm">
                        {car.badge}
                      </span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleFavoriteClick(e, car.id)}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition active:scale-90"
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        isFav ? "fill-rose-500 text-rose-500" : "text-white"
                      }`}
                    />
                  </button>

                  {/* Carousel Pagination Dots */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Car Title & Year */}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-[-0.04em] group-hover:text-black">
                      {car.name} ({car.year})
                    </h3>

                    {/* Specs Pill Row (Black color and font-medium) */}
                    <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 text-xs sm:text-[13px] font-medium text-black">
                      <div className="flex items-center gap-1 text-black">
                        {getFuelIcon(car.fuelType)}
                        <span className="text-black">{car.fuelType}</span>
                      </div>
                      <span className="text-gray-300 font-normal">•</span>
                      <div className="flex items-center gap-1 text-black">
                        <Settings2 className="w-3.5 h-3.5 text-black stroke-[2]" />
                        <span className="text-black">{car.transmission}</span>
                      </div>
                      <span className="text-gray-300 font-normal">•</span>
                      <div className="flex items-center gap-1 text-black">
                        <CarFront className="w-3.5 h-3.5 text-black stroke-[2]" />
                        <span className="text-black">{car.condition}</span>
                      </div>
                      <span className="text-gray-300 font-normal">•</span>
                      <span className="text-black">{car.bodyType}</span>
                    </div>
                  </div>

                  {/* Pricing & CTA Divider (Same font size & medium weight for prices, larger See Details icon) */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      {car.originalPrice && (
                        <span className="text-sm sm:text-base text-rose-500 line-through font-medium">
                          ${car.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight">
                        ${car.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black transition"
                    >
                      <span>See Details</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
