"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  ArrowLeftRight,
  Heart,
  User,
  ShieldAlert,
  Wrench,
  Store,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSavedVehicles } from "@/context/SavedVehiclesContext";

export function PublicBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { savedCount } = useSavedVehicles();

  // If inside any dashboard portal shell, suppress public bottom nav (portal has its own bottom nav)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dealer") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/technician")
  ) {
    return null;
  }

  // Determine portal route for authenticated user
  const getPortalHref = () => {
    if (!user) return "/auth/login";
    switch (user.role) {
      case "dealer":
        return "/dealer/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "technician":
        return "/technician/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/buyer/garage";
    }
  };

  const getPortalIcon = () => {
    if (!user) return User;
    switch (user.role) {
      case "dealer":
        return Store;
      case "seller":
        return User;
      case "technician":
        return Wrench;
      case "admin":
        return ShieldAlert;
      default:
        return User;
    }
  };

  const PortalIcon = getPortalIcon();
  const portalHref = getPortalHref();

  const isHomeActive = pathname === "/";
  const isExploreActive =
    pathname.startsWith("/buyer/search") ||
    pathname.startsWith("/buyer/vehicles") ||
    pathname.startsWith("/shops");
  const isSwapActive =
    pathname.startsWith("/buyer/swap") ||
    pathname.startsWith("/seller/sell") ||
    pathname === "/swap";
  const isSavedActive = pathname.startsWith("/buyer/garage");
  const isAccountActive =
    pathname.startsWith("/settings") ||
    (isAuthenticated && pathname.startsWith(portalHref));

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isHomeActive
              ? "text-neutral-900 font-bold"
              : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
          aria-current={isHomeActive ? "page" : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Home
              className={`w-5 h-5 transition-transform ${
                isHomeActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
              }`}
            />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
          {isHomeActive && (
            <span className="w-1 h-1 rounded-full bg-neutral-900 mt-0.5" />
          )}
        </Link>

        {/* 2. Explore / Inventory */}
        <Link
          href="/buyer/search"
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isExploreActive
              ? "text-blue-600 font-bold"
              : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
          aria-current={isExploreActive ? "page" : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Compass
              className={`w-5 h-5 transition-transform ${
                isExploreActive ? "scale-110 stroke-[2.5] text-blue-600" : "stroke-[1.75]"
              }`}
            />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Explore</span>
          {isExploreActive && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
          )}
        </Link>

        {/* 3. Sell & Swap (Elevated Call to Action) */}
        <Link
          href={isAuthenticated && user?.role === "dealer" ? "/dealer/inventory" : "/seller/sell"}
          className="flex flex-col items-center justify-center -mt-4 group"
          aria-label="Sell or Swap Vehicle"
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-95 ${
              isSwapActive
                ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
                : "bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-900/20"
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={`text-[10px] mt-1 font-semibold tracking-tight ${
              isSwapActive ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Sell &amp; Swap
          </span>
        </Link>

        {/* 4. Saved / Garage */}
        <Link
          href="/buyer/garage"
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isSavedActive
              ? "text-rose-600 font-bold"
              : "text-gray-500 hover:text-gray-900 font-medium"
          }`}
          aria-current={isSavedActive ? "page" : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Heart
              className={`w-5 h-5 transition-transform ${
                isSavedActive
                  ? "scale-110 fill-rose-600 text-rose-600 stroke-[2]"
                  : "stroke-[1.75]"
              }`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center shadow-xs">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Saved</span>
          {isSavedActive && (
            <span className="w-1 h-1 rounded-full bg-rose-600 mt-0.5" />
          )}
        </Link>

        {/* 5. Account / Dashboard */}
        {isAuthenticated ? (
          <Link
            href={portalHref}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              isAccountActive
                ? "text-neutral-900 font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
            aria-current={isAccountActive ? "page" : undefined}
          >
            <div className="relative flex items-center justify-center">
              <PortalIcon
                className={`w-5 h-5 transition-transform ${
                  isAccountActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                }`}
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
              {user?.name?.split(" ")[0] || "Account"}
            </span>
            {isAccountActive && (
              <span className="w-1 h-1 rounded-full bg-neutral-900 mt-0.5" />
            )}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="flex flex-col items-center justify-center min-w-[56px] py-1 text-gray-500 hover:text-gray-900 font-medium cursor-pointer transition-all"
            aria-label="Sign in to your account"
          >
            <div className="relative flex items-center justify-center">
              <User className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
