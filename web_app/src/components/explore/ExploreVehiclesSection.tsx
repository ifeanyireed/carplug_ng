"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSavedVehicles } from "@/context/SavedVehiclesContext";
import { fetchVehicles } from "@/services/api";
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
  fuelType: "Electric" | "Gasoline" | "Hybrid" | "Diesel" | "Petrol";
  transmission: "Automatic" | "Manual";
  condition: string;
  bodyType: "Sedan" | "Coupe" | "SUV" | "Hatchback" | "Pickup";
}

// Fallback catalog matching real records in the MySQL database
const INITIAL_VEHICLES: ExploreCar[] = [
  {
    id: "v-toyota-camry-2020",
    name: "Toyota Camry XSE V6",
    year: 2020,
    image: "/images/cars/car18.jpeg",
    price: 26500000,
    originalPrice: 28000000,
    badge: "Great Price",
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Foreign Used (Tokunbo)",
    bodyType: "Sedan",
  },
  {
    id: "v-mercedes-gle450-2022",
    name: "Mercedes-Benz GLE 450 4MATIC",
    year: 2022,
    image: "/images/cars/car17.jpeg",
    price: 68000000,
    originalPrice: 71000000,
    badge: "Good Deal",
    fuelType: "Hybrid",
    transmission: "Automatic",
    condition: "Foreign Used (Tokunbo)",
    bodyType: "SUV",
  },
  {
    id: "v-lexus-rx350-2021",
    name: "Lexus RX 350 F-Sport AWD",
    year: 2021,
    image: "/images/cars/car16.jpeg",
    price: 42000000,
    originalPrice: 45000000,
    badge: "Hot Deal",
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Foreign Used (Tokunbo)",
    bodyType: "SUV",
  },
  {
    id: "v-honda-accord-2019",
    name: "Honda Accord Touring 2.0T",
    year: 2019,
    image: "/images/cars/car15.jpeg",
    price: 19500000,
    originalPrice: 21000000,
    badge: "Good Deal",
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Nigerian Used",
    bodyType: "Sedan",
  },
  {
    id: "v-toyota-corolla-2018",
    name: "Toyota Corolla LE (First Body)",
    year: 2018,
    image: "/images/cars/car1.jpeg",
    price: 13500000,
    originalPrice: 14000000,
    badge: "Great Price",
    fuelType: "Petrol",
    transmission: "Automatic",
    condition: "Nigerian Used",
    bodyType: "Sedan",
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
  const { isSaved, toggleSave } = useSavedVehicles();
  const [activeTab, setActiveTab] = useState<"all" | "new" | "used">("all");
  const [vehicles, setVehicles] = useState<ExploreCar[]>(INITIAL_VEHICLES);

  // Fetch live inventory from backend API
  useEffect(() => {
    let isMounted = true;
    fetchVehicles()
      .then((list) => {
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const mapped: ExploreCar[] = list.map((v) => {
            const rawImg =
              Array.isArray(v.images) && v.images.length > 0
                ? v.images[0]
                : "/images/cars/hero-car.webp";
            const badge =
              v.priceRating === "deal"
                ? "Great Price"
                : v.priceRating === "fair"
                ? "Good Deal"
                : v.featured
                ? "Hot Deal"
                : null;

            return {
              id: v.id,
              name: v.title || `${v.year} ${v.make} ${v.model}`,
              year: v.year,
              image: rawImg,
              price: v.price,
              originalPrice:
                v.marketPriceRange && v.marketPriceRange[1] > v.price
                  ? v.marketPriceRange[1]
                  : undefined,
              badge,
              fuelType: (v.fuelType as ExploreCar["fuelType"]) || "Petrol",
              transmission: (v.transmission as ExploreCar["transmission"]) || "Automatic",
              condition: v.condition,
              bodyType: (v.bodyType as ExploreCar["bodyType"]) || "Sedan",
            };
          });
          setVehicles(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback explore vehicles catalog:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFavoriteClick = async (e: React.MouseEvent, car: ExploreCar) => {
    e.stopPropagation();
    try {
      await toggleSave({
        id: car.id,
        title: car.name,
        make: car.name.split(" ")[0],
        model: car.name.split(" ").slice(1).join(" "),
        year: car.year,
        price: car.price,
        image: car.image,
        images: [car.image],
        fuelType: car.fuelType,
        transmission: car.transmission,
        condition: car.condition,
        bodyType: car.bodyType,
      });
      onToggleFavorite?.(car.id);
    } catch (err) {
      console.warn("Failed to toggle favorite:", err);
    }
  };

  const filteredVehicles = vehicles.filter((car) => {
    if (activeTab === "new") {
      return (
        car.condition.toLowerCase().includes("brand new") ||
        car.condition.toLowerCase() === "new"
      );
    }
    if (activeTab === "used") {
      return (
        car.condition.toLowerCase().includes("used") ||
        car.condition.toLowerCase().includes("tokunbo")
      );
    }
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

        <Link
          href="/buyer/search"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition tracking-tight group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
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
              Brand New
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
              Tokunbo & Used
            </button>
          </div>
        </div>

        {/* Vehicles Grid with Tighter Padding/Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
          {filteredVehicles.map((car) => {
            const isFav = isSaved(car.id);
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
                    onClick={(e) => handleFavoriteClick(e, car)}
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
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-[-0.04em] group-hover:text-black line-clamp-1">
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
                        <span className="text-black truncate max-w-[110px]">{car.condition}</span>
                      </div>
                      <span className="text-gray-300 font-normal">•</span>
                      <span className="text-black">{car.bodyType}</span>
                    </div>
                  </div>

                  {/* Pricing & CTA Divider (Nigerian Naira) */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      {car.originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                          ₦{car.originalPrice.toLocaleString("en-US")}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                        ₦{car.price.toLocaleString("en-US")}
                      </span>
                    </div>

                    <Link
                      href={`/buyer/vehicles/${car.id}`}
                      className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black transition"
                    >
                      <span>See Details</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
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
