import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader, Section, TextLink } from "@/components/common/PageHeader";
import { MaterialThumb, RowItem, RowList } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { SkeletonList, SkeletonTable } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { OrganizationNeed } from "@/lib/domain";
import { Inbox, Plus, Sparkles } from "lucide-react";

/**
 * Organization Home — job: keep needs current and act on new matches.
 * Two quiet summary values, needs, best matches. No analytics.
 */
export const OrgDashboardPage: React.FC = () => {
  const needs = useAsync(() => circularityService.getOrganizationNeeds());
  const matches = useAsync(() => circularityService.getMatches());

  const activeNeeds = (needs.data ?? []).filter((n) => n.status === "Active");
  const pending = (matches.data ?? []).filter((m) => m.status === "Suggested" || m.status === "Requested");
  const ready = !needs.isLoading && !matches.isLoading;

  const needColumns: Column<OrganizationNeed>[] = [
    { id: "material", header: "Material", mobile: "primary", cell: (n) => <span className="font-medium">{n.material}</span> },
    { id: "qty", header: "Quantity", cell: (n) => <span className="font-mono">{n.quantity}</span> },
    { id: "by", header: "Needed by", cell: (n) => <span className="font-mono">{n.neededBy}</span> },
    { id: "area", header: "Area", mobile: "hidden", cell: (n) => <span className="text-muted-foreground">{n.area}</span> },
  ];

  return (
    <AppShell active="home">
      <PageContainer>
        <PageHeader
          title="EcoPack"
          subtitle={
            ready ? (
              <>
                <span className="font-mono text-foreground">{activeNeeds.length}</span> active needs
                <span className="mx-2 text-border" aria-hidden="true">·</span>
                <span className="font-mono text-foreground">{pending.length}</span> matches to review
              </>
            ) : (
              "Your material needs and incoming matches."
            )
          }
          action={
            <Button asChild className="gap-2">
              <Link to="/org/needs?new=1">
                <Plus className="h-4 w-4" />
                Add need
              </Link>
            </Button>
          }
        />

        <Section title="Best matches" description="Community listings that fit what you're looking for." action={<TextLink to="/org/matches">View all</TextLink>}>
          {matches.error ? (
            <ErrorState onRetry={matches.reload} />
          ) : matches.isLoading ? (
            <SkeletonList rows={3} />
          ) : pending.length === 0 ? (
            <EmptyState icon={Sparkles} title="No circular matches found yet." description="Matches appear when residents list items that fit your needs." />
          ) : (
            <RowList label="Best matches">
              {pending.slice(0, 3).map((m) => (
                <RowItem
                  key={m.id}
                  to={`/org/matches/${m.id}`}
                  leading={<MaterialThumb category={m.category} />}
                  title={m.material}
                  meta={
                    <>
                      <span className="font-mono">{m.quantity}</span> · <span className="font-mono">{m.distance}</span> · {m.counterparty}
                    </>
                  }
                  trailing={
                    m.status === "Requested" ? (
                      <StatusBadge status="Requested" label="Offered to you" />
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">{m.matchPercent}%</span>
                    )
                  }
                />
              ))}
            </RowList>
          )}
        </Section>

        <Section title="Material needs" action={<TextLink to="/org/needs">Manage</TextLink>}>
          {needs.error ? (
            <ErrorState onRetry={needs.reload} />
          ) : needs.isLoading ? (
            <SkeletonTable rows={3} />
          ) : activeNeeds.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No active needs."
              description="Add a need to start receiving matches."
              action={
                <Button asChild size="sm">
                  <Link to="/org/needs?new=1">Add need</Link>
                </Button>
              }
            />
          ) : (
            <DataTable label="Active material needs" columns={needColumns} rows={activeNeeds.slice(0, 5)} rowKey={(n) => n.id} />
          )}
        </Section>
      </PageContainer>
    </AppShell>
  );
};
