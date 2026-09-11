"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword, AuthUser } from "@/services/api";
import {
  User,
  Lock,
  ShieldCheck,
  Smartphone,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  Store,
  Car,
  Wrench,
  Shield,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

function ProfileForm({ user }: { user: AuthUser | null }) {
  const [name, setName] = useState<string>(user?.name || "");
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      setProfileMsg({ type: "success", text: "Profile details updated successfully." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile details.";
      setProfileMsg({ type: "error", text: msg });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Personal Information</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Update your contact details displayed on vehicle listings and transactions.
        </p>
      </div>

      {profileMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{profileMsg.text}</span>
          <button onClick={() => setProfileMsg(null)} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Legal / Brand Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Musa Danladi or Reed Motors"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Email addresses are unique identifiers and cannot be modified directly. Contact platform support for assistance.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: "success", text: res.message || "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      setPasswordMsg({ type: "error", text: msg });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Account Security &amp; Password</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Ensure your account is protected with a secure password of at least 8 characters.
        </p>
      </div>

      {passwordMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            passwordMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{passwordMsg.text}</span>
          <button onClick={() => setPasswordMsg(null)} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Must be at least 8 characters long.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <button
            type="submit"
            disabled={isSavingPassword}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
          >
            {isSavingPassword ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "workspace" ? "workspace" : tabParam === "security" ? "security" : "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "workspace">(initialTab);
  const { user, isAuthenticated, isLoading: isAuthLoading, upgradeRole } = useAuth();
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRoleUpgrade = async (targetRole: "seller" | "dealer") => {
    setIsUpgradingRole(true);
    setUpgradeMessage(null);
    try {
      await upgradeRole(targetRole);
      setUpgradeMessage({
        type: "success",
        text: `Congratulations! Your account was upgraded to ${targetRole === "dealer" ? "Dealership Showroom" : "Private Seller"}.`,
      });
    } catch (err) {
      setUpgradeMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upgrade role. Please try again.",
      });
    } finally {
      setIsUpgradingRole(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "dealer":
        return { label: "Verified Dealership", color: "bg-amber-50 text-amber-800 border-amber-200" };
      case "technician":
        return { label: "Certified Diagnostic Technician", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "seller":
        return { label: "Private Vehicle Seller", color: "bg-purple-50 text-purple-800 border-purple-200" };
      case "admin":
        return { label: "Platform Governance Administrator", color: "bg-red-50 text-red-800 border-red-200" };
      default:
        return { label: "Verified Car Buyer", color: "bg-blue-50 text-blue-800 border-blue-200" };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-sm ring-4 ring-gray-100">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                {user?.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>KYC Verified</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                {user?.name || "Account Profile"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.email || "Manage your account security and contact credentials"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8 pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "profile"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "security"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "workspace"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Role Workspace</span>
          </button>
        </div>

        {/* Tab Content */}
        {!isAuthenticated && !isAuthLoading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-neutral-900">Sign In Required</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Please sign in to access your security settings, profile credentials, and role workspaces.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
            >
              <span>Return to Home &amp; Sign In</span>
            </Link>
          </div>
        ) : activeTab === "profile" ? (
          <ProfileForm key={user?.id || "guest"} user={user} />
        ) : activeTab === "security" ? (
          <SecurityForm />
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Role Workspaces &amp; Direct Portals</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Quick access to the consoles and workflows mapped to your account role ({user?.role}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.role === "dealer" ? (
                <>
                  <Link
                    href="/dealer/dashboard"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <Store className="w-4 h-4" />
                        <span>Dealership Hub</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Overview of your active inventory, verified inquiries, and sales conversions.
                    </p>
                  </Link>

                  <Link
                    href="/dealer/shop"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                        <Store className="w-4 h-4" />
                        <span>Showroom Profile Settings</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Edit showroom address, tagline, operating hours, and WhatsApp contact details.
                    </p>
                  </Link>

                  <Link
                    href="/dealer/subscription"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Subscription &amp; Listing Limits</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Check your active plan tier, listings capacity, and upgrade to Pro or Premium.
                    </p>
                  </Link>

                  <Link
                    href="/dealer/vehicles/new"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Post Vehicle Listing</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload photos, declare VIN, and publish certified inventory to the marketplace.
                    </p>
                  </Link>
                </>
              ) : user?.role === "technician" ? (
                <>
                  <Link
                    href="/technician/dashboard"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <Wrench className="w-4 h-4" />
                        <span>Technician Command Console</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Live dispatch overview, ratings SLA, and active job resume link.
                    </p>
                  </Link>

                  <Link
                    href="/technician/earnings"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Payout Wallet &amp; Withdrawals</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Withdraw audit earnings directly to your commercial bank account.
                    </p>
                  </Link>

                  <Link
                    href="/technician/inspections"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <Wrench className="w-4 h-4" />
                        <span>Mobile Checklists Queue</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Execute digital 150-point diagnostic inspections and publish certified reports.
                    </p>
                  </Link>
                </>
              ) : user?.role === "seller" ? (
                <>
                  <Link
                    href="/seller/dashboard"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Private Seller Portal</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      View your live listing, buyer saves, and inbound chat negotiations.
                    </p>
                  </Link>

                  <Link
                    href="/seller/sell"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Algorithmic Valuation &amp; Sell</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Calculate fair market price and publish your vehicle in 3 simple steps.
                    </p>
                  </Link>

                  <Link
                    href="/seller/onboard"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>NIN Identity Verification</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Submit your National Identity Card or Voter&apos;s Card to earn Verified Seller status.
                    </p>
                  </Link>
                </>
              ) : user?.role === "admin" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <Shield className="w-4 h-4" />
                        <span>Platform Governance Console</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Live telemetry across inventory, dealers, verifications, and financial settlements.
                    </p>
                  </Link>

                  <Link
                    href="/admin/verifications"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>KYC Document Verification Queue</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Audit Customs SGD declarations, CAC registrations, and technician licenses.
                    </p>
                  </Link>

                  <Link
                    href="/admin/listings"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Listings Moderation &amp; Fraud Prevention</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Inspect flagged pricing anomalies, duplicate VINs, and suspend suspect listings.
                    </p>
                  </Link>

                  <Link
                    href="/admin/payments"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Master Financial Ledger</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Review platform escrow balances, subscriptions ARR, and partner disbursements.
                    </p>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/buyer/garage"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <ShoppingBag className="w-4 h-4" />
                        <span>My Saved Vehicles (Garage)</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Review bookmarked listings and track market price updates.
                    </p>
                  </Link>

                  <Link
                    href="/buyer/messages"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <User className="w-4 h-4" />
                        <span>Direct Messages &amp; Seller Chat</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Negotiate directly with verified dealerships and private sellers.
                    </p>
                  </Link>

                  <Link
                    href="/buyer/search"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Browse Verified Inventory</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Explore Tokunbo and Nigerian used cars with 150-Point inspection reports.
                    </p>
                  </Link>

                  <Link
                    href="/buyer/concierge"
                    className="p-5 rounded-2xl border border-gray-200 hover:border-neutral-900 bg-gray-50/50 hover:bg-white transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>VIP Concierge Sourcing</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neutral-900" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Request custom off-shore or local car sourcing with guaranteed customs clearance.
                    </p>
                  </Link>
                </>
              )}
            </div>

            {/* 1-Click Role Upgrade Section for Buyers */}
            {user?.role === "buyer" && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Account Expansion &amp; Role Upgrade</span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">
                    Want to sell cars or list inventory on CarPlug?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upgrade your account in 1-click. You keep the same login email and password, with instant access to seller portals.
                  </p>
                </div>

                {upgradeMessage && (
                  <div
                    className={`mb-4 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                      upgradeMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    <span>{upgradeMessage.text}</span>
                    <button onClick={() => setUpgradeMessage(null)} className="text-gray-400 hover:text-gray-700">
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Private Seller Card */}
                  <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <Car className="w-4 h-4" />
                        <span>Become a Private Seller (Free)</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Sell your personal car directly to pre-qualified buyers. Create certified 10-step vehicle listings and negotiate via direct chat.
                      </p>
                    </div>

                    <button
                      onClick={() => handleRoleUpgrade("seller")}
                      disabled={isUpgradingRole}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isUpgradingRole ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Activate Free Seller Account</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dealership Showroom Card */}
                  <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <Store className="w-4 h-4" />
                        <span>Register Dealership Showroom</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Open a verified digital car dealership. Multi-unit inventory management, staff roles, and VIP lead concierge dispatch.
                      </p>
                    </div>

                    <button
                      onClick={() => handleRoleUpgrade("dealer")}
                      disabled={isUpgradingRole}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isUpgradingRole ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5" />
                          <span>Activate Dealership Hub</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

