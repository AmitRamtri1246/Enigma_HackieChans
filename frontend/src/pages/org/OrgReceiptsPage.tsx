import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { formatDate } from "@/lib/format";
import type { WastePassport } from "@/lib/domain";
import { ClipboardCheck } from "lucide-react";

/** Receipts — job: a record of what arrived and what became of it. */
export const OrgReceiptsPage: React.FC = () => {
  const passports = useAsync(() => circularityService.getWastePassports());
  const received = (passports.data ?? []).filter((p) => p.currentStage === "Completed");

  const receivedOn = (p: WastePassport) => {
    const evt = p.timeline.find((e) => e.stage === "Received") ?? p.timeline[p.timeline.length - 1];
    return formatDate(evt?.date ?? "");
  };

  const columns: Column<WastePassport>[] = [
    { id: "item", header: "Material", mobile: "primary", cell: (p) => <ItemCell category={p.category} title={p.material} sub={`From ${p.owner}`} /> },
    { id: "qty", header: "Received", cell: (p) => <span className="font-mono">{p.quantity}</span> },
    { id: "date", header: "Date", cell: (p) => <span className="font-mono">{receivedOn(p)}</span> },
    { id: "co2", header: "Est. CO₂e", align: "right", mobile: "hidden", cell: (p) => <span className="font-mono text-muted-foreground">{p.co2eEstimate} kg</span> },
    { id: "outcome", header: "Outcome", mobile: "trailing", cell: (p) => (p.outcome ? <StatusBadge status={p.outcome} /> : null) },
  ];

  return (
    <AppShell active="receipts">
      <PageContainer>
        <PageHeader title="Receipts" subtitle="Materials EcoPack has received and what they became." />
        {passports.error ? (
          <ErrorState onRetry={passports.reload} />
        ) : passports.isLoading ? (
          <SkeletonTable rows={3} />
        ) : received.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No receipts yet." description="Accept a match and confirm what arrived to record it here." />
        ) : (
          <>
            <DataTable label="Receipts" columns={columns} rows={received} rowKey={(p) => p.id} rowHref={(p) => `/passports/${p.id}`} />
            <p className="mt-3 text-xs text-muted-foreground">CO₂e values are illustrative estimates.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};
