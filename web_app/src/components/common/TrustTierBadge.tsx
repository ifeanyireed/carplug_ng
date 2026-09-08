import React from "react";
import { ShieldCheck, FileText, CheckCircle2, Wrench, Award } from "lucide-react";

interface TrustTierBadgeProps {
  tier: 1 | 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const TrustTierBadge = ({
  tier,
  size = "md",
  showLabel = true,
}: TrustTierBadgeProps) => {
  const configs = {
    1: {
      label: "Seller Listed",
      sublabel: "Tier 1",
      bgColor: "bg-gray-100 text-gray-700 border-gray-200",
      accent: "text-gray-500",
      icon: FileText,
    },
    2: {
      label: "Documents Uploaded",
      sublabel: "Tier 2",
      bgColor: "bg-amber-50 text-amber-800 border-amber-200",
      accent: "text-amber-600",
      icon: FileText,
    },
    3: {
      label: "Platform Verified",
      sublabel: "Tier 3",
      bgColor: "bg-blue-50 text-blue-800 border-blue-200",
      accent: "text-blue-600",
      icon: CheckCircle2,
    },
    4: {
      label: "Technician Inspected",
      sublabel: "Tier 4",
      bgColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accent: "text-emerald-600",
      icon: Wrench,
    },
    5: {
      label: "Premium Verified",
      sublabel: "Tier 5 (Top)",
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border-blue-300 shadow-sm",
      accent: "text-blue-600",
      icon: Award,
    },
  };

  const current = configs[tier] || configs[1];
  const Icon = current.icon;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-medium",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${sizeStyles[size]} ${current.bgColor}`}
    >
      <Icon className={`${iconSizes[size]} shrink-0 ${current.accent}`} />
      {showLabel && (
        <span className="truncate">
          <span className="font-semibold">{current.label}</span>
        </span>
      )}
    </span>
  );
};
