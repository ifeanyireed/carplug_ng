"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createInspection, getAuthToken, initializePayment } from "@/services/api";

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
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const handleDispatch = async () => {
    setIsDispatching(true);
    setDispatchError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        // Redirect to login if unauthenticated
        router.push(`/auth/login?redirect=/buyer/inspections/book/${vehicleId}/technicians?tier=${tier}`);
        return;
      }

      let tierLabel: "Standard" | "Premium" | "Comprehensive" = "Premium";
      let tierAmount = 45000;
      if (tier.toLowerCase() === "standard") {
        tierLabel = "Standard";
        tierAmount = 25000;
      } else if (tier.toLowerCase() === "comprehensive") {
        tierLabel = "Comprehensive";
        tierAmount = 75000;
      }

      // Step 1: create the escrow payment
      const payment = await initializePayment({
        type: "inspection_escrow",
        amount: tierAmount,
        entityId: vehicleId,
        title: `${tierLabel} Inspection Escrow`,
      });

      if (!payment?.transaction?.id) {
        throw new Error("Failed to initialize inspection escrow payment");
      }

      // Step 2: create the inspection, linked to that escrow
      const created = await createInspection({
        vehicleId,
        technicianId,
        inspectionTier: tierLabel,
        status: "requested",
        escrowTransactionId: payment.transaction.id,
        scheduledDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      });

      if (created && created.id) {
        router.push(`/buyer/inspections/${created.id}/tracker`);
      } else {
        throw new Error("Inspection creation returned no ID");
      }
    } catch (err) {
      console.error("Inspection dispatch failed:", err);
      setDispatchError(
        err instanceof Error ? err.message : "Unable to book this inspection. Please try again."
      );
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
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
      {dispatchError && (
        <p className="text-[11px] font-medium text-rose-600 max-w-xs text-left sm:text-right">
          {dispatchError}
        </p>
      )}
    </div>
  );
}
