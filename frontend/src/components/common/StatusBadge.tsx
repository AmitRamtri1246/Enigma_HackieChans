import React from "react";
import { cn } from "@/lib/utils";

type Tone = "active" | "neutral" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  /** Show a leading status dot. */
  dot?: boolean;
}

const TONE: Record<Tone, string> = {
  active: "bg-brand-soft text-brand-forest",
  success: "bg-brand-soft text-brand-forest",
  neutral: "bg-secondary text-muted-foreground",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-destructive/10 text-destructive",
};

const DOT: Record<Tone, string> = {
  active: "bg-brand-sage",
  success: "bg-brand-sage",
  neutral: "bg-muted-foreground/50",
  warning: "bg-amber-500",
  danger: "bg-destructive",
};

/** Small pill for statuses and priorities, consistent across roles. */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = "neutral", dot = true }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
      TONE[tone]
    )}
  >
    {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} aria-hidden="true" />}
    {label}
  </span>
);

/** Maps common status/priority strings to a tone. */
export function toneFor(value: string): Tone {
  switch (value) {
    case "Active":
    case "Listed":
    case "Matched":
    case "Accepted":
    case "Completed":
    case "Received":
    case "Delivered":
    case "Reused":
      return "success";
    case "High":
      return "danger";
    case "Normal":
    case "In transit":
    case "Assigned":
    case "Collected":
    case "Pending":
    case "Requested":
    case "Pickup assigned":
      return "active";
    case "Cancelled":
    case "Declined":
      return "danger";
    default:
      return "neutral";
  }
}
