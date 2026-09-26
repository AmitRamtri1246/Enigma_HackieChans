import React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, CircleDashed } from "lucide-react";
import type { Stability } from "@/lib/use-camera-scanner";

interface StabilityIndicatorProps {
  stability: Stability;
  /** True once the init grace period lets the user capture regardless. */
  ready: boolean;
}

/**
 * Small status line above the capture button. Communicates readiness with an
 * icon + label + subtle color. Never uses aggressive red; relies on icon +
 * text, not color alone, and announces changes politely.
 */
export const StabilityIndicator: React.FC<StabilityIndicatorProps> = ({ stability, ready }) => {
  const view = resolve(stability, ready);
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
        view.className
      )}
      role="status"
      aria-live="polite"
    >
      <view.icon className={cn("h-3.5 w-3.5", view.spin && "motion-safe:animate-spin")} strokeWidth={2.5} />
      {view.label}
    </div>
  );
};

function resolve(stability: Stability, ready: boolean): {
  icon: typeof Check;
  label: string;
  className: string;
  spin?: boolean;
} {
  if (ready && stability !== "stable") {
    // Grace period elapsed — allow capture, phrased gently.
    return { icon: Check, label: "Ready to capture", className: "bg-brand-soft text-brand-forest" };
  }
  switch (stability) {
    case "stable":
      return { icon: Check, label: "Ready to capture", className: "bg-brand-soft text-brand-forest" };
    case "stabilizing":
      return { icon: CircleDashed, label: "Almost ready", className: "bg-secondary text-foreground/80" };
    case "initializing":
      return { icon: CircleDashed, label: "Starting camera", className: "bg-secondary text-muted-foreground", spin: true };
    case "moving":
    default:
      return { icon: Circle, label: "Hold steady", className: "bg-secondary text-muted-foreground" };
  }
}
