import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app-shell/AppShell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCards } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/StateViews";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { ImpactMetric, Match, MaterialListing } from "@/lib/domain";
import { ScanLine, ArrowRight, MapPin, PackagePlus, Handshake, Truck, Sprout, type LucideIcon } from "lucide-react";

export const AppPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const impact = useAsync(() => circularityService.getImpactSummary());
  const matches = useAsync(() => circularityService.getMatches());
  const listings = useAsync(() => circularityService.getListings());

  const firstName = user?.full_name?.trim().split(" ")[0] ?? "there";
  const isLoading = impact.isLoading || matches.isLoading || listings.isLoading;
  const hasError = impact.error || matches.error || listings.error;

  const opportunities = (matches.data ?? []).slice(0, 3);
  const recent = (listings.data ?? []).slice(0, 3);

  return (
    <AppShell active="home" areaLabel="Citizen · Demo area">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle="Here's what's happening with your materials."
        />

        {hasError ? (
          <ErrorState onRetry={() => { impact.reload(); matches.reload(); listings.reload(); }} />
        ) : isLoading ? (
          <SkeletonCards count={3} />
        ) : (
          <div className="space-y-10">
            {/* Impact summary — 3 metrics max */}
            <section aria-labelledby="impact-heading">
              <h2 id="impact-heading" className="sr-only">Your impact summary</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(impact.data?.metrics ?? []).map((m, i) => (
                  <MetricBlock key={m.id} metric={m} index={i} />
                ))}
              </div>
            </section>

            {/* Primary hero */}
            <PrimaryAction onScan={() => navigate("/scan")} onBrowse={() => navigate("/exchange")} />

            {/* Nearby opportunities */}
            <section aria-labelledby="opps-heading">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="opps-heading" className="text-base font-semibold tracking-tight text-foreground">
                  Nearby opportunities
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/exchange")}
                  className="text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} match={opp} onView={() => navigate(`/exchange/${opp.id}`)} />
                ))}
              </div>
            </section>

            {/* Recent activity */}
            <section aria-labelledby="activity-heading">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="activity-heading" className="text-base font-semibold tracking-tight text-foreground">
                  Recent activity
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/listings")}
                  className="text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                >
                  My listings
                </button>
              </div>
              <ActivityTimeline items={recent} onOpen={() => navigate("/listings")} />
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
};

const MetricBlock: React.FC<{ metric: ImpactMetric; index: number }> = ({ metric, index }) => (
  <div
    className="motion-safe:animate-riseIn rounded-[10px] border border-border/80 bg-card p-4"
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-2xl font-medium tracking-tight text-brand-forest">{metric.value}</span>
      {metric.unit && <span className="font-mono text-sm text-muted-foreground">{metric.unit}</span>}
    </div>
    <p className="mt-1 text-sm text-muted-foreground">
      {metric.estimated && <span className="text-muted-foreground/80">Estimated </span>}
      {metric.label}
    </p>
  </div>
);

const PrimaryAction: React.FC<{ onScan: () => void; onBrowse: () => void }> = ({ onScan, onBrowse }) => (
  <section className="relative overflow-hidden rounded-2xl border border-border bg-brand-forest px-6 py-8 text-brand-white sm:px-10 sm:py-12">
    <CircularVisual />
    <div className="relative max-w-lg">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Give your next item a second life.</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-white/75">
        Scan something you no longer need and find its best circular destination.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onScan} className="gap-2 bg-brand-white text-brand-forest hover:bg-brand-white/90 active:bg-brand-white/85">
          <ScanLine className="h-4 w-4" />
          Scan an item
        </Button>
        <button
          type="button"
          onClick={onBrowse}
          className="inline-flex items-center gap-1 rounded-md px-1 text-sm font-medium text-brand-white/85 transition-colors duration-150 hover:text-brand-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-white/60"
        >
          Browse exchanges
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </section>
);

const CircularVisual: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 sm:-right-10 sm:top-1/2 sm:h-72 sm:w-72 sm:-translate-y-1/2">
    <div className="motion-safe:animate-flowSpin h-full w-full">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <g fill="none" stroke="currentColor" className="text-brand-white">
          <circle cx="100" cy="100" r="88" strokeOpacity="0.08" strokeWidth="1" />
          <circle cx="100" cy="100" r="66" strokeOpacity="0.12" strokeWidth="1" />
          <circle cx="100" cy="100" r="44" strokeOpacity="0.16" strokeWidth="1" />
          <circle cx="100" cy="100" r="88" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 190" strokeLinecap="round" />
          <circle cx="100" cy="100" r="66" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 140" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  </div>
);

const OpportunityCard: React.FC<{ match: Match; onView: () => void }> = ({ match, onView }) => (
  <article className="group flex flex-col rounded-[10px] border border-border/80 bg-card p-4 transition-[border-color,background-color] duration-200 hover:border-brand-sage/40 hover:bg-accent/30">
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{match.material}</h3>
      <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand-forest">
        {match.matchPercent}% match
      </span>
    </div>
    <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
      <dd className="font-mono text-foreground/80">{match.quantity}</dd>
      <dd className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-brand-sage" />
        <span className="font-mono">{match.distance}</span> · {match.counterparty}
      </dd>
    </dl>
    <div className="mt-4 pt-1">
      <Button variant="outline" size="sm" onClick={onView} className="w-full justify-center gap-1.5 group-hover:border-brand-sage/50">
        View match
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  </article>
);

const STAGE_ICON: Record<string, LucideIcon> = {
  Listed: PackagePlus,
  Matched: Handshake,
  Accepted: Handshake,
  "In transit": Truck,
  Completed: Sprout,
};

const ActivityTimeline: React.FC<{ items: MaterialListing[]; onOpen: () => void }> = ({ items, onOpen }) => (
  <ol className="overflow-hidden rounded-[10px] border border-border/80 bg-card">
    {items.map((item, i) => {
      const Icon = STAGE_ICON[item.status] ?? PackagePlus;
      return (
        <li key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i !== items.length - 1 ? "border-b border-border/60" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft/70 text-brand-sage">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{item.material}</p>
            <p className="text-xs text-muted-foreground">{item.status}</p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 rounded px-1 text-xs font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View
          </button>
        </li>
      );
    })}
  </ol>
);

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
