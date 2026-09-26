import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { onCircularityChange, resetDemoData } from "@/lib/circularity-service";

interface CircularityContextType {
  /** Increments whenever demo state changes; use to re-fetch from the service. */
  version: number;
  /** Restore all demo data to its seeded state. */
  reset: () => void;
}

const CircularityContext = createContext<CircularityContextType | undefined>(undefined);

/**
 * Lightweight shared-state provider for the TraceIQ demo. It does not hold the
 * data itself — the mock `circularityService` owns that and persists it to
 * localStorage. This context simply broadcasts a `version` bump on any change
 * so pages can re-fetch, and exposes a demo reset.
 */
export const CircularityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(0);

  useEffect(() => onCircularityChange(() => setVersion((v) => v + 1)), []);

  const reset = useCallback(() => {
    resetDemoData();
    setVersion((v) => v + 1);
  }, []);

  return (
    <CircularityContext.Provider value={{ version, reset }}>
      {children}
    </CircularityContext.Provider>
  );
};

export const useCircularity = (): CircularityContextType => {
  const ctx = useContext(CircularityContext);
  if (!ctx) throw new Error("useCircularity must be used within CircularityProvider");
  return ctx;
};
