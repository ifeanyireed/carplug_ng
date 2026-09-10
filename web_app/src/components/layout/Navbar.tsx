"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { RojoLogo } from "@/components/common/RojoLogo";
import {
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Gavel,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onOpenAuth?: (mode: "login" | "signup") => void;
  savedCount?: number;
  onOpenSaved?: () => void;
}

export const Navbar = ({
  onOpenAuth,
  savedCount = 2,
}: NavbarProps) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleAuthTrigger = (mode: "login" | "signup") => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      openAuthModal(mode);
    }
  };

  const portalPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "dealer"
      ? "/dealer/dashboard"
      : user?.role === "seller"
      ? "/seller/dashboard"
      : user?.role === "technician"
      ? "/technician/dashboard"
      : "/buyer/search";

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
          {/* User Icon / Garage */}
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

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-xs text-white"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px] ring-1 ring-white/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/20 text-gray-200">
                  {user.role}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {userMenuOpen && (
                <div
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute top-full right-0 mt-2 w-52 bg-[#1f2326] border border-white/10 rounded-xl shadow-2xl p-2 text-xs text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      href={portalPath}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-xs font-medium"
                    >
                      <span>My Portal Hub</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                    <Link
                      href="/buyer/garage"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition text-xs font-medium"
                    >
                      <span>Saved Vehicles</span>
                      <ShoppingBag className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 transition text-xs font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAuthTrigger("login")}
                className="hidden sm:inline-flex items-center justify-center text-white/90 hover:text-white font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuthTrigger("signup")}
                className="hidden sm:inline-flex items-center justify-center bg-white text-neutral-900 font-medium text-xs lg:text-sm px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

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
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 bg-white/5 rounded-lg">
                    <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mt-1">{user.role} Account</div>
                  </div>
                  <Link
                    href={portalPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-white text-black font-semibold text-xs py-2 rounded-lg hover:bg-gray-100 transition text-center"
                  >
                    Go to Portal Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full bg-red-500/20 text-red-300 font-semibold text-xs py-2 rounded-lg hover:bg-red-500/30 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAuthTrigger("login");
                    }}
                    className="w-full bg-white/10 text-white font-medium text-xs py-2 rounded-lg hover:bg-white/20 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAuthTrigger("signup");
                    }}
                    className="w-full bg-white text-black font-semibold text-xs py-2 rounded-lg hover:bg-gray-100 transition shadow cursor-pointer"
                  >
                    Sign Up Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
