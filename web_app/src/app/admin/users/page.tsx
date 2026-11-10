"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  fetchAdminUsers,
  updateAdminUserSubscription,
  AdminUserItem,
} from "@/services/api";
import { SUBSCRIPTION_TIERS, normalizePlanKey } from "@/services/SubscriptionHelper";
import {
  Users,
  Store,
  Car,
  Wrench,
  Shield,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Crown,
  TrendingUp,
  CreditCard,
  Building2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Layers,
} from "lucide-react";

type RoleFilter = "all" | "dealer" | "seller" | "buyer" | "technician" | "admin";
type TierFilter = "all" | "starter" | "basic" | "pro" | "premium";

export default function AdminUsersSubscriptionsPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("all");
  const [selectedTier, setSelectedTier] = useState<TierFilter>("all");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Plan Modification Modal
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetPlan, setTargetPlan] = useState<string>("Pro Shop");
  const [targetStatus, setTargetStatus] = useState<string>("active");
  const [customQuota, setCustomQuota] = useState<number>(60);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    async function loadUsers() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAdminUsers();
        if (isSubscribed) {
          setUsers(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : "Failed to load user directory";
          setError(msg);
          setIsLoading(false);
        }
      }
    }
    loadUsers();
    return () => {
      isSubscribed = false;
    };
  }, [refreshIndex]);

  // Derived Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (selectedRole !== "all" && u.role.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }

      // Tier filter
      if (selectedTier !== "all") {
        const userTierKey = normalizePlanKey(u.subscription?.plan);
        if (userTierKey !== selectedTier) {
          return false;
        }
      }

      // Verified only
      if (verifiedOnly && !u.isVerified && !u.shop?.verifiedCAC) {
        return false;
      }

      // Search query (name, email, phone, shop name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = Boolean(u.phone && u.phone.includes(q));
        const matchesShop = Boolean(u.shop && u.shop.name.toLowerCase().includes(q));
        const matchesPlan = Boolean(u.subscription && u.subscription.plan.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesShop && !matchesPlan) {
          return false;
        }
      }

      return true;
    });
  }, [users, selectedRole, selectedTier, verifiedOnly, searchQuery]);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const dealers = users.filter((u) => u.role === "dealer");
    const sellers = users.filter((u) => u.role === "seller");
    const buyers = users.filter((u) => u.role === "buyer");
    const techs = users.filter((u) => u.role === "technician");

    // Subscription metrics
    const dealersWithPlan = dealers.filter((d) => d.subscription && d.subscription.price > 0);
    const mrr = dealers.reduce((acc, d) => acc + (d.subscription?.price || 0), 0);

    // Active listing capacity vs active listings
    const totalActiveListings = dealers.reduce(
      (acc, d) => acc + (d.subscription?.activeListingsCount || 0),
      0
    );
    const totalQuotaSlots = dealers.reduce(
      (acc, d) => acc + (d.subscription?.listingsLimit || 0),
      0
    );

    return {
      totalUsers,
      dealersCount: dealers.length,
      sellersCount: sellers.length,
      buyersCount: buyers.length,
      techsCount: techs.length,
      paidDealersCount: dealersWithPlan.length,
      monthlyMRR: mrr,
      totalActiveListings,
      totalQuotaSlots,
    };
  }, [users]);

  // Handlers for Plan Override Modal
  const handleOpenEditPlan = (user: AdminUserItem) => {
    setSelectedUser(user);
    setTargetPlan(user.subscription?.plan || "Pro Shop");
    setTargetStatus(user.subscription?.status || "active");
    setCustomQuota(user.subscription?.listingsLimit || 60);
    setToastMessage(null);
    setIsModalOpen(true);
  };

  const handlePlanSelectionChange = (planName: string) => {
    setTargetPlan(planName);
    const key = normalizePlanKey(planName);
    const tier = SUBSCRIPTION_TIERS[key];
    if (tier) {
      setCustomQuota(tier.listingsLimit);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmittingPlan(true);
    setToastMessage(null);

    const key = normalizePlanKey(targetPlan);
    const tier = SUBSCRIPTION_TIERS[key];
    const price = tier ? tier.priceMonthly : 0;

    try {
      await updateAdminUserSubscription(selectedUser.id, {
        plan: targetPlan,
        status: targetStatus,
        listingsLimit: customQuota,
        price,
      });

      setToastMessage({
        type: "success",
        text: `Plan for ${selectedUser.name} successfully updated to ${targetPlan}!`,
      });

      // Update local state directly
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              subscription: {
                ...u.subscription,
                plan: targetPlan,
                status: targetStatus,
                listingsLimit: customQuota,
                activeListingsCount: u.subscription?.activeListingsCount || 0,
                price,
              },
            };
          }
          return u;
        })
      );

      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedUser(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update subscription";
      setToastMessage({ type: "error", text: msg });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "dealer":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: Store,
          label: "Dealership",
        };
      case "seller":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Car,
          label: "Private Seller",
        };
      case "technician":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: Wrench,
          label: "Technician",
        };
      case "admin":
        return {
          bg: "bg-neutral-900 text-white border-neutral-900",
          icon: Shield,
          label: "Super Admin",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Users,
          label: "Buyer",
        };
    }
  };

  const getPlanBadge = (planName?: string) => {
    const key = normalizePlanKey(planName);
    switch (key) {
      case "premium":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          label: "Premium Hub",
          icon: Crown,
        };
      case "pro":
        return {
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          label: "Pro Shop",
          icon: Sparkles,
        };
      case "basic":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          label: "Basic Shop",
          icon: Store,
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          label: "Starter (Free)",
          icon: Store,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Identity &amp; Showroom Governance</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            User Accounts &amp; Active Subscriptions
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Manage all registered platform accounts across Nigeria. Monitor showroom subscription tiers,
            audit inventory quota capacities, and execute administrative plan overrides.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setRefreshIndex((i) => i + 1)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Platform Accounts</span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {stats.dealersCount} Dealers • {stats.sellersCount} Sellers • {stats.buyersCount} Buyers
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Paid Subscriptions MRR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Active Subscription MRR</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₦{(stats.monthlyMRR / 1000).toLocaleString()}k
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              ₦{((stats.monthlyMRR * 12) / 1000000).toFixed(1)}M Annual Run-Rate (ARR)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Dealership Showroom Tiers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Active Dealerships</span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {stats.dealersCount}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {stats.paidDealersCount} on Paid Plans • {stats.dealersCount - stats.paidDealersCount} Starter
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Quota Utilization */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Showroom Inventory Quota</span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {stats.totalActiveListings} <span className="text-xs font-normal text-gray-400">Cars Listed</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Across verified dealer showroom lots
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or dealership..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          {/* Tier and Verification Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as TierFilter)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Subscription Tiers</option>
              <option value="starter">Starter Showroom (Free, 3 cars)</option>
              <option value="basic">Basic Shop (₦25k, 15 cars)</option>
              <option value="pro">Pro Shop (₦65k, 60 cars)</option>
              <option value="premium">Premium Hub (₦150k, Unlimited)</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900 w-3.5 h-3.5"
              />
              <span>Verified Accounts Only</span>
            </label>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
          {[
            { id: "all", label: "All Users", count: users.length },
            { id: "dealer", label: "Dealerships", count: stats.dealersCount },
            { id: "seller", label: "Private Sellers", count: stats.sellersCount },
            { id: "buyer", label: "Buyers", count: stats.buyersCount },
            { id: "technician", label: "Technicians", count: stats.techsCount },
            { id: "admin", label: "Super Admins", count: users.filter((u) => u.role === "admin").length },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedRole(pill.id as RoleFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedRole === pill.id
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-neutral-900"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedRole === pill.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Users & Subscriptions Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-neutral-900">
              User Directory &amp; Subscription Ledger
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              ({filteredUsers.length} account{filteredUsers.length === 1 ? "" : "s"} shown)
            </span>
          </div>

          <Link
            href="/admin/payments"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
          >
            <span>View Payments Ledger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">User &amp; Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Verification &amp; KYC</th>
                <th className="py-3.5 px-4">Active Subscription Plan</th>
                <th className="py-3.5 px-4">Inventory Quota Utilization</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-900" />
                    <span>Loading registered users &amp; subscription plans...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div className="text-sm font-bold text-neutral-900">No users match your criteria</div>
                    <p className="text-xs text-gray-500 mt-1">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleMeta = getRoleBadge(u.role);
                  const RoleIcon = roleMeta.icon;
                  const planMeta = getPlanBadge(u.subscription?.plan);
                  const PlanIcon = planMeta.icon;

                  const isDealer = u.role === "dealer" || Boolean(u.shop);
                  const limit = u.subscription?.listingsLimit || 3;
                  const activeCount = u.subscription?.activeListingsCount || 0;
                  const usagePercent = Math.min(100, Math.round((activeCount / (limit === 9999 ? 100 : limit)) * 100));

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* User & Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-neutral-900 truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.shop && (
                                <Link
                                  href={`/shops/${u.shop.slug}`}
                                  target="_blank"
                                  className="text-[10px] text-gray-400 hover:text-neutral-900"
                                  title="View Public Storefront"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleMeta.bg}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Verification & KYC */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            {u.isVerified ? (
                              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Email Verified
                              </span>
                            ) : (
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                Email Pending
                              </span>
                            )}
                          </div>

                          {u.shop && (
                            <div>
                              {u.shop.verifiedCAC ? (
                                <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                                  <Building2 className="w-2.5 h-2.5 text-emerald-600" />
                                  CAC Certified
                                </span>
                              ) : (
                                <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                                  CAC Pending
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Subscription Plan */}
                      <td className="py-4 px-4">
                        {isDealer || u.subscription ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${planMeta.bg}`}
                            >
                              <PlanIcon className="w-3 h-3" />
                              <span>{u.subscription?.plan || "Starter Showroom"}</span>
                            </span>

                            <div className="text-[11px] text-gray-500 font-medium">
                              {u.subscription?.price
                                ? `₦${u.subscription.price.toLocaleString()} / mo`
                                : "Free Tier (₦0)"}
                            </div>

                            {u.subscription?.status && (
                              <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                  u.subscription.status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : u.subscription.status === "grace_period"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {u.subscription.status.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Standard Buyer Account</span>
                        )}
                      </td>

                      {/* Inventory Quota Utilization */}
                      <td className="py-4 px-4">
                        {isDealer || u.subscription ? (
                          <div className="space-y-1.5 min-w-[140px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-neutral-900">
                                {activeCount} / {limit === 9999 ? "∞" : limit}
                              </span>
                              <span className="text-gray-400 text-[10px]">
                                {limit === 9999 ? "Unlimited" : `${usagePercent}%`}
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent >= 90
                                    ? "bg-rose-500"
                                    : usagePercent >= 60
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${limit === 9999 ? Math.min(100, activeCount * 5) : usagePercent}%` }}
                              />
                            </div>

                            <span className="text-[10px] text-gray-400 block">
                              Active vehicle listings
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-gray-500 font-medium">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Jan 2026"}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isDealer || u.role === "seller" ? (
                            <button
                              onClick={() => handleOpenEditPlan(u)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Override Plan</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenEditPlan(u)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                            >
                              Upgrade Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Override & Modification Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-neutral-900 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold mb-2">
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Admin Subscription Override</span>
              </div>
              <h3 className="text-xl font-black text-neutral-900">
                Modify Subscription Plan
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Account: <b>{selectedUser.name}</b> ({selectedUser.email})
              </p>
            </div>

            {toastMessage && (
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
                  toastMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {toastMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{toastMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              {/* Plan Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Subscription Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Starter Showroom", limit: 3, price: 0, tag: "Free" },
                    { name: "Basic Shop", limit: 15, price: 25000, tag: "₦25k/mo" },
                    { name: "Pro Shop", limit: 60, price: 65000, tag: "₦65k/mo" },
                    { name: "Premium Shop", limit: 9999, price: 150000, tag: "₦150k/mo" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handlePlanSelectionChange(p.name)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        targetPlan === p.name
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{p.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            targetPlan === p.name ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] block mt-1 ${
                          targetPlan === p.name ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {p.limit === 9999 ? "Unlimited listings" : `Up to ${p.limit} vehicles`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Quota Override */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Listing Quota Capacity Limit (Slots)
                </label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={customQuota}
                  onChange={(e) => setCustomQuota(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  You can grant custom listing slot allowances overriding the default tier limits.
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subscription Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="grace_period">Grace Period (7-Day Renewal Window)</option>
                  <option value="expired">Expired (Publishing Blocked)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingPlan}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Plan Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
