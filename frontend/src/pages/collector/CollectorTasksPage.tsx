import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupTask } from "@/lib/domain";
import { Truck, MapPin, ArrowRight, ClipboardList, PackageCheck } from "lucide-react";

const COLLECTOR_NAME = "Sam Ortiz";

export const CollectorTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const tasks = useAsync(() => circularityService.getPickupTasks());

  const mine = (tasks.data ?? []).filter((t) => t.collector === COLLECTOR_NAME);
  const active = mine.filter((t) => t.status === "Assigned" || t.status === "Collected");
  const done = mine.filter((t) => t.status === "Delivered");
  const next = active[0] ?? null;
  const upcoming = active.slice(1);

  return (
    <AppShell active="tasks" areaLabel="Collector · Tasks">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <PageHeader title="Pickups" subtitle={`Assigned to ${COLLECTOR_NAME}`} />

        {tasks.error ? (
          <ErrorState onRetry={tasks.reload} />
        ) : tasks.isLoading ? (
          <SkeletonList rows={3} />
        ) : mine.length === 0 ? (
          <EmptyState icon={Truck} title="No pickups assigned." description="Assigned pickups from the municipality will appear here." />
        ) : (
          <div className="space-y-8">
            {/* Next task — hero */}
            {next && (
              <section aria-labelledby="next-h">
                <p id="next-h" className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-sage">Next task</p>
                <div className="rounded-[12px] border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">{next.material}</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">Est. <span className="font-mono">{next.estimatedQuantity}</span></p>
                    </div>
                    <StatusBadge label={next.priority} tone={toneFor(next.priority)} />
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <Row icon={MapPin} label="Pickup" value={next.pickupArea} />
                    <Row icon={PackageCheck} label="Destination" value={next.destination} />
                  </dl>
                  <p className="mt-3 text-sm text-muted-foreground">Window: <span className="font-mono">{next.window}</span></p>

                  <div className="mt-5">
                    <Button className="gap-2" onClick={() => navigate(`/collector/tasks/${next.id}`)}>
                      <Truck className="h-4 w-4" />
                      {next.status === "Collected" ? "Continue pickup" : "Start pickup"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section aria-labelledby="up-h">
                <h2 id="up-h" className="mb-3 text-base font-semibold tracking-tight text-foreground">Upcoming</h2>
                <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
                  {upcoming.map((t, i) => <TaskRow key={t.id} task={t} last={i === upcoming.length - 1} onOpen={() => navigate(`/collector/tasks/${t.id}`)} />)}
                </ul>
              </section>
            )}

            {/* Completed */}
            {done.length > 0 && (
              <section aria-labelledby="done-h">
                <h2 id="done-h" className="mb-3 text-base font-semibold tracking-tight text-foreground">Delivered</h2>
                <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
                  {done.map((t, i) => <TaskRow key={t.id} task={t} last={i === done.length - 1} onOpen={() => navigate(`/collector/tasks/${t.id}`)} />)}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const Row: React.FC<{ icon: typeof MapPin; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 shrink-0 text-brand-sage" />
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const TaskRow: React.FC<{ task: PickupTask; last: boolean; onOpen: () => void }> = ({ task, last, onOpen }) => (
  <li className={cn(!last && "border-b border-border/70")}>
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-sage"><ClipboardList className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{task.material}</p>
        <p className="text-xs text-muted-foreground"><span className="font-mono">{task.estimatedQuantity}</span> · {task.pickupArea}</p>
      </div>
      <StatusBadge label={task.status} tone={toneFor(task.status)} />
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  </li>
);
