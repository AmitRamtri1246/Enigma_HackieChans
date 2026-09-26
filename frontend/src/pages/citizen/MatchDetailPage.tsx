import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DetailList, MaterialThumb } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkeletonList } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { OFFER_LABEL } from "@/lib/format";
import { Check } from "lucide-react";

/** Match detail — job: understand why this is a good destination, then offer the item. */
export const MatchDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { toast } = useToast();
  const match = useAsync(() => circularityService.getMatch(id), [id]);
  const listing = useAsync(
    () => (match.data ? circularityService.getListing(match.data.listingId) : Promise.resolve(null)),
    [match.data?.listingId]
  );
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const offer = async () => {
    if (!match.data) return;
    setSending(true);
    await circularityService.createExchangeRequest({
      listingId: match.data.listingId,
      material: match.data.material,
      kind: "offer",
    });
    setSending(false);
    setConfirming(false);
    toast(`Offer sent to ${match.data.counterparty}.`);
  };

  const m = match.data;
  const l = listing.data;
  const alreadyOffered = m?.status === "Requested" || m?.status === "Accepted";

  return (
    <AppShell active="exchange" title={m?.material ?? "Match"}>
      <PageContainer>
        {match.error ? (
          <ErrorState onRetry={match.reload} />
        ) : match.isLoading ? (
          <SkeletonList rows={3} />
        ) : !m ? (
          <EmptyState
            title="This match is no longer available."
            description="The item may have been taken or withdrawn."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/exchange">Back to Exchange</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              back={{ label: "Exchange", to: "/exchange" }}
              title={m.material}
              subtitle={`${m.counterparty} · ${m.counterpartyType}`}
            />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <div className="overflow-hidden rounded-xl border border-border">
                  <MaterialThumb category={m.category} size="lg" className="rounded-none" />
                </div>

                {l?.description && <p className="mt-6 max-w-prose text-[15px] leading-7 text-foreground">{l.description}</p>}

                <section className="mt-10" aria-labelledby="why-h">
                  <h2 id="why-h" className="text-lg font-semibold tracking-tight text-foreground">
                    Why this match?
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {m.reasons.slice(0, 3).map((r) => (
                      <li key={r} className="flex items-start gap-3 text-[15px] text-foreground">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-brand-sage" strokeWidth={2.5} aria-hidden="true" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-10" aria-labelledby="impact-h">
                  <h2 id="impact-h" className="text-lg font-semibold tracking-tight text-foreground">
                    Impact if reused
                  </h2>
                  <dl className="mt-4 grid max-w-md grid-cols-2 gap-6">
                    <div>
                      <dd className="font-mono text-2xl font-medium text-foreground">{m.diverted}</dd>
                      <dt className="mt-1 text-sm text-muted-foreground">Material diverted</dt>
                    </div>
                    <div>
                      <dd className="font-mono text-2xl font-medium text-foreground">
                        {m.co2eEstimate} <span className="text-sm text-muted-foreground">kg</span>
                      </dd>
                      <dt className="mt-1 text-sm text-muted-foreground">
                        CO₂e avoided
                        <span className="block text-xs">Illustrative estimate</span>
                      </dt>
                    </div>
                  </dl>
                </section>
              </div>

              <aside className="lg:sticky lg:top-20 lg:self-start">
                <Card className="p-5">
                  <p className="text-xl font-semibold tracking-tight text-foreground">{OFFER_LABEL[l?.exchangeType ?? "donation"]}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className="font-mono">{m.matchPercent}%</span> match for your area
                  </p>
                  <Separator className="my-5" />
                  <DetailList
                    items={[
                      { label: "Quantity", value: m.quantity, mono: true },
                      { label: "Distance", value: m.distance, mono: true },
                      { label: "Condition", value: l?.condition ?? "Good" },
                      { label: "Area", value: l?.area ?? "Riverside" },
                    ]}
                  />
                  <div className="mt-6">
                    {alreadyOffered ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">Offer sent</span>
                        <StatusBadge status={m.status} />
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => setConfirming(true)}>
                        Offer material
                      </Button>
                    )}
                  </div>
                </Card>
              </aside>
            </div>
          </>
        )}
      </PageContainer>

      <ConfirmationDialog
        open={confirming}
        title="Offer this material?"
        description={m ? `${m.counterparty} will be notified that you'd like to hand over ${m.material.toLowerCase()} (${m.quantity}).` : undefined}
        confirmLabel="Send offer"
        loading={sending}
        onConfirm={offer}
        onCancel={() => setConfirming(false)}
      />
    </AppShell>
  );
};
