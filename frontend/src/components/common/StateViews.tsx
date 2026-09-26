import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Inbox, RefreshCw, type LucideIcon } from "lucide-react";

/* ------------------------------ EmptyState ------------------------------ */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Calm empty state for screens with no records yet. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center rounded-[10px] border border-dashed border-border bg-card/50 px-6 py-12 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
    <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
    {description && (
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ------------------------------ ErrorState ------------------------------ */

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Friendly inline error with a retry affordance. */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong.",
  onRetry,
}) => (
  <div className="flex flex-col items-center rounded-[10px] border border-border bg-card px-6 py-12 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <AlertTriangle className="h-5 w-5" strokeWidth={2} />
    </span>
    <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
    <p className="mt-1 text-sm text-muted-foreground">Please try again in a moment.</p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-5 gap-1.5" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    )}
  </div>
);
