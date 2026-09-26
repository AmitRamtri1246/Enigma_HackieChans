import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCards } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { cn } from "@/lib/utils";
import type { SmartBin } from "@/lib/domain";
import { Trash2 } from "lucide-react";

export const AdminBinsPage: React.FC = () => {
  const bins = useAsync(() => circularityService.getSmartBins());

  return (
    <AppShell active="bins" areaLabel="Municipality · Bins">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Smart Bins" subtitle="Seeded demo bins — fill levels are illustrative, not live IoT data." />

        {bins.error ? (
          <ErrorState onRetry={bins.reload} />
        ) : bins.isLoading ? (
          <SkeletonCards count={4} />
        ) : (bins.data ?? []).length === 0 ? (
          <EmptyState icon={Trash2} title="No bins registered." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(bins.data ?? []).map((b) => <BinCard key={b.id} bin={b} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const BinCard: React.FC<{ bin: SmartBin }> = ({ bin }) => {
  const critical = bin.fillLevel >= 85;
  return (
    <article className="rounded-[10px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">{bin.area}</h3>
          <p className="text-xs text-muted-foreground">{bin.category} · last collected {bin.lastCollection}</p>
        </div>
        <StatusBadge label={bin.priority} tone={toneFor(bin.priority)} />
      </div>

      {/* Fill level */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Fill level</span>
          <span className={cn("font-mono font-medium", critical ? "text-destructive" : "text-brand-forest")}>{bin.fillLevel}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none", critical ? "bg-destructive" : "bg-brand-sage")} style={{ width: `${bin.fillLevel}%` }} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Est. overflow in ~<span className="font-mono">{bin.overflowEstimateHrs}h</span> · illustrative estimate
      </p>
    </article>
  );
};
