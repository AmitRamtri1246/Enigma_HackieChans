import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------- PageContainer ---------------------------- */

const WIDTH = {
  narrow: "max-w-2xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

/** Consistent page gutter + max width for every workspace screen. */
export const PageContainer: React.FC<{
  size?: keyof typeof WIDTH;
  className?: string;
  children: React.ReactNode;
}> = ({ size = "default", className, children }) => (
  <div className={cn("mx-auto w-full px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-10", WIDTH[size], className)}>
    {children}
  </div>
);

/* ------------------------------ PageHeader ----------------------------- */

interface PageHeaderProps {
  title: string;
  /** Short supporting line under the title. */
  subtitle?: React.ReactNode;
  /** Single primary action, right-aligned on wider screens. */
  action?: React.ReactNode;
  /** Inline element beside the title, e.g. a status badge. */
  meta?: React.ReactNode;
  /** Back link for detail pages. */
  back?: { label: string; to: string };
}

/** Page context: back link, 28–30px title, one line of support, one action. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, meta, back }) => (
  <header className="mb-8 sm:mb-10">
    {back && (
      <Link
        to={back.to}
        className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" />
        {back.label}
      </Link>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-foreground sm:text-[30px]">
            {title}
          </h1>
          {meta}
        </div>
        {subtitle && <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  </header>
);

/* ------------------------------- Section ------------------------------- */

interface SectionProps {
  title: string;
  description?: string;
  /** Secondary action, e.g. a "View all" link. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** A titled region of a page. Sections separate content; they are not cards. */
export const Section: React.FC<SectionProps> = ({ title, description, action, className, children }) => {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className={cn("mt-12 first:mt-0", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={id} className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
};

/** Quiet text link used for "View all" style section actions. */
export const TextLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="rounded-md text-sm font-medium text-brand-sage transition-colors duration-150 hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  >
    {children}
  </Link>
);
