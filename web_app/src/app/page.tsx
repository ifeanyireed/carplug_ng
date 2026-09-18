"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/hero/Hero";
import { SearchFilterState } from "@/components/hero/HeroSearchBox";
import { SearchResultsDisplay } from "@/components/hero/SearchResultsDisplay";
import { BrandsRow } from "@/components/browse/BrandsRow";
import { BrowseByType } from "@/components/browse/BrowseByType";
import {
  ExploreVehiclesSection,
  ExploreCar,
} from "@/components/explore/ExploreVehiclesSection";
import { BestSellingMakesSection } from "@/components/makes/BestSellingMakesSection";
import { WhatTheySaidSection } from "@/components/stories/WhatTheySaidSection";
import { NewsAndArticlesSection } from "@/components/news/NewsAndArticlesSection";
import { Footer } from "@/components/layout/Footer";
import { CarListing } from "@/data/mockCars";
import { Vehicle } from "@/data/mockStore";
import { fetchVehicles } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function adaptVehicleToCarListing(v: Vehicle): CarListing {
  const isNew = v.condition.toLowerCase().includes("brand new");
  let badge: "Great Price" | "Good Deal" | "Featured" | undefined = undefined;
  if (v.featured) badge = "Featured";
  else if (v.trustTier >= 4) badge = "Great Price";
  else if (v.priceRating === "deal") badge = "Good Deal";

  let fuel: "Gasoline" | "Electric" | "Hybrid" | "Diesel" = "Gasoline";
  if (v.fuelType === "Electric") fuel = "Electric";
  else if (v.fuelType === "Hybrid") fuel = "Hybrid";
  else if (v.fuelType === "Diesel") fuel = "Diesel";

  return {
    id: v.id,
    name: v.title,
    year: v.year,
    make: v.make,
    model: v.model,
    type: v.bodyType || "Sedan",
    condition: isNew ? "New" : "Used",
    transmission: v.transmission === "Manual" ? "Manual" : "Automatic",
    fuelType: fuel,
    price: v.price,
    badge,
    image: v.images && v.images.length > 0 ? v.images[0] : "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg",
    mileage: v.mileage ? `${v.mileage.toLocaleString()} km` : undefined,
    hasVideo: Boolean(v.featured),
    isCertified: v.trustTier >= 4,
    hasWarranty: v.trustTier >= 4,
    isTrustedDealer: v.sellerType === "dealer" || v.trustTier >= 3,
  };
}

