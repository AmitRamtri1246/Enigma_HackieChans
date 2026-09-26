import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { MaterialAnalysis } from "@/lib/domain";

/**
 * Holds the most recent completed scan (captured image + analysis) in memory so
 * downstream flows (Sell, Exchange, Donate, Repair, Recycle) can prefill from
 * it. Images are NEVER persisted to localStorage — only kept in memory as a
 * File + object URL, and the URL is revoked when replaced or cleared.
 */

export interface PendingScan {
  file: File;
  previewUrl: string;
  analysis: MaterialAnalysis;
  imageDataUrl?: string;
}

interface ScanContextType {
  pending: PendingScan | null;
  setPending: (scan: { file: File; analysis: MaterialAnalysis; imageDataUrl?: string }) => void;
  clear: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPendingState] = useState<PendingScan | null>(null);
  const urlRef = useRef<string | null>(null);

  const setPending = useCallback(
    (scan: { file: File; analysis: MaterialAnalysis; imageDataUrl?: string }) => {
      // Revoke any previously held URL that we own and are replacing.
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
      // Re-create a fresh, context-owned object URL so lifetime is independent
      // of the scanner component that produced the capture.
      const ownedUrl = URL.createObjectURL(scan.file);
      urlRef.current = ownedUrl;
      setPendingState({ file: scan.file, previewUrl: ownedUrl, analysis: scan.analysis, imageDataUrl: scan.imageDataUrl });
    },
    []
  );

  const clear = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPendingState(null);
  }, []);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return (
    <ScanContext.Provider value={{ pending, setPending, clear }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = (): ScanContextType => {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used within ScanProvider");
  return ctx;
};
