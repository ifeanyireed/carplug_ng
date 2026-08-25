"use client";

import React, { useState } from "react";
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
import { AuthModal } from "@/components/modals/AuthModal";
import { CAR_LISTINGS, CarListing } from "@/data/mockCars";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [savedBagCount, setSavedBagCount] = useState(2);
  const [activeFilters, setActiveFilters] = useState<SearchFilterState | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CarListing[] | null>(null);

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleToggleFavorite = () => {
    setSavedBagCount((prev) => prev + 1);
  };

  const handleSearch = (filters: SearchFilterState) => {
    setActiveFilters(filters);
    setSelectedBrand(filters.brand !== "All" ? filters.brand : null);
    setSelectedType(filters.type);

    const filtered = CAR_LISTINGS.filter((car) => {
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
        // loose match if multiple words
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
    const filtered = CAR_LISTINGS.filter((car) =>
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
    const filtered = CAR_LISTINGS.filter(
      (car) => car.type.toLowerCase() === typeName.toLowerCase()
    );
    setSearchResults(filtered.length > 0 ? filtered : CAR_LISTINGS);

    const resultsEl = document.getElementById("search-results");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectExploreCar = (car: ExploreCar) => {
    const matched = CAR_LISTINGS.find((c) =>
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
      .filter(([_, active]) => active)
      .map(([key]) => {
        switch (key) {
          case "hotDeals":
            return "Hot Deals";
          case "videoAds":
            return "Video Ads";
          case "trustedDealers":
            return "Trusted Dealers";
          case "rojoCertified":
            return "Rojo Certified";
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
    <main className="min-h-screen bg-[#F7F8FA] pb-24 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Hero Section with continuous car backdrop and search card */}
      <Hero
        onSearch={handleSearch}
        onOpenAuth={handleOpenAuth}
        savedCount={savedBagCount}
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
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Exploring Best Selling Cars Makes Section from UI8.webp */}
      <BestSellingMakesSection onSelectMake={handleSelectBrand} />

      {/* Dynamic Search / Browse Results Section */}
      {searchResults !== null && (
        <SearchResultsDisplay
          results={searchResults}
          totalCount={CAR_LISTINGS.length}
          filterSummary={getFilterSummary()}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </main>
  );
}
