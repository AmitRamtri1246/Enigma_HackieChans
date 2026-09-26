import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonList } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/common/StateViews";
import { useToast } from "@/components/common/ToastProvider";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { MaterialOutcome } from "@/lib/domain";
import { ArrowLeft, Check, MapPin, Loader2 } from "lucide-react";

const OUTCOMES: MaterialOutcome[] = ["Reused", "Repaired", "Upcycled", "Recycled"];

export const OrgMatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const match = useAsync(() => circularityService.getMatch(id ?? ""), [id]);

  const [accepted, setAccepted] = useState(false);
  const [actualQty, setActualQty] = useState("");
  const [outcome, setOutcome] = useState<MaterialOutcome>("Reused");
  const [submitting, setSubmitting] = useState(false);

  const accept = () => {
    if (!match.data) return;
    setActualQty(match.data.quantity);
    setSubmitting(true);
    circularityService
      .acceptMatch(match.data.id)
      .then(() => {
        setAccepted(true);
        toast("Match accepted.");
      })
      .finally(() => setSubmitting(false));
  };

  const confirmReceipt = () => {
    if (!match.data) return;
    setSubmitting(true);
    circularityService
      .confirmReceipt({
        matchId: match.data.id,
        listingId: match.data.listingId,
        actualQuantity: actualQty || match.data.quantity,
        outcome,
      })
      .then(() => {
        toast("Material received. Journey updated.");
        navigate("/org/matches");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <AppShell active="matches">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <button
          type="button"
          onClick={() => navigate("/org/matches")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          All matches
        </button>

        {match.error ? (
          <ErrorState onRetry={match.reload} />
        ) : match.isLoading ? (
          <SkeletonList rows={2} />
        ) : !match.data ? (
          <EmptyState title="Match not found." />
        ) : (
          <>
            <PageHeader title={match.data.material} />
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-mono text-xs font-medium text-brand-forest">
                  {match.data.matchPercent}% match
                </span>
                <span className="text-sm text-muted-foreground">{match.data.counterparty}</span>
              </div>
              <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <dd className="font-mono text-foreground/80">{match.data.quantity}</dd>
                <dd className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-brand-sage" />
                  <span className="font-mono">{match.data.distance}</span>
                </dd>
              </dl>

              <ul className="mt-5 space-y-2">
                {match.data.reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-foreground/90">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>

              {!accepted ? (
                <div className="mt-6 border-t border-border/70 pt-5">
                  <Button className="gap-2" onClick={accept} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                        Accepting…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Accept material
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-4 border-t border-border/70 pt-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="qty" className="text-xs font-medium text-foreground">
                      Actual quantity received
                    </Label>
                    <Input
                      id="qty"
                      value={actualQty}
                      onChange={(e) => setActualQty(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-foreground">Outcome</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {OUTCOMES.map((o) => (
                        <button
                          key={o}
                          type="button"
                          role="radio"
                          aria-checked={outcome === o}
                          onClick={() => setOutcome(o)}
                          className={cn(
                            "flex items-center justify-between rounded-[10px] border px-3 py-2.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                            outcome === o
                              ? "border-brand-forest bg-brand-soft/60 font-medium text-brand-forest"
                              : "border-border text-foreground hover:border-brand-sage/50 hover:bg-accent/40"
                          )}
                        >
                          {o}
                          {outcome === o && <Check className="h-4 w-4 text-brand-sage" />}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Button className="gap-2" onClick={confirmReceipt} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Confirm receipt
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};