export default function HomePage() {
  const { openAuthModal } = useAuth();
  const [catalog, setCatalog] = useState<CarListing[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilterState | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CarListing[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchVehicles()
      .then((vehicles) => {
        if (isMounted) {
          if (vehicles && vehicles.length > 0) {
            const adapted: CarListing[] = vehicles.map(adaptVehicleToCarListing);
            setCatalog(adapted);
          } else {
            setCatalog([]);
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load live vehicles for homepage catalog:", err);
        if (isMounted) setCatalog([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAuth = (mode?: "login" | "signup") => {
    openAuthModal(mode || "login");
  };

  const handleSearch = (filters: SearchFilterState) => {
    setActiveFilters(filters);
    setSelectedBrand(filters.brand !== "All" ? filters.brand : null);
    setSelectedType(filters.type);

    const filtered = catalog.filter((car) => {
      // Category filter
      if (filters.category === "new" && car.condition !== "New") return false;
      if (filters.category === "used" && car.condition !== "Used") return false;

      // Brand filter
      if (
        filters.brand &&
        filters.brand !== "All" &&
        !car.make.toLowerCase().includes(filters.brand.toLowerCase()) &&
        !filters.brand.toLowerCase().includes(car.make.toLowerCase())
      ) {
        return false;
      }

      // Options filters
      if (filters.options.hotDeals && !car.badge) return false;
      if (filters.options.videoAds && !car.hasVideo) return false;
      if (filters.options.trustedDealers && !car.isTrustedDealer) return false;
      if (filters.options.rojoCertified && !car.isCertified) return false;
      if (filters.options.warranty && !car.hasWarranty) return false;

      return true;
    });

    setSearchResults(filtered);

    // Smooth scroll to results
    const resultsEl = document.getElementById("search-results");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectBrand = (brandName: string) => {
    if (selectedBrand === brandName) {
      setSelectedBrand(null);
      setSearchResults(null);
      return;
    }

    setSelectedBrand(brandName);
    const filtered = catalog.filter((car) =>
      car.make.toLowerCase().includes(brandName.toLowerCase()) ||
      brandName.toLowerCase().includes(car.make.toLowerCase())
    );
    setSearchResults(filtered);

    const resultsEl = document.getElementById("search-results");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectType = (typeName: string) => {
    if (selectedType === typeName) {
      setSelectedType(null);
      setSearchResults(null);
      return;
    }

    setSelectedType(typeName);
    const filtered = catalog.filter(
      (car) => car.type.toLowerCase() === typeName.toLowerCase()
    );
    setSearchResults(filtered.length > 0 ? filtered : catalog);

    const resultsEl = document.getElementById("search-results");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectExploreCar = (car: ExploreCar) => {
    const matched = catalog.find((c) =>
      c.name.toLowerCase().includes(car.name.toLowerCase())
    );
    if (matched) {
      setSearchResults([matched]);
      const resultsEl = document.getElementById("search-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSelectFooterModel = (modelName: string) => {
    const filtered = catalog.filter((car) =>
      car.name.toLowerCase().includes(modelName.toLowerCase()) ||
      modelName.toLowerCase().includes(car.make.toLowerCase())
    );
    setSearchResults(filtered.length > 0 ? filtered : catalog);

    const resultsEl = document.getElementById("search-results");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setSelectedBrand(null);
    setSelectedType(null);
    setSearchResults(null);
  };

  // Generate filter summary string
  const getFilterSummary = () => {
    if (selectedBrand) return `Brand: ${selectedBrand}`;
    if (selectedType) return `Body Type: ${selectedType}`;
    if (!activeFilters) return "";

    const activeOptions = Object.entries(activeFilters.options)
      .filter(([, active]) => active)
      .map(([key]) => {
        switch (key) {
          case "hotDeals":
            return "Hot Deals";
          case "videoAds":
            return "Video Ads";
          case "trustedDealers":
            return "Trusted Dealers";
          case "rojoCertified":
            return "mycarsNg Certified";
          case "warranty":
            return "Warranty";
          default:
            return key;
        }
      });

    const parts = [
      activeFilters.category !== "all" ? `${activeFilters.category.toUpperCase()} Cars` : "All Categories",
      activeFilters.brand,
      activeFilters.type,
      activeFilters.price,
      ...activeOptions,
    ];
    return parts.join(" • ");
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      <div>
        {/* Sticky Floating Navbar */}
        <Navbar floating onOpenAuth={handleOpenAuth} />

        {/* Hero Section with continuous car backdrop and search card */}
        <Hero
          onSearch={handleSearch}
        />

        {/* Brand Logos Row from public/images/brands */}
        <BrandsRow
          onSelectBrand={handleSelectBrand}
          selectedBrand={selectedBrand}
        />

        {/* Browse By Type Section from UI6.webp */}
        <BrowseByType
          onSelectType={handleSelectType}
          selectedType={selectedType}
        />

        {/* Explore All Vehicles Section from UI7.webp */}
        <ExploreVehiclesSection
          onSelectCar={handleSelectExploreCar}
        />

        {/* Exploring Best Selling Cars Makes Section from UI8.webp */}
        <BestSellingMakesSection onSelectMake={handleSelectBrand} />

        {/* What They Said Video Story Section from UI9.webp */}
        <WhatTheySaidSection />

        {/* News and Articles Section from UI10.webp */}
        <NewsAndArticlesSection />

        {/* Dynamic Search / Browse Results Section */}
        {searchResults !== null && (
          <SearchResultsDisplay
            results={searchResults}
            totalCount={catalog.length}
            filterSummary={getFilterSummary()}
            onClearFilters={handleClearFilters}
          />
        )}
      </div>

      {/* Footer Section from UI11.webp */}
      <Footer onSelectModel={handleSelectFooterModel} />
    </main>
  );
}
