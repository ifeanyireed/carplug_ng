"use client";

import React, { useState } from "react";
import { useCompare } from "@/context/CompareContext";
import { Scale } from "lucide-react";

interface AddToCompareButtonProps {
  vehicleId: string;
  className?: string;
  showText?: boolean;
  iconClassName?: string;
}

export function AddToCompareButton({
  vehicleId,
  className = "",
  showText = true,
  iconClassName = "w-3.5 h-3.5",
}: AddToCompareButtonProps) {
  const { isComparing, toggleCompare } = useCompare();
  const comparing = isComparing(vehicleId);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const res = toggleCompare(vehicleId);
    setFeedback(res.message);
    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  const defaultClasses = showText
    ? `flex items-center gap-1.5 transition text-xs font-semibold cursor-pointer ${
        comparing
          ? "text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
          : "text-gray-600 hover:text-neutral-900"
      }`
    : `w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition active:scale-90 cursor-pointer ${
        comparing
          ? "bg-blue-600 text-white shadow-md ring-2 ring-white/80"
          : "bg-black/35 hover:bg-black/60 text-white"
      }`;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        className={`${defaultClasses} ${className}`}
        title={comparing ? "Remove from comparison" : "Add to comparison tray"}
        aria-label={comparing ? "Remove from compare" : "Add to compare"}
      >
        <Scale
          className={`${iconClassName} ${
            showText ? (comparing ? "text-blue-600" : "text-gray-500") : "stroke-[2.2]"
          }`}
        />
        {showText && (
          <span>{comparing ? "In Compare" : "Add to Compare"}</span>
        )}
      </button>

      {/* Ephemeral Feedback Tooltip */}
      {feedback && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1 bg-neutral-900 text-white text-[10px] rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
          {feedback}
        </div>
      )}
    </div>
  );
}
