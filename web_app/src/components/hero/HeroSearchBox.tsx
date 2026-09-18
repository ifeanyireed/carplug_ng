"use client";

import React, { useState } from "react";
import {
  FlameIcon,
  VideoAdsIcon,
  TrustedDealersIcon,
  RojoCertifiedIcon,
  WarrantyIcon,
} from "@/components/icons/PremiumIcons";
import { Search, ChevronDown, Check } from "lucide-react";

export interface SearchFilterState {
  category: "all" | "new" | "used" | "tokunbo" | "nigerian_used";
  brand: string;
  type: string;
  model: string;
  price: string;
  options: {
    hotDeals: boolean;
    videoAds: boolean;
    trustedDealers: boolean;
    rojoCertified: boolean;
    warranty: boolean;
  };
}

interface HeroSearchBoxProps {
  onSearch?: (filters: SearchFilterState) => void;
}

const BRANDS = [
  "All Brands",
  "Toyota",
  "Mercedes-Benz",
  "Lexus",
  "BMW",
  "Ford",
  "Honda",
  "Audi",
  "Jeep",
  "Volkswagen",
  "Porsche",
  "Mitsubishi",
  "Infiniti",
  "Volvo",
];

const TYPES = [
  "All Types",
  "SUV",
  "Sedan",
  "Coupe",
  "Jeep",
  "Hatchback",
  "Convertible",
  "Electric",
];

const MODELS: Record<string, string[]> = {
  "All Brands": ["All Models"],
  Toyota: ["All Models", "Camry", "Corolla", "Highlander", "Land Cruiser", "4Runner", "RAV4", "Supra"],
  "Mercedes-Benz": ["All Models", "C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Class", "AMG GT"],
  "Mercedes Benz": ["All Models", "C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Class", "AMG GT"],
  Lexus: ["All Models", "RX", "ES", "GX", "LX", "IS", "NX"],
  BMW: ["All Models", "3 Series", "5 Series", "M3 / M4", "X5", "X3", "Z4"],
  Ford: ["All Models", "Explorer", "F-150", "Mustang", "Edge", "Escape"],
  Honda: ["All Models", "Accord", "Civic", "CR-V", "Pilot"],
  Audi: ["All Models", "A4", "A6", "RS5", "Q7", "e-tron GT"],
  Jeep: ["All Models", "Wrangler", "Grand Cherokee", "Gladiator"],
  Volkswagen: ["All Models", "Golf", "Tiguan", "Passat", "Touareg"],
  Porsche: ["All Models", "Cayenne", "Taycan", "911 Carrera", "Panamera"],
  Mitsubishi: ["All Models", "Pajero", "Outlander", "Lancer Evo"],
  Infiniti: ["All Models", "Q50", "Q60", "QX80", "QX60"],
  Volvo: ["All Models", "S60", "XC90", "V60", "XC60"],
};

export const PRICE_RANGES = [
  { label: "Any Price", value: "any" },
  { label: "Under ₦15M", value: "lt15m" },
  { label: "₦15M - ₦30M", value: "15m-30m" },
  { label: "₦30M - ₦60M", value: "30m-60m" },
  { label: "₦60M - ₦100M", value: "60m-100m" },
  { label: "Above ₦100M", value: "gt100m" },
];

