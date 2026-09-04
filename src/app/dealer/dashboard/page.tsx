import React from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { MOCK_VEHICLES, MOCK_LEADS, MOCK_SHOPS } from "@/data/mockStore";
import {
  Car,
  Users,
  Wrench,
  TrendingUp,
  Star,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function DealerDashboardPage() {
  const shop = MOCK_SHOPS[0];
  const dealerVehicles = MOCK_VEHICLES.filter((v) => v.sellerId === shop.id);
  const leads = MOCK_LEADS.filter((l) => l.sellerId === shop.id);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {shop.plan}
            </span>
            <span className="text-xs text-gray-500">CAC Verified Dealership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
            Welcome back, {shop.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Lot Location: {shop.address}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shops/reed-motors-lagos"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Active Listings</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {dealerVehicles.length}
            <span className="text-xs font-normal text-gray-400 ml-1">/ 60 max</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            All listings carrying Trust Badges
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inbound Leads</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{leads.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold">
            3 unread verified inquiries
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Inspection Requests</span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">12</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            92% buyer conversion after report
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Dealership Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{shop.rating}</div>
          <div className="text-[11px] text-gray-500">Based on {shop.reviewCount} customer reviews</div>
        </div>
      </div>

      {/* Active Inventory Snapshot */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="font-bold text-base text-neutral-900">
            Active Showroom Inventory
          </h2>
          <Link
            href="/dealer/vehicles"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage All Inventory →
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {dealerVehicles.map((car) => (
            <div
              key={car.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className="w-full h-full object-cover"
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
      </div>

      {/* Inbound Leads Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="font-bold text-base text-neutral-900">
            Recent Inbound Buyer Leads
          </h2>
          <Link
            href="/dealer/leads"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            All Leads Board →
          </Link>
        </div>

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
      </div>
    </div>
  );
}
