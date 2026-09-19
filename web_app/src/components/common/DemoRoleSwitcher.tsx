"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  Building2,
  Car,
  Wrench,
  UserCheck,
  Check,
  Loader2,
  LogOut,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface DemoAccount {
  id: string;
  role: "admin" | "dealer" | "seller" | "technician" | "buyer";
  name: string;
  email: string;
  label: string;
  sublabel: string;
  dashboardPath: string;
  badgeBg: string;
  icon: React.ElementType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "admin",
    role: "admin",
    name: "Super Admin",
    email: "admin@mycars.ng",
    label: "Super Admin",
    sublabel: "Platform governance, escrow & verifications",
    dashboardPath: "/admin/dashboard",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ShieldAlert,
  },
  {
    id: "dealer-reed",
    role: "dealer",
    name: "Reed Motors Lagos",
    email: "dealer.reed@mycars.ng",
    label: "Dealer (Lekki)",
    sublabel: "Premium Tokunbo & luxury showroom",
    dashboardPath: "/dealer/dashboard",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Building2,
  },
  {
    id: "dealer-crown",
    role: "dealer",
    name: "Crown Continental Autos",
    email: "dealer.crown@mycars.ng",
    label: "Dealer (Ikeja GRA)",
    sublabel: "US & Canada high-volume importer",
    dashboardPath: "/dealer/dashboard",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Building2,
  },
  {
    id: "dealer-apex",
    role: "dealer",
    name: "Apex Exotic Motors",
    email: "dealer.apex@mycars.ng",
    label: "Dealer (VI Showroom)",
    sublabel: "Brand-new flagships & next-gen EVs",
    dashboardPath: "/dealer/dashboard",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Building2,
  },
  {
    id: "seller",
    role: "seller",
    name: "Babatunde Olumide",
    email: "seller.babatunde@mycars.ng",
    label: "Private Seller",
    sublabel: "Verified direct vehicle owner (Surulere)",
    dashboardPath: "/seller/dashboard",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Car,
  },
  {
    id: "technician",
    role: "technician",
    name: "Musa Danladi, ASE-Cert",
    email: "tech.musa@mycars.ng",
    label: "Master Inspector",
    sublabel: "150-Point checklist & AI summary audit",
    dashboardPath: "/technician/dashboard",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Wrench,
  },
  {
    id: "buyer",
    role: "buyer",
    name: "Dr. Chidi Nwosu",
    email: "buyer.chidi@mycars.ng",
    label: "Verified Buyer",
    sublabel: "Garage, saved cars & inspection bookings",
    dashboardPath: "/buyer/garage",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    icon: UserCheck,
  },
];

export const DemoRoleSwitcher = () => {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeLoggingEmail, setActiveLoggingEmail] = useState<string | null>(null);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSwitchAccount = async (account: DemoAccount) => {
    setActiveLoggingEmail(account.email);
    setToastMessage(null);

    try {
      await login({
        email: account.email,
        password: "Carplug2026!",
      });

      setToastMessage(`Logged in as ${account.name} (${account.label})`);

      if (autoRedirect) {
        startTransition(() => {
          router.push(account.dashboardPath);
        });
      }

      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } catch (err) {
      console.error("Failed demo account switch:", err);
      setToastMessage("Switch failed. Ensure backend API is active.");
    } finally {
      setActiveLoggingEmail(null);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return { text: "Admin", bg: "bg-purple-600 text-white" };
      case "dealer":
        return { text: "Dealer", bg: "bg-blue-600 text-white" };
      case "seller":
        return { text: "Seller", bg: "bg-amber-600 text-white" };
      case "technician":
        return { text: "Tech", bg: "bg-emerald-600 text-white" };
      case "buyer":
        return { text: "Buyer", bg: "bg-sky-600 text-white" };
      default:
        return { text: "Guest", bg: "bg-neutral-600 text-white" };
    }
  };

  const currentBadge = getRoleBadge(user?.role);

  if (isMinimized) {
    return (
      <aside aria-label="Demo role switcher" className="fixed bottom-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-neutral-900/95 hover:bg-black text-white text-xs font-medium px-3 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md transition-all active:scale-95"
          title="Open Demo Role Switcher"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-tight">Role Switcher</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentBadge.bg}`}>
            {currentBadge.text}
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Demo role switcher" className="fixed bottom-4 left-4 z-50 flex flex-col items-start select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-2 bg-neutral-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl border border-white/15 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Expanded Menu Card */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden mb-2 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xs font-semibold tracking-tight">1-Click Role Switcher</h2>
                <p className="text-[10px] text-white/70">Pre-verified test accounts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 text-white/70 hover:text-white rounded hover:bg-white/10 transition"
                title="Minimize pill"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded hover:bg-white/10 transition"
                title="Close switcher"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Session Banner */}
          <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-gray-500 text-[11px]">Active:</span>
              <span className="font-semibold text-gray-900 truncate">
                {isAuthenticated ? user?.name || user?.email : "Guest (Logged Out)"}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentBadge.bg}`}>
                {currentBadge.text}
              </span>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setToastMessage("Logged out");
                }}
                className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-rose-600 transition font-medium"
                title="Log out current account"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            )}
          </div>

          {/* Auto Redirect Toggle */}
          <div className="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-600 bg-white">
            <span>Auto-navigate to role dashboard on switch</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRedirect}
                onChange={(e) => setAutoRedirect(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>

          {/* Account Rows */}
          <div className="p-2 max-h-[340px] overflow-y-auto divide-y divide-gray-50 space-y-1">
            {DEMO_ACCOUNTS.map((acc) => {
              const isCurrent = isAuthenticated && user?.email === acc.email;
              const isLoading = activeLoggingEmail === acc.email;
              const Icon = acc.icon;

              return (
                <div
                  key={acc.id}
                  className={`p-2 rounded-xl transition flex items-center justify-between gap-2 ${
                    isCurrent
                      ? "bg-neutral-50 border border-neutral-200/80"
                      : "hover:bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 text-gray-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {acc.name}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${acc.badgeBg}`}>
                          {acc.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{acc.sublabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isCurrent ? (
                      <button
                        type="button"
                        onClick={() => router.push(acc.dashboardPath)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium flex items-center gap-1 transition"
                        title={`Go to ${acc.label} Dashboard`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading || !!activeLoggingEmail}
                        onClick={() => handleSwitchAccount(acc)}
                        className="px-2.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-[11px] font-medium transition active:scale-95 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span>Switch</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
            Standard Password: <code className="font-mono text-gray-700 font-bold">Carplug2026!</code>
          </div>
        </div>
      )}

      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-neutral-900/95 hover:bg-black text-white text-xs font-medium pl-3.5 pr-3 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md transition-all active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="font-semibold tracking-tight">Role Switcher</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentBadge.bg}`}>
          {currentBadge.text}
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/70" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-white/70" />
        )}
      </button>
    </aside>
  );
};
