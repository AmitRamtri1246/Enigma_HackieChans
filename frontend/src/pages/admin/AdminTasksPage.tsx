import React, { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PriorityLabel, StatusBadge } from "@/components/common/StatusBadge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { TabsList, TabsPanel } from "@/components/ui/tabs";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupTask } from "@/lib/domain";
import { ClipboardList } from "lucide-react";

type Filter = "unassigned" | "active" | "done";

/** Collection Tasks — job: make sure every pickup has a collector. */
export const AdminTasksPage: React.FC = () => {
  const tasks = useAsync(() => circularityService.getPickupTasks());
  const all = tasks.data ?? [];
  const unassigned = all.filter((t) => t.status === "Unassigned");
  const active = all.filter((t) => t.status === "Assigned" || t.status === "Collected");
  const done = all.filter((t) => t.status === "Delivered");
  const [filter, setFilter] = useState<Filter>("unassigned");
  const rows = filter === "unassigned" ? unassigned : filter === "active" ? active : done;

  const columns: Column<PickupTask>[] = [
    { id: "item", header: "Material", mobile: "primary", cell: (t) => <ItemCell category={t.category} title={t.material} sub={<span className="font-mono">{t.estimatedQuantity}</span>} /> },
    {
      id: "route",
      header: "Route",
      cell: (t) => (
        <span className="text-sm">
          {t.pickupArea} <span className="text-muted-foreground" aria-label="to">→</span> {t.destination}
        </span>
      ),
    },
    { id: "window", header: "Window", mobile: "hidden", cell: (t) => <span className="font-mono text-[13px] text-muted-foreground">{t.window}</span> },
    { id: "priority", header: "Priority", cell: (t) => <PriorityLabel priority={t.priority} /> },
    {
      id: "collector",
      header: filter === "unassigned" ? "Status" : "Collector",
      mobile: "trailing",
      cell: (t) => (t.collector ? <span className="text-sm">{t.collector}</span> : <StatusBadge status="Unassigned" />),
    },
  ];

  return (
    <AppShell active="tasks">
      <PageContainer>
        <PageHeader title="Collection Tasks" subtitle="Pickups created when organizations accept a match." />

        <TabsList<Filter>
          idBase="admin-tasks"
          label="Task status"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: "unassigned", label: "Unassigned", count: unassigned.length },
            { value: "active", label: "In progress", count: active.length },
            { value: "done", label: "Delivered", count: done.length },
          ]}
        />
        <TabsPanel idBase="admin-tasks" value={filter} className="pt-6">
          {tasks.error ? (
            <ErrorState onRetry={tasks.reload} />
          ) : tasks.isLoading ? (
            <SkeletonTable rows={3} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={filter === "unassigned" ? "Every pickup has a collector." : filter === "active" ? "No pickups in progress." : "No deliveries yet."}
            />
          ) : (
            <DataTable label="Collection tasks" columns={columns} rows={rows} rowKey={(t) => t.id} rowHref={(t) => `/admin/tasks/${t.id}`} />
          )}
        </TabsPanel>
      </PageContainer>
    </AppShell>
  );
};
