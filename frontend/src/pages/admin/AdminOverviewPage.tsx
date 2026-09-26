import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader, Section, TextLink } from "@/components/common/PageHeader";
import { ItemCell, MetricStrip, RowItem, RowList } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonList, SkeletonStrip, SkeletonTable } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { binTone } from "@/lib/format";
import type { PickupTask, SmartBin } from "@/lib/domain";
import { CheckCircle2, ClipboardList, Trash2 } from "lucide-react";

const COLLECTED_STAGES = ["Collected", "Delivered", "Received", "Completed"];

/**
 * Municipality Overview — exception monitoring.
 * 3 metrics → what needs attention → tasks → bins.
 */
export const AdminOverviewPage: React.FC = () => {
  const tasks = useAsync(() => circularityService.getPickupTasks());
  const bins = useAsync(() => circularityService.getSmartBins());
  const passports = useAsync(() => circularityService.getWastePassports());

  const collected = (passports.data ?? []).filter((p) => COLLECTED_STAGES.includes(p.currentStage)).length;
  const completed = (passports.data ?? []).filter((p) => p.currentStage === "Completed").length;
  const hotBins = (bins.data ?? []).filter((b) => b.priority === "High" || b.fillLevel >= 85).sort((a, b) => a.overflowEstimateHrs - b.overflowEstimateHrs);
  const unassigned = (tasks.data ?? []).filter((t) => t.status === "Unassigned");
  const loading = tasks.isLoading || bins.isLoading || passports.isLoading;

  const taskColumns: Column<PickupTask>[] = [
    { id: "item", header: "Material", mobile: "primary", cell: (t) => <ItemCell category={t.category} title={t.material} sub={t.pickupArea} /> },
    { id: "qty", header: "Est.", cell: (t) => <span className="font-mono">{t.estimatedQuantity}</span> },
    { id: "collector", header: "Collector", cell: (t) => (t.collector ? t.collector : <span className="text-muted-foreground">Unassigned</span>) },
    { id: "status", header: "Status", mobile: "trailing", cell: (t) => <StatusBadge status={t.status} /> },
  ];

  const binColumns: Column<SmartBin>[] = [
    { id: "area", header: "Bin", mobile: "primary", cell: (b) => <span className="font-medium">{b.area}</span> },
    { id: "cat", header: "Stream", cell: (b) => <span className="text-muted-foreground">{b.category}</span> },
    {
      id: "fill",
      header: "Fill level",
      mobile: "trailing",
      className: "w-56",
      cell: (b) => (
        <span className="flex items-center gap-3">
          <Progress value={b.fillLevel} label={`${b.area} fill level`} tone={binTone(b.fillLevel)} className="hidden w-28 sm:block" />
          <span className="w-10 text-right font-mono text-sm">{b.fillLevel}%</span>
        </span>
      ),
    },
  ];

  return (
    <AppShell active="overview" title="Overview">
      <PageContainer>
        <PageHeader title="Overview" subtitle="Riverside collection network. Seeded demo data, not live sensors." />

        {passports.error ? (
          <ErrorState onRetry={passports.reload} />
        ) : loading ? (
          <SkeletonStrip />
        ) : (
          <MetricStrip
            metrics={[
              { label: "Materials collected", value: String(collected) },
              { label: "Reused or recycled", value: String(completed) },
              { label: "Need attention", value: String(hotBins.length + unassigned.length) },
            ]}
          />
        )}

        <Section title="Needs attention" description="Bins close to overflow and pickups without a collector.">
          {tasks.error || bins.error ? (
            <ErrorState onRetry={() => { tasks.reload(); bins.reload(); }} />
          ) : loading ? (
            <SkeletonList rows={3} />
          ) : hotBins.length + unassigned.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing needs attention." description="All bins are below threshold and every pickup has a collector." />
          ) : (
            <RowList label="Needs attention">
              {unassigned.map((t) => (
                <RowItem
                  key={t.id}
                  leading={<span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F5EFE2] text-[#7A5A1C]"><ClipboardList className="h-[18px] w-[18px]" aria-hidden="true" /></span>}
                  title={`${t.material} pickup has no collector`}
                  meta={
                    <>
                      {t.pickupArea} · <span className="font-mono">{t.estimatedQuantity}</span> · {t.window}
                    </>
                  }
                  trailing={
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/tasks/${t.id}`}>Assign</Link>
                    </Button>
                  }
                />
              ))}
              {hotBins.map((b) => (
                <RowItem
                  key={b.id}
                  to="/admin/bins"
                  leading={<span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-danger/10 text-[#A4463B]"><Trash2 className="h-[18px] w-[18px]" aria-hidden="true" /></span>}
                  title={`${b.area} bin at ${b.fillLevel}%`}
                  meta={
                    <>
                      {b.category} · overflow in ~<span className="font-mono">{b.overflowEstimateHrs}h</span> (est.)
                    </>
                  }
                />
              ))}
            </RowList>
          )}
        </Section>

        <Section title="Collection tasks" action={<TextLink to="/admin/tasks">View all</TextLink>}>
          {tasks.error ? (
            <ErrorState onRetry={tasks.reload} />
          ) : tasks.isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <DataTable label="Collection tasks" columns={taskColumns} rows={(tasks.data ?? []).slice(0, 5)} rowKey={(t) => t.id} rowHref={(t) => `/admin/tasks/${t.id}`} />
          )}
        </Section>

        <Section title="Smart bins" action={<TextLink to="/admin/bins">View all</TextLink>}>
          {bins.error ? (
            <ErrorState onRetry={bins.reload} />
          ) : bins.isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <DataTable
              label="Smart bins by fill level"
              columns={binColumns}
              rows={[...(bins.data ?? [])].sort((a, b) => b.fillLevel - a.fillLevel).slice(0, 4)}
              rowKey={(b) => b.id}
            />
          )}
        </Section>
      </PageContainer>
    </AppShell>
  );
};
