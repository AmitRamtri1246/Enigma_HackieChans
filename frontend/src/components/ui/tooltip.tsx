import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CSS-only tooltip shown on hover and keyboard focus of its child. The child
 * must carry its own accessible name; the tooltip is a visual aid only.
 */
export const Tooltip: React.FC<{
  content: string;
  side?: "right" | "top";
  /** Extra classes for the bubble, e.g. "lg:hidden" when a label is visible. */
  bubbleClassName?: string;
  children: React.ReactNode;
}> = ({ content, side = "right", bubbleClassName, children }) => (
  <span className="group/tooltip relative flex">
    {children}
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-xs font-medium text-brand-white opacity-0 transition-opacity delay-150 duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
        side === "right" ? "left-full top-1/2 ml-2 -translate-y-1/2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
        bubbleClassName
      )}
    >
      {content}
    </span>
  </span>
);
