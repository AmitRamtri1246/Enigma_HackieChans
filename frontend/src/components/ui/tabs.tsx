import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** Optional count shown after the label (mono). */
  count?: number;
}

interface TabsListProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible name for the tab list. */
  label: string;
  /** Prefix used to link tabs and panels (aria-controls). */
  idBase: string;
  className?: string;
}

/**
 * shadcn-style underline tabs with roving focus (Arrow keys, Home, End).
 * Pair with <TabsPanel> using the same idBase/value.
 */
export function TabsList<T extends string>({
  items,
  value,
  onValueChange,
  label,
  idBase,
  className,
}: TabsListProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onValueChange(items[next].value);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-5 overflow-x-auto border-b border-border [scrollbar-width:none]", className)}
    >
      {items.map((item, i) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            type="button"
            id={`${idBase}-tab-${item.value}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative -mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-brand-forest text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn("font-mono text-xs", selected ? "text-muted-foreground" : "text-muted-foreground/70")}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const TabsPanel: React.FC<{
  idBase: string;
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ idBase, value, className, children }) => (
  <div
    role="tabpanel"
    id={`${idBase}-panel-${value}`}
    aria-labelledby={`${idBase}-tab-${value}`}
    tabIndex={0}
    className={cn("motion-safe:animate-fadeIn focus-visible:outline-none", className)}
  >
    {children}
  </div>
);
