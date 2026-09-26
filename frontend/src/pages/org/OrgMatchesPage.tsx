import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonCards } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { Match } from "@/lib/domain";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";

export const OrgMatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const matches = useAsync(() => circularityService.getMatches());

  return (
    <AppShell active="matches">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader title="Matches" subtitle="Materials that may fit your current needs." />

        {matches.error ? (
          <ErrorState onRetry={matches.reload} />
        ) : matches.isLoading ? (
          <SkeletonCards count={6} />
        ) : (matches.data ?? []).length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matching materials yet."
            description="New matches appear here when community listings fit your needs."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(matches.data ?? []).map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onReview={() => navigate(`/org/matches/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const MatchCard: React.FC<{ match: Match; onReview: () => void }> = ({ match, onReview }) => (
  <article className="flex flex-col rounded-[10px] border border-border bg-card p-4 transition-[border-color] duration-200 hover:border-brand-sage/40">
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{match.material}</h3>
      <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand-forest">
        {match.matchPercent}% match
      </span>
    </div>
    <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <dd className="font-mono text-foreground/80">{match.quantity}</dd>
      <dd className="flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5 text-brand-sage" />
        <span className="font-mono">{match.distance}</span>
      </dd>
    </dl>
    <p className="mt-1 text-xs text-muted-foreground">{match.counterparty}</p>
    <div className="mt-4 pt-1">
      <Button variant="outline" size="sm" className="w-full justify-center gap-1.5" onClick={onReview}>
        Review
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  </article>
);
