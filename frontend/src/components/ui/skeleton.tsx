import React from "react";
import { cn } from "@/lib/utils";

/** A single shimmering placeholder block. */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("motion-safe:animate-pulse rounded-md bg-muted/70", className)}
    aria-hidden="true"
    {...props}
  />
);

/** A list of skeleton rows for record-style screens. */
export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-3" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="rounded-[10px] border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="mt-3 h-3 w-24" />
      </div>
    ))}
  </div>
);

/** A grid of skeleton cards. */
export const SkeletonCards: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-[10px] border border-border/70 bg-card p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-3 w-20" />
        <Skeleton className="mt-2 h-3 w-24" />
        <Skeleton className="mt-4 h-8 w-full" />
      </div>
    ))}
  </div>
);
