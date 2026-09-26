import React, { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DetailList } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PriorityLabel } from "@/components/common/StatusBadge";
import { FormField } from "@/components/common/FormField";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SkeletonList } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupStatus } from "@/lib/domain";
import { Check, Loader2, Truck } from "lucide-react";

const STEPS: { status: PickupStatus; label: string }[] = [
  { status: "Assigned", label: "Assigned" },
  { status: "Collected", label: "Collected" },
  { status: "Delivered", label: "Delivered" },
];

/** Task detail — job: move one pickup forward. One action per state. */
export const CollectorTaskDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const task = useAsync(() => circularityService.getPickupTask(id), [id]);

  const [started, setStarted] = useState(params.get("start") === "1");
  const [weight, setWeight] = useState("");
  const [weightError, setWeightError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const t = task.data;
  const stepIndex = t ? STEPS.findIndex((s) => s.status === t.status) : 0;

  const confirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!t) return;
    if (!/\d/.test(weight)) {
      setWeightError("Enter the weight you collected, e.g. 11 kg.");
      return;
    }
    setBusy(true);
    await circularityService.updatePickupStatus(t.id, "Collected", weight.trim());
    setBusy(false);
    toast("Collection recorded. The material's passport is updated.");
  };

  const markDelivered = async () => {
    if (!t) return;
    setBusy(true);
    await circularityService.updatePickupStatus(t.id, "Delivered");
    setBusy(false);
    toast(`Delivered to ${t.destination}. They can now confirm receipt.`);
  };

  return (
    <AppShell active="tasks" title={t?.material ?? "Task"}>
      <PageContainer size="narrow">
        {task.error ? (
          <ErrorState onRetry={task.reload} />
        ) : task.isLoading ? (
          <SkeletonList rows={3} />
        ) : !t ? (
          <EmptyState
            icon={Truck}
            title="Task not found."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/collector">All tasks</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              back={{ label: "Tasks", to: "/collector" }}
              title={t.material}
              meta={<PriorityLabel priority={t.priority} />}
              subtitle={<span className="font-mono text-[15px]">{t.window}</span>}
            />

            {/* Stepper */}
            <ol className="mb-8 flex items-center gap-3" aria-label="Task progress">
              {STEPS.map((s, i) => {
                const done = i < stepIndex || t.status === "Delivered";
                const current = i === stepIndex && t.status !== "Delivered";
                return (
                  <React.Fragment key={s.status}>
                    <li className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors duration-300",
                          done && "border-brand-sage bg-brand-sage text-brand-white",
                          current && "border-brand-forest text-brand-forest ring-4 ring-brand-soft",
                          !done && !current && "border-border text-muted-foreground"
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" /> : <span className="font-mono">{i + 1}</span>}
                      </span>
                      <span className={cn("text-sm", done || current ? "font-medium text-foreground" : "text-muted-foreground")}>{s.label}</span>
                    </li>
                    {i < STEPS.length - 1 && (
                      <li aria-hidden="true" className={cn("h-px flex-1 transition-colors duration-300", i < stepIndex ? "bg-brand-sage/60" : "bg-border")} />
                    )}
                  </React.Fragment>
                );
              })}
            </ol>

            <Card className="p-6">
              <DetailList
                items={[
                  { label: "Pickup", value: t.pickupArea },
                  { label: "Deliver to", value: t.destination },
                  { label: "Estimated", value: t.estimatedQuantity, mono: true },
                  ...(t.actualQuantity ? [{ label: "Collected", value: t.actualQuantity, mono: true }] : []),
                ]}
              />
              <Separator className="my-6" />

              {t.status === "Assigned" && !started && (
                <div>
                  <p className="text-sm text-muted-foreground">Head to the pickup area. Start when you arrive.</p>
                  <Button size="lg" className="mt-4 w-full gap-2 sm:w-auto" onClick={() => setStarted(true)}>
                    <Truck className="h-4 w-4" />
                    Start pickup
                  </Button>
                </div>
              )}

              {t.status === "Assigned" && started && (
                <form onSubmit={confirmCollection} noValidate className="space-y-4 motion-safe:animate-fadeIn">
                  <FormField id="weight" label="Actual weight collected" error={weightError} hint={`Estimated ${t.estimatedQuantity}`}>
                    <Input
                      id="weight"
                      data-autofocus
                      autoFocus
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        setWeightError(undefined);
                      }}
                      placeholder={t.estimatedQuantity}
                      className="h-11 max-w-[200px] font-mono text-base"
                      error={Boolean(weightError)}
                      aria-invalid={Boolean(weightError)}
                      aria-describedby={weightError ? "weight-error" : "weight-hint"}
                    />
                  </FormField>
                  <Button type="submit" size="lg" disabled={busy} className="w-full gap-2 sm:w-auto">
                    {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
                    Confirm collection
                  </Button>
                </form>
              )}

              {t.status === "Collected" && (
                <div>
                  <p className="text-sm text-muted-foreground">Drop the material at {t.destination}, then mark it delivered.</p>
                  <Button size="lg" disabled={busy} onClick={markDelivered} className="mt-4 w-full gap-2 sm:w-auto">
                    {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
                    Mark delivered
                  </Button>
                </div>
              )}

              {t.status === "Delivered" && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-brand-sage" strokeWidth={2.5} aria-hidden="true" />
                    Delivered. Nothing left to do here.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/collector">Back to tasks</Link>
                  </Button>
                </div>
              )}

              {t.status === "Unassigned" && (
                <p className="text-sm text-muted-foreground">This task hasn't been assigned to you yet.</p>
              )}
            </Card>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};
