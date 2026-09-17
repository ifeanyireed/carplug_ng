"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Vehicle } from "@/data/mockStore";
import { Wrench, PhoneCall } from "lucide-react";
import { SaveVehicleButton } from "@/components/common/SaveVehicleButton";
import { ContactSellerModal, WhatsAppIcon } from "./ContactSellerModal";
import {
  fetchVehicleContact,
  buildWhatsAppDeepLink,
} from "@/services/api";

interface VehicleContactActionsProps {
  vehicle: Vehicle;
}

export function VehicleContactActions({ vehicle }: VehicleContactActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"whatsapp" | "chat" | "viewing">("whatsapp");
  const [launchingWhatsApp, setLaunchingWhatsApp] = useState(false);

  const handleDirectWhatsAppClick = async () => {
    setLaunchingWhatsApp(true);
    const fallbackMsg = `Hello ${vehicle.sellerName}, I saw your ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin}) listed for ₦${vehicle.price.toLocaleString()} on mycarsNg. Is it still available for viewing/inspection?`;

    try {
      const contact = await fetchVehicleContact(vehicle.id);
      if (contact && contact.whatsappUrl) {
        window.open(contact.whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        const direct = buildWhatsAppDeepLink(vehicle.sellerPhone || "2348035004401", fallbackMsg);
        window.open(direct, "_blank", "noopener,noreferrer");
      }
    } catch {
      const direct = buildWhatsAppDeepLink(vehicle.sellerPhone || "2348035004401", fallbackMsg);
      window.open(direct, "_blank", "noopener,noreferrer");
    } finally {
      setLaunchingWhatsApp(false);
    }
  };

  const openModalWithTab = (tab: "whatsapp" | "chat" | "viewing") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Primary Call to Action: Book Inspection */}
        <Link
          href={`/buyer/inspections/book/${vehicle.id}`}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-center flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
        >
          <Wrench className="w-4 h-4" />
          <span>Request Inspection First</span>
        </Link>

        {/* WhatsApp Instant Deep Link */}
        <button
          type="button"
          onClick={handleDirectWhatsAppClick}
          disabled={launchingWhatsApp}
          className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl text-center flex items-center justify-center gap-2.5 shadow-xs transition active:scale-[0.99] cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 fill-white" />
          <span>Chat on WhatsApp</span>
        </button>

        {/* Contact Seller Sheet Trigger */}
        <button
          type="button"
          onClick={() => openModalWithTab("chat")}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-center flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Seller (Options)</span>
        </button>

        {/* Save to Garage Button */}
        <SaveVehicleButton
          vehicle={vehicle}
          className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-neutral-800 font-bold rounded-2xl text-center flex items-center justify-center gap-2 transition active:scale-[0.99]"
          iconClassName="w-4 h-4 text-neutral-700"
          showText={true}
          text="Save to Garage"
          savedText="Saved in Garage"
        />
      </div>

      {/* Contact Seller Sheet / Modal */}
      <ContactSellerModal
        vehicle={vehicle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={modalTab}
      />
    </>
  );
}
