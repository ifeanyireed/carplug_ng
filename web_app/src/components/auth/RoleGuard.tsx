"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowRight, ArrowLeft, Loader2, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/services/api";

interface RoleGuardProps {
  allowedRoles: Array<AuthUser["role"]>;
  portalName: string;
  children: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  portalName,
  children,
}: RoleGuardProps) {
  const { user, isLoading, openAuthModal, logout } = useAuth();

  // 1. Loading state during session hydration
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-neutral-800 shadow-sm animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Verifying Permissions
        </h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Checking your authenticated session for {portalName} access...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-5 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Please sign in to your account to access the{" "}
            <span className="font-semibold text-neutral-900">{portalName}</span>.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow cursor-pointer"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuthModal("signup")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-900 font-medium text-sm py-2.5 rounded-xl transition cursor-pointer"
            >
              Create New Account
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but unauthorized role
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    const userPortalPath =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "dealer"
        ? "/dealer/dashboard"
        : user.role === "seller"
        ? "/seller/dashboard"
        : user.role === "technician"
        ? "/technician/dashboard"
        : "/buyer/search";

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            You are currently signed in as{" "}
            <span className="font-semibold text-gray-900">{user.name}</span> with a{" "}
            <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
              {user.role}
            </span>{" "}
            account.
          </p>

          <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
            The <strong className="text-gray-800">{portalName}</strong> requires an authorized{" "}
            <strong>{allowedRoles.join(" / ").toUpperCase()}</strong> account.
          </p>

          <div className="space-y-2.5">
            <Link
              href={userPortalPath}
              className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow"
            >
              <UserCheck className="w-4 h-4" />
              <span>Go to Your {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Hub</span>
            </Link>

            <button
              onClick={() => {
                logout();
                openAuthModal("login");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-900 font-medium text-sm py-2.5 rounded-xl transition cursor-pointer"
            >
              Switch Account
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized user: render portal
  return <>{children}</>;
}
