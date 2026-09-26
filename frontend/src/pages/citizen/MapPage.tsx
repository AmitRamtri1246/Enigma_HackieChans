import React, { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/StateViews";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { parseKm } from "@/lib/format";
import type { MapPoint, MapPointKind } from "@/lib/domain";
import { Recycle, Repeat, Sprout, Trash2, type LucideIcon } from "lucide-react";

const KIND: Record<MapPointKind, { label: string; icon: LucideIcon; dot: string }> = {
  reuse: { label: "Reuse", icon: Sprout, dot: "bg-brand-sage" },
  recycler: { label: "Recyclers", icon: Recycle, dot: "bg-brand-forest" },
  exchange: { label: "Exchange points", icon: Repeat, dot: "bg-[#5B8C7B]" },
  collection: { label: "Collection points", icon: Trash2, dot: "bg-[#B08A4A]" },
};

type Filter = MapPointKind | "all";

/**
 * Circular Map — job: find the nearest place for an item.
 * Illustrative map (no live geocoding) with a filterable, distance-sorted list.
 */
export const MapPage: React.FC = () => {
  const points = useAsync(() => circularityService.getMapPoints());
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = [...(points.data ?? [])]
    .filter((p) => filter === "all" || p.kind === filter)
    .sort((a, b) => parseKm(a.distance) - parseKm(b.distance));

  return (
    <AppShell active="circular-map" title="Circular Map">
      <PageContainer size="wide">
        <PageHeader title="Circular Map" subtitle="Reuse spots, recyclers, exchange and collection points near Riverside." />

        {/* Filter chips double as the legend */}
        <div role="group" aria-label="Filter places" className="mb-6 flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            All places
          </Chip>
          {(Object.keys(KIND) as MapPointKind[]).map((k) => (
            <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
              <span className={cn("h-2 w-2 rounded-full", KIND[k].dot)} aria-hidden="true" />
              {KIND[k].label}
            </Chip>
          ))}
        </div>

        {points.error ? (
          <ErrorState onRetry={points.reload} />
        ) : points.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-[#EEF1EC]">
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 75">
                <path d="M0 42 C 30 38, 60 30, 100 33" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
                <path d="M44 0 C 46 25, 50 50, 56 75" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                <path d="M0 64 C 25 58, 40 66, 70 60 S 100 55, 100 55" stroke="#DCE6E0" strokeWidth="5" fill="none" />
              </svg>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                <span className="block h-3.5 w-3.5 rounded-full border-2 border-brand-white bg-brand-ink shadow" />
              </span>
              <span className="absolute bottom-3 left-3 rounded-md bg-card/90 px-2 py-1 text-xs text-muted-foreground">
                Illustrative map · you are at the centre
              </span>
              {visible.map((p) => {
                const Icon = KIND[p.kind].icon;
                const active = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(active ? null : p.id)}
                    aria-pressed={active}
                    aria-label={`${p.name}, ${p.distance}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-white text-brand-white shadow-sm transition-transform duration-150 hover:scale-110",
                        KIND[p.kind].dot,
                        active && "scale-125"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>

            <ul aria-label="Nearby places, closest first" className="divide-y divide-border/80 self-start overflow-hidden rounded-xl border border-border bg-card">
              {visible.map((p) => (
                <PlaceRow key={p.id} point={p} active={selected === p.id} onSelect={() => setSelected(p.id)} />
              ))}
            </ul>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
};

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      active ? "border-brand-forest bg-brand-forest text-brand-white" : "border-border bg-card text-foreground hover:bg-secondary"
    )}
  >
    {children}
  </button>
);

const PlaceRow: React.FC<{ point: MapPoint; active: boolean; onSelect: () => void }> = ({ point, active, onSelect }) => (
  <li>
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
        active && "bg-brand-soft/40"
      )}
    >
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", KIND[point.kind].dot)} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{point.name}</span>
        <span className="block text-[13px] text-muted-foreground">
          {KIND[point.kind].label} · {point.area}
        </span>
      </span>
      <span className="font-mono text-sm text-muted-foreground">{point.distance}</span>
    </button>
  </li>
);
