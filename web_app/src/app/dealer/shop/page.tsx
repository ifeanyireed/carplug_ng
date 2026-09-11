"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_SHOPS, DealerShop } from "@/data/mockStore";
import { fetchDealerMeShop, updateDealerShop } from "@/services/api";
import { ShieldCheck, Save, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";

export default function DealerShopSettingsPage() {
  const [shop, setShop] = useState<DealerShop>(MOCK_SHOPS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: MOCK_SHOPS[0].name,
    tagline: MOCK_SHOPS[0].tagline,
    location: MOCK_SHOPS[0].location,
    address: MOCK_SHOPS[0].address,
    phone: MOCK_SHOPS[0].phone,
    whatsapp: MOCK_SHOPS[0].whatsapp,
    email: MOCK_SHOPS[0].email,
    operatingHours: MOCK_SHOPS[0].operatingHours,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadShop() {
      try {
        const data = await fetchDealerMeShop();
        if (!isMounted) return;
        if (data) {
          setShop(data);
          setForm({
            name: data.name || "",
            tagline: data.tagline || "",
            location: data.location || "",
            address: data.address || "",
            phone: data.phone || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            operatingHours: data.operatingHours || "",
          });
        }
      } catch (err) {
        console.warn("Failed to fetch dealer shop from API:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateDealerShop(shop.id, form);
      if (updated) {
        setShop(updated);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      console.error("Failed to update dealer shop:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to update storefront settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
        <span className="text-xs font-semibold">Loading dealership storefront...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {shop.verifiedCAC ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CAC Verified Dealership</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>CAC Verification Pending</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Dealer Shop Storefront</h1>
          <p className="text-xs text-gray-500 mt-1">
            Public brand profile, showroom location, and customer contact credentials
          </p>
        </div>

        <Link
          href={`/shops/${shop.slug}`}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <span>View Public Storefront</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
            ✓ Storefront settings updated and published successfully!
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Dealership Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Public Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Zone Area</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Operating Hours</label>
            <input
              type="text"
              value={form.operatingHours}
              onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Exact Showroom Physical Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
