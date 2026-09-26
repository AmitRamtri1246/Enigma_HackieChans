import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PriorityLabel } from "@/components/common/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { binTone } from "@/lib/format";
import type { SmartBin } from "@/lib/domain";
import { Trash2 } from "lucide-react";

/** Smart Bins — job: spot which bins to empty first. Fullest first. */
export const AdminBinsPage: React.FC = () => {
  const bins = useAsync(() => circularityService.getSmartBins());
  const rows = [...(bins.data ?? [])].sort((a, b) => b.fillLevel - a.fillLevel);

  const columns: Column<SmartBin>[] = [
    {
      id: "bin",
      header: "Bin",
      mobile: "primary",
      cell: (b) => (
        <span className="block">
          <span className="block font-medium">{b.area}</span>
          <span className="block font-mono text-xs font-normal text-muted-foreground">{b.id.toUpperCase()}</span>
        </span>
      ),
    },
    { id: "stream", header: "Stream", cell: (b) => <span className="text-muted-foreground">{b.category}</span> },
    {
      id: "fill",
      header: "Fill level",
      mobile: "trailing",
      className: "w-60",
      cell: (b) => (
        <span className="flex items-center gap-3">
          <Progress value={b.fillLevel} label={`${b.area} fill level`} tone={binTone(b.fillLevel)} className="hidden w-32 sm:block" />
          <span className="w-10 text-right font-mono text-sm">{b.fillLevel}%</span>
        </span>
      ),
    },
    { id: "last", header: "Last collection", cell: (b) => <span className="text-muted-foreground">{b.lastCollection}</span> },
    {
      id: "overflow",
      header: "Est. overflow",
      align: "right",
      cell: (b) => <span className="font-mono">~{b.overflowEstimateHrs}h</span>,
    },
    { id: "priority", header: "Priority", mobile: "hidden", cell: (b) => <PriorityLabel priority={b.priority} /> },
  ];

  return (
    <AppShell active="bins">
      <PageContainer>
        <PageHeader title="Smart Bins" subtitle="Fill levels and overflow estimates are seeded demo values, not live IoT data." />
        {bins.error ? (
          <ErrorState onRetry={bins.reload} />
        ) : bins.isLoading ? (
          <SkeletonTable rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState icon={Trash2} title="No bins registered." />
        ) : (
          <DataTable label="Smart bins, fullest first" columns={columns} rows={rows} rowKey={(b) => b.id} />
        )}
      </PageContainer>
    </AppShell>
  );
};
