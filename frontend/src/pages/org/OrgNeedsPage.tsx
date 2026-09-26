import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { OrganizationNeed } from "@/lib/domain";
import { Inbox } from "lucide-react";

export const OrgNeedsPage: React.FC = () => {
  const needs = useAsync(() => circularityService.getOrganizationNeeds());

  return (
    <AppShell active="needs">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="Material needs"
          subtitle="Materials your organization is currently looking to receive."
        />

        {needs.error ? (
          <ErrorState onRetry={needs.reload} />
        ) : needs.isLoading ? (
          <SkeletonList rows={3} />
        ) : (needs.data ?? []).length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No active needs."
            description="Add a material need to start receiving matches."
          />
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
            {(needs.data ?? []).map((n, i, arr) => (
              <NeedRow key={n.id} need={n} last={i === arr.length - 1} />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

const NeedRow: React.FC<{ need: OrganizationNeed; last: boolean }> = ({ need, last }) => (
  <li
    className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 sm:px-5 ${
      last ? "" : "border-b border-border/70"
    }`}
  >
    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{need.material}</span>
    <span className="font-mono text-sm text-foreground/80">{need.quantity}</span>
    <span className="hidden text-sm text-muted-foreground sm:inline">
      Needed by <span className="font-mono">{need.neededBy}</span>
    </span>
    <StatusBadge label={need.status} tone={toneFor(need.status)} />
  </li>
);
