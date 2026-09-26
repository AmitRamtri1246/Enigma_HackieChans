import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app-shell/AppShell";
import { Button } from "@/components/ui/button";
import { SkeletonList, SkeletonStrip } from "@/components/ui/skeleton";
import { PageContainer, PageHeader, Section, TextLink } from "@/components/common/PageHeader";
import { MaterialThumb, MetricStrip, RowItem, RowList } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { formatDate, greeting } from "@/lib/format";
import { ArrowRight, Package, Repeat, ScanLine } from "lucide-react";

/**
 * Citizen Home — job: decide what to do with the next item.
 * Context (3 metrics) → primary action (scan) → nearby opportunities → recent activity.
 */
export const AppPage: React.FC = () => {
  const { user } = useAuth();
  const impact = useAsync(() => circularityService.getImpactSummary());
  const matches = useAsync(() => circularityService.getMatches());
  const listings = useAsync(() => circularityService.getListings());

  const firstName = user?.full_name?.trim().split(" ")[0] ?? "there";
  const opportunities = (matches.data ?? []).filter((m) => m.status !== "Declined").slice(0, 3);
  const recent = (listings.data ?? []).slice(0, 3);

  return (
    <AppShell active="home">
      <PageContainer>
        <PageHeader title={`${greeting()}, ${firstName}`} subtitle="Here's where your materials are and what's nearby." />

        {impact.error ? (
          <ErrorState onRetry={impact.reload} />
        ) : impact.isLoading || !impact.data ? (
          <SkeletonStrip />
        ) : (
          <MetricStrip
            metrics={impact.data.metrics.map((m) => ({
              label: m.label,
              value: m.value,
              unit: m.unit,
              note: m.estimated ? "Illustrative estimate" : undefined,
            }))}
          />
        )}

        {/* Primary action */}
        <section
          aria-labelledby="scan-cta"
          className="mt-8 flex flex-col gap-6 rounded-xl bg-brand-forest px-6 py-7 text-brand-white sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <div className="max-w-md">
            <h2 id="scan-cta" className="text-xl font-semibold tracking-tight">
              Give your next item a second life.
            </h2>
            <p className="mt-1.5 text-[15px] leading-6 text-brand-white/70">
              Scan something you no longer need. We'll suggest where it's most useful.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-brand-white text-brand-forest hover:bg-brand-white/90">
              <Link to="/scan">
                <ScanLine className="h-4 w-4" />
                Scan an item
              </Link>
            </Button>
            <Link
              to="/exchange"
              className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-brand-white/80 transition-colors duration-150 hover:text-brand-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-white/60"
            >
              Browse exchange
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Section title="Nearby opportunities" action={<TextLink to="/exchange">View all</TextLink>}>
          {matches.error ? (
            <ErrorState onRetry={matches.reload} />
          ) : matches.isLoading ? (
            <SkeletonList rows={3} />
          ) : opportunities.length === 0 ? (
            <EmptyState icon={Repeat} title="No materials available nearby." description="New opportunities appear as neighbours list items." />
          ) : (
            <RowList label="Nearby opportunities">
              {opportunities.map((m) => (
                <RowItem
                  key={m.id}
                  to={`/exchange/${m.id}`}
                  leading={<MaterialThumb category={m.category} />}
                  title={m.material}
                  meta={
                    <>
                      <span className="font-mono">{m.quantity}</span> · <span className="font-mono">{m.distance}</span> · {m.counterparty}
                    </>
                  }
                  trailing={<span className="font-mono text-sm text-muted-foreground">{m.matchPercent}%</span>}
                />
              ))}
            </RowList>
          )}
        </Section>

        <Section title="Recent activity" action={<TextLink to="/listings">My listings</TextLink>}>
          {listings.error ? (
            <ErrorState onRetry={listings.reload} />
          ) : listings.isLoading ? (
            <SkeletonList rows={3} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No material activity yet."
              description="Scan or list an item to start its journey."
              action={
                <Button asChild size="sm">
                  <Link to="/scan">Scan an item</Link>
                </Button>
              }
            />
          ) : (
            <RowList label="Recent activity">
              {recent.map((l) => (
                <RowItem
                  key={l.id}
                  to={l.passportId ? `/passports/${l.passportId}` : "/listings"}
                  leading={<MaterialThumb category={l.category} />}
                  title={l.title}
                  meta={<>Listed {formatDate(l.createdAt)}</>}
                  trailing={<StatusBadge status={l.status} />}
                />
              ))}
            </RowList>
          )}
        </Section>
      </PageContainer>
    </AppShell>
  );
};
