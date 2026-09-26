import React, { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { TabsList, TabsPanel } from "@/components/ui/tabs";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { Match } from "@/lib/domain";
import { Sparkles } from "lucide-react";

type Filter = "review" | "accepted";

/** Matches — job: decide which listings to accept. Compare in a table, decide on the detail page. */
export const OrgMatchesPage: React.FC = () => {
  const matches = useAsync(() => circularityService.getMatches());
  const [filter, setFilter] = useState<Filter>("review");

  const all = matches.data ?? [];
  const review = all.filter((m) => m.status === "Suggested" || m.status === "Requested").sort((a, b) => b.matchPercent - a.matchPercent);
  const accepted = all.filter((m) => m.status === "Accepted");
  const rows = filter === "review" ? review : accepted;

  const columns: Column<Match>[] = [
    { id: "item", header: "Listing", mobile: "primary", cell: (m) => <ItemCell category={m.category} title={m.material} sub={m.counterparty} /> },
    { id: "qty", header: "Quantity", cell: (m) => <span className="font-mono">{m.quantity}</span> },
    { id: "dist", header: "Distance", cell: (m) => <span className="font-mono">{m.distance}</span> },
    { id: "match", header: "Match", align: "right", cell: (m) => <span className="font-mono">{m.matchPercent}%</span> },
    {
      id: "status",
      header: "Status",
      mobile: "trailing",
      cell: (m) =>
        m.status === "Accepted" ? (
          <StatusBadge status="Accepted" label="Awaiting receipt" />
        ) : m.status === "Requested" ? (
          <StatusBadge status="Requested" label="Offered to you" />
        ) : (
          <span className="text-sm text-muted-foreground">To review</span>
        ),
    },
  ];

  return (
    <AppShell active="matches">
      <PageContainer>
        <PageHeader title="Matches" subtitle="Listings that fit your open needs, best fit first." />

        <TabsList<Filter>
          idBase="matches"
          label="Match status"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: "review", label: "To review", count: review.length },
            { value: "accepted", label: "Accepted", count: accepted.length },
          ]}
        />
        <TabsPanel idBase="matches" value={filter} className="pt-6">
          {matches.error ? (
            <ErrorState onRetry={matches.reload} />
          ) : matches.isLoading ? (
            <SkeletonTable rows={3} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={filter === "review" ? "No circular matches found yet." : "Nothing accepted yet."}
              description={filter === "review" ? "New matches appear when residents list items that fit your needs." : "Accepted matches wait here until you confirm receipt."}
            />
          ) : (
            <DataTable label="Matches" columns={columns} rows={rows} rowKey={(m) => m.id} rowHref={(m) => `/org/matches/${m.id}`} />
          )}
        </TabsPanel>
      </PageContainer>
    </AppShell>
  );
};
