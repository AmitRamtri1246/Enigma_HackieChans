import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader, Section } from "@/components/common/PageHeader";
import { MetricStrip } from "@/components/common/DataDisplay";
import { ErrorState } from "@/components/common/StateViews";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonStrip } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { ImpactTrendPoint } from "@/lib/domain";

/** Impact — job: see what my actions added up to. Three numbers, one chart, one breakdown. */
export const ImpactPage: React.FC = () => {
  const impact = useAsync(() => circularityService.getImpactSummary());
  const data = impact.data;

  return (
    <AppShell active="impact" title="Impact">
      <PageContainer>
        <PageHeader title="Impact" subtitle="What keeping materials in use has added up to so far." />

        {impact.error ? (
          <ErrorState onRetry={impact.reload} />
        ) : impact.isLoading || !data ? (
          <>
            <SkeletonStrip />
            <Skeleton className="mt-12 h-56 w-full rounded-xl" />
          </>
        ) : (
          <>
            <MetricStrip
              metrics={data.metrics.map((m) => ({
                label: m.label,
                value: m.value,
                unit: m.unit,
                note: m.estimated ? "Illustrative estimate" : undefined,
              }))}
            />

            <Section title="Material diverted per month" description="Kilograms kept out of landfill, last five months.">
              <TrendChart points={data.trend} />
            </Section>

            <Section title="By material">
              <Table>
                <caption className="sr-only">Material breakdown</caption>
                <TableHeader>
                  <tr>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden w-[40%] sm:table-cell">Share</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {data.breakdown.map((b) => (
                    <TableRow key={b.category}>
                      <TableCell className="font-medium">{b.category}</TableCell>
                      <TableCell className="text-right font-mono">{b.amount}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="flex items-center gap-3">
                          <Progress value={b.percent} label={`${b.category} share`} />
                          <span className="w-10 text-right font-mono text-[13px] text-muted-foreground">{b.percent}%</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};

/** One plain bar chart. The latest month is emphasised; values are labelled. */
const TrendChart: React.FC<{ points: ImpactTrendPoint[] }> = ({ points }) => {
  const max = Math.max(...points.map((p) => p.value), 1);
  const summary = points.map((p) => `${p.label} ${p.value} kg`).join(", ");

  return (
    <figure className="rounded-xl border border-border bg-card px-5 pb-4 pt-6 sm:px-8">
      <div role="img" aria-label={`Material diverted per month: ${summary}`} className="flex h-44 items-end gap-3 sm:gap-6">
        {points.map((p, i) => {
          const latest = i === points.length - 1;
          return (
            <div key={p.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className={cn("font-mono text-xs", latest ? "text-foreground" : "text-muted-foreground")}>{p.value}</span>
              <div
                className={cn(
                  "w-full max-w-[44px] rounded-t-[4px] transition-[height] duration-500 ease-out",
                  latest ? "bg-brand-forest" : "bg-brand-sage/35"
                )}
                style={{ height: `${Math.max(4, (p.value / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 border-t border-border pt-2 sm:gap-6" aria-hidden="true">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center text-xs text-muted-foreground">
            {p.label}
          </span>
        ))}
      </div>
    </figure>
  );
};
