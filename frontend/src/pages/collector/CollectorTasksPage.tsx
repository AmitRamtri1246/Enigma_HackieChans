import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader, Section } from "@/components/common/PageHeader";
import { MaterialThumb, RowItem, RowList } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PriorityLabel, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupTask } from "@/lib/domain";
import { ArrowRight, Truck } from "lucide-react";

/** Collector identity for the demo; the municipality assigns tasks to this name by default. */
const COLLECTOR_NAME = "Sam Ortiz";

/**
 * Collector Tasks — a task manager, nothing else.
 * One large next task, then the upcoming queue. Delivered history via ?tab=delivered.
 */
export const CollectorTasksPage: React.FC = () => {
  const [params] = useSearchParams();
  const showDelivered = params.get("tab") === "delivered";
  const tasks = useAsync(() => circularityService.getPickupTasks());

  const mine = (tasks.data ?? []).filter((t) => t.collector === COLLECTOR_NAME);
  const open = mine
    .filter((t) => t.status === "Assigned" || t.status === "Collected")
    // In-progress first, then high priority.
    .sort((a, b) => rank(a) - rank(b));
  const delivered = mine.filter((t) => t.status === "Delivered");
  const next = open[0];
  const upcoming = open.slice(1);

  if (showDelivered) {
    return (
      <AppShell active="history" title="Delivered">
        <PageContainer size="narrow">
          <PageHeader title="Delivered" subtitle={`Completed drop-offs for ${COLLECTOR_NAME}.`} />
          {tasks.error ? (
            <ErrorState onRetry={tasks.reload} />
          ) : tasks.isLoading ? (
            <SkeletonList rows={3} />
          ) : delivered.length === 0 ? (
            <EmptyState icon={Truck} title="No deliveries yet." description="Tasks you mark delivered will be listed here." />
          ) : (
            <RowList label="Delivered tasks">
              {delivered.map((t) => (
                <RowItem
                  key={t.id}
                  to={`/collector/tasks/${t.id}`}
                  leading={<MaterialThumb category={t.category} />}
                  title={t.material}
                  meta={
                    <>
                      <span className="font-mono">{t.actualQuantity ?? t.estimatedQuantity}</span> · {t.destination}
                    </>
                  }
                  trailing={<StatusBadge status="Completed" label="Delivered" />}
                />
              ))}
            </RowList>
          )}
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell active="tasks" title="Tasks">
      <PageContainer size="narrow">
        <PageHeader
          title="Tasks"
          subtitle={
            tasks.isLoading ? (
              `Assigned to ${COLLECTOR_NAME}`
            ) : (
              <>
                <span className="font-mono text-foreground">{open.length}</span> open {open.length === 1 ? "task" : "tasks"} · assigned to {COLLECTOR_NAME}
              </>
            )
          }
        />

        {tasks.error ? (
          <ErrorState onRetry={tasks.reload} />
        ) : tasks.isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : !next ? (
          <EmptyState icon={Truck} title="No pickups assigned." description="New tasks appear here as soon as the municipality assigns them to you." />
        ) : (
          <>
            <NextTask task={next} />
            <Section title="Upcoming">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing else queued. You're clear after this one.</p>
              ) : (
                <RowList label="Upcoming tasks">
                  {upcoming.map((t) => (
                    <RowItem
                      key={t.id}
                      to={`/collector/tasks/${t.id}`}
                      leading={<MaterialThumb category={t.category} />}
                      title={t.material}
                      meta={
                        <>
                          <span className="font-mono">{t.estimatedQuantity}</span> · {t.pickupArea} · {t.window}
                        </>
                      }
                      trailing={t.status === "Collected" ? <StatusBadge status="Collected" label="In transit" /> : t.priority === "High" ? <PriorityLabel priority="High" /> : undefined}
                    />
                  ))}
                </RowList>
              )}
            </Section>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};

function rank(t: PickupTask): number {
  const progress = t.status === "Collected" ? 0 : 10;
  const priority = t.priority === "High" ? 0 : t.priority === "Normal" ? 1 : 2;
  return progress + priority;
}

const NextTask: React.FC<{ task: PickupTask }> = ({ task }) => {
  const inTransit = task.status === "Collected";
  return (
    <Card className="p-6 sm:p-8" aria-labelledby="next-task-title">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-brand-sage">{inTransit ? "In progress" : "Next task"}</p>
        <PriorityLabel priority={task.priority} />
      </div>
      <h2 id="next-task-title" className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {task.material}
      </h2>
      <p className="mt-1 text-[15px] text-muted-foreground">
        {inTransit ? "Collected " : "Estimated "}
        <span className="font-mono text-foreground">{task.actualQuantity ?? task.estimatedQuantity}</span>
        <span aria-hidden="true"> · </span>
        <span className="font-mono">{task.window}</span>
      </p>

      {/* Route as text, not a map */}
      <ol className="mt-7 space-y-0" aria-label="Route">
        <RouteStop label="Pickup" place={task.pickupArea} done={inTransit} first />
        <RouteStop label="Deliver to" place={task.destination} />
      </ol>

      <div className="mt-8">
        <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
          <Link to={`/collector/tasks/${task.id}${inTransit ? "" : "?start=1"}`}>
            {inTransit ? "Continue to delivery" : "Start pickup"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

const RouteStop: React.FC<{ label: string; place: string; done?: boolean; first?: boolean }> = ({ label, place, done, first }) => (
  <li className="relative flex gap-4 pb-5 last:pb-0">
    {first && <span aria-hidden="true" className="absolute left-[5px] top-4 h-[calc(100%-0.5rem)] w-px bg-border" />}
    <span
      aria-hidden="true"
      className={
        "relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 " +
        (done ? "border-brand-sage bg-brand-sage" : first ? "border-brand-forest bg-card" : "border-brand-forest bg-brand-forest")
      }
    />
    <div>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="text-[15px] font-medium text-foreground">{place}</p>
    </div>
  </li>
);
