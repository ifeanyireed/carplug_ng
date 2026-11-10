"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
import { PublicAdBanner } from "@/components/common/PublicAdBanner";

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
    rawCondition: v.condition,
    transmission: v.transmission === "Manual" ? "Manual" : "Automatic",
    fuelType: fuel,
    price: v.price,
    badge,
    image:
      v.images && v.images.length > 0
        ? v.images[0]
        : "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg",
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
  const [activeFilters, setActiveFilters] = useState<SearchFilterState | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchResults, setSearchResults] = useState<CarListing[] | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsCatalogLoading(true);
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
      })
      .finally(() => {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAuth = (mode?: "login" | "signup") => {
    openAuthModal(mode || "login");
  };

  // Unified catalog filtering & sorting engine
  const filterCatalog = (
    filters: SearchFilterState | null,
    brandOverride?: string | null,
    typeOverride?: string | null,
    sortOption: string = sortBy
  ): CarListing[] => {
    let list = [...catalog];

    const currentBrand =
      brandOverride !== undefined
        ? brandOverride
        : filters?.brand && filters.brand !== "All" && filters.brand !== "All Brands"
        ? filters.brand
        : null;

    const currentType =
      typeOverride !== undefined
        ? typeOverride
        : filters?.type && filters.type !== "All" && filters.type !== "All Types"
        ? filters.type
        : null;

    if (filters) {
      list = list.filter((car) => {
        // Category filter
        if (filters.category === "new" && car.condition !== "New") return false;
        if (filters.category === "used" && car.condition !== "Used") return false;
        if (
          filters.category === "tokunbo" &&
          !(
            car.rawCondition?.toLowerCase().includes("tokunbo") ||
            car.rawCondition?.toLowerCase().includes("foreign")
          )
        ) {
          return false;
        }
        if (
          filters.category === "nigerian_used" &&
          !car.rawCondition?.toLowerCase().includes("nigerian")
        ) {
          return false;
        }

        // Model filter
        if (filters.model && filters.model !== "All" && filters.model !== "All Models") {
          const normFilterModel = filters.model.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normCarModel = car.model.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normCarName = car.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (!normCarModel.includes(normFilterModel) && !normCarName.includes(normFilterModel)) {
            return false;
          }
        }

        // Price filter (Naira ranges)
        if (filters.price && filters.price !== "Any Price") {
          if (filters.price === "Under ₦15M" && car.price > 15000000) return false;
          if (filters.price === "₦15M - ₦30M" && (car.price < 15000000 || car.price > 30000000)) return false;
          if (filters.price === "₦30M - ₦60M" && (car.price < 30000000 || car.price > 60000000)) return false;
          if (filters.price === "₦60M - ₦100M" && (car.price < 60000000 || car.price > 100000000)) return false;
          if (filters.price === "Above ₦100M" && car.price < 100000000) return false;
        }

        // Options filters
        if (filters.options.hotDeals && !car.badge) return false;
        if (filters.options.videoAds && !car.hasVideo) return false;
        if (filters.options.trustedDealers && !car.isTrustedDealer) return false;
        if (filters.options.rojoCertified && !car.isCertified) return false;
        if (filters.options.warranty && !car.hasWarranty) return false;

        return true;
      });
    }

    // Brand filter
    if (currentBrand) {
      const normBrand = currentBrand.toLowerCase().replace(/[^a-z0-9]/g, "");
      list = list.filter((car) => {
        const normCarMake = car.make.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normCarMake.includes(normBrand) || normBrand.includes(normCarMake);
      });
    }

    // Body Type filter
    if (currentType) {
      list = list.filter(
        (car) => car.type.toLowerCase() === currentType.toLowerCase()
      );
    }

    // Sort order
    if (sortOption === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === "year_desc") {
      list.sort((a, b) => b.year - a.year);
    } else if (sortOption === "featured") {
      list.sort((a, b) => {
        const badgeScoreA = a.badge === "Featured" ? 3 : a.badge === "Great Price" ? 2 : a.badge === "Good Deal" ? 1 : 0;
        const badgeScoreB = b.badge === "Featured" ? 3 : b.badge === "Great Price" ? 2 : b.badge === "Good Deal" ? 1 : 0;
        if (badgeScoreB !== badgeScoreA) return badgeScoreB - badgeScoreA;
        return b.year - a.year;
      });
    }

    return list;
  };

  const triggerFilteringAnimation = (updateFn: () => void) => {
    setIsFiltering(true);
    updateFn();
    setTimeout(() => {
      setIsFiltering(false);
    }, 250);
  };

  const scrollToResults = () => {
    setTimeout(() => {
      const resultsEl = document.getElementById("search-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const handleSearch = (filters: SearchFilterState) => {
    triggerFilteringAnimation(() => {
      setActiveFilters(filters);
      const brand = filters.brand !== "All" && filters.brand !== "All Brands" ? filters.brand : null;
      const type = filters.type !== "All" && filters.type !== "All Types" ? filters.type : null;
      setSelectedBrand(brand);
      setSelectedType(type);

      const filtered = filterCatalog(filters, brand, type, sortBy);
      setSearchResults(filtered);
    });
    scrollToResults();
  };

  const handleSelectBrand = (brandName: string) => {
    triggerFilteringAnimation(() => {
      if (selectedBrand === brandName) {
        setSelectedBrand(null);
        const updated = activeFilters ? { ...activeFilters, brand: "All Brands" } : null;
        setActiveFilters(updated);
        const filtered = filterCatalog(updated, null, selectedType, sortBy);
        if (!updated && !selectedType) {
          setSearchResults(null);
        } else {
          setSearchResults(filtered);
        }
        return;
      }

      setSelectedBrand(brandName);
      const updated: SearchFilterState = activeFilters
        ? { ...activeFilters, brand: brandName }
        : {
            category: "all",
            brand: brandName,
            type: selectedType || "All Types",
            model: "All Models",
            price: "Any Price",
            options: {
              hotDeals: false,
              videoAds: false,
              trustedDealers: false,
              rojoCertified: false,
              warranty: false,
            },
          };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, brandName, selectedType, sortBy);
      setSearchResults(filtered);
    });
    scrollToResults();
  };

  const handleSelectType = (typeName: string) => {
    triggerFilteringAnimation(() => {
      if (selectedType === typeName) {
        setSelectedType(null);
        const updated = activeFilters ? { ...activeFilters, type: "All Types" } : null;
        setActiveFilters(updated);
        const filtered = filterCatalog(updated, selectedBrand, null, sortBy);
        if (!updated && !selectedBrand) {
          setSearchResults(null);
        } else {
          setSearchResults(filtered);
        }
        return;
      }

      setSelectedType(typeName);
      const updated: SearchFilterState = activeFilters
        ? { ...activeFilters, type: typeName }
        : {
            category: "all",
            brand: selectedBrand || "All Brands",
            type: typeName,
            model: "All Models",
            price: "Any Price",
            options: {
              hotDeals: false,
              videoAds: false,
              trustedDealers: false,
              rojoCertified: false,
              warranty: false,
            },
          };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, selectedBrand, typeName, sortBy);
      setSearchResults(filtered);
    });
    scrollToResults();
  };

  const handleSelectExploreCar = (car: ExploreCar) => {
    const matched = catalog.find((c) =>
      c.name.toLowerCase().includes(car.name.toLowerCase())
    );
    if (matched) {
      setSearchResults([matched]);
      scrollToResults();
    }
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setSelectedBrand(null);
    setSelectedType(null);
    setSearchResults(null);
  };

  const handleRemoveBrand = () => {
    setSelectedBrand(null);
    const updated = activeFilters ? { ...activeFilters, brand: "All Brands" } : null;
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, null, selectedType);
    setSearchResults(filtered);
  };

  const handleRemoveType = () => {
    setSelectedType(null);
    const updated = activeFilters ? { ...activeFilters, type: "All Types" } : null;
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, selectedBrand, null);
    setSearchResults(filtered);
  };

  const handleRemoveModel = () => {
    if (!activeFilters) return;
    const updated = { ...activeFilters, model: "All Models" };
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, selectedBrand, selectedType);
    setSearchResults(filtered);
  };

  const handleRemovePrice = () => {
    if (!activeFilters) return;
    const updated = { ...activeFilters, price: "Any Price" };
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, selectedBrand, selectedType);
    setSearchResults(filtered);
  };

  const handleRemoveCategory = () => {
    if (!activeFilters) return;
    const updated: SearchFilterState = { ...activeFilters, category: "all" };
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, selectedBrand, selectedType);
    setSearchResults(filtered);
  };

  const handleRemoveOption = (key: keyof SearchFilterState["options"]) => {
    if (!activeFilters) return;
    const updated = {
      ...activeFilters,
      options: { ...activeFilters.options, [key]: false },
    };
    setActiveFilters(updated);
    const filtered = filterCatalog(updated, selectedBrand, selectedType);
    setSearchResults(filtered);
  };

  const handleSelectCategoryTab = (cat: SearchFilterState["category"]) => {
    triggerFilteringAnimation(() => {
      const base: SearchFilterState = activeFilters || {
        category: cat,
        brand: selectedBrand || "All Brands",
        type: selectedType || "All Types",
        model: "All Models",
        price: "Any Price",
        options: {
          hotDeals: false,
          videoAds: false,
          trustedDealers: false,
          rojoCertified: false,
          warranty: false,
        },
      };
      const updated = { ...base, category: cat };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, selectedBrand, selectedType, sortBy);
      setSearchResults(filtered);
    });
  };

  const handleSortChange = (newSort: string) => {
    triggerFilteringAnimation(() => {
      setSortBy(newSort);
      const filtered = filterCatalog(activeFilters, selectedBrand, selectedType, newSort);
      setSearchResults(filtered);
    });
  };

  const handleScrollToHero = () => {
    const heroEl = document.getElementById("hero-search");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChangeBrand = (brandName: string) => {
    triggerFilteringAnimation(() => {
      const isAll = brandName === "All Brands" || brandName === "All";
      setSelectedBrand(isAll ? null : brandName);
      const base: SearchFilterState = activeFilters || {
        category: "all",
        brand: "All Brands",
        type: selectedType || "All Types",
        model: "All Models",
        price: "Any Price",
        options: {
          hotDeals: false,
          videoAds: false,
          trustedDealers: false,
          rojoCertified: false,
          warranty: false,
        },
      };
      const updated: SearchFilterState = {
        ...base,
        brand: brandName,
        model: "All Models",
      };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, isAll ? null : brandName, selectedType, sortBy);
      setSearchResults(filtered);
    });
  };

  const handleChangeType = (typeName: string) => {
    triggerFilteringAnimation(() => {
      const isAll = typeName === "All Types" || typeName === "All";
      setSelectedType(isAll ? null : typeName);
      const base: SearchFilterState = activeFilters || {
        category: "all",
        brand: selectedBrand || "All Brands",
        type: "All Types",
        model: "All Models",
        price: "Any Price",
        options: {
          hotDeals: false,
          videoAds: false,
          trustedDealers: false,
          rojoCertified: false,
          warranty: false,
        },
      };
      const updated: SearchFilterState = {
        ...base,
        type: typeName,
      };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, selectedBrand, isAll ? null : typeName, sortBy);
      setSearchResults(filtered);
    });
  };

  const handleChangeModel = (modelName: string) => {
    triggerFilteringAnimation(() => {
      const base: SearchFilterState = activeFilters || {
        category: "all",
        brand: selectedBrand || "All Brands",
        type: selectedType || "All Types",
        model: "All Models",
        price: "Any Price",
        options: {
          hotDeals: false,
          videoAds: false,
          trustedDealers: false,
          rojoCertified: false,
          warranty: false,
        },
      };
      const updated: SearchFilterState = {
        ...base,
        model: modelName,
      };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, selectedBrand, selectedType, sortBy);
      setSearchResults(filtered);
    });
  };

  const handleChangePrice = (priceRange: string) => {
    triggerFilteringAnimation(() => {
      const base: SearchFilterState = activeFilters || {
        category: "all",
        brand: selectedBrand || "All Brands",
        type: selectedType || "All Types",
        model: "All Models",
        price: "Any Price",
        options: {
          hotDeals: false,
          videoAds: false,
          trustedDealers: false,
          rojoCertified: false,
          warranty: false,
        },
      };
      const updated: SearchFilterState = {
        ...base,
        price: priceRange,
      };
      setActiveFilters(updated);
      const filtered = filterCatalog(updated, selectedBrand, selectedType, sortBy);
      setSearchResults(filtered);
    });
  };

  // Generate filter summary string
  const getFilterSummary = () => {
    if (!activeFilters && !selectedBrand && !selectedType) return "";

    const activeOptions = activeFilters
      ? Object.entries(activeFilters.options)
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
          })
      : [];

    const categoryLabel =
      activeFilters?.category === "new"
        ? "Brand New"
        : activeFilters?.category === "tokunbo"
        ? "Tokunbo"
        : activeFilters?.category === "nigerian_used"
        ? "Nigerian Used"
        : activeFilters?.category === "used"
        ? "Used Cars"
        : null;

    const brandLabel =
      selectedBrand ||
      (activeFilters?.brand &&
      activeFilters.brand !== "All Brands" &&
      activeFilters.brand !== "All"
        ? activeFilters.brand
        : null);

    const typeLabel =
      selectedType ||
      (activeFilters?.type &&
      activeFilters.type !== "All Types" &&
      activeFilters.type !== "All"
        ? activeFilters.type
        : null);

    const parts = [
      categoryLabel,
      brandLabel,
      typeLabel,
      activeFilters?.model &&
      activeFilters.model !== "All Models" &&
      activeFilters.model !== "All"
        ? activeFilters.model
        : null,
      activeFilters?.price && activeFilters.price !== "Any Price"
        ? activeFilters.price
        : null,
      ...activeOptions,
    ].filter(Boolean);

    return parts.join(" • ");
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      <div>
        {/* Sticky Floating Navbar */}
        <Navbar floating onOpenAuth={handleOpenAuth} />

        {/* Hero Section with continuous car backdrop and search card */}
        <Hero onSearch={handleSearch} externalFilters={activeFilters} />

        {/* Brand Logos Row from public/images/brands */}
        <BrandsRow
          onSelectBrand={handleSelectBrand}
          selectedBrand={selectedBrand}
        />

        {/* Dynamic Search / Browse Results Section - DIRECT PROXIMITY UNDER HERO & BRANDS */}
        {searchResults !== null && (
          <SearchResultsDisplay
            results={searchResults}
            totalCount={catalog.length}
            filterSummary={getFilterSummary()}
            activeFilters={activeFilters}
            selectedBrand={selectedBrand}
            selectedType={selectedType}
            sortBy={sortBy}
            onClearFilters={handleClearFilters}
            onRemoveBrand={handleRemoveBrand}
            onRemoveType={handleRemoveType}
            onRemoveModel={handleRemoveModel}
            onRemovePrice={handleRemovePrice}
            onRemoveCategory={handleRemoveCategory}
            onRemoveOption={handleRemoveOption}
            onSelectCategoryTab={handleSelectCategoryTab}
            onSortChange={handleSortChange}
            onScrollToHero={handleScrollToHero}
            onChangeBrand={handleChangeBrand}
            onChangeType={handleChangeType}
            onChangeModel={handleChangeModel}
            onChangePrice={handleChangePrice}
            isLoading={isCatalogLoading || isFiltering}
          />
        )}

        {/* When search is inactive, render full discovery sections. When active, display clean bottom banner */}
        {searchResults === null ? (
          <>
            {/* Browse By Type Section from UI6.webp */}
            <BrowseByType
              onSelectType={handleSelectType}
              selectedType={selectedType}
            />

            {/* Explore All Vehicles Section from UI7.webp */}
            <ExploreVehiclesSection onSelectCar={handleSelectExploreCar} />

            {/* Homepage Brand Spotlight Public Ad Banner */}
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-10">
              <PublicAdBanner placement="Homepage Brand Spotlight" />
            </div>

            {/* Exploring Best Selling Cars Makes Section from UI8.webp */}
            <BestSellingMakesSection onSelectMake={handleSelectBrand} />

            {/* What They Said Video Story Section from UI9.webp */}
            <WhatTheySaidSection />

            {/* News and Articles Section from UI10.webp */}
            <NewsAndArticlesSection />
          </>
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-200/70 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Looking for more options or want to browse all discovery sections?
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                  You can clear your search filters to return to the full overview, or jump into our advanced multi-filter catalog.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-800 transition shadow-2xs cursor-pointer"
                >
                  Return to Homepage
                </button>
                <Link
                  href="/buyer/search"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium transition shadow-xs"
                >
                  <span>Advanced Catalog</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}
