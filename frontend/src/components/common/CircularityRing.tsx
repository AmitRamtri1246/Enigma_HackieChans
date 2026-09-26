import React, { useEffect, useState } from "react";
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
 * Circular score ring. The stroke fills from 0 on mount so the score reads as
 * a result arriving; reduced-motion users see the final value immediately.
 */
export const CircularityRing: React.FC<CircularityRingProps> = ({
  value,
  size = 96,
  label = "Circularity",
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (shown / 100) * c;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-secondary" strokeWidth={stroke} />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-mono text-xl font-medium text-foreground">{clamped}</span>
        <span className="font-mono text-[11px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};
