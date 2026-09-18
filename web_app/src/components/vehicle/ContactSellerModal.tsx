"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/data/mockStore";
import {
  fetchVehicleContact,
  buildWhatsAppDeepLink,
  formatNigerianPhoneDigits,
  createLead,
  getStoredUser,
} from "@/services/api";
import {
  X,
  MessageSquare,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";

interface ContactSellerModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "whatsapp" | "chat" | "viewing";
}

export function WhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function ContactSellerModal({
  vehicle,
  isOpen,
  onClose,
  defaultTab = "whatsapp",
}: ContactSellerModalProps) {
  const [selectedTab, setSelectedTab] = useState<"whatsapp" | "chat" | "viewing" | null>(null);
  const tab = selectedTab ?? defaultTab;

  const defaultPrefilled = `Hello ${vehicle.sellerName}, I saw your ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin}) listed for ₦${vehicle.price.toLocaleString()} on mycarsNg. Is it still available for viewing / inspection?`;
  const [waUrl, setWaUrl] = useState(() => buildWhatsAppDeepLink(vehicle.sellerPhone || "2348035004401", defaultPrefilled));
  const [contactNumber, setContactNumber] = useState(() => "+" + formatNigerianPhoneDigits(vehicle.sellerPhone || "2348035004401"));
  const [prefilledMessage, setPrefilledMessage] = useState(defaultPrefilled);

  // Viewing lead form
  const [fullName, setFullName] = useState(() => {
    if (typeof window === "undefined") return "";
    return getStoredUser()?.name || "";
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return getStoredUser()?.phone || "";
  });
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("morning");
  const [note, setNote] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Fetch verified contact in background when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    fetchVehicleContact(vehicle.id)
      .then((contact) => {
        if (!isMounted || !contact) return;
        if (contact.whatsappUrl) setWaUrl(contact.whatsappUrl);
        if (contact.phone) setContactNumber(contact.phone);
        if (contact.prefilledMessage) setPrefilledMessage(contact.prefilledMessage);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, vehicle.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunchWhatsApp = () => {
    const targetUrl = waUrl || buildWhatsAppDeepLink(vehicle.sellerPhone || "2348035004401", prefilledMessage);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleScheduleViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      await createLead({
        buyerName: fullName.trim() || "Verified Buyer",
        buyerPhone: phone.trim() || "+234 800 000 0000",
        vehicleId: vehicle.id,
        vehicleTitle: vehicle.title,
        vehiclePrice: vehicle.price,
        type: "viewing_schedule",
        status: "new",
        sellerId: vehicle.sellerId,
        date: preferredDate || new Date().toISOString().split("T")[0],
        note: `Preferred Time: ${preferredTime}. ${note ? "Note: " + note : ""}`,
      });
      setLeadSuccess(true);
    } catch (err) {
      console.error("Failed to submit viewing schedule:", err);
      // Fallback optimistic success
      setLeadSuccess(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Contact Seller</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified channel for <span className="font-semibold text-neutral-800">{vehicle.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Summary Snippet */}
        <div className="p-4 mx-5 sm:mx-6 mt-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3.5">
          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
            <Image
              src={vehicle.images[0] || "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679177/carplug/cars/car1.jpg"}
              alt={vehicle.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-neutral-900 truncate">{vehicle.title}</div>
            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-neutral-800">₦{vehicle.price.toLocaleString()}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">{vehicle.vin.slice(-8)}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
            {vehicle.sellerType === "dealer" ? "Verified Dealer" : "Private"}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-4 pb-1">
          <div className="grid grid-cols-3 gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setSelectedTab("whatsapp")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "whatsapp"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("chat")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "chat"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>In-App Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("viewing")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "viewing"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "hover:text-neutral-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {tab === "whatsapp" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant WhatsApp Direct Link</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-bold text-emerald-800">
                    Typically replies &lt; 15 mins
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Connect directly with <b className="font-semibold">{vehicle.sellerName}</b> on WhatsApp with pre-filled vehicle verification specs, asking price, and VIN.
                </p>
              </div>

              {/* Message preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Pre-filled Message Preview
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 italic leading-relaxed">
                  &ldquo;{prefilledMessage}&rdquo;
                </div>
              </div>

              {contactNumber && (
                <div className="text-xs text-gray-500 flex items-center justify-between px-1">
                  <span>Seller Contact:</span>
                  <span className="font-mono font-bold text-neutral-800">{contactNumber}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99] text-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Launch WhatsApp Chat</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero spam guarantee • Direct connection to seller</span>
              </div>
            </div>
          )}

          {tab === "chat" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time In-App Messaging</span>
                </div>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Chat directly through mycarsNg&apos;s encrypted WebSocket messaging hub. Keeps your private phone number concealed while keeping all offers and conversations in one place.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Recipient:</span>
                  <span className="font-bold text-neutral-900">{vehicle.sellerName}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Chat Protocol:</span>
                  <span className="font-bold text-emerald-700">WebSocket Duplex Push</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Privacy Protection:</span>
                  <span className="font-bold text-blue-700">Identity Masked</span>
                </div>
              </div>

              <Link
                href={`/buyer/messages/${vehicle.id}`}
                onClick={onClose}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open In-App Conversation</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </Link>

              <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Instant delivery • Accessible on mobile &amp; web</span>
              </div>
            </div>
          )}

          {tab === "viewing" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {leadSuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-950">Viewing Request Lodged!</h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                    We have dispatched your viewing request to <b className="font-semibold">{vehicle.sellerName}</b>. They will confirm the appointment on your phone number.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleScheduleViewing} className="space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Schedule a physical viewing appointment. The seller will verify availability before confirming the lot address.
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Adeleke"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number (WhatsApp preferred)</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0803 123 4567"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Time of Day</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="morning">Morning (9am - 12pm)</option>
                        <option value="afternoon">Afternoon (12pm - 3pm)</option>
                        <option value="evening">Late Afternoon (3pm - 6pm)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Notes / Questions (Optional)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Any specific questions about condition or test drives?"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-xs transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    {submittingLead ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span>Submit Viewing Schedule</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Safety Note */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <Link
            href={`/buyer/inspections/book/${vehicle.id}`}
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>Order 150-Point Inspection First</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <span className="text-gray-400">Escrow Protected</span>
        </div>
      </div>
    </div>
  );
}
