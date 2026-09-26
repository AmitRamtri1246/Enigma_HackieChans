import React from "react";
import { cn } from "@/lib/utils";

/** A single pulsing placeholder block. */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("motion-safe:animate-pulse rounded-md bg-muted", className)} aria-hidden="true" {...props} />
);

const Loading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div role="status" aria-live="polite" className={className}>
    <span className="sr-only">Loading…</span>
    {children}
  </div>
);

/** Rows inside one bordered list — matches RowList / DataTable. */
export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <Loading className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border bg-card">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 px-5 py-4">
        <Skeleton className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </Loading>
);

/** Alias kept for table screens. */
export const SkeletonTable = SkeletonList;

/** Image-led grid for the marketplace. */
export const SkeletonCards: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Loading className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="mt-3 h-4 w-3/5" />
        <Skeleton className="mt-2 h-3 w-2/5" />
      </div>
    ))}
  </Loading>
);

/** Metric strip placeholder. */
export const SkeletonStrip: React.FC = () => (
  <Loading className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-2 px-5 py-5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    ))}
  </Loading>
);