export const HeroSearchBox = ({ onSearch }: HeroSearchBoxProps) => {
  const [category, setCategory] = useState<"all" | "new" | "used" | "tokunbo" | "nigerian_used">("all");
  const [brand, setBrand] = useState("All Brands");
  const [type, setType] = useState("All Types");
  const [model, setModel] = useState("All Models");
  const [price, setPrice] = useState("Any Price");

  const [options, setOptions] = useState({
    hotDeals: false,
    videoAds: false,
    trustedDealers: false,
    rojoCertified: false,
    warranty: false,
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleOption = (key: keyof typeof options) => {
    const updated = { ...options, [key]: !options[key] };
    setOptions(updated);
    onSearch?.({
      category,
      brand,
      type,
      model,
      price,
      options: updated,
    });
  };

  const handleCategoryChange = (newCat: SearchFilterState["category"]) => {
    setCategory(newCat);
    onSearch?.({
      category: newCat,
      brand,
      type,
      model,
      price,
      options,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({
      category,
      brand,
      type,
      model,
      price,
      options,
    });
  };

  const availableModels = MODELS[brand] || ["All Models"];

  return (
    <div className="w-full bg-white rounded-xl p-5 sm:p-7 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-gray-100 relative">
      {/* Category Tabs */}
      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100/90 rounded-lg flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "all"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("new")}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "new"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Brand New
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("tokunbo")}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "tokunbo"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Tokunbo
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("nigerian_used")}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "nigerian_used"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Nigerian Used
          </button>
        </div>
      </div>

      {/* Filter Selectors Form */}
      <form onSubmit={handleSearch} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 items-end">
          {/* 1. Brand Name */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5 pl-0.5">
              Brand Name
            </label>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "brand" ? null : "brand")
              }
              className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-left text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <span className="font-medium truncate">{brand}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {openDropdown === "brand" && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 z-30 max-h-56 overflow-y-auto">
                {BRANDS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setBrand(item);
                      setModel("All Models");
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition"
                  >
                    <span>{item}</span>
                    {brand === item && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Type */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5 pl-0.5">
              Type
            </label>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "type" ? null : "type")
              }
              className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-left text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <span className="font-medium truncate">{type}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {openDropdown === "type" && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 z-30 max-h-56 overflow-y-auto">
                {TYPES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setType(item);
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition"
                  >
                    <span>{item}</span>
                    {type === item && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Model */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5 pl-0.5">
              Model
            </label>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "model" ? null : "model")
              }
              className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-left text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <span className="font-medium truncate">{model}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {openDropdown === "model" && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 z-30 max-h-56 overflow-y-auto">
                {availableModels.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setModel(item);
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition"
                  >
                    <span>{item}</span>
                    {model === item && (
                      <Check className="w-3.5 h-3.5 text-black" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Price */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5 pl-0.5">
              Price Range
            </label>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "price" ? null : "price")
              }
              className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-left text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <span className="font-medium truncate">{price}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {openDropdown === "price" && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 z-30">
                {PRICE_RANGES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setPrice(item.label);
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition"
                  >
                    <span>{item.label}</span>
                    {price === item.label && (
                      <Check className="w-3.5 h-3.5 text-black" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Search Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Options Row with Premium Icon Pack */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-xs font-semibold text-gray-500 mr-1">
            Options
          </span>

          {/* 1. Hot Deals */}
          <button
            type="button"
            onClick={() => toggleOption("hotDeals")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              options.hotDeals
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FlameIcon
              className={`w-3.5 h-3.5 ${
                options.hotDeals ? "text-orange-400" : "text-gray-600"
              }`}
            />
            <span>Hot Deals</span>
          </button>

          {/* 2. Video Ads */}
          <button
            type="button"
            onClick={() => toggleOption("videoAds")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              options.videoAds
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <VideoAdsIcon
              className={`w-3.5 h-3.5 ${
                options.videoAds ? "text-red-400" : "text-gray-600"
              }`}
            />
            <span>Video Ads</span>
          </button>

          {/* 3. Trusted Dealers */}
          <button
            type="button"
            onClick={() => toggleOption("trustedDealers")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              options.trustedDealers
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <TrustedDealersIcon
              className={`w-3.5 h-3.5 ${
                options.trustedDealers ? "text-sky-400" : "text-gray-600"
              }`}
            />
            <span>Trusted Dealers</span>
          </button>

          {/* 4. Rojo Certified */}
          <button
            type="button"
            onClick={() => toggleOption("rojoCertified")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              options.rojoCertified
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <RojoCertifiedIcon
              className={`w-3.5 h-3.5 ${
                options.rojoCertified ? "text-emerald-400" : "text-gray-600"
              }`}
            />
            <span>mycarsNg Certified</span>
          </button>

          {/* 5. Warranty */}
          <button
            type="button"
            onClick={() => toggleOption("warranty")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              options.warranty
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <WarrantyIcon
              className={`w-3.5 h-3.5 ${
                options.warranty ? "text-indigo-400" : "text-gray-600"
              }`}
            />
            <span>Warranty</span>
          </button>
        </div>
      </form>
    </div>
  );
};
