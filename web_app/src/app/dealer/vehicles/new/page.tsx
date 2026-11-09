"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Vehicle } from "@/data/mockStore";
import { createVehicle, updateVehicle, fetchVehicleById, uploadVehicleImages, fetchValuationEstimate, ValuationEstimateResult, fetchDealerSubscription } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Wrench,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from "lucide-react";

function AddVehicleWizardContent() {
  const { user, upgradeRole } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") || searchParams.get("id");
  const isEditMode = Boolean(editId);
  const qStep = searchParams.get("step");

  const [currentStep, setCurrentStep] = useState(() => {
    if (qStep) {
      const parsed = parseInt(qStep, 10);
      if (parsed >= 1 && parsed <= 10) return parsed;
    }
    return 1;
  });
  const [published, setPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingCustomsDoc, setIsUploadingCustomsDoc] = useState(false);
  const [customsDocError, setCustomsDocError] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(() => Boolean(editId));
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [originalVehicle, setOriginalVehicle] = useState<Vehicle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customsFileInputRef = useRef<HTMLInputElement>(null);
  const [priceValuation, setPriceValuation] = useState<ValuationEstimateResult | null>(null);
  const [isEvaluatingPrice, setIsEvaluatingPrice] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{
    isAtQuota: boolean;
    activeCount: number;
    limit: number;
    planName: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role === "dealer" && !isEditMode) {
      fetchDealerSubscription()
        .then((data) => {
          if (data) {
            const isAtQuota = data.activeListingsCount >= data.listingsLimit && data.listingsLimit < 9999;
            setQuotaInfo({
              isAtQuota,
              activeCount: data.activeListingsCount,
              limit: data.listingsLimit,
              planName: data.subscription?.plan || "Starter Showroom",
            });
          }
        })
        .catch(() => null);
    }
  }, [user?.role, isEditMode]);

  const [formData, setFormData] = useState(() => {
    const qMake = searchParams.get("make");
    const qModel = searchParams.get("model");
    const qYear = searchParams.get("year");
    const qMileage = searchParams.get("mileage");
    const qCondition = searchParams.get("condition");
    const qAskingPrice = searchParams.get("askingPrice");
    const qVin = searchParams.get("vin");
    const qTrim = searchParams.get("trim");

    return {
      // Step 1: Basic details
      make: qMake || "Mercedes-Benz",
      model: qModel || "GLC 300",
      year: qYear || "2021",
      trim: qTrim || (qMake?.toLowerCase().includes("toyota") ? "Standard AWD" : "4MATIC AMG Line"),
      bodyType: "SUV",
      // Step 2: Condition
      condition: qCondition || "Foreign Used (Tokunbo)",
      // Step 3: Location
      locationZone: "Lekki Phase 1, Lagos",
      exactAddress: "Plot 14 Admiralty Way",
      // Step 4: Specs
      mileage: qMileage || "32000",
      transmission: "Automatic",
      engineSize: qMake?.toLowerCase().includes("toyota") ? "3.5L V6 DOHC" : "2.0L Turbo Inline-4",
      fuelType: "Petrol",
      // Step 5: Customs & Docs
      vin: qVin || (qMake?.toLowerCase().includes("toyota") ? "2T2BZMCA9JC108421" : "WDC2539841F901823"),
      customsCleared: true,
      originalReceipt: true,
      customsDocUrl: "",
      customsDocFileName: "",
      // Step 6: Photos & Cloudinary Images
      images: [] as string[],
      // Step 7: Pricing
      askingPrice: qAskingPrice || "42000000",
      negotiable: true,
      // Step 8: Faults disclosure
      disclosedFaults: "Minor front bumper stone chips. Interior pristine.",
      // Step 9: Pre-inspection opt-in
      preInspectionOptIn: true,
    };
  });

  useEffect(() => {
    if (!editId) return;

    let isSubscribed = true;
    fetchVehicleById(editId)
      .then((car) => {
        if (!isSubscribed) return;
        if (car) {
          setOriginalVehicle(car);
          setFormData({
            make: car.make || "",
            model: car.model || "",
            year: String(car.year || 2021),
            trim: car.trim || "",
            bodyType: car.bodyType || "SUV",
            condition: car.condition || "Foreign Used (Tokunbo)",
            locationZone: car.publicLocation || "Lagos, Nigeria",
            exactAddress: car.exactLocation || "",
            mileage: String(car.mileage || 0),
            transmission: car.transmission || "Automatic",
            engineSize: car.engineSize || "",
            fuelType: car.fuelType || "Petrol",
            vin: car.vin || "",
            customsCleared: car.documentsAvailable?.customsDoc ?? true,
            originalReceipt: car.documentsAvailable?.registrationDoc ?? true,
            customsDocUrl: car.documentsAvailable?.customsDocUrl || "",
            customsDocFileName: car.documentsAvailable?.customsDocUrl ? "Customs_SGD_Declaration.pdf" : "",
            images: Array.isArray(car.images) && car.images.length > 0 ? car.images : [],
            askingPrice: String(car.price || 0),
            negotiable: true,
            disclosedFaults: "",
            preInspectionOptIn: car.trustTier >= 4,
          });
        } else {
          setFetchError(`Vehicle listing with ID "${editId}" could not be found.`);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setFetchError(`Error loading vehicle: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingExisting(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [editId]);

  const handleCustomsDocSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setCustomsDocError("File size exceeds 10MB limit. Please select a document under 10MB.");
      if (e.target) e.target.value = "";
      return;
    }

    setIsUploadingCustomsDoc(true);
    setCustomsDocError(null);

    try {
      const urls = await uploadVehicleImages([file], "carplug/documents");
      if (urls && urls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          customsDocUrl: urls[0],
          customsDocFileName: file.name,
          customsCleared: true,
        }));
      }
    } catch (err: unknown) {
      console.error("Customs document upload error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to upload customs document. Please try again or verify file format.";
      setCustomsDocError(errorMessage);
    } finally {
      setIsUploadingCustomsDoc(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveCustomsDoc = () => {
    setFormData((prev) => ({
      ...prev,
      customsDocUrl: "",
      customsDocFileName: "",
    }));
  };

  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    setUploadError(null);
    try {
      const urls = await uploadVehicleImages(Array.from(files), "carplug/vehicles");
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch (err: unknown) {
      console.error("Cloudinary upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload photo(s) to Cloudinary";
      setUploadError(errorMessage);
    } finally {
      setIsUploadingImages(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  useEffect(() => {
    if (currentStep !== 7) return;

    let isSubscribed = true;
    const timer = setTimeout(() => {
      setIsEvaluatingPrice(true);
      fetchValuationEstimate({
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || 2021,
        condition: formData.condition,
        mileage: Number(formData.mileage) || 30000,
        askingPrice: Number(formData.askingPrice) || undefined,
      })
        .then((res) => {
          if (isSubscribed && res) setPriceValuation(res);
        })
        .catch(() => {})
        .finally(() => {
          if (isSubscribed) setIsEvaluatingPrice(false);
        });
    }, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [currentStep, formData.askingPrice, formData.make, formData.model, formData.year, formData.condition, formData.mileage]);

  const steps = [
    "Vehicle Identity",
    "Condition Category",
    "Public Zone & Location",
    "Powertrain & Mileage",
    "Customs Papers & VIN",
    "Photos & Walkaround Video",
    "Pricing & Market Valuation",
    "Fault Disclosures",
    "Pre-Inspection Dispatch",
    "Review & Publish",
  ];

  const handleNext = async () => {
    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsPublishing(true);
      setPublishError(null);
      try {
        // Prompts.md requirement 4: If signed in as buyer, seamlessly upgrade to seller first
        if (user?.role === "buyer") {
          try {
            await upgradeRole("seller");
          } catch (upgradeErr) {
            console.error("Failed to upgrade role to seller:", upgradeErr);
            throw new Error(
              upgradeErr instanceof Error
                ? upgradeErr.message
                : "Unable to activate seller account. Please check your network and try again."
            );
          }
        }

        if (isEditMode && editId) {
          await updateVehicle(editId, {
            title: `${formData.year} ${formData.make} ${formData.model} ${formData.trim}`.trim(),
            year: Number(formData.year) || originalVehicle?.year || 2021,
            make: formData.make,
            model: formData.model,
            trim: formData.trim,
            bodyType: formData.bodyType,
            condition: formData.condition as Vehicle["condition"],
            mileage: Number(formData.mileage) || originalVehicle?.mileage || 30000,
            transmission: formData.transmission as Vehicle["transmission"],
            fuelType: formData.fuelType as Vehicle["fuelType"],
            engineSize: formData.engineSize,
            vin: formData.vin,
            price: Number(formData.askingPrice) || originalVehicle?.price || 35000000,
            images: formData.images.length > 0 ? formData.images : originalVehicle?.images,
            publicLocation: formData.locationZone,
            exactLocation: formData.exactAddress,
            customsStatus: formData.customsCleared ? "Fully Cleared" : "Local Registration",
            documentsAvailable: {
              customsDoc: formData.customsCleared,
              registrationDoc: formData.originalReceipt,
              roadworthiness: true,
              tintPermit: false,
              policeExtracted: false,
              customsDocUrl: formData.customsDocUrl || undefined,
            },
          });
        } else {
          const generatedId = `v-${formData.make.toLowerCase().replace(/\s+/g, "-")}-${formData.model.toLowerCase().replace(/\s+/g, "-")}-${String(Date.now()).slice(-6)}`;
          await createVehicle({
            id: generatedId,
            title: `${formData.year} ${formData.make} ${formData.model} ${formData.trim}`.trim(),
            year: Number(formData.year) || 2021,
            make: formData.make,
            model: formData.model,
            trim: formData.trim,
            bodyType: formData.bodyType,
            condition: formData.condition as Vehicle["condition"],
            mileage: Number(formData.mileage) || 30000,
            transmission: formData.transmission as Vehicle["transmission"],
            fuelType: formData.fuelType as Vehicle["fuelType"],
            engineSize: formData.engineSize,
            vin: formData.vin,
            price: Number(formData.askingPrice) || 35000000,
            priceRating: "fair",
            trustTier: formData.preInspectionOptIn ? 4 : 2,
            trustTierLabel: formData.preInspectionOptIn
              ? "Tier 4: Comprehensive Tech Inspected"
              : "Tier 2: Verification In Progress",
            images: formData.images.length > 0 ? formData.images : ["https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679189/carplug/cars/car18.jpg"],
            publicLocation: formData.locationZone,
            exactLocation: formData.exactAddress,
            sellerType: user?.role === "dealer" ? "dealer" : "private",
            sellerRating: 5.0,
            customsStatus: formData.customsCleared ? "Fully Cleared" : "Local Registration",
            documentsAvailable: {
              customsDoc: formData.customsCleared,
              registrationDoc: formData.originalReceipt,
              roadworthiness: true,
              tintPermit: false,
              policeExtracted: false,
              customsDocUrl: formData.customsDocUrl || undefined,
            },
            healthScore: formData.preInspectionOptIn ? 92 : 0,
            featured: false,
          });
        }
        setPublished(true);
      } catch (err) {
        console.error("Failed to publish vehicle listing:", err);
        setPublishError(
          err instanceof Error
            ? err.message
            : "Failed to publish vehicle listing. Please try again."
        );
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {isEditMode ? "Inventory Listing Editor" : "10-Step Publishing Pipeline"}
            </span>
            <h1 className="text-2xl font-black text-neutral-900 mt-1">
              {isEditMode ? "Edit Vehicle Listing" : "Add Vehicle to Showroom"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode
                ? "Update vehicle specifications, pricing, documents, or showroom photos."
                : "Listings climb the Trust Ladder as verified documentation is uploaded."}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-gray-400">Step {currentStep} of 10</span>
            <div className="font-extrabold text-sm text-neutral-900 mt-0.5">
              {steps[currentStep - 1]}
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-10 gap-1.5 pt-4">
          {steps.map((stepName, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx + 1)}
              title={`Step ${idx + 1}: ${stepName}`}
              className={`h-2 rounded-full transition cursor-pointer hover:opacity-80 ${
                idx + 1 <= currentStep ? "bg-neutral-900" : "bg-gray-100 hover:bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Showroom Quota Warning */}
      {quotaInfo?.isAtQuota && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Showroom Listing Quota Reached</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Your dealership has reached the capacity limit of <b>{quotaInfo.activeCount} / {quotaInfo.limit}</b> active vehicles under your <b>{quotaInfo.planName}</b> plan. Upgrade your plan to list additional inventory.
              </p>
            </div>
          </div>
          <Link
            href="/dealer/subscription"
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shrink-0 transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Wizard Content Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        {published ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900">
              {isEditMode ? "Listing Updated Successfully!" : "Vehicle Published at Tier 4!"}
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {isEditMode
                ? `Your modifications to the ${formData.year} ${formData.make} ${formData.model} have been synchronized live with the mycarsNg marketplace.`
                : `Your ${formData.year} ${formData.make} ${formData.model} is now live on the marketplace. Customs documents have been queued for administrative seal, and pre-inspection dispatch has been triggered.`}
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/dealer/vehicles"
                className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800"
              >
                Go to Active Inventory
              </Link>
              <Link
                href={isEditMode && editId ? `/buyer/vehicles/${editId}` : "/buyer/search"}
                className="px-5 py-2.5 bg-gray-100 text-neutral-900 font-semibold text-xs rounded-xl hover:bg-gray-200"
              >
                {isEditMode ? "View Public Listing" : "View on Marketplace"}
              </Link>
            </div>
          </div>
        ) : isLoadingExisting ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            <span className="text-xs font-semibold">Loading vehicle listing details...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-sm font-bold text-neutral-900">{fetchError}</div>
            <Link
              href="/dealer/vehicles"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold mt-2"
            >
              <span>Back to Showroom Inventory</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 1: Vehicle Make, Model, Year & Trim
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Trim / Edition</label>
                    <input
                      type="text"
                      value={formData.trim}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 2: Condition Classification (Nigerian Market)
                </h3>
                <div className="space-y-3">
                  {[
                    { id: "Foreign Used (Tokunbo)", desc: "Direct foreign import with port customs clearance" },
                    { id: "Nigerian Used", desc: "Registered and previously driven in Nigeria with plate history" },
                    { id: "Brand New", desc: "Zero-mileage factory fresh vehicle with manufacturer certificate" },
                  ].map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setFormData({ ...formData, condition: c.id as Vehicle["condition"] })}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        formData.condition === c.id
                          ? "bg-blue-50/70 border-blue-500 shadow-xs"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-bold text-sm text-neutral-900">{c.id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 3: Public Privacy Zone vs Exact Lot Address
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Public Zone (Shown on Marketplace Search)
                    </label>
                    <input
                      type="text"
                      value={formData.locationZone}
                      onChange={(e) => setFormData({ ...formData, locationZone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Exact Showroom Address (Masked until inspection/viewing booked)
                    </label>
                    <input
                      type="text"
                      value={formData.exactAddress}
                      onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 4: Mileage, Transmission & Powertrain
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Odometer Mileage (mi)</label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Engine Size</label>
                    <input
                      type="text"
                      value={formData.engineSize}
                      onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    Step 5: Customs Documentation & VIN (Unlocks Tier 2)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload official Nigerian Customs Service (NCS) entry documentation and provide the 17-digit VIN to unlock Tier 2 platform verification.
                  </p>
                </div>

                {/* Hidden File Input for Customs SGD Document */}
                <input
                  ref={customsFileInputRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleCustomsDocSelected}
                  className="hidden"
                />

                {/* Upload Error Banner */}
                {customsDocError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{customsDocError}</span>
                  </div>
                )}

                {/* Customs Document Upload Zone / Uploaded Preview */}
                {formData.customsDocUrl ? (
                  <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-neutral-900 truncate max-w-xs">
                            {formData.customsDocFileName || "Customs_SGD_Declaration.pdf"}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SGD Attached
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Uploaded to Cloudinary CDN & queued for CarPlug administrative verification
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={formData.customsDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-800 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        <span>View</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => customsFileInputRef.current?.click()}
                        disabled={isUploadingCustomsDoc}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCustomsDoc}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingCustomsDoc && customsFileInputRef.current?.click()}
                    className={`p-6 sm:p-8 bg-gray-50 hover:bg-gray-100/80 border-2 border-dashed ${
                      isUploadingCustomsDoc ? "border-neutral-400 cursor-wait" : "border-gray-300 hover:border-gray-400 cursor-pointer"
                    } rounded-2xl text-center space-y-3 transition`}
                  >
                    {isUploadingCustomsDoc ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2 text-neutral-800">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
                        <span className="text-xs font-bold">Uploading Customs Document to Cloudinary...</span>
                        <span className="text-[11px] text-gray-500">Encrypting document for compliance review</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                          <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-neutral-900">
                            Upload Federal Customs Single Goods Declaration (SGD) & Release
                          </div>
                          <p className="text-[11px] text-gray-500">
                            PDF, JPG, PNG or WEBP up to 10MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            customsFileInputRef.current?.click();
                          }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Browse File</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* VIN Input Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      17-Digit Vehicle Identification Number (VIN)
                    </label>
                    {formData.vin.length === 17 ? (
                      <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Valid 17-Character Format
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px] font-medium">
                        {formData.vin.length}/17 characters
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={17}
                    value={formData.vin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17),
                      })
                    }
                    placeholder="e.g. 2T2BZMCA9JC108421"
                    className="w-full px-3.5 py-2.5 font-mono tracking-wider uppercase bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    VIN must match the chassis number on your customs clearance papers and vehicle dashboard plate.
                  </p>
                </div>

                {/* Verification Checkboxes */}
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-start gap-3 p-3.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-2xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.customsCleared}
                      onChange={(e) => setFormData({ ...formData, customsCleared: e.target.checked })}
                      className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-neutral-900 block">
                        Customs Duties Fully Cleared at Port
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-relaxed">
                        Vehicle has authentic NCS Single Goods Declaration (SGD), C-Number, Assessment Notice, and Bank Payment Teller.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-2xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.originalReceipt}
                      onChange={(e) => setFormData({ ...formData, originalReceipt: e.target.checked })}
                      className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-neutral-900 block">
                        Original Purchase Receipt & Bill of Lading Available
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-relaxed">
                        Shipper Bill of Lading or original dealer invoice is on file to verify lawful ownership chain.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Tier 2 Benefit Badge */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-900">Tier 2 Platform Verification</p>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      Customs documentation and VIN verification elevates this vehicle to <strong>Tier 2 Verified</strong> status. Verified listings stand out in marketplace searches, enjoy priority search ranking, and give buyers 100% confidence against customs impoundment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-neutral-900">
                    Step 6: High-Res Photos & Walkaround Video
                  </h3>
                  {formData.images.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      {formData.images.length} photo{formData.images.length === 1 ? "" : "s"} uploaded
                    </span>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Trigger Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 bg-gray-50 hover:bg-gray-100/80 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-2xl text-center space-y-2 cursor-pointer transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/heic,image/jpg"
                    onChange={handleImageFilesSelected}
                    className="hidden"
                  />
                  {isUploadingImages ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-2 text-neutral-800">
                      <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
                      <div className="text-xs font-bold">Uploading photos to Cloudinary...</div>
                      <p className="text-[11px] text-gray-500">Auto-compressing and generating WebP variants</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div className="text-xs font-bold text-neutral-900">
                        Click to Choose Photos or Drag & Drop Here
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Supports JPG, PNG, WEBP, HEIC up to 50MB total.
                      </p>
                    </>
                  )}
                </div>

                {/* Uploaded Photos Grid */}
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-600">Uploaded Gallery Previews:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group shadow-xs"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Car photo ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 7: Asking Price & Price Intelligence Rating
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Showroom Asking Price (₦ Naira)
                  </label>
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                    placeholder="e.g. 42000000"
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-extrabold text-neutral-900 focus:bg-white focus:outline-none"
                  />

                  {priceValuation ? (
                    <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">Projected Price Rating:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            priceValuation.priceRating === "great"
                              ? "bg-emerald-100 text-emerald-800"
                              : priceValuation.priceRating === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {priceValuation.priceRating === "great"
                            ? "🟢 Great Price"
                            : priceValuation.priceRating === "high"
                            ? "🟠 Above Market"
                            : "🔵 Fair Market Value"}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-medium">
                        Market Range: ₦{(priceValuation.marketPriceMin / 1000000).toFixed(1)}M – ₦{(priceValuation.marketPriceMax / 1000000).toFixed(1)}M (Median ₦{(priceValuation.medianPrice / 1000000).toFixed(1)}M)
                      </div>
                      <p className="text-[11px] text-neutral-700 italic leading-relaxed">
                        &ldquo;{priceValuation.priceVerdict}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <span className="block text-[11px] text-gray-500 mt-1.5">
                      {isEvaluatingPrice
                        ? "Evaluating live market comps..."
                        : "✓ Dynamically calibrated against verified Nigerian dealer transactions and customs duties."}
                    </span>
                  )}
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 8: Transparent Fault Disclosures
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Disclose known cosmetic or mechanical defects
                  </label>
                  <textarea
                    rows={4}
                    value={formData.disclosedFaults}
                    onChange={(e) => setFormData({ ...formData, disclosedFaults: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none leading-relaxed"
                  />
                  <span className="block text-[11px] text-gray-400 mt-1">
                    Disclosing defects prevents inspection deal dropouts and elevates trust score.
                  </span>
                </div>
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 9: Pre-Inspection Dispatch (Unlocks Tier 4 & 5)
                </h3>
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
                  <Wrench className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 space-y-1">
                    <div className="font-bold text-sm">
                      Dispatch an Independent Technician to your Lot
                    </div>
                    <p className="text-blue-800 leading-relaxed">
                      Pre-inspected dealer vehicles receive 4x more viewings and sell 18 days faster on average. mycarsNg handles technician dispatch automatically.
                    </p>
                    <label className="flex items-center gap-2 pt-2 font-bold text-neutral-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preInspectionOptIn}
                        onChange={(e) =>
                          setFormData({ ...formData, preInspectionOptIn: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Yes, dispatch pre-inspection before publishing (₦25,000 billed to shop wallet)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-neutral-900">
                  Step 10: Final Review & Publish
                </h3>

                {user?.role === "buyer" && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold">1-Click Free Seller Account Activation</p>
                      <p className="text-amber-700 leading-relaxed">
                        You are currently signed in as a <strong>Buyer</strong>. Publishing this vehicle will instantly activate your free <strong>Private Seller</strong> account and publish your listing in one seamless action with zero setup required.
                      </p>
                    </div>
                  </div>
                )}

                {quotaInfo?.isAtQuota && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Dealership quota reached ({quotaInfo.activeCount}/{quotaInfo.limit} listings). Upgrade subscription to publish this vehicle.</span>
                    </div>
                    <Link
                      href="/dealer/subscription"
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 shrink-0 self-start sm:self-auto"
                    >
                      Upgrade Plan
                    </Link>
                  </div>
                )}

                {publishError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle:</span>
                    <span className="font-bold text-neutral-900">
                      {formData.year} {formData.make} {formData.model} {formData.trim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Asking Price:</span>
                    <span className="font-bold text-neutral-900">
                      ₦{Number(formData.askingPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-bold text-neutral-900">{formData.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">VIN:</span>
                    <span className="font-mono font-bold text-neutral-900">{formData.vin || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customs Clearance:</span>
                    <span className="font-bold text-neutral-900">
                      {formData.customsDocUrl
                        ? "Verified SGD Attached"
                        : formData.customsCleared
                        ? "Declared Cleared"
                        : "Local Registration"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Initial Trust Tier:</span>
                    <span className="font-bold text-blue-600">
                      {formData.preInspectionOptIn ? "Tier 4 (Technician Dispatched)" : "Tier 2"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isPublishing || (currentStep === 10 && Boolean(quotaInfo?.isAtQuota))}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {currentStep === 10
                    ? quotaInfo?.isAtQuota
                      ? "Quota Reached — Upgrade Plan"
                      : isPublishing
                      ? isEditMode
                        ? "Saving Changes..."
                        : user?.role === "buyer"
                        ? "Activating Seller & Publishing..."
                        : "Publishing Listing..."
                      : isEditMode
                      ? "Save Changes"
                      : user?.role === "buyer"
                      ? "Activate Free Seller Account & Publish"
                      : "Publish Listing"
                    : "Next Step"}
                </span>
                {!isPublishing && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddVehicleWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <span className="text-xs font-semibold">Loading vehicle wizard...</span>
        </div>
      }
    >
      <AddVehicleWizardContent />
    </Suspense>
  );
}
