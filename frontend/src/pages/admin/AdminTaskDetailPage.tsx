import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DetailList, MaterialThumb } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PriorityLabel, StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService, AVAILABLE_COLLECTORS } from "@/lib/circularity-service";
import { Check, ClipboardList, Loader2 } from "lucide-react";

/** Admin task detail — job: assign the right collector. */
export const AdminTaskDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { toast } = useToast();
  const task = useAsync(() => circularityService.getPickupTask(id), [id]);
  const tasks = useAsync(() => circularityService.getPickupTasks());

  const [selected, setSelected] = useState(AVAILABLE_COLLECTORS[0]);
  const [busy, setBusy] = useState(false);
  const t = task.data;

  // Current open workload per collector, to help pick.
  const load = (name: string) =>
    (tasks.data ?? []).filter((x) => x.collector === name && (x.status === "Assigned" || x.status === "Collected")).length;

  const assign = async () => {
    if (!t) return;
    setBusy(true);
    await circularityService.assignCollector(t.id, selected);
    setBusy(false);
    toast(`Assigned to ${selected}. It's now in their task list.`);
  };

  return (
    <AppShell active="tasks" title={t?.material ?? "Task"}>
      <PageContainer>
        {task.error ? (
          <ErrorState onRetry={task.reload} />
        ) : task.isLoading ? (
          <SkeletonList rows={3} />
        ) : !t ? (
          <EmptyState
            icon={ClipboardList}
            title="Task not found."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/tasks">All tasks</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              back={{ label: "Collection Tasks", to: "/admin/tasks" }}
              title={`${t.material} pickup`}
              meta={<StatusBadge status={t.status} />}
              subtitle={<span className="font-mono text-[15px]">{t.window}</span>}
            />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section aria-labelledby="assign-h" className="min-w-0">
                <h2 id="assign-h" className="text-lg font-semibold tracking-tight text-foreground">
                  {t.collector ? "Collector" : "Assign a collector"}
                </h2>

                {t.collector ? (
                  <p className="mt-3 flex items-center gap-2 text-[15px] text-foreground">
                    <Check className="h-4 w-4 text-brand-sage" strokeWidth={2.5} aria-hidden="true" />
                    <span>
                      <span className="font-medium">{t.collector}</span> is handling this pickup.
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">The task appears in the collector's list as soon as you assign it.</p>
                    <div role="radiogroup" aria-label="Collector" className="mt-5 divide-y divide-border/80 overflow-hidden rounded-xl border border-border bg-card">
                      {AVAILABLE_COLLECTORS.map((name) => {
                        const checked = selected === name;
                        const open = load(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            onClick={() => setSelected(name)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                              checked ? "bg-brand-soft/40" : "hover:bg-secondary/40"
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                                checked ? "border-brand-forest" : "border-input"
                              )}
                            >
                              {checked && <span className="h-2 w-2 rounded-full bg-brand-forest" />}
                            </span>
                            <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
                            <span className="text-[13px] text-muted-foreground">
                              <span className="font-mono">{open}</span> open {open === 1 ? "task" : "tasks"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <Button onClick={assign} disabled={busy} className="mt-5 gap-2">
                      {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
                      Assign {selected.split(" ")[0]}
                    </Button>
                  </>
                )}
              </section>

              <aside className="lg:sticky lg:top-20 lg:self-start">
                <Card className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <MaterialThumb category={t.category} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{t.material}</p>
                      <p className="text-[13px] text-muted-foreground">{t.category}</p>
                    </div>
                  </div>
                  <DetailList
                    items={[
                      { label: "Pickup", value: t.pickupArea },
                      { label: "Deliver to", value: t.destination },
                      { label: "Estimated", value: t.estimatedQuantity, mono: true },
                      ...(t.actualQuantity ? [{ label: "Collected", value: t.actualQuantity, mono: true }] : []),
                      { label: "Priority", value: <PriorityLabel priority={t.priority} /> },
                    ]}
                  />
                  {t.passportId && (
                    <Link
                      to={`/passports/${t.passportId}`}
                      className="mt-5 inline-block rounded-md text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      View Waste Passport
                    </Link>
                  )}
                </Card>
              </aside>
            </div>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};
