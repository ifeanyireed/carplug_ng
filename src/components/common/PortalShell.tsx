"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RojoLogo } from "@/components/common/RojoLogo";
import {
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowUpRight,
  LogOut,
  Bell,
} from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const roleColors = {
    buyer: "bg-blue-500/10 text-blue-600 border-blue-200",
    dealer: "bg-amber-500/10 text-amber-700 border-amber-200",
    seller: "bg-purple-500/10 text-purple-700 border-purple-200",
    technician: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    admin: "bg-red-500/10 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <RojoLogo className="h-6 w-auto text-neutral-900" />
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
            <Link
              href="/buyer/search"
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                pathname.startsWith("/buyer")
                  ? "bg-white shadow-xs text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Buyer
            </Link>
            <Link
              href="/dealer/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                pathname.startsWith("/dealer")
                  ? "bg-white shadow-xs text-amber-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Dealer
            </Link>
            <Link
              href="/seller/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                pathname.startsWith("/seller")
                  ? "bg-white shadow-xs text-purple-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Private Seller
            </Link>
            <Link
              href="/technician/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                pathname.startsWith("/technician")
                  ? "bg-white shadow-xs text-emerald-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Technician
            </Link>
            <Link
              href="/admin/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                pathname.startsWith("/admin")
                  ? "bg-white shadow-xs text-red-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </Link>
          </div>

          <Link
            href="/buyer/search"
            className="text-xs font-medium text-gray-600 hover:text-gray-900 hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition"
          >
            <span>Public Marketplace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-semibold">
            {roleTitle.charAt(0)}
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  pathname.startsWith(item.href) &&
                  item.href !== `/${roleType}`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 px-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Verza Trust Engine
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <p className="font-semibold mb-1">Independent Verification</p>
              <p className="text-blue-700">
                All platform leads and inspections are logged and protected under the Trust Tier ladder.
              </p>
            </div>
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
                  <RojoLogo className="h-6 w-auto text-neutral-900" />
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
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? "bg-neutral-900 text-white font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
};
