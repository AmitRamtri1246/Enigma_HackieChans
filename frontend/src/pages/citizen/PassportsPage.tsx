import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";

export const PassportsPage: React.FC = () => {
  const navigate = useNavigate();
  const passports = useAsync(() => circularityService.getWastePassports());

  return (
    <AppShell active="passports" areaLabel="Citizen · Passports">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="Waste Passports"
          subtitle="Trace each material's journey from listing to completion."
        />

        {passports.error ? (
          <ErrorState onRetry={passports.reload} />
        ) : passports.isLoading ? (
          <SkeletonList rows={3} />
        ) : (passports.data ?? []).length === 0 ? (
          <EmptyState icon={FileText} title="No passports yet." description="Passports are created when you list a material." />
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
            {(passports.data ?? []).map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/passports/${p.id}`)}
                  className={cn(
                    "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring sm:px-5",
                    i !== (passports.data ?? []).length - 1 && "border-b border-border/70"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.material}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{p.quantity}</span> · {p.owner}
                    </p>
                  </div>
                  <StatusBadge label={p.currentStage} tone={toneFor(p.currentStage)} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};
