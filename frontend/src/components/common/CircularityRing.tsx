import React from "react";
import { cn } from "@/lib/utils";

interface CircularityRingProps {
  /** Score 0–100. */
  value: number;
  /** Diameter in px. */
  size?: number;
  label?: string;
  className?: string;
}

/**
 * A restrained circular progress ring for circularity/confidence scores.
 * Animates its stroke on mount (respecting reduced motion).
 */
export const CircularityRing: React.FC<CircularityRingProps> = ({
  value,
  size = 96,
  label = "Circularity",
  className,
}) => {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-brand-sage transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-semibold text-brand-forest">{clamped}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};
