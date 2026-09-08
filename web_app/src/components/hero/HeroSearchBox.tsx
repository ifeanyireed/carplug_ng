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
  category: "all" | "new" | "used";
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
  "Mercedes Benz",
  "BMW",
  "Audi",
  "Lexus",
  "Toyota",
  "Mitsubishi",
  "Infiniti",
  "Ford",
  "Porsche",
  "Volvo",
];

const TYPES = [
  "SUV",
  "Sedan",
  "Coupe",
  "Jeep",
  "Hatchback",
  "Convertible",
  "Electric",
];

const MODELS: Record<string, string[]> = {
  "Mercedes Benz": ["Old Classic", "C-Class", "S-Class", "GLE", "G-Class", "AMG GT", "GLA"],
  BMW: ["3 Series", "5 Series", "M3 / M4", "X5", "X3", "Z4", "i3"],
  Audi: ["A4", "A6", "RS5", "Q7", "e-tron GT"],
  Lexus: ["IS 250", "RX", "ES", "NX", "GX", "LS"],
  Toyota: ["Camry", "Supra", "Highlander", "Avalon", "4Runner"],
  Mitsubishi: ["Lancer Evo", "Outlander", "Pajero", "Eclipse Cross"],
  Infiniti: ["Q50", "Q60", "QX80", "QX60"],
  Ford: ["Mustang", "F-150", "Explorer", "Escape", "Fusion"],
  Porsche: ["911 Carrera", "Taycan", "Cayenne", "Panamera"],
  Volvo: ["S60", "XC90", "V60", "XC60"],
};

const PRICE_RANGES = [
  { label: ">$1000", value: "gt1000" },
  { label: "Under $20,000", value: "lt20k" },
  { label: "$20,000 - $40,000", value: "20k-40k" },
  { label: "$40,000 - $75,000", value: "40k-75k" },
  { label: ">$75,000", value: "gt75k" },
  { label: "Any Price", value: "any" },
];

export const HeroSearchBox = ({ onSearch }: HeroSearchBoxProps) => {
  const [category, setCategory] = useState<"all" | "new" | "used">("all");
  const [brand, setBrand] = useState("Mercedes Benz");
  const [type, setType] = useState("SUV");
  const [model, setModel] = useState("Old Classic");
  const [price, setPrice] = useState(">$1000");

  const [options, setOptions] = useState({
    hotDeals: false,
    videoAds: false,
    trustedDealers: false,
    rojoCertified: false,
    warranty: false,
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <div className="w-full bg-white rounded-xl p-5 sm:p-7 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-gray-100 relative">
      {/* Category Tabs */}
      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-100/90 rounded-lg">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "all"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            All Categories
          </button>
          <button
            type="button"
            onClick={() => setCategory("new")}
            className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "new"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            New Cars
          </button>
          <button
            type="button"
            onClick={() => setCategory("used")}
            className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              category === "used"
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Used Cars
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
                      const modelList = MODELS[item];
                      if (modelList && modelList.length > 0) {
                        setModel(modelList[0]);
                      }
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
                {(MODELS[brand] || ["All Models", "Old Classic", "Sport Package"]).map(
                  (item) => (
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
                  )
                )}
              </div>
            )}
          </div>

          {/* 4. Price */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5 pl-0.5">
              Price
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
            <span>Rojo Certified</span>
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
