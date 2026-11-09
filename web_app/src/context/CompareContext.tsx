"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

const STORAGE_KEY = "carplug_compare_ids";
export const MAX_COMPARE_LIMIT = 4;

function areArraysEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

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
  const compareIdsRef = useRef<string[]>(compareIds);
  compareIdsRef.current = compareIds;

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.slice(0, MAX_COMPARE_LIMIT);
          setCompareIdsState((prev) => (areArraysEqual(prev, valid) ? prev : valid));
        }
      }
    } catch {
      // Ignore local storage parse errors
    }

    // Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const valid = parsed.slice(0, MAX_COMPARE_LIMIT);
            setCompareIdsState((prev) => (areArraysEqual(prev, valid) ? prev : valid));
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save changes to localStorage with functional update and equality check
  const persist = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setCompareIdsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const trimmed = next.slice(0, MAX_COMPARE_LIMIT);

      if (areArraysEqual(prev, trimmed)) {
        return prev; // Identical: no-op, prevent re-renders
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Ignore storage write issues
      }
      return trimmed;
    });
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

      let result = { success: true, message: "" };

      persist((prev) => {
        if (prev.includes(vehicleId)) {
          result = { success: true, message: "Vehicle already in comparison" };
          return prev;
        }

        if (prev.length >= MAX_COMPARE_LIMIT) {
          result = {
            success: false,
            message: `Maximum ${MAX_COMPARE_LIMIT} vehicles can be compared at once.`,
          };
          return prev;
        }

        const next = [...prev, vehicleId];
        result = {
          success: true,
          message: `Added to comparison tray (${next.length}/${MAX_COMPARE_LIMIT})`,
        };
        return next;
      });

      return result;
    },
    [persist]
  );

  const removeFromCompare = useCallback(
    (vehicleId: string) => {
      persist((prev) => prev.filter((id) => id !== vehicleId));
    },
    [persist]
  );

  const toggleCompare = useCallback(
    (vehicleId: string) => {
      let isAdded = false;
      let msg = "";
      let success = true;

      persist((prev) => {
        if (prev.includes(vehicleId)) {
          isAdded = false;
          msg = "Removed from comparison";
          return prev.filter((id) => id !== vehicleId);
        } else {
          if (prev.length >= MAX_COMPARE_LIMIT) {
            success = false;
            msg = `Maximum ${MAX_COMPARE_LIMIT} vehicles can be compared at once.`;
            return prev;
          }
          isAdded = true;
          const next = [...prev, vehicleId];
          msg = `Added to comparison tray (${next.length}/${MAX_COMPARE_LIMIT})`;
          return next;
        }
      });

      return { success, isAdded, message: msg };
    },
    [persist]
  );

  const clearCompare = useCallback(() => {
    persist([]);
  }, [persist]);

  const setCompareIds = useCallback(
    (ids: string[]) => {
      persist(ids);
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
