"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { RojoLogo } from "@/components/common/RojoLogo";
import {
  User,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Gavel,
  ShieldCheck,
  Flame,
  ArrowUpRight,
} from "lucide-react";

interface NavbarProps {
  onOpenAuth?: (mode: "login" | "signup") => void;
  savedCount?: number;
  onOpenSaved?: () => void;
}

export const Navbar = ({
  onOpenAuth,
  savedCount = 2,
  onOpenSaved,
}: NavbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className="w-full pt-4 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-40 relative">
      <nav
        ref={navRef}
        className="bg-[#4a4e51]/90 hover:bg-[#43474a]/95 transition-colors backdrop-blur-xl border border-white/15 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-white shadow-xl flex items-center justify-between"
      >
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
        >
          <RojoLogo className="h-6 sm:h-6.5 w-auto text-white group-hover:text-gray-200 transition-colors" />
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[13px] lg:text-sm font-medium text-white/90">
          {/* Used Cars with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("used")}
              onMouseEnter={() => setActiveDropdown("used")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeDropdown === "used"
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Used Cars</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "used" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "used" && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-2 w-64 bg-[#1f2326] border border-white/10 rounded-xl shadow-2xl p-2.5 text-sm text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              >
                <div className="space-y-1">
                  <Link
                    href="#explore"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition group text-xs"
                  >
                    <span>Browse All Used Cars</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </Link>
                  <Link
                    href="#explore"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Certified Pre-Owned</span>
                  </Link>
                  <Link
                    href="#explore"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition text-xs"
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Deals Under $25,000</span>
                  </Link>
                  <div className="h-px bg-white/10 my-1.5" />
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Popular Bodies
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <Link
                      href="#explore"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1.5 rounded-md hover:bg-white/10 transition"
                    >
                      Coupes
                    </Link>
                    <Link
                      href="#explore"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1.5 rounded-md hover:bg-white/10 transition"
                    >
                      Sedans
                    </Link>
                    <Link
                      href="#explore"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1.5 rounded-md hover:bg-white/10 transition"
                    >
                      SUVs & 4x4
                    </Link>
                    <Link
                      href="#explore"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1.5 rounded-md hover:bg-white/10 transition"
                    >
                      Electric / Hybrid
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auctions with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("auctions")}
              onMouseEnter={() => setActiveDropdown("auctions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeDropdown === "auctions"
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>Auctions</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "auctions" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "auctions" && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-2 w-60 bg-[#1f2326] border border-white/10 rounded-xl shadow-2xl p-2.5 text-sm text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              >
                <div className="space-y-1 text-xs">
                  <Link
                    href="#auctions"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <Gavel className="w-4 h-4 text-yellow-400" />
                    <span>Live Bidding Now</span>
                  </Link>
                  <Link
                    href="#auctions"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>No Reserve Auctions</span>
                  </Link>
                  <Link
                    href="#auctions"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span>Ending Today</span>
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-bold px-1.5 py-0.5 rounded">
                      12 LIVE
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/buyer/search"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Find Cars
          </Link>

          <Link
            href="/buyer/compare"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Compare
          </Link>

          <Link
            href="/buyer/concierge"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Find For Me
          </Link>

          <Link
            href="/seller/sell"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Sell Car
          </Link>

          <Link
            href="/swap"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-emerald-400 font-medium"
          >
            Swap Car
          </Link>

          <Link
            href="/advertise"
            className="px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Advertise
          </Link>

          {/* Dedicated User Portals Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("portals")}
              onMouseEnter={() => setActiveDropdown("portals")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                activeDropdown === "portals"
                  ? "bg-blue-600 text-white"
                  : "bg-white/15 text-white hover:bg-white/20"
              }`}
            >
              <span>Portals</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  activeDropdown === "portals" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "portals" && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full right-0 mt-2 w-56 bg-[#1f2326] border border-white/10 rounded-xl shadow-2xl p-2 text-xs text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Dedicated User Portals
                </div>
                <div className="space-y-1">
                  <Link
                    href="/buyer/search"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-blue-400 font-medium"
                  >
                    <span>Buyer Marketplace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/dealer/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-amber-400 font-medium"
                  >
                    <span>Dealer Hub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/seller/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-purple-400 font-medium"
                  >
                    <span>Private Seller</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/technician/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-emerald-400 font-medium"
                  >
                    <span>Technician Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="h-px bg-white/10 my-1" />
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-red-400 font-medium"
                  >
                    <span>Admin Console</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/swap"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-emerald-400 font-medium"
                  >
                    <span>Car Swap &amp; Trade-In</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/advertise"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-sky-400 font-medium"
                  >
                    <span>Advertise on Verza</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Icon */}
          <Link
            href="/buyer/garage"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors focus:outline-none relative"
            aria-label="Garage & Saved Cars"
            title="My Garage"
          >
            <ShoppingBag className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#4a4e51]" />
            )}
          </Link>

          {/* Sign Up Button */}
          <button
            onClick={() => onOpenAuth?.("signup")}
            className="hidden sm:inline-flex items-center justify-center bg-white text-neutral-900 font-medium text-xs lg:text-sm px-4 lg:px-5 py-2 lg:py-2.2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all shadow-md"
          >
            Sign Up Now
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/15 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-[#2d3032]/95 backdrop-blur-xl border border-white/15 rounded-xl p-4 text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1.5">
            <Link
              href="#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition"
            >
              Used Cars
            </Link>
            <Link
              href="#auctions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition"
            >
              Auctions
            </Link>
            <Link
              href="#new-cars"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition"
            >
              New Cars
            </Link>
            <Link
              href="#sell"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition"
            >
              Sell Cars
            </Link>
            <Link
              href="#dealers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition"
            >
              Local Dealers
            </Link>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.("signup");
                }}
                className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-100 transition shadow"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
