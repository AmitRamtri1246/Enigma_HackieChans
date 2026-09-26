import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { TimelineEvent } from "@/lib/domain";
import { formatDate } from "@/lib/format";

/**
 * The Waste Passport signature: Listed → Accepted → Pickup assigned →
 * Collected → Delivered → Received → Completed. Done steps show actor and
 * date; the current step is emphasised; upcoming steps stay quiet.
 */
export const JourneyTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  const currentIndex = events.reduce((acc, e, i) => (e.done ? i : acc), -1);

  return (
    <ol className="relative" aria-label="Material journey">
      {events.map((evt, i) => {
        const isLast = i === events.length - 1;
        const isCurrent = i === currentIndex;
        return (
          <li
            key={evt.id}
            className="relative flex gap-4 pb-7 last:pb-0 motion-safe:animate-stepIn"
            style={{ animationDelay: `${i * 50}ms` }}
            aria-current={isCurrent ? "step" : undefined}
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[11px] top-7 h-[calc(100%-1.5rem)] w-px transition-colors duration-300",
                  i < currentIndex ? "bg-brand-sage/50" : "bg-border"
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                evt.done ? "border-brand-sage bg-brand-sage text-brand-white" : "border-border bg-card",
                isCurrent && "ring-4 ring-brand-soft"
              )}
            >
              {evt.done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-border" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", evt.done ? "font-medium text-foreground" : "text-muted-foreground")}>
                {evt.stage}
                <span className="sr-only">{evt.done ? " — done" : " — upcoming"}</span>
              </p>
              {evt.done && (
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {evt.actor}
                  {evt.date && (
                    <>
                      <span aria-hidden="true"> · </span>
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
};
