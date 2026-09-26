import React from "react";
import { ChevronsUpDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceRole } from "@/lib/onboarding";
import { ROLE_LABELS } from "@/lib/use-preview-role";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ROLES: TraceRole[] = ["citizen", "organization", "collector", "municipality"];

interface RolePreviewSwitcherProps {
  role: TraceRole;
  onChange: (role: TraceRole) => void;
  /**
   * Layout hint from call sites (top bar vs. sidebar). The dropdown renders the
   * same either way, so this is accepted for API compatibility.
   */
  variant?: "compact" | "full";
}

/**
 * Frontend-only demo control to preview each role's workspace. It changes
 * navigation and screens only — it does NOT grant permissions.
 */
export const RolePreviewSwitcher: React.FC<RolePreviewSwitcherProps> = ({ role, onChange }) => (
  <DropdownMenu
    label="Preview role"
    align="end"
    trigger={({ ref, ...props }) => (
      <button
        ref={ref}
        type="button"
        {...props}
        aria-label={`Preview role: ${ROLE_LABELS[role]}. Demo only.`}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-border bg-card px-2.5 text-sm transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="hidden text-muted-foreground lg:inline">Preview role</span>
        <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </button>
    )}
  >
    <DropdownMenuLabel>
      <span className="block font-medium text-foreground">Preview role</span>
      Demo only — switches screens, not permissions.
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    {ROLES.map((r) => (
      <DropdownMenuRadioItem key={r} checked={r === role} onSelect={() => onChange(r)}>
        {ROLE_LABELS[r]}
      </DropdownMenuRadioItem>
    ))}
  </DropdownMenu>
);
