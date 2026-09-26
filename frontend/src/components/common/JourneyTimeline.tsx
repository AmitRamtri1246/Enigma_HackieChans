import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { TimelineEvent } from "@/lib/domain";

interface JourneyTimelineProps {
  events: TimelineEvent[];
}

/**
 * The signature vertical material-journey timeline used by Waste Passports:
 * Listed → Accepted → Pickup assigned → Collected → Delivered → Received →
 * Completed. Completed steps show actor and date; upcoming steps are dimmed.
 */
export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ events }) => (
  <ol className="relative">
    {events.map((evt, i) => {
      const isLast = i === events.length - 1;
      return (
        <li key={evt.id} className="relative flex gap-3.5 pb-6 last:pb-0">
          {/* Connector line */}
          {!isLast && (
            <span
              className={cn(
                "absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px",
                evt.done ? "bg-brand-sage/40" : "bg-border"
              )}
              aria-hidden="true"
            />
          )}
          {/* Node */}
          <span
            className={cn(
              "relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
              evt.done
                ? "border-brand-sage bg-brand-soft text-brand-sage"
                : "border-border bg-card text-muted-foreground/40"
            )}
          >
            {evt.done ? (
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            )}
          </span>
          {/* Content */}
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                evt.done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {evt.stage}
            </p>
            {evt.done && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {evt.actor}
                {evt.date && (
                  <>
                    {" · "}
                    <span className="font-mono">{formatDate(evt.date)}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
