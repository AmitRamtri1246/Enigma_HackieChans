import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional primary action rendered to the right on wider screens. */
  action?: React.ReactNode;
}

/** Consistent page title block used across every workspace screen. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
);
