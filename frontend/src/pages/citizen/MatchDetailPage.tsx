import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/common/StateViews";
import { useToast } from "@/components/common/ToastProvider";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { ArrowLeft, MapPin, Check, Leaf, Loader2 } from "lucide-react";

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const match = useAsync(() => circularityService.getMatch(id ?? ""), [id]);
  const [submitting, setSubmitting] = useState(false);

  const requestExchange = () => {
    if (!match.data) return;
    setSubmitting(true);
    circularityService
      .createExchangeRequest({
        listingId: match.data.listingId,
        material: match.data.material,
        kind: "request",
      })
      .then(() => {
        toast("Exchange requested. You'll be notified when it's accepted.");
        navigate("/exchange");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <AppShell active="exchange">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <button
          type="button"
          onClick={() => navigate("/exchange")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to exchange
        </button>

        {match.error ? (
          <ErrorState onRetry={match.reload} />
        ) : match.isLoading ? (
          <SkeletonList rows={2} />
        ) : !match.data ? (
          <EmptyState title="Match not found." description="This exchange may no longer be available." />
        ) : (
          <>
            <PageHeader title={match.data.material} />
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-mono text-xs font-medium text-brand-forest">
                  {match.data.matchPercent}% match
                </span>
                <span className="text-sm text-muted-foreground">{match.data.counterpartyType}</span>
              </div>

              <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <dd className="font-mono text-foreground/80">{match.data.quantity}</dd>
                <dd className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand-sage" />
                  <span className="font-mono">{match.data.distance}</span> · {match.data.counterparty}
                </dd>
              </dl>

              <div className="mt-5">
                <h3 className="text-sm font-medium text-foreground">Why this match?</h3>
                <ul className="mt-2 space-y-2">
                  {match.data.reasons.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-foreground/90">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 flex items-center gap-1.5 rounded-[10px] bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                <Leaf className="h-3.5 w-3.5 text-brand-sage" />
                Estimated <span className="font-mono text-foreground/80">{match.data.co2eEstimate} kg</span> CO₂e avoided ·{" "}
                <span className="font-mono text-foreground/80">{match.data.diverted}</span> diverted
              </p>

              <div className="mt-6 border-t border-border/70 pt-5">
                <Button className="gap-2" onClick={requestExchange} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                      Requesting…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Request exchange
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};
