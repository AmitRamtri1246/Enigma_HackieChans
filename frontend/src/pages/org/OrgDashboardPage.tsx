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
import type { Match, OrganizationNeed } from "@/lib/domain";
import { Plus, Inbox, Sparkles, MapPin, ArrowRight } from "lucide-react";

export const OrgDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const needs = useAsync(() => circularityService.getOrganizationNeeds());
  const matches = useAsync(() => circularityService.getMatches());

  const activeNeeds = (needs.data ?? []).filter((n) => n.status === "Active");
  const pending = (matches.data ?? []).filter((m) => m.status === "Suggested" || m.status === "Requested");
  const isLoading = needs.isLoading || matches.isLoading;
  const hasError = needs.error || matches.error;

  return (
    <AppShell active="home" areaLabel="Organization">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="EcoPack"
          subtitle="Manage your material needs and incoming matches."
          action={
            <Button className="gap-1.5" onClick={() => navigate("/org/needs")}>
              <Plus className="h-4 w-4" />
              Add material need
            </Button>
          }
        />

        {hasError ? (
          <ErrorState onRetry={() => { needs.reload(); matches.reload(); }} />
        ) : isLoading ? (
          <SkeletonCards count={3} />
        ) : (
          <>
            <p className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span><span className="font-mono font-medium text-brand-forest">{activeNeeds.length}</span> active needs</span>
              <span aria-hidden="true" className="text-border">·</span>
              <span><span className="font-mono font-medium text-brand-forest">{pending.length}</span> pending matches</span>
            </p>

            {/* Needs */}
            <section className="mb-10" aria-labelledby="needs-h">
              <SectionHeading id="needs-h" title="Your material needs" subtitle="Materials your organization is currently looking for." action={
                <button type="button" onClick={() => navigate("/org/needs")} className="text-sm font-medium text-brand-sage hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">Manage</button>
              } />
              {activeNeeds.length > 0 ? (
                <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
                  {activeNeeds.slice(0, 3).map((n, i) => <NeedRow key={n.id} need={n} last={i === Math.min(activeNeeds.length, 3) - 1} />)}
                </ul>
              ) : (
                <EmptyState icon={Inbox} title="No active needs." description="Add a need to start receiving matches." action={<Button size="sm" className="gap-1.5" onClick={() => navigate("/org/needs")}><Plus className="h-4 w-4" />Add need</Button>} />
              )}
            </section>

            {/* Matches */}
            <section aria-labelledby="matches-h">
              <SectionHeading id="matches-h" title="Best matches" subtitle="Materials that may fit your current needs." action={
                <button type="button" onClick={() => navigate("/org/matches")} className="text-sm font-medium text-brand-sage hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">View all</button>
              } />
              {pending.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pending.slice(0, 3).map((m) => <MatchCard key={m.id} match={m} onReview={() => navigate(`/org/matches/${m.id}`)} />)}
                </div>
              ) : (
                <EmptyState icon={Sparkles} title="No matching materials yet." description="New matches appear when community listings fit your needs." />
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};

const SectionHeading: React.FC<{ id: string; title: string; subtitle: string; action?: React.ReactNode }> = ({ id, title, subtitle, action }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <h2 id={id} className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {action}
  </div>
);

const NeedRow: React.FC<{ need: OrganizationNeed; last: boolean }> = ({ need, last }) => (
  <li className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 sm:px-5", !last && "border-b border-border/70")}>
    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{need.material}</span>
    <span className="font-mono text-sm text-foreground/80">{need.quantity}</span>
    <span className="hidden text-sm text-muted-foreground sm:inline">Needed by <span className="font-mono">{need.neededBy}</span></span>
    <StatusBadge label={need.status} tone={toneFor(need.status)} />
  </li>
);

const MatchCard: React.FC<{ match: Match; onReview: () => void }> = ({ match, onReview }) => (
  <article className="flex flex-col rounded-[10px] border border-border bg-card p-4 transition-[border-color] duration-200 hover:border-brand-sage/40">
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{match.material}</h3>
      <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand-forest">{match.matchPercent}%</span>
    </div>
    <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <dd className="font-mono text-foreground/80">{match.quantity}</dd>
      <dd className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-sage" /><span className="font-mono">{match.distance}</span></dd>
    </dl>
    <p className="mt-1 text-xs text-muted-foreground">{match.counterparty}</p>
    <div className="mt-4 pt-1">
      <Button variant="outline" size="sm" onClick={onReview} className="w-full justify-center gap-1.5">Review<ArrowRight className="h-3.5 w-3.5" /></Button>
    </div>
  </article>
);
