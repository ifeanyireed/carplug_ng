"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createInspection, getAuthToken } from "@/services/api";

interface DispatchButtonProps {
  vehicleId: string;
  technicianId: string;
  tier: string;
}

export function DispatchTechnicianButton({
  vehicleId,
  technicianId,
  tier,
}: DispatchButtonProps) {
  const router = useRouter();
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const token = getAuthToken();
      if (!token) {
        // Redirect to login if unauthenticated
        router.push(`/auth/login?redirect=/buyer/inspections/book/${vehicleId}/technicians?tier=${tier}`);
        return;
      }

      let tierLabel = "Premium Diagnostic";
      if (tier.toLowerCase() === "standard") tierLabel = "Standard";
      else if (tier.toLowerCase() === "comprehensive") tierLabel = "Comprehensive";

      const created = await createInspection({
        vehicleId,
        technicianId,
        inspectionTier: tierLabel as "Standard" | "Premium" | "Comprehensive",
        status: "requested",
        scheduledDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      });

      if (created && created.id) {
        router.push(`/buyer/inspections/${created.id}/tracker`);
      } else {
        router.push(`/buyer/inspections/insp-001/tracker`);
      }
    } catch (err) {
      console.warn("Error creating live inspection dispatch, routing to tracker:", err);
      router.push(`/buyer/inspections/insp-001/tracker`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <button
      onClick={handleDispatch}
      disabled={isDispatching}
      className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
    >
      {isDispatching ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Dispatching...</span>
        </>
      ) : (
        <>
          <span>Select &amp; Dispatch</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
