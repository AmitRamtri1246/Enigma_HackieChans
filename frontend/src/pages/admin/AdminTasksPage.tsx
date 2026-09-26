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
import type { PickupTask } from "@/lib/domain";
import { ClipboardList, ChevronRight } from "lucide-react";

export const AdminTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const tasks = useAsync(() => circularityService.getPickupTasks());

  return (
    <AppShell active="tasks" areaLabel="Municipality · Tasks">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Collection Tasks" subtitle="Assign collectors and track pickups across the area." />

        {tasks.error ? (
          <ErrorState onRetry={tasks.reload} />
        ) : tasks.isLoading ? (
          <SkeletonList rows={4} />
        ) : (tasks.data ?? []).length === 0 ? (
          <EmptyState icon={ClipboardList} title="No collection tasks." />
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
            {(tasks.data ?? []).map((t, i) => <TaskRow key={t.id} task={t} last={i === (tasks.data ?? []).length - 1} onOpen={() => navigate(`/admin/tasks/${t.id}`)} />)}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

const TaskRow: React.FC<{ task: PickupTask; last: boolean; onOpen: () => void }> = ({ task, last, onOpen }) => (
  <li className={cn(!last && "border-b border-border/70")}>
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{task.material}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono">{task.estimatedQuantity}</span> · {task.pickupArea}
          {task.collector && <> · {task.collector}</>}
        </p>
      </div>
      <StatusBadge label={task.priority} tone={toneFor(task.priority)} dot={false} />
      <StatusBadge label={task.status} tone={toneFor(task.status)} />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  </li>
);
