"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavLink } from "@/components/common/NavLink";
import {
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface PortalShellProps {
  roleTitle: string;
  roleType: "buyer" | "dealer" | "seller" | "technician" | "admin";
  navItems: NavItem[];
  children: React.ReactNode;
  userEmail?: string;
}

export const PortalShell = ({
  roleTitle,
  roleType,
  navItems,
  children,
  userEmail = "user@carplug.ng",
}: PortalShellProps) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleColors = {
    buyer: "bg-blue-500/10 text-blue-600 border-blue-200",
    dealer: "bg-amber-500/10 text-amber-700 border-amber-200",
    seller: "bg-purple-500/10 text-purple-700 border-purple-200",
    technician: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    admin: "bg-red-500/10 text-red-700 border-red-200",
  };

  const roleActiveStyles = {
    buyer: "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 rounded-l-none rounded-r-xl shadow-xs",
    dealer: "bg-amber-50 text-amber-800 font-medium border-l-4 border-amber-600 rounded-l-none rounded-r-xl shadow-xs",
    seller: "bg-purple-50 text-purple-700 font-medium border-l-4 border-purple-600 rounded-l-none rounded-r-xl shadow-xs",
    technician: "bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600 rounded-l-none rounded-r-xl shadow-xs",
    admin: "bg-red-50 text-red-700 font-medium border-l-4 border-red-600 rounded-l-none rounded-r-xl shadow-xs",
  };

  const roleActiveIconColor = {
    buyer: "text-blue-600",
    dealer: "text-amber-600",
    seller: "text-purple-600",
    technician: "text-emerald-600",
    admin: "text-red-600",
  };

  const roleActiveBadgeStyles = {
    buyer: "bg-blue-100 text-blue-800",
    dealer: "bg-amber-100 text-amber-800",
    seller: "bg-purple-100 text-purple-800",
    technician: "bg-emerald-100 text-emerald-800",
    admin: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/mycarNG-black.png"
              alt="mycarsNg"
              width={48}
              height={48}
              priority
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <span className="hidden sm:inline-block text-gray-300">/</span>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColors[roleType]}`}
          >
            {roleTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Testing */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs bg-gray-100 p-1 rounded-lg">
            <span className="px-2 text-gray-500 font-medium">Switch Portal:</span>
            <NavLink
              href="/buyer/search"
              matchPrefix
              activeMatch={(p) => p.startsWith("/buyer")}
              className="px-2.5 py-1 rounded-md font-medium transition"
              activeClassName="bg-white shadow-xs text-emerald-600 font-bold border border-emerald-500/30"
              inactiveClassName="text-gray-600 hover:text-gray-900"
            >
              Buyer
            </NavLink>
            <NavLink
              href="/dealer/dashboard"
              matchPrefix
              activeMatch={(p) => p.startsWith("/dealer")}
              className="px-2.5 py-1 rounded-md font-medium transition"
              activeClassName="bg-white shadow-xs text-emerald-600 font-bold border border-emerald-500/30"
              inactiveClassName="text-gray-600 hover:text-gray-900"
            >
              Dealer
            </NavLink>
            <NavLink
              href="/seller/dashboard"
              matchPrefix
              activeMatch={(p) => p.startsWith("/seller")}
              className="px-2.5 py-1 rounded-md font-medium transition"
              activeClassName="bg-white shadow-xs text-emerald-600 font-bold border border-emerald-500/30"
              inactiveClassName="text-gray-600 hover:text-gray-900"
            >
              Private Seller
            </NavLink>
            <NavLink
              href="/technician/dashboard"
              matchPrefix
              activeMatch={(p) => p.startsWith("/technician")}
              className="px-2.5 py-1 rounded-md font-medium transition"
              activeClassName="bg-white shadow-xs text-emerald-600 font-bold border border-emerald-500/30"
              inactiveClassName="text-gray-600 hover:text-gray-900"
            >
              Technician
            </NavLink>
            <NavLink
              href="/admin/dashboard"
              matchPrefix
              activeMatch={(p) => p.startsWith("/admin")}
              className="px-2.5 py-1 rounded-md font-medium transition"
              activeClassName="bg-white shadow-xs text-emerald-600 font-bold border border-emerald-500/30"
              inactiveClassName="text-gray-600 hover:text-gray-900"
            >
              Admin
            </NavLink>
          </div>

          <Link
            href="/buyer/search"
            className="text-xs font-medium text-gray-600 hover:text-gray-900 hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition"
          >
            <span>Public Marketplace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs"
              title={user?.email || userEmail}
            >
              {user?.name?.charAt(0).toUpperCase() || roleTitle.charAt(0)}
            </div>
            {user && (
              <button
                onClick={() => logout()}
                title="Log Out"
                className="hidden sm:flex p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col justify-between w-72 border-r border-gray-200 bg-white p-4 shrink-0 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">
          <div>
            <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  activeMatch={(p) =>
                    p === item.href ||
                    (item.href !== "/" &&
                      p.startsWith(item.href) &&
                      item.href !== `/${roleType}`)
                  }
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 text-[15px] font-normal transition ${
                      isActive
                        ? "rounded-r-xl rounded-l-none"
                        : "rounded-xl border-l-4 border-transparent"
                    }`
                  }
                  activeClassName={roleActiveStyles[roleType]}
                  inactiveClassName="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={`w-6 h-6 shrink-0 ${
                            isActive ? roleActiveIconColor[roleType] : "text-gray-500"
                          }`}
                        />
                        <span className="leading-snug">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                            isActive
                              ? roleActiveBadgeStyles[roleType]
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-2 mt-2 border-t border-gray-100">
              <NavLink
                href="/settings"
                exact
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 text-[15px] font-normal transition ${
                    isActive
                      ? "rounded-r-xl rounded-l-none"
                      : "rounded-xl border-l-4 border-transparent"
                  }`
                }
                activeClassName={roleActiveStyles[roleType]}
                inactiveClassName="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {({ isActive }) => (
                  <>
                    <Settings
                      className={`w-6 h-6 shrink-0 ${
                        isActive ? roleActiveIconColor[roleType] : "text-gray-500"
                      }`}
                    />
                    <span className="leading-snug">Account Settings</span>
                  </>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 px-3">
            {roleType === "admin" ? (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                  <span>System Telemetry</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Core Services</span>
                    <span className="font-semibold text-emerald-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Escrow Node</span>
                    <span className="font-semibold text-neutral-900">Synchronized</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Governance</span>
                    <span className="font-mono text-gray-600">v2.4-prod</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  mycarsNg Trust Engine
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <p className="font-semibold mb-1">Independent Verification</p>
                  <p className="text-blue-700">
                    All platform leads and inspections are logged and protected under the Trust Tier ladder.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-over Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full p-4 flex flex-col justify-between z-10 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/mycarNG-black.png"
                      alt="mycarsNg"
                      width={32}
                      height={32}
                      priority
                      className="h-8 w-8 object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        activeMatch={(p) =>
                          p === item.href ||
                          (item.href !== "/" &&
                            p.startsWith(item.href) &&
                            item.href !== `/${roleType}`)
                        }
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-3 text-[15px] font-normal transition ${
                            isActive
                              ? "rounded-r-xl rounded-l-none"
                              : "rounded-xl border-l-4 border-transparent"
                          }`
                        }
                        activeClassName={roleActiveStyles[roleType]}
                        inactiveClassName="text-gray-700 hover:bg-gray-100"
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3.5">
                              <Icon
                                className={`w-6 h-6 shrink-0 ${
                                  isActive ? roleActiveIconColor[roleType] : "text-gray-500"
                                }`}
                              />
                              <span className="leading-snug">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                                  isActive
                                    ? roleActiveBadgeStyles[roleType]
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}

                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <NavLink
                      href="/settings"
                      exact
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-3.5 py-3 text-[15px] font-normal transition ${
                          isActive
                            ? "rounded-r-xl rounded-l-none"
                            : "rounded-xl border-l-4 border-transparent"
                        }`
                      }
                      activeClassName={roleActiveStyles[roleType]}
                      inactiveClassName="text-gray-700 hover:bg-gray-100"
                    >
                      {({ isActive }) => (
                        <>
                          <Settings
                            className={`w-6 h-6 shrink-0 ${
                              isActive ? roleActiveIconColor[roleType] : "text-gray-500"
                            }`}
                          />
                          <span className="leading-snug">Account Settings</span>
                        </>
                      )}
                    </NavLink>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                {user && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                )}
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
