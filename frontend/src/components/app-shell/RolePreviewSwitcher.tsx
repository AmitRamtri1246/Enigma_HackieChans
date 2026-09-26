import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceRole } from "@/lib/onboarding";
import { ROLE_LABELS } from "@/lib/use-preview-role";

const ROLES: TraceRole[] = ["citizen", "organization", "collector", "municipality"];

interface RolePreviewSwitcherProps {
  role: TraceRole;
  onChange: (role: TraceRole) => void;
  /** "compact" for the top bar; "full" for the sidebar account area. */
  variant?: "compact" | "full";
}

/**
 * Frontend-only demo control to preview each role's workspace. This does NOT
 * grant permissions — it only changes which navigation and screens are shown.
 */
export const RolePreviewSwitcher: React.FC<RolePreviewSwitcherProps> = ({
  role,
  onChange,
  variant = "compact",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Preview role (demo only)"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          variant === "compact" ? "h-9 px-2.5 text-xs" : "w-full justify-between px-2.5 py-2 text-xs"
        )}
      >
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-muted-foreground/80">Preview</span>
          <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Preview role"
          className={cn(
            "absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg motion-safe:animate-fadeIn",
            variant === "full" && "left-0 right-auto bottom-full mb-1.5 mt-0"
          )}
        >
          <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
            Preview role · demo only
          </p>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="option"
              aria-selected={r === role}
              onClick={() => {
                onChange(r);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                r === role
                  ? "bg-brand-soft text-brand-forest font-medium"
                  : "text-foreground hover:bg-accent/50"
              )}
            >
              {ROLE_LABELS[r]}
              {r === role && <Check className="h-4 w-4 text-brand-sage" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
