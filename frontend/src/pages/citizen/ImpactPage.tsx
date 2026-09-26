import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCards } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/StateViews";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { usePreviewRole } from "@/lib/use-preview-role";
import type { ImpactMetric, ImpactTrendPoint, MaterialBreakdownItem } from "@/lib/domain";

export const ImpactPage: React.FC = () => {
  const { role } = usePreviewRole();
  const impact = useAsync(() => circularityService.getImpactSummary());
  const activeId = role === "organization" ? "home" : "impact";

  return (
    <AppShell active={activeId} areaLabel={`${cap(role)} · Impact`}>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Impact" subtitle="Your contribution to keeping materials in use." />

        {impact.error ? (
          <ErrorState onRetry={impact.reload} />
        ) : impact.isLoading || !impact.data ? (
          <SkeletonCards count={3} />
        ) : (
          <div className="space-y-10">
            {/* 3 metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {impact.data.metrics.map((m, i) => <Metric key={m.id} metric={m} index={i} />)}
            </div>

            {/* Simple trend chart */}
            <section>
              <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">Material diverted over time</h2>
              <TrendChart points={impact.data.trend} />
            </section>

            {/* Breakdown */}
            <section>
              <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">By material</h2>
              <div className="space-y-3 rounded-[10px] border border-border bg-card p-5">
                {impact.data.breakdown.map((b) => <BreakdownRow key={b.category} item={b} />)}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
};

const Metric: React.FC<{ metric: ImpactMetric; index: number }> = ({ metric, index }) => (
  <div className="motion-safe:animate-riseIn rounded-[10px] border border-border/80 bg-card p-5" style={{ animationDelay: `${index * 70}ms` }}>
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-2xl font-medium tracking-tight text-brand-forest">{metric.value}</span>
      {metric.unit && <span className="font-mono text-sm text-muted-foreground">{metric.unit}</span>}
    </div>
    <p className="mt-1 text-sm text-muted-foreground">
      {metric.estimated && <span className="text-muted-foreground/80">Estimated </span>}
      {metric.label}
    </p>
  </div>
);

const TrendChart: React.FC<{ points: ImpactTrendPoint[] }> = ({ points }) => {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="rounded-[10px] border border-border bg-card p-5">
      <div className="flex items-end justify-between gap-3" style={{ height: 160 }}>
        {points.map((p) => (
          <div key={p.label} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{p.value}</span>
            <div
              className="w-full max-w-[48px] rounded-t-md bg-brand-sage/85 transition-[height] duration-500 ease-out motion-reduce:transition-none"
              style={{ height: `${(p.value / max) * 120}px` }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Kilograms of material diverted per month · illustrative.</p>
    </div>
  );
};

const BreakdownRow: React.FC<{ item: MaterialBreakdownItem }> = ({ item }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-sm">
      <span className="font-medium text-foreground">{item.category}</span>
      <span className="font-mono text-muted-foreground">{item.amount}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-brand-sage transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${item.percent}%` }} aria-hidden="true" />
    </div>
  </div>
);

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
