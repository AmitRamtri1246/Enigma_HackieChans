import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { PickupPriority } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * Status tones used across the app. These map onto the restrained Badge
 * variants so every role workspace shows consistent status pills.
 */
export type Tone = "active" | "neutral" | "success" | "warning" | "danger";

const TONE_VARIANT: Record<Tone, BadgeVariant> = {
  active: "active",
  success: "completed",
  neutral: "neutral",
  warning: "pending",
  danger: "problem",
};

type StatusBadgeProps = {
  /** Explicit tone; defaults to `toneFor(status)` when a status is given. */
  tone?: Tone;
  /** Kept for API compatibility; the underlying Badge renders its own dot. */
  dot?: boolean;
  className?: string;
} & (
  | { /** Status string; also used as the label unless `label` is set. */ status: string; label?: string }
  | { status?: undefined; label: string }
);

/** Small pill for statuses and priorities, consistent across roles. */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  tone,
  className,
}) => {
  const resolvedTone = tone ?? (status ? toneFor(status) : "neutral");
  return (
    <Badge variant={TONE_VARIANT[resolvedTone]} className={className}>
      {label ?? status}
    </Badge>
  );
};

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
    case "Repaired":
    case "Upcycled":
    case "Recycled":
    case "Fulfilled":
    case "Sold":
      return "success";
    case "High":
    case "Cancelled":
    case "Declined":
    case "Expired":
      return "danger";
    case "Normal":
    case "In transit":
    case "Assigned":
    case "Collected":
    case "Pending":
    case "Requested":
    case "Pickup assigned":
    case "Awaiting handoff":
    case "Under review":
    case "Needs community review":
      return "warning";
    case "Community buy-in":
    case "Auction queued":
    case "Recycler handoff":
      return "active";
    default:
      return "neutral";
  }
}

/** Maps a status string directly to a Badge variant (compat helper). */
export function statusVariant(status: string): BadgeVariant {
  return TONE_VARIANT[toneFor(status)];
}

/**
 * Priority as plain text. Only "High" earns a coloured dot so exceptions stand
 * out without every row shouting.
 */
export const PriorityLabel: React.FC<{ priority: PickupPriority; className?: string }> = ({
  priority,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 text-sm",
      priority === "High" ? "font-medium text-[#A4463B]" : "text-muted-foreground",
      className
    )}
  >
    {priority === "High" && (
      <span className="h-1.5 w-1.5 rounded-full bg-brand-danger" aria-hidden="true" />
    )}
    {priority}
    <span className="sr-only"> priority</span>
  </span>
);
