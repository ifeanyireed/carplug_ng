"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useSavedVehicles, SavedVehicleItem } from "@/context/SavedVehiclesContext";

interface SaveVehicleButtonProps {
  vehicle: SavedVehicleItem;
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  text?: string;
  savedText?: string;
}

export const SaveVehicleButton: React.FC<SaveVehicleButtonProps> = ({
  vehicle,
  className = "absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition active:scale-90",
  iconClassName = "w-4 h-4",
  showText = false,
  text = "Save to Garage",
  savedText = "Saved in Garage",
}) => {
  const { isSaved, toggleSave } = useSavedVehicles();
  const saved = isSaved(vehicle.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const v = vehicle as unknown as Record<string, unknown>;
    const vName = typeof v.name === "string" ? v.name : "";
    const vTitle = typeof v.title === "string" ? v.title : "";
    const vMake = typeof v.make === "string" ? v.make : "";
    const vModel = typeof v.model === "string" ? v.model : "";

    const normalizedVehicle: SavedVehicleItem = {
      ...vehicle,
      id: vehicle.id,
      make:
        vMake ||
        (vName
          ? vName.split(" ")[0]
          : vTitle
          ? vTitle.split(" ")[0]
          : ""),
      model:
        vModel ||
        (vName
          ? vName.split(" ").slice(1).join(" ")
          : vTitle
          ? vTitle.split(" ").slice(1).join(" ")
          : ""),
      images:
        Array.isArray(v.images) && v.images.length > 0
          ? (v.images as string[])
          : typeof v.image === "string"
          ? [v.image]
          : [],
    };

    await toggleSave(normalizedVehicle);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from favorites" : "Add to favorites"}
      className={className}
    >
      <Heart
        className={`${iconClassName} transition ${
          saved ? "fill-rose-500 text-rose-500" : ""
        }`}
      />
      {showText && <span>{saved ? savedText : text}</span>}
    </button>
  );
};
