import * as React from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * Compact selectable role row for onboarding. Selected state uses a pale
 * soft-green wash, a deep-forest border, and a check indicator.
 */
export const RoleOption: React.FC<RoleOptionProps> = ({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
  disabled,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "group flex w-full items-start gap-3 rounded-[10px] border bg-card p-3.5 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brand-forest bg-brand-soft/60"
          : "border-border hover:border-brand-sage/50 hover:bg-accent/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
          selected
            ? "border-brand-forest/20 bg-brand-forest text-brand-white"
            : "border-border bg-secondary text-brand-sage"
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>

      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          selected
            ? "border-brand-forest bg-brand-forest text-brand-white"
            : "border-border bg-card text-transparent"
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
    </button>
  );
};
