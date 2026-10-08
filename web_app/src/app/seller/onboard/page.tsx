"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  uploadVehicleImages,
  submitVerification,
  fetchMyVerifications,
  VerificationItem,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function SellerKYCOnboardPage() {
  const { user } = useAuth();
  const [existingVerification, setExistingVerification] = useState<VerificationItem | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  const [ninNumber, setNinNumber] = useState("");
  const [documentType, setDocumentType] = useState("National Identity Card (NIN Slip)");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocUrl, setUploadedDocUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const res = await fetchMyVerifications({ entityType: "seller_nin" });
        if (!isMounted) return;
        const items = res?.data || [];
        setExistingVerification(items.length > 0 ? items[0] : null);
      } catch (err) {
        console.warn("Failed to fetch seller verification status:", err);
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshIndex]);

  const loadVerificationStatus = () => {
    setIsLoadingStatus(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const urls = await uploadVehicleImages([file], "carplug/verifications");
      if (urls.length > 0) {
        setUploadedDocUrl(urls[0]);
        setUploadedFileName(file.name);
      }
    } catch (err: unknown) {
      console.warn("Document upload error:", err);
      const msg = err instanceof Error ? err.message : "Document upload failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ninNumber.trim()) {
      setErrorMsg("Please enter your document identification number.");
      return;
    }
    if (!uploadedDocUrl) {
      setErrorMsg("Please upload a clear photograph or scan of your identification document.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await submitVerification({
        entityType: "seller_nin",
        documentUrl: uploadedDocUrl,
        vin: `NIN: ${ninNumber.trim()}`,
        notes: `${documentType} submitted for private seller verification`,
      });
      setExistingVerification(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please check your network connection and try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NDPR Compliant Verification</span>
          </span>
          <button
            onClick={loadVerificationStatus}
            disabled={isLoadingStatus}
            title="Refresh verification status"
            className="text-gray-400 hover:text-neutral-900 transition p-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? "animate-spin" : ""}`} />
          </button>
        </div>

        <h1 className="text-2xl font-black text-neutral-900 mt-2">
          Private Seller Identity Verification
        </h1>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          mycarsNg requires verified identity for private sellers before listings become discoverable. This eliminates phantom car listings and protects Nigerian automotive buyers.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoadingStatus ? (
          <div className="mt-8 p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            <span className="text-xs font-medium">Checking verification records...</span>
          </div>
        ) : existingVerification?.status === "approved" || user?.isIdentityVerified ? (
          /* Approved State */
          <div className="mt-8 p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-emerald-950 text-lg">
              Identity Verified &amp; Compliant
            </h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
              Your government identity credentials have been validated by our compliance audit team. All your vehicles will feature the Verified Seller Trust Seal.
            </p>
            {existingVerification?.reviewedAt && (
              <p className="text-[11px] text-emerald-700 font-mono">
                Approved on: {new Date(existingVerification.reviewedAt).toLocaleDateString()}
              </p>
            )}
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/seller/sell"
                className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition flex items-center gap-1.5"
              >
                <span>Post a New Listing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/seller/listings"
                className="px-5 py-2.5 bg-white border border-gray-200 text-neutral-900 font-bold text-xs rounded-xl hover:bg-gray-50 transition"
              >
                View My Listings
              </Link>
            </div>
          </div>
        ) : existingVerification?.status === "pending" ? (
          /* Pending Review State */
          <div className="mt-8 p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-amber-950 text-lg">
              Verification Documents Under Review
            </h3>
            <p className="text-xs text-amber-800 max-w-sm mx-auto leading-relaxed">
              Your identification details have been received and queued in our administrative compliance desk. Review turnaround is typically within 24 hours.
            </p>
            <div className="text-[11px] text-amber-700 font-medium">
              Submitted: {new Date(existingVerification.createdAt).toLocaleString()}
            </div>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/seller/listings"
                className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition flex items-center gap-1.5"
              >
                <span>Go to My Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form (Fresh or Rejected Re-Submission) */
          <>
            {existingVerification?.status === "rejected" && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Previous Submission Not Approved</span>
                </div>
                <p className="text-xs text-red-700">
                  {existingVerification.notes || "The uploaded document was illegible or could not be verified. Please re-upload a clear copy."}
                </p>
              </div>
            )}

            <form onSubmit={handleKYC} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Identification Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                >
                  <option>National Identity Card (NIN Slip)</option>
                  <option>Voter&apos;s Card (INEC PVC)</option>
                  <option>Nigerian International Passport</option>
                  <option>FRSC Driver&apos;s License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Number (NIN / PVC / Passport / License No.)
                </label>
                <input
                  type="text"
                  required
                  value={ninNumber}
                  onChange={(e) => setNinNumber(e.target.value)}
                  placeholder="e.g. 49201928401"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload Photograph or PDF Scan of Document
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedDocUrl ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-emerald-950">
                          {uploadedFileName || "Document attached"}
                        </div>
                        <div className="text-[10px] text-emerald-700">Uploaded to Cloudinary secure storage</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-2xl text-center space-y-2 cursor-pointer transition"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                        <span className="text-xs font-semibold text-gray-600">
                          Uploading to secure storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                        <div className="text-xs font-semibold text-neutral-800">
                          Tap to upload identity document photo
                        </div>
                        <p className="text-[10px] text-gray-400">JPEG, PNG or PDF up to 10MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Verification...</span>
                  </>
                ) : (
                  <span>Submit for Identity Verification</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
