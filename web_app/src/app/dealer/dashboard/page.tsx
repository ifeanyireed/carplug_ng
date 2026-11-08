"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { Vehicle, Lead, DealerShop } from "@/data/mockStore";
import {
  fetchDealerInventory,
  fetchVehicles,
  fetchLeads,
  fetchConversations,
  fetchDealerBySlugOrId,
  fetchDealerSubscription,
  DealerSubscriptionResponse,
  Conversation,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  Users,
  Wrench,
  Star,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  CreditCard,
  MessageSquare,
} from "lucide-react";

export default function DealerDashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [shop, setShop] = useState<DealerShop | null>(null);
  const [subscription, setSubscription] = useState<DealerSubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dealerId = useMemo(() => {
    return user?.id || "dealer-reed-motors";
  }, [user?.id]);

  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        // Parallel fetch for dealer details, inventory, inbound leads, buyer messages, and subscription
        const [inventoryData, leadsData, convsData, shopData, subData] = await Promise.all([
          fetchDealerInventory(dealerId).catch(() => []),
          fetchLeads().catch(() => []),
          fetchConversations().catch(() => []),
          fetchDealerBySlugOrId(dealerId).catch(() => undefined),
          fetchDealerSubscription().catch(() => null),
        ]);

        if (!isMounted) return;

        if (subData) {
          setSubscription(subData);
        }

        if (inventoryData && inventoryData.length > 0) {
          setVehicles(inventoryData);
        } else {
          const allVehicles = await fetchVehicles().catch(() => []);
          if (!isMounted) return;
          const filtered = allVehicles.filter(
            (v) => (user?.id && v.sellerId === user.id) || v.sellerId === dealerId
          );
          setVehicles(filtered);
        }

        setLeads(leadsData || []);
        setConversations(convsData || []);

        if (shopData) {
          setShop(shopData);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to load dealer dashboard live data:", err);
        setVehicles([]);
        setLeads([]);
        setConversations([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [dealerId, refreshIndex, user?.id]);

  // Derived metrics with useMemo
  const metrics = useMemo(() => {
    const verifiedListings = vehicles.filter((v) => v.trustTier >= 4).length;
    const inspectionRequests = leads.filter((l) => l.type === "inspection_request").length;
    const viewingRequests = leads.filter((l) => l.type === "viewing_schedule").length;
    const unreadMessagesCount = conversations.reduce(
      (acc, c) => acc + (c.unreadCount || 0),
      0
    );
    return {
      activeListingsCount: vehicles.length,
      verifiedListings,
      totalLeads: leads.length,
      inspectionRequests,
      viewingRequests,
      totalConversations: conversations.length,
      unreadMessagesCount,
    };
  }, [vehicles, leads, conversations]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {shop?.plan || "Verified Dealer"}
            </span>
            <span className="text-xs text-gray-500">CAC Verified Dealership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mt-2 tracking-tight">
            Welcome back, {user?.name || shop?.name || "Dealer"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Lot Location: {shop?.address || "Lagos Showroom"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition flex items-center justify-center disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neutral-900" : ""}`} />
          </button>
          <Link
            href="/dealer/subscription"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
            <span>Plan &amp; Billing</span>
          </Link>
          <Link
            href={`/shops/${shop?.slug || "reed-motors-lagos"}`}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <span>Public Storefront</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dealer/vehicles/new"
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Listings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Active Listings</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {metrics.activeListingsCount}
            <span className="text-xs font-normal text-gray-400 ml-1">
              / {subscription?.listingsLimit ? (subscription.listingsLimit >= 9999 ? "Unlimited" : subscription.listingsLimit) : 60} max
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            {metrics.verifiedListings} listings carrying Certified Badges
          </div>
        </div>

        {/* Buyer Messages & Inquiries (New) */}
        <Link
          href="/dealer/messages"
          className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs space-y-2 transition block group"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Buyer Messages</span>
            <MessageSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <span>{metrics.totalConversations}</span>
            {metrics.unreadMessagesCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold animate-pulse">
                {metrics.unreadMessagesCount} unread
              </span>
            )}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold group-hover:underline flex items-center gap-1">
            <span>Open In-App Chat</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Inbound Leads */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inbound Leads</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{metrics.totalLeads}</div>
          <div className="text-[11px] text-amber-700 font-semibold">
            {metrics.viewingRequests} viewing appointments
          </div>
        </div>

        {/* Inspection Requests */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inspection Requests</span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{metrics.inspectionRequests}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            92% buyer conversion after report
          </div>
        </div>

        {/* Dealership Rating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Dealership Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{shop?.rating ?? "—"}</div>
          <div className="text-[11px] text-gray-500">Based on {shop?.reviewCount ?? 0} reviews</div>
        </div>
      </div>

      {/* In-App Direct Buyer Messages & Inquiries Feed */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base text-neutral-900">
              Direct Buyer Messages &amp; Inquiries
            </h2>
            {metrics.unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white">
                {metrics.unreadMessagesCount} Unread
              </span>
            )}
          </div>
          <Link
            href="/dealer/messages"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Open All Messages Inbox →</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            <span>Loading buyer conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 space-y-1">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-600">No buyer messages received yet</p>
            <p className="text-[11px] text-gray-400">
              When buyers click &apos;Contact Seller&apos; on your showroom cars, their inquiries will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.slice(0, 5).map((conv) => (
              <div
                key={conv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/70 rounded-xl px-2 -mx-2 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {conv.buyerName?.charAt(0) || "B"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 truncate">
                        {conv.buyerName || "Verified Buyer"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                          NEW
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        • {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">
                      Car: <b className="text-neutral-900">{conv.vehicleTitle}</b> (₦
                      {(conv.vehiclePrice / 1000000).toFixed(1)}M)
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 italic">
                      &quot;{conv.lastMessage || "Inquiry initiated..."}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Link
                    href={`/dealer/messages?id=${conv.id}`}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                  >
                    <span>Reply in Chat</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Inventory Snapshot */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-base text-neutral-900">
            Active Showroom Inventory
          </h2>
          <Link
            href="/dealer/vehicles"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage All Inventory →
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            <span>Loading active stock...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Car className="w-8 h-8 text-gray-300 mx-auto" />
            <div className="text-gray-500 text-xs font-semibold">No active listings in your lot yet</div>
            <Link
              href="/dealer/vehicles/new"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
            >
              + Add your first vehicle →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vehicles.map((car) => (
              <div
                key={car.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                    <Image
                      src={car.images?.[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg"}
                      alt={car.title}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{car.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>₦{(car.price / 1000000).toFixed(1)}M</span>
                      <span>•</span>
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/buyer/vehicles/${car.id}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
                  >
                    View Live
                  </Link>
                  <Link
                    href={`/dealer/vehicles/new`}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    Edit / Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inbound Leads Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-base text-neutral-900">
            Recent Inbound Buyer Leads
          </h2>
          <Link
            href="/dealer/leads"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            All Leads Board →
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No inbound buyer leads yet. Inquiries will appear here when buyers contact your showroom.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Buyer</th>
                  <th className="pb-3">Target Car</th>
                  <th className="pb-3">Inquiry Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-neutral-900">
                      {lead.buyerName}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        {lead.buyerCity}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-gray-700">{lead.vehicleTitle}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {lead.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/dealer/messages`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Respond →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
