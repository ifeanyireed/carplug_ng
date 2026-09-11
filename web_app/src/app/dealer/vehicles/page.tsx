"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { PriceRatingBadge } from "@/components/common/PriceRatingBadge";
import { Vehicle, MOCK_VEHICLES } from "@/data/mockStore";
import { fetchDealerInventory, fetchVehicles, deleteVehicle } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function DealerVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Active dealer identifier: use logged-in user or default seeded dealer shop
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

    async function fetchInventory() {
      try {
        // Fetch dealer's dedicated inventory first
        const data = await fetchDealerInventory(dealerId);
        if (!isMounted) return;

        if (data && data.length > 0) {
          setVehicles(data);
        } else {
          // Fallback to general vehicle fetch or mock if database has no records for this dealer
          const allVehicles = await fetchVehicles();
          if (!isMounted) return;
          const matched = allVehicles.filter(
            (v) => v.sellerId === dealerId || v.sellerType === "dealer"
          );
          setVehicles(matched.length > 0 ? matched : MOCK_VEHICLES);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to load inventory from API, fallback to mock:", err);
        setError("Could not synchronize with cloud inventory. Showing local cached listings.");
        setVehicles(MOCK_VEHICLES);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, [dealerId, refreshIndex]);

  // Filtered vehicles with useMemo
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((car) => {
      const matchesSearch =
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCondition =
        selectedCondition === "all" ||
        (selectedCondition === "tokunbo" && car.condition.toLowerCase().includes("tokunbo")) ||
        (selectedCondition === "nigerian_used" && car.condition.toLowerCase().includes("nigerian"));

      return matchesSearch && matchesCondition;
    });
  }, [vehicles, searchTerm, selectedCondition]);

  // Inventory stats with useMemo
  const inventoryStats = useMemo(() => {
    const totalValue = filteredVehicles.reduce((acc, car) => acc + (car.price || 0), 0);
    const verifiedCount = filteredVehicles.filter((car) => car.trustTier >= 4).length;
    return {
      totalCount: filteredVehicles.length,
      totalValueNaira: `₦${(totalValue / 1000000).toFixed(1)}M`,
      verifiedCount,
    };
  }, [filteredVehicles]);

  const handleDelete = async (carId: string, carTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove "${carTitle}" from showroom inventory?`)) {
      return;
    }
    setIsDeletingId(carId);
    try {
      await deleteVehicle(carId);
      setVehicles((prev) => prev.filter((c) => c.id !== carId));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Showroom Inventory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Live cloud stock from your dealership • {inventoryStats.totalCount} active listings (Total value: {inventoryStats.totalValueNaira})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition flex items-center justify-center disabled:opacity-50"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-neutral-900" : ""}`} />
          </button>
          <Link
            href="/dealer/vehicles/new"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your inventory by make, model or VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:bg-white"
          >
            <option value="all">All Conditions</option>
            <option value="tokunbo">Tokunbo Only</option>
            <option value="nigerian_used">Nigerian Used</option>
          </select>

          <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
            Showing {filteredVehicles.length} of {vehicles.length} listings
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            <span className="text-xs font-semibold">Synchronizing showroom inventory with live database...</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="text-gray-400 text-sm font-semibold">No vehicles found</div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? "No vehicle matches your search term. Try checking for typos or clear the search filter."
                : "Your dealership currently has no active listings. Click below to add your first car."}
            </p>
            <Link
              href="/dealer/vehicles/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Asking Price</th>
                  <th className="p-4">Trust Tier</th>
                  <th className="p-4">Health Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={car.images?.[0] || "/images/cars/car1.jpeg"}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 line-clamp-1">
                            {car.title}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            VIN: {car.vin}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px]">
                        {car.condition}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-neutral-900">
                        {formatNaira(car.price)}
                      </div>
                      <PriceRatingBadge rating={car.priceRating} size="sm" />
                    </td>

                    <td className="p-4">
                      <TrustTierBadge tier={car.trustTier} size="sm" />
                    </td>

                    <td className="p-4">
                      {car.healthScore ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                          {car.healthScore}% Certified
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Pending Inspection</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/buyer/vehicles/${car.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-neutral-900 transition"
                          title="View Public Listing"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dealer/vehicles/new?edit=${car.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-neutral-900 transition"
                          title="Edit Vehicle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id, car.title)}
                          disabled={isDeletingId === car.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                          title="Delete Vehicle"
                        >
                          {isDeletingId === car.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
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
