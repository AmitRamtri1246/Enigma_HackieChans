import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Armchair, Box, Cpu, Dumbbell, GlassWater, House, Leaf, Milk, Shirt, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialCategory } from "@/lib/domain";

/* ------------------------------ MetricStrip ------------------------------ */

export interface StripMetric {
  label: string;
  value: string;
  unit?: string;
  /** Small qualifier under the label, e.g. "Illustrative estimate". */
  note?: string;
}

/**
 * Up to three headline numbers in one hairline-divided strip — deliberately
 * not a grid of KPI cards.
 */
export const MetricStrip: React.FC<{ metrics: StripMetric[]; className?: string }> = ({ metrics, className }) => (
  <dl
    className={cn(
      "grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0",
      className
    )}
  >
    {metrics.slice(0, 3).map((m, i) => (
      <div
        key={m.label}
        className="flex items-baseline justify-between gap-4 px-5 py-4 motion-safe:animate-riseIn sm:flex-col-reverse sm:items-start sm:justify-end sm:gap-1 sm:py-5"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <dt className="text-sm text-muted-foreground">
          {m.label}
          {m.note && <span className="block text-xs text-muted-foreground/80">{m.note}</span>}
        </dt>
        <dd className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-medium tracking-tight text-foreground">{m.value}</span>
          {m.unit && <span className="font-mono text-sm text-muted-foreground">{m.unit}</span>}
        </dd>
      </div>
    ))}
  </dl>
);

/* -------------------------------- RowList -------------------------------- */

/** A single bordered list whose rows are separated by hairlines. */
export const RowList: React.FC<{ children: React.ReactNode; className?: string; label?: string }> = ({
  children,
  className,
  label,
}) => (
  <ul aria-label={label} className={cn("divide-y divide-border/80 overflow-hidden rounded-xl border border-border bg-card", className)}>
    {children}
  </ul>
);

interface RowItemProps {
  title: React.ReactNode;
  /** Secondary line. Keep to one line of metadata. */
  meta?: React.ReactNode;
  leading?: React.ReactNode;
  /** Right-side content (a value, a status, or an action). */
  trailing?: React.ReactNode;
  /** When set, the whole row becomes a link. */
  to?: string;
}

export const RowItem: React.FC<RowItemProps> = ({ title, meta, leading, trailing, to }) => {
  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{title}</span>
        {meta && <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{meta}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-3">{trailing}</span>}
      {to && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />}
    </>
  );

  return (
    <li>
      {to ? (
        <Link
          to={to}
          className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">{body}</div>
      )}
    </li>
  );
};

/* ------------------------------- DetailList ------------------------------ */

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

/** Label/value rows for detail pages and summary asides. */
export const DetailList: React.FC<{ items: DetailItem[]; className?: string }> = ({ items, className }) => (
  <dl className={cn("divide-y divide-border/80", className)}>
    {items.map((item) => (
      <div key={item.label} className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0">
        <dt className="shrink-0 text-sm text-muted-foreground">{item.label}</dt>
        <dd className={cn("min-w-0 text-right text-sm font-medium text-foreground", item.mono && "font-mono font-normal")}>
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);

/* ------------------------------ MaterialThumb ---------------------------- */

const CATEGORY_VISUAL: Record<MaterialCategory, { icon: LucideIcon; tone: string }> = {
  Plastic: { icon: Milk, tone: "bg-[#E7EFEA] text-[#2D6A4F]" },
  Cardboard: { icon: Box, tone: "bg-[#F0EADF] text-[#7C6440]" },
  Metal: { icon: Wrench, tone: "bg-[#E9ECEC] text-[#4D5A57]" },
  Electronics: { icon: Cpu, tone: "bg-[#E6EAEE] text-[#435264]" },
  Furniture: { icon: Armchair, tone: "bg-[#EEEAE2] text-[#6B5B45]" },
  Textile: { icon: Shirt, tone: "bg-[#EFE8E6] text-[#7A5750]" },
  Glass: { icon: GlassWater, tone: "bg-[#E4EEEE] text-[#3E6664]" },
  Organic: { icon: Leaf, tone: "bg-[#E9EFE1] text-[#52663A]" },
  "Sports equipment": { icon: Dumbbell, tone: "bg-[#E9ECEC] text-[#4D5A57]" },
  "Household items": { icon: House, tone: "bg-[#EEEAE2] text-[#6B5B45]" },
};

/**
 * Visual stand-in for a listing photo. Real images arrive with the backend;
 * until then a calm category tile keeps the grid scannable.
 */
export const MaterialThumb: React.FC<{
  category: MaterialCategory;
  size?: "sm" | "md" | "lg";
  imageUrl?: string;
  alt?: string;
  className?: string;
}> = ({ category, size = "sm", imageUrl, alt = "", className }) => {
  const visual = CATEGORY_VISUAL[category] ?? CATEGORY_VISUAL.Plastic;
  const Icon = visual.icon;
  const box =
    size === "lg"
      ? "aspect-[4/3] w-full rounded-lg"
      : size === "md"
      ? "h-14 w-14 rounded-lg"
      : "h-10 w-10 rounded-md";

  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className={cn(box, "object-cover", className)} />;
  }
  return (
    <span className={cn("flex items-center justify-center", box, visual.tone, className)} aria-hidden="true">
      <Icon className={size === "lg" ? "h-10 w-10 opacity-70" : size === "md" ? "h-6 w-6" : "h-[18px] w-[18px]"} strokeWidth={1.5} />
    </span>
  );
};

/* -------------------------------- ItemCell ------------------------------- */

/** Thumb + title (+ optional sub line) — the primary cell of record tables. */
export const ItemCell: React.FC<{
  category: MaterialCategory;
  title: string;
  sub?: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
}> = ({ category, title, sub, imageUrl, imageAlt }) => (
  <span className="flex min-w-0 items-center gap-3">
    <MaterialThumb category={category} imageUrl={imageUrl} alt={imageAlt ?? title} />
    <span className="min-w-0">
      <span className="block truncate text-sm font-medium text-foreground">{title}</span>
      {sub && <span className="block truncate text-[13px] font-normal text-muted-foreground">{sub}</span>}
    </span>
  </span>
);
