import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DetailList, MaterialThumb } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { ChoiceGroup, FormField } from "@/components/common/FormField";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonList } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { MaterialOutcome } from "@/lib/domain";
import { Check, Loader2, Sparkles } from "lucide-react";

const OUTCOMES: { value: MaterialOutcome; label: string }[] = [
  { value: "Reused", label: "Reused" },
  { value: "Repaired", label: "Repaired" },
  { value: "Upcycled", label: "Upcycled" },
  { value: "Recycled", label: "Recycled" },
];

/** Org match detail — job: accept or decline, then confirm what actually arrived. */
export const OrgMatchDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const match = useAsync(() => circularityService.getMatch(id), [id]);
  const tasks = useAsync(() => circularityService.getPickupTasks());

  const [actualQty, setActualQty] = useState("");
  const [qtyError, setQtyError] = useState<string>();
  const [outcome, setOutcome] = useState<MaterialOutcome>("Reused");
  const [busy, setBusy] = useState<"accept" | "decline" | "receipt" | null>(null);
  const [confirmDecline, setConfirmDecline] = useState(false);

  const m = match.data;
  const accepted = m?.status === "Accepted";
  const task = (tasks.data ?? []).find((t) => t.listingId === m?.listingId);

  // Prefill actual quantity with what the collector recorded, else the estimate.
  useEffect(() => {
    if (m && !actualQty) setActualQty(task?.actualQuantity ?? m.quantity);
  }, [m, task, actualQty]);

  const accept = async () => {
    if (!m) return;
    setBusy("accept");
    await circularityService.acceptMatch(m.id);
    setBusy(null);
    toast("Match accepted. The municipality can now schedule a pickup.");
  };

  const decline = async () => {
    if (!m) return;
    setBusy("decline");
    await circularityService.declineMatch(m.id);
    setBusy(null);
    setConfirmDecline(false);
    toast("Match declined.");
    navigate("/org/matches");
  };

  const confirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m) return;
    if (!/\d/.test(actualQty)) {
      setQtyError("Enter the quantity you received, e.g. 11 kg.");
      return;
    }
    setBusy("receipt");
    await circularityService.confirmReceipt({
      matchId: m.id,
      listingId: m.listingId,
      actualQuantity: actualQty.trim(),
      outcome,
    });
    setBusy(null);
    toast("Receipt confirmed. The Waste Passport is complete.");
    navigate("/org/receipts");
  };

  const pickupLabel = !task
    ? "Not scheduled"
    : task.status === "Unassigned"
    ? "Awaiting collector"
    : task.status === "Assigned"
    ? `Assigned to ${task.collector}`
    : task.status === "Collected"
    ? "Collected, in transit"
    : "Delivered";

  return (
    <AppShell active="matches" title={m?.material ?? "Match"}>
      <PageContainer>
        {match.error ? (
          <ErrorState onRetry={match.reload} />
        ) : match.isLoading ? (
          <SkeletonList rows={3} />
        ) : !m ? (
          <EmptyState
            icon={Sparkles}
            title="This match is no longer available."
            description="It may have been completed or declined."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/org/matches">All matches</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              back={{ label: "Matches", to: "/org/matches" }}
              title={m.material}
              meta={accepted ? <StatusBadge status="Accepted" label="Accepted" /> : undefined}
              subtitle={`Listed by ${m.counterparty} · ${m.counterpartyType}`}
            />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <section aria-labelledby="why-h">
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

                {accepted && (
                  <section aria-labelledby="receipt-h" className="mt-12">
                    <h2 id="receipt-h" className="text-lg font-semibold tracking-tight text-foreground">
                      Confirm receipt
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Record what arrived. This completes the material's Waste Passport and updates impact.
                    </p>
                    <form onSubmit={confirmReceipt} noValidate className="mt-6 max-w-md space-y-5">
                      <DetailList items={[{ label: "Expected quantity", value: m.quantity, mono: true }]} />
                      <FormField id="actual-qty" label="Actual quantity received" error={qtyError}>
                        <Input
                          id="actual-qty"
                          value={actualQty}
                          onChange={(e) => {
                            setActualQty(e.target.value);
                            setQtyError(undefined);
                          }}
                          className="font-mono"
                          error={Boolean(qtyError)}
                          aria-invalid={Boolean(qtyError)}
                          aria-describedby={qtyError ? "actual-qty-error" : undefined}
                        />
                      </FormField>
                      <ChoiceGroup label="Outcome" value={outcome} options={OUTCOMES} onChange={setOutcome} columns={4} />
                      <Button type="submit" disabled={busy !== null} className="gap-2">
                        {busy === "receipt" && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
                        Confirm receipt
                      </Button>
                    </form>
                  </section>
                )}
              </div>

              <aside className="lg:sticky lg:top-20 lg:self-start">
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <MaterialThumb category={m.category} size="md" />
                    <div className="min-w-0">
                      <p className="font-mono text-2xl font-medium text-foreground">{m.matchPercent}%</p>
                      <p className="text-[13px] text-muted-foreground">match with your needs</p>
                    </div>
                  </div>
                  <Separator className="my-5" />
                  <DetailList
                    items={[
                      { label: "Quantity", value: m.quantity, mono: true },
                      { label: "Distance", value: m.distance, mono: true },
                      { label: "Est. CO₂e", value: `${m.co2eEstimate} kg`, mono: true },
                      ...(accepted ? [{ label: "Pickup", value: pickupLabel }] : []),
                    ]}
                  />
                  {!accepted && (
                    <div className="mt-6 flex gap-2">
                      <Button variant="outline" className="flex-1" disabled={busy !== null} onClick={() => setConfirmDecline(true)}>
                        Decline
                      </Button>
                      <Button className="flex-1 gap-2" disabled={busy !== null} onClick={accept}>
                        {busy === "accept" && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
                        Accept
                      </Button>
                    </div>
                  )}
                </Card>
              </aside>
            </div>
          </>
        )}
      </PageContainer>

      <ConfirmationDialog
        open={confirmDecline}
        title="Decline this match?"
        description="The resident's listing stays available to other organizations."
        confirmLabel="Decline match"
        destructive
        loading={busy === "decline"}
        onConfirm={decline}
        onCancel={() => setConfirmDecline(false)}
      />
    </AppShell>
  );
};
