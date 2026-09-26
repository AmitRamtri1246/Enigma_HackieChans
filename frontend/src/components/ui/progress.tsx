import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 0–100 */
  value: number;
  /** Accessible label, e.g. "Fill level". */
  label: string;
  tone?: "default" | "warning" | "danger";
  className?: string;
}

const TONE = {
  default: "bg-brand-sage",
  warning: "bg-[#C9A15A]",
  danger: "bg-brand-danger",
} as const;

/** Thin progress bar. Width animates on change (respecting reduced motion). */
export const Progress: React.FC<ProgressProps> = ({ value, label, tone = "default", className }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", TONE[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
