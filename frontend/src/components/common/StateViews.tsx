import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, RefreshCw, type LucideIcon } from "lucide-react";

/* ------------------------------ EmptyState ------------------------------ */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Calm empty state: one sentence of context and at most one action. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon = Inbox, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center",
      className
    )}
  >
    <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
    <p className="mt-3 text-[15px] font-medium text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ------------------------------ ErrorState ------------------------------ */

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Friendly inline error with a retry affordance. */
export const ErrorState: React.FC<ErrorStateProps> = ({ message = "We couldn't load this right now.", onRetry }) => (
  <div role="alert" className="flex items-start gap-3 rounded-xl border border-brand-danger/25 bg-brand-danger/[0.04] px-4 py-4 sm:items-center">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A4463B] sm:mt-0" aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    )}
  </div>
);
