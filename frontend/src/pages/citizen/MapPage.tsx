import React, { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/StateViews";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { usePreviewRole } from "@/lib/use-preview-role";
import { cn } from "@/lib/utils";
import type { MapPoint, MapPointKind } from "@/lib/domain";
import { Recycle, Repeat, Sprout, Trash2, MapPin, type LucideIcon } from "lucide-react";

const KIND_META: Record<MapPointKind, { label: string; icon: LucideIcon; color: string }> = {
  reuse: { label: "Reuse opportunity", icon: Sprout, color: "bg-brand-sage" },
  recycler: { label: "Recycler", icon: Recycle, color: "bg-brand-forest" },
  exchange: { label: "Exchange point", icon: Repeat, color: "bg-emerald-500" },
  collection: { label: "Collection point", icon: Trash2, color: "bg-amber-500" },
};

export const MapPage: React.FC = () => {
  const { role } = usePreviewRole();
  const points = useAsync(() => circularityService.getMapPoints());
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AppShell active="circular-map" areaLabel={`${cap(role)} · Map`}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Circular Map" subtitle="Discover nearby reuse, recycling, exchange and collection points." />

        {points.error ? (
          <ErrorState onRetry={points.reload} />
        ) : points.isLoading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Mock map canvas */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-border bg-secondary/40 bg-grid-subtle">
              {/* Illustrative roads */}
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <line x1="0" y1="55%" x2="100%" y2="45%" stroke="hsl(var(--border))" strokeWidth="8" />
                <line x1="40%" y1="0" x2="55%" y2="100%" stroke="hsl(var(--border))" strokeWidth="8" />
              </svg>
              {/* "You" marker */}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" title="Your area">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-forest ring-4 ring-brand-forest/20" />
              </span>
              {(points.data ?? []).map((p) => {
                const meta = KIND_META[p.kind];
                const Icon = meta.icon;
                const active = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(active ? null : p.id)}
                    aria-label={`${p.name}, ${meta.label}`}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-brand-white shadow-sm transition-transform duration-150 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-ring", meta.color, active && "scale-110 ring-2 ring-ring")}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend + list */}
            <div className="space-y-5">
              <div className="rounded-[10px] border border-border bg-card p-4">
                <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Legend</p>
                <ul className="space-y-2">
                  {(Object.keys(KIND_META) as MapPointKind[]).map((k) => {
                    const meta = KIND_META[k];
                    return (
                      <li key={k} className="flex items-center gap-2 text-sm text-foreground">
                        <span className={cn("h-2.5 w-2.5 rounded-full", meta.color)} />
                        {meta.label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <ul className="space-y-2">
                {(points.data ?? []).map((p) => (
                  <PointRow key={p.id} point={p} active={selected === p.id} onSelect={() => setSelected(p.id)} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

const PointRow: React.FC<{ point: MapPoint; active: boolean; onSelect: () => void }> = ({ point, active, onSelect }) => {
  const meta = KIND_META[point.kind];
  const Icon = meta.icon;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 rounded-[10px] border bg-card px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          active ? "border-brand-sage/60 bg-accent/40" : "border-border/80 hover:border-brand-sage/40"
        )}
      >
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-white", meta.color)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{point.name}</p>
          <p className="text-xs text-muted-foreground">{meta.label} · {point.area}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />{point.distance}
        </span>
      </button>
    </li>
  );
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
