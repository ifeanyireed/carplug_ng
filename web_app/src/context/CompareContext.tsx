"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const STORAGE_KEY = "carplug_compare_ids";
export const MAX_COMPARE_LIMIT = 4;

interface CompareContextType {
  compareIds: string[];
  compareCount: number;
  maxLimit: number;
  isComparing: (vehicleId: string) => boolean;
  addToCompare: (vehicleId: string) => { success: boolean; message: string };
  removeFromCompare: (vehicleId: string) => void;
  toggleCompare: (vehicleId: string) => { success: boolean; isAdded: boolean; message: string };
  clearCompare: () => void;
  setCompareIds: (ids: string[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIdsState] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompareIdsState(parsed.slice(0, MAX_COMPARE_LIMIT));
        }
      }
    } catch {
      // Ignore local storage parse errors
    } finally {
      setIsHydrated(true);
    }

    // Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCompareIdsState(parsed.slice(0, MAX_COMPARE_LIMIT));
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save changes to localStorage
  const persist = useCallback((ids: string[]) => {
    const trimmed = ids.slice(0, MAX_COMPARE_LIMIT);
    setCompareIdsState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore storage write issues
    }
  }, []);

  const isComparing = useCallback(
    (vehicleId: string) => {
      return compareIds.includes(vehicleId);
    },
    [compareIds]
  );

  const addToCompare = useCallback(
    (vehicleId: string) => {
      if (!vehicleId) return { success: false, message: "Invalid vehicle ID" };

      if (compareIds.includes(vehicleId)) {
        return { success: true, message: "Vehicle already in comparison" };
      }

      if (compareIds.length >= MAX_COMPARE_LIMIT) {
        return {
          success: false,
          message: `Maximum ${MAX_COMPARE_LIMIT} vehicles can be compared at once. Remove one to add another.`,
        };
      }

      const next = [...compareIds, vehicleId];
      persist(next);
      return {
        success: true,
        message: `Added to comparison tray (${next.length}/${MAX_COMPARE_LIMIT})`,
      };
    },
    [compareIds, persist]
  );

  const removeFromCompare = useCallback(
    (vehicleId: string) => {
      const next = compareIds.filter((id) => id !== vehicleId);
      persist(next);
    },
    [compareIds, persist]
  );

  const toggleCompare = useCallback(
    (vehicleId: string) => {
      if (compareIds.includes(vehicleId)) {
        removeFromCompare(vehicleId);
        return {
          success: true,
          isAdded: false,
          message: "Removed from comparison",
        };
      } else {
        const res = addToCompare(vehicleId);
        return {
          success: res.success,
          isAdded: res.success,
          message: res.message,
        };
      }
    },
    [compareIds, removeFromCompare, addToCompare]
  );

  const clearCompare = useCallback(() => {
    persist([]);
  }, [persist]);

  const setCompareIds = useCallback(
    (ids: string[]) => {
      persist(ids.slice(0, MAX_COMPARE_LIMIT));
    },
    [persist]
  );

  const value = useMemo<CompareContextType>(
    () => ({
      compareIds,
      compareCount: compareIds.length,
      maxLimit: MAX_COMPARE_LIMIT,
      isComparing,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      setCompareIds,
    }),
    [
      compareIds,
      isComparing,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      setCompareIds,
    ]
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
