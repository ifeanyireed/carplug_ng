"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Vehicle } from "@/data/mockStore";
import { CarListing } from "@/data/mockCars";
import {
  fetchSavedVehicles,
  fetchSavedVehicleIds,
  toggleSavedVehicle,
  removeSavedVehicle,
} from "@/services/api";
import { useAuth } from "./AuthContext";

export type SavedVehicleItem =
  | Vehicle
  | CarListing
  | {
      id: string;
      make?: string;
      model?: string;
      name?: string;
      title?: string;
      year?: number;
      price?: number;
      image?: string;
      images?: string[];
      mileage?: string | number;
      transmission?: string;
      fuelType?: string;
      condition?: string;
      bodyType?: string;
      badge?: string | null;
    };

interface SavedVehiclesContextType {
  savedVehicles: Vehicle[];
  savedIds: Set<string>;
  savedCount: number;
  isLoading: boolean;
  isSaved: (vehicleId: string) => boolean;
  toggleSave: (vehicle: SavedVehicleItem) => Promise<boolean>;
  removeSaved: (vehicleId: string) => Promise<void>;
  refreshSaved: () => Promise<void>;
}

const SavedVehiclesContext = createContext<SavedVehiclesContextType | undefined>(
  undefined
);

export function SavedVehiclesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize saved vehicles whenever authentication state changes
  const refreshSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedVehicles([]);
      setSavedIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [vehiclesList, idsList] = await Promise.all([
        fetchSavedVehicles(),
        fetchSavedVehicleIds(),
      ]);

      setSavedVehicles(vehiclesList);

      const allIds = new Set<string>();
      idsList.forEach((id) => allIds.add(id));
      vehiclesList.forEach((v) => allIds.add(v.id));
      setSavedIds(allIds);
    } catch (err) {
      console.warn("Failed to load saved vehicles from backend:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      (async () => {
        try {
          const [vehiclesList, idsList] = await Promise.all([
            fetchSavedVehicles(),
            fetchSavedVehicleIds(),
          ]);

          if (!isMounted) return;

          setSavedVehicles(vehiclesList);

          const allIds = new Set<string>();
          idsList.forEach((id) => allIds.add(id));
          vehiclesList.forEach((v) => allIds.add(v.id));
          setSavedIds(allIds);
        } catch (err) {
          console.warn("Failed to load saved vehicles from backend:", err);
        }
      })();
    } else {
      queueMicrotask(() => {
        if (isMounted) {
          setSavedVehicles([]);
          setSavedIds(new Set());
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const isSaved = useCallback(
    (vehicleId: string): boolean => {
      return savedIds.has(vehicleId);
    },
    [savedIds]
  );

  // Toggle saving a car. Strict enforcement: unauthenticated users cannot save!
  const toggleSave = useCallback(
    async (vehicle: SavedVehicleItem): Promise<boolean> => {
      if (!isAuthenticated) {
        // Trigger login modal immediately
        openAuthModal("login");
        return false;
      }

      const vehicleId = vehicle.id;
      const currentlySaved = savedIds.has(vehicleId);
      const nextSaved = !currentlySaved;

      // Optimistic state update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (nextSaved) {
          next.add(vehicleId);
        } else {
          next.delete(vehicleId);
        }
        return next;
      });

      if (!nextSaved) {
        setSavedVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      }

      try {
        const res = await toggleSavedVehicle(vehicleId);
        // If it was added and we have the full vehicle object, prepend it
        if (res.isSaved && "title" in vehicle) {
          setSavedVehicles((prev) => {
            if (prev.some((v) => v.id === vehicleId)) return prev;
            return [vehicle as Vehicle, ...prev];
          });
        }
        return res.isSaved;
      } catch (err) {
        console.warn("Failed to persist save state to backend:", err);
        // Rollback optimistic update
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) {
            next.add(vehicleId);
          } else {
            next.delete(vehicleId);
          }
          return next;
        });
        refreshSaved();
        return currentlySaved;
      }
    },
    [isAuthenticated, openAuthModal, savedIds, refreshSaved]
  );

  const removeSaved = useCallback(
    async (vehicleId: string): Promise<void> => {
      if (!isAuthenticated) return;

      // Optimistic removal
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
      setSavedVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      try {
        await removeSavedVehicle(vehicleId);
      } catch (err) {
        console.warn("Failed to remove saved vehicle:", err);
        refreshSaved();
      }
    },
    [isAuthenticated, refreshSaved]
  );

  const savedCount = useMemo(() => {
    return savedIds.size;
  }, [savedIds]);

  const value = useMemo(
    () => ({
      savedVehicles,
      savedIds,
      savedCount,
      isLoading,
      isSaved,
      toggleSave,
      removeSaved,
      refreshSaved,
    }),
    [
      savedVehicles,
      savedIds,
      savedCount,
      isLoading,
      isSaved,
      toggleSave,
      removeSaved,
      refreshSaved,
    ]
  );

  return (
    <SavedVehiclesContext.Provider value={value}>
      {children}
    </SavedVehiclesContext.Provider>
  );
}

export function useSavedVehicles() {
  const context = useContext(SavedVehiclesContext);
  if (!context) {
    throw new Error(
      "useSavedVehicles must be used within a SavedVehiclesProvider"
    );
  }
  return context;
}
