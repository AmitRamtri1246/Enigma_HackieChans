import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService, AVAILABLE_COLLECTORS } from "@/lib/circularity-service";
import { ArrowLeft, ClipboardList, MapPin, PackageCheck, Truck, Check, Loader2 } from "lucide-react";

export const AdminTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const task = useAsync(() => circularityService.getPickupTask(id ?? ""), [id]);

  const [selected, setSelected] = useState<string>(AVAILABLE_COLLECTORS[0]);
  const [busy, setBusy] = useState(false);

  const assign = async () => {
    if (!task.data) return;
    setBusy(true);
    await circularityService.assignCollector(task.data.id, selected);
    setBusy(false);
    toast(`Assigned to ${selected}. The task now appears in their pickups.`);
  };

  return (
    <AppShell active="tasks" areaLabel="Municipality · Task">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <button type="button" onClick={() => navigate("/admin/tasks")} className="mb-5 inline-flex items-center gap-1.5 rounded px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" />
          Back to Collection Tasks
        </button>

        {task.error ? (
          <ErrorState onRetry={task.reload} />
        ) : task.isLoading ? (
          <SkeletonList rows={3} />
        ) : !task.data ? (
          <EmptyState icon={ClipboardList} title="Task not found." action={<Button variant="outline" onClick={() => navigate("/admin/tasks")}>All tasks</Button>} />
        ) : (
          <>
            <PageHeader
              title={task.data.material}
              subtitle={`Est. ${task.data.estimatedQuantity} · ${task.data.window}`}
              action={<StatusBadge label={task.data.status} tone={toneFor(task.data.status)} />}
            />

            <dl className="grid grid-cols-1 gap-2 rounded-[10px] border border-border bg-card p-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-sage" /><span className="text-muted-foreground">Pickup:</span><span className="font-medium text-foreground">{task.data.pickupArea}</span></div>
              <div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-brand-sage" /><span className="text-muted-foreground">Destination:</span><span className="font-medium text-foreground">{task.data.destination}</span></div>
              <div className="flex items-center gap-2"><span className="text-muted-foreground">Priority:</span><StatusBadge label={task.data.priority} tone={toneFor(task.data.priority)} /></div>
              {task.data.actualQuantity && <div className="flex items-center gap-2"><span className="text-muted-foreground">Collected:</span><span className="font-mono font-medium text-foreground">{task.data.actualQuantity}</span></div>}
            </dl>

            {/* Assignment */}
            <section className="mt-8 rounded-[10px] border border-border bg-card p-5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Assign a collector</h2>
              {task.data.collector ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand-sage"><Check className="h-3.5 w-3.5 stroke-[3]" /></span>
                  Assigned to <span className="font-medium">{task.data.collector}</span>
                </p>
              ) : (
                <div className="mt-3 space-y-4">
                  <fieldset className="space-y-2">
                    <legend className="sr-only">Choose a collector</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {AVAILABLE_COLLECTORS.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={selected === c} onClick={() => setSelected(c)}
                          className={cn("flex items-center justify-between rounded-[10px] border px-3 py-2.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected === c ? "border-brand-forest bg-brand-soft/60 font-medium text-brand-forest" : "border-border text-foreground hover:border-brand-sage/50 hover:bg-accent/40")}>
                          {c}{selected === c && <Check className="h-4 w-4 text-brand-sage" />}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Button onClick={assign} disabled={busy} className="gap-2">
                    {busy ? <><Loader2 className="h-4 w-4 motion-safe:animate-spin" />Assigning…</> : <><Truck className="h-4 w-4" />Assign collector</>}
                  </Button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};
