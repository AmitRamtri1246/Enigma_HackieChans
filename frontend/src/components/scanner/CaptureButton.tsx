import React from "react";
import { cn } from "@/lib/utils";

interface CaptureButtonProps {
  onCapture: () => void;
  /** Enabled only when the frame is stable (or grace period elapsed). */
  enabled: boolean;
}

/**
 * Large circular capture button. Disabled while the frame is significantly
 * moving; gains a subtle sage ring pulse when capture becomes available.
 */
export const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, enabled }) => (
  <button
    type="button"
    onClick={onCapture}
    disabled={!enabled}
    aria-label="Capture photo"
    className={cn(
      "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink",
      "disabled:cursor-not-allowed"
    )}
  >
    {/* Outer ring */}
    <span
      className={cn(
        "absolute inset-0 rounded-full border-2 transition-colors duration-200",
        enabled ? "border-brand-white" : "border-brand-white/40"
      )}
    />
    {/* Readiness pulse */}
    {enabled && (
      <span
        className="absolute inset-0 rounded-full border-2 border-brand-accent/70 motion-safe:animate-ping"
        aria-hidden="true"
      />
    )}
    {/* Inner disc */}
    <span
      className={cn(
        "h-12 w-12 rounded-full transition-all duration-200",
        enabled ? "bg-brand-white active:scale-90" : "bg-brand-white/40"
      )}
    />
  </button>
);
