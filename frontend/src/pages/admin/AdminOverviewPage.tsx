import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCards } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupTask, SmartBin } from "@/lib/domain";
import { Trash2, ClipboardList, ArrowRight, AlertTriangle } from "lucide-react";

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const tasks = useAsync(() => circularityService.getPickupTasks());
  const bins = useAsync(() => circularityService.getSmartBins());
  const passports = useAsync(() => circularityService.getWastePassports());

  const isLoading = tasks.isLoading || bins.isLoading || passports.isLoading;
  const hasError = tasks.error || bins.error || passports.error;

  const collected = (passports.data ?? []).filter((p) => ["Collected", "Delivered", "Received", "Completed"].includes(p.currentStage)).length;
  const reused = (passports.data ?? []).filter((p) => p.currentStage === "Completed").length;
  const attentionBins = (bins.data ?? []).filter((b) => b.priority === "High");
  const unassigned = (tasks.data ?? []).filter((t) => t.status === "Unassigned");

  return (
    <AppShell active="overview" areaLabel="Municipality">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Riverside Municipality" subtitle="Coordinate collection and keep materials circulating." />

        {hasError ? (
          <ErrorState onRetry={() => { tasks.reload(); bins.reload(); passports.reload(); }} />
        ) : isLoading ? (
          <SkeletonCards count={3} />
        ) : (
          <>
            {/* 3 metrics */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Metric value={String(collected)} label="Materials collected" />
              <Metric value={String(reused)} label="Reused / recycled" />
              <Metric value={String(attentionBins.length + unassigned.length)} label="Needs attention" />
            </div>

            {/* Needs attention */}
            <section className="mt-10" aria-labelledby="attn-h">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-danger" />
                <h2 id="attn-h" className="text-base font-semibold tracking-tight text-foreground">Needs attention</h2>
              </div>

              {attentionBins.length === 0 && unassigned.length === 0 ? (
                <EmptyState title="Everything's under control." description="No high-priority bins or unassigned tasks right now." />
              ) : (
                <div className="space-y-3">
                  {attentionBins.map((b) => <AttnBin key={b.id} bin={b} onOpen={() => navigate("/admin/bins")} />)}
                  {unassigned.map((t) => <AttnTask key={t.id} task={t} onAssign={() => navigate(`/admin/tasks/${t.id}`)} />)}
                </div>
              )}
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline" className="gap-1.5" onClick={() => navigate("/admin/tasks")}><ClipboardList className="h-4 w-4" />Collection tasks</Button>
              <Button variant="outline" className="gap-1.5" onClick={() => navigate("/admin/bins")}><Trash2 className="h-4 w-4" />Smart bins</Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

const Metric: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="rounded-[10px] border border-border/80 bg-card p-5">
    <p className="font-mono text-2xl font-medium tracking-tight text-brand-forest">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
  </div>
);

const AttnBin: React.FC<{ bin: SmartBin; onOpen: () => void }> = ({ bin, onOpen }) => (
  <div className="flex items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3.5">
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", bin.fillLevel >= 85 ? "bg-destructive/10 text-destructive" : "bg-brand-soft text-brand-sage")}>
      <Trash2 className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{bin.area}</p>
      <p className="text-xs text-muted-foreground"><span className="font-mono">{bin.fillLevel}%</span> full · overflow in ~<span className="font-mono">{bin.overflowEstimateHrs}h</span> (est.)</p>
    </div>
    <StatusBadge label={bin.priority} tone={toneFor(bin.priority)} />
    <button type="button" onClick={onOpen} className="rounded px-1 text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">View</button>
  </div>
);

const AttnTask: React.FC<{ task: PickupTask; onAssign: () => void }> = ({ task, onAssign }) => (
  <div className="flex items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-sage"><ClipboardList className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{task.material}</p>
      <p className="text-xs text-muted-foreground"><span className="font-mono">{task.estimatedQuantity}</span> · {task.pickupArea} · unassigned</p>
    </div>
    <Button size="sm" variant="outline" onClick={onAssign} className="gap-1.5">Assign<ArrowRight className="h-3.5 w-3.5" /></Button>
  </div>
);
