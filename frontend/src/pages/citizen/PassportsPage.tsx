import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { JOURNEY_STAGES, type WastePassport } from "@/lib/domain";
import { FileText } from "lucide-react";

/** Waste Passports — job: see where each material is in its journey. */
export const PassportsPage: React.FC = () => {
  const passports = useAsync(() => circularityService.getWastePassports());
  const rows = passports.data ?? [];

  const columns: Column<WastePassport>[] = [
    { id: "item", header: "Material", mobile: "primary", cell: (p) => <ItemCell category={p.category} title={p.material} sub={p.owner} /> },
    { id: "qty", header: "Quantity", cell: (p) => <span className="font-mono">{p.quantity}</span> },
    {
      id: "progress",
      header: "Journey",
      mobile: "hidden",
      className: "w-48",
      cell: (p) => {
        const step = JOURNEY_STAGES.indexOf(p.currentStage) + 1;
        return (
          <span className="flex items-center gap-3">
            <Progress value={(step / JOURNEY_STAGES.length) * 100} label={`${p.material} journey progress`} className="w-24" />
            <span className="font-mono text-[13px] text-muted-foreground">
              {step}/{JOURNEY_STAGES.length}
            </span>
          </span>
        );
      },
    },
    { id: "stage", header: "Stage", mobile: "trailing", cell: (p) => <StatusBadge status={p.currentStage} /> },
  ];

  return (
    <AppShell active="passports" title="Waste Passports">
      <PageContainer>
        <PageHeader title="Waste Passports" subtitle="A traceable record of each material, from listing to completion." />
        {passports.error ? (
          <ErrorState onRetry={passports.reload} />
        ) : passports.isLoading ? (
          <SkeletonTable rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No passports yet." description="A passport is created when a material is listed." />
        ) : (
          <DataTable label="Waste passports" columns={columns} rows={rows} rowKey={(p) => p.id} rowHref={(p) => `/passports/${p.id}`} />
        )}
      </PageContainer>
    </AppShell>
  );
};
