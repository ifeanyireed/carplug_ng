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

    const v = vehicle as any;
    const normalizedVehicle: SavedVehicleItem = {
      ...vehicle,
      id: vehicle.id,
      make:
        v.make ||
        (v.name
          ? v.name.split(" ")[0]
          : v.title
          ? v.title.split(" ")[0]
          : ""),
      model:
        v.model ||
        (v.name
          ? v.name.split(" ").slice(1).join(" ")
          : v.title
          ? v.title.split(" ").slice(1).join(" ")
          : ""),
      images:
        v.images && Array.isArray(v.images) && v.images.length > 0
          ? v.images
          : v.image
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
