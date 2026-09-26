import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { WastePassport } from "@/lib/domain";
import { Building2 } from "lucide-react";

export const OrgReceiptsPage: React.FC = () => {
  // Receipts are completed passports the organization has received.
  const passports = useAsync(() => circularityService.getWastePassports());
  const received = (passports.data ?? []).filter((p) => p.currentStage === "Completed");

  return (
    <AppShell active="receipts">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="Receipts"
          subtitle="Materials your organization has received and processed."
        />

        {passports.error ? (
          <ErrorState onRetry={passports.reload} />
        ) : passports.isLoading ? (
          <SkeletonList rows={3} />
        ) : received.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No receipts yet."
            description="Confirmed materials will appear here once received."
          />
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
            {received.map((p, i, arr) => (
              <ReceiptRow key={p.id} passport={p} last={i === arr.length - 1} />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

const ReceiptRow: React.FC<{ passport: WastePassport; last: boolean }> = ({ passport, last }) => (
  <li
    className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 sm:px-5 ${
      last ? "" : "border-b border-border/70"
    }`}
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{passport.material}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        <span className="font-mono">{passport.quantity}</span> · {passport.category}
      </p>
    </div>
    {passport.outcome && <StatusBadge label={passport.outcome} tone={toneFor(passport.outcome)} />}
    <span className="font-mono text-xs text-muted-foreground">
      {passport.co2eEstimate} kg CO₂e
    </span>
  </li>
);
