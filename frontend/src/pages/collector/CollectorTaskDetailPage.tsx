import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { PickupStatus } from "@/lib/domain";
import { ArrowLeft, MapPin, PackageCheck, Truck, Check, Loader2, Package } from "lucide-react";

const FLOW: PickupStatus[] = ["Assigned", "Collected", "Delivered"];

export const CollectorTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const task = useAsync(() => circularityService.getPickupTask(id ?? ""), [id]);

  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!task.data) return;
    setBusy(true);
    // "Start pickup" transitions Assigned -> (stays Assigned, now in progress) then reveals weight entry.
    await circularityService.updatePickupStatus(task.data.id, "Assigned");
    setBusy(false);
    toast("Pickup started. Record the actual weight when collected.");
  };

  const confirmCollection = async () => {
    if (!task.data) return;
    if (!weight.trim()) {
      toast("Enter the actual weight collected.", "error");
      return;
    }
    setBusy(true);
    await circularityService.updatePickupStatus(task.data.id, "Collected", weight.trim());
    setBusy(false);
    toast("Collection recorded. Material timeline updated.");
  };

  const markDelivered = async () => {
    if (!task.data) return;
    setBusy(true);
    await circularityService.updatePickupStatus(task.data.id, "Delivered");
    setBusy(false);
    toast("Marked delivered. The organization can now confirm receipt.");
    navigate("/collector");
  };

  const currentIndex = task.data ? FLOW.indexOf(task.data.status) : 0;

  return (
    <AppShell active="tasks" areaLabel="Collector · Task">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <button type="button" onClick={() => navigate("/collector")} className="mb-5 inline-flex items-center gap-1.5 rounded px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" />
          Back to Pickups
        </button>

        {task.error ? (
          <ErrorState onRetry={task.reload} />
        ) : task.isLoading ? (
          <SkeletonList rows={3} />
        ) : !task.data ? (
          <EmptyState icon={Truck} title="Task not found." action={<Button variant="outline" onClick={() => navigate("/collector")}>All pickups</Button>} />
        ) : (
          <>
            <PageHeader
              title={task.data.material}
              subtitle={`Est. ${task.data.estimatedQuantity} · ${task.data.window}`}
              action={<StatusBadge label={task.data.priority} tone={toneFor(task.data.priority)} />}
            />

            {/* Route facts */}
            <dl className="grid grid-cols-1 gap-2 rounded-[10px] border border-border bg-card p-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-sage" /><span className="text-muted-foreground">Pickup:</span><span className="font-medium text-foreground">{task.data.pickupArea}</span></div>
              <div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-brand-sage" /><span className="text-muted-foreground">Destination:</span><span className="font-medium text-foreground">{task.data.destination}</span></div>
            </dl>

            {/* Status flow */}
            <ol className="mt-6 flex items-center gap-2" aria-label="Task progress">
              {FLOW.map((s, i) => (
                <React.Fragment key={s}>
                  <li className="flex items-center gap-2">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs", i <= currentIndex ? "border-brand-sage bg-brand-soft text-brand-sage" : "border-border bg-card text-muted-foreground/50")}>
                      {i < currentIndex ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : i + 1}
                    </span>
                    <span className={cn("text-sm", i <= currentIndex ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
                  </li>
                  {i < FLOW.length - 1 && <span className={cn("h-px flex-1", i < currentIndex ? "bg-brand-sage/40" : "bg-border")} aria-hidden="true" />}
                </React.Fragment>
              ))}
            </ol>

            {/* Actions by status */}
            <section className="mt-8 rounded-[10px] border border-border bg-card p-5">
              {task.data.status === "Assigned" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Start the pickup, then record the actual weight collected.</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-xs font-medium text-foreground">Actual weight collected</Label>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-brand-sage" />
                      <Input id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="font-mono" placeholder={`e.g. ${task.data.estimatedQuantity}`} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" onClick={start} disabled={busy} className="gap-2"><Truck className="h-4 w-4" />Start pickup</Button>
                    <Button onClick={confirmCollection} disabled={busy} className="gap-2">
                      {busy ? <><Loader2 className="h-4 w-4 motion-safe:animate-spin" />Saving…</> : <><Check className="h-4 w-4" />Confirm collection</>}
                    </Button>
                  </div>
                </div>
              )}

              {task.data.status === "Collected" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    Collected <span className="font-mono font-medium">{task.data.actualQuantity ?? task.data.estimatedQuantity}</span>. Deliver to {task.data.destination}.
                  </p>
                  <Button onClick={markDelivered} disabled={busy} className="gap-2">
                    {busy ? <><Loader2 className="h-4 w-4 motion-safe:animate-spin" />Saving…</> : <><PackageCheck className="h-4 w-4" />Mark delivered</>}
                  </Button>
                </div>
              )}

              {task.data.status === "Delivered" && (
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand-sage"><Check className="h-3.5 w-3.5 stroke-[3]" /></span>
                  Delivered <span className="font-mono font-medium">{task.data.actualQuantity ?? task.data.estimatedQuantity}</span> to {task.data.destination}.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};
