"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DealerShop } from "@/data/mockStore";
import {
  fetchDealerMeShop,
  updateDealerShop,
  fetchMyVerifications,
  submitVerification,
  uploadVehicleImages,
  VerificationItem,
} from "@/services/api";
import {
  ShieldCheck,
  Save,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  Upload,
  Building2,
} from "lucide-react";

export default function DealerShopSettingsPage() {
  const [shop, setShop] = useState<DealerShop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CAC verification state
  const [cacVerif, setCacVerif] = useState<VerificationItem | null>(null);
  const [cacRcNumber, setCacRcNumber] = useState("");
  const [cacDocUrl, setCacDocUrl] = useState<string | null>(null);
  const [cacDocName, setCacDocName] = useState<string | null>(null);
  const [isUploadingCac, setIsUploadingCac] = useState(false);
  const [isSubmittingCac, setIsSubmittingCac] = useState(false);
  const [cacMessage, setCacMessage] = useState<string | null>(null);
  const cacFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    location: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    operatingHours: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadShopAndVerif() {
      try {
        const [data, verifs] = await Promise.all([
          fetchDealerMeShop().catch(() => null),
          fetchMyVerifications({ entityType: "dealer_cac" }).catch(() => ({ data: [] })),
        ]);

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

        if (verifs && verifs.data && verifs.data.length > 0) {
          setCacVerif(verifs.data[0]);
        }
      } catch (err) {
        console.warn("Failed to fetch dealer shop and verifications:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadShopAndVerif();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
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

  const handleCacFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCac(true);
    setCacMessage(null);
    try {
      const urls = await uploadVehicleImages([file], "carplug/verifications");
      if (urls.length > 0) {
        setCacDocUrl(urls[0]);
        setCacDocName(file.name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document upload failed.";
      setCacMessage(msg);
    } finally {
      setIsUploadingCac(false);
    }
  };

  const handleSubmitCac = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cacRcNumber.trim()) {
      setCacMessage("Please enter your CAC Registration Number (RC or BN).");
      return;
    }
    if (!cacDocUrl) {
      setCacMessage("Please upload a photograph or PDF of your CAC Certificate.");
      return;
    }

    setIsSubmittingCac(true);
    setCacMessage(null);

    try {
      const created = await submitVerification({
        entityType: "dealer_cac",
        documentUrl: cacDocUrl,
        vin: `CAC: ${cacRcNumber.trim()}`,
        notes: `CAC Certificate submitted for dealership: ${form.name || shop?.name || "Dealership"}`,
      });
      setCacVerif(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "CAC submission failed. Please try again.";
      setCacMessage(msg);
    } finally {
      setIsSubmittingCac(false);
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

  const isCacVerified = shop?.verifiedCAC || cacVerif?.status === "approved";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCacVerified ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CAC Verified Dealership</span>
              </span>
            ) : cacVerif?.status === "pending" ? (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>CAC Verification Under Review</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Commercial Dealership</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Dealer Shop Storefront</h1>
          <p className="text-xs text-gray-500 mt-1">
            Public brand profile, showroom location, and customer contact credentials
          </p>
        </div>

        {shop?.slug && (
          <Link
            href={`/shops/${shop.slug}`}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-neutral-900 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <span>View Public Storefront</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* CAC Corporate Accreditation Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              CAC Corporate Accreditation
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified Corporate Affairs Commission (CAC) certificate unlocks the verified dealership badge across all vehicle listings.
            </p>
          </div>
        </div>

        {isCacVerified ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-emerald-950">CAC Verified Dealership</div>
                <div className="text-[10px] text-emerald-700">Official corporate business registration verified by compliance</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-extrabold">Active Badge</span>
          </div>
        ) : cacVerif?.status === "pending" ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-amber-950">CAC Documents Under Compliance Audit</div>
                <div className="text-[10px] text-amber-700">Submitted on {new Date(cacVerif.createdAt).toLocaleDateString()} — review turnaround is within 24 hours</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">Pending</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitCac} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            {cacMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cacMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CAC Registration Number (RC / BN)
                </label>
                <input
                  type="text"
                  required
                  value={cacRcNumber}
                  onChange={(e) => setCacRcNumber(e.target.value)}
                  placeholder="e.g. RC 1849204"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload CAC Certificate Photo or PDF
                </label>
                <input
                  ref={cacFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleCacFileUpload}
                  className="hidden"
                />

                {cacDocUrl ? (
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-semibold truncate max-w-[180px]">{cacDocName || "Document Attached"}</span>
                    <button
                      type="button"
                      onClick={() => cacFileInputRef.current?.click()}
                      className="text-emerald-700 underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => cacFileInputRef.current?.click()}
                    disabled={isUploadingCac}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition"
                  >
                    {isUploadingCac ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select Certificate File</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingCac || isUploadingCac}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingCac ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit CAC for Verification</span>
              )}
            </button>
          </form>
        )}
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Showroom Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Operating Hours</label>
          <input
            type="text"
            value={form.operatingHours}
            onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
            placeholder="e.g. Mon - Sat: 8:00 AM - 6:00 PM"
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
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
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
