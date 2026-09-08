import React from "react";
import { TrendingDown, CheckCircle, AlertCircle } from "lucide-react";

interface PriceRatingBadgeProps {
  rating: "fair" | "deal" | "above";
  marketRange?: [number, number];
  size?: "sm" | "md";
}

export const PriceRatingBadge = ({
  rating,
  marketRange,
  size = "md",
}: PriceRatingBadgeProps) => {
  const configs = {
    deal: {
      label: "Great Deal",
      sub: "Below Market Range",
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
      icon: TrendingDown,
    },
    fair: {
      label: "Fair Market",
      sub: "Within Normal Range",
      bg: "bg-blue-50 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
      icon: CheckCircle,
    },
    above: {
      label: "Above Market",
      sub: "High / Negotiate",
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertCircle,
    },
  };

  const current = configs[rating] || configs.fair;
  const Icon = current.icon;

  const formatNaira = (val: number) => {
    return `₦${(val / 1000000).toFixed(1)}m`;
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${
          size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        } ${current.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{current.label}</span>
      </span>
      {marketRange && size === "md" && (
        <span className="text-[11px] text-gray-500 font-medium">
          ({formatNaira(marketRange[0])}–{formatNaira(marketRange[1])} range)
        </span>
      )}
    </div>
  );
};
