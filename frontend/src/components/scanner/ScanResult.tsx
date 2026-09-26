import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CircularityRing } from "@/components/common/CircularityRing";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SCAN_ACTIONS, type ItemCondition, type MaterialAnalysis, type ScanAction } from "@/lib/domain";
import {
  Tag,
  Repeat,
  Gift,
  Wrench,
  Recycle,
  RotateCcw,
  Info,
  type LucideIcon,
} from "lucide-react";

interface ScanResultProps {
  analysis: MaterialAnalysis;
  previewUrl: string;
  onAction: (action: ScanAction, details: { condition: ItemCondition; weightKg: number }) => void;
  onRetake: () => void;
}

const ACTION_META: Record<ScanAction, { label: string; icon: LucideIcon; blurb: string }> = {
  sell: { label: "Sell", icon: Tag, blurb: "List it on the marketplace." },
  exchange: { label: "Exchange", icon: Repeat, blurb: "Swap with the community." },
  donate: { label: "Donate", icon: Gift, blurb: "Give it a new home." },
  repair: { label: "Repair", icon: Wrench, blurb: "Extend its useful life." },
  recycle: { label: "Recycle", icon: Recycle, blurb: "Send it to a recycler." },
};

/**
 * Analysis result: the identified material, an illustrative circularity score,
 * and the five circular pathways. The recommended action is highlighted but all
 * options remain available.
 */
export const ScanResult: React.FC<ScanResultProps> = ({ analysis, previewUrl, onAction, onRetake }) => {
  const [condition, setCondition] = useState<ItemCondition | "">("");
  const [weightKg, setWeightKg] = useState("");
  const [detailsError, setDetailsError] = useState(false);
  const recommended = analysis.recommendedAction;

  const chooseAction = (action: ScanAction) => {
    const parsedWeight = Number(weightKg);
    if (!condition || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setDetailsError(true);
      return;
    }
    onAction(action, { condition, weightKg: parsedWeight });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <img
            src={previewUrl}
            alt={analysis.materialName}
            className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {analysis.materialName}
              </h2>
              <StatusBadge
                label={`${Math.round(analysis.confidence * 100)}% confidence`}
                tone="active"
                dot={false}
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{analysis.category} · Review the details before choosing a route</p>

            <div className="mt-4 flex items-center gap-4">
              <CircularityRing value={analysis.circularityScore} label="Circularity" size={72} />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Circularity {analysis.circularityScore} / 100</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs">
                  <Info className="h-3 w-3" />
                  Illustrative estimate
                </p>
                <p className="mt-0.5 text-xs">Score is illustrative; weight is entered by you below.</p>
              </div>
            </div>
          </div>
        </div>

        {analysis.preparationGuidance.length > 0 && (
          <div className="mt-5 rounded-[10px] bg-secondary/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Before you hand it on
            </p>
            <ul className="mt-2 space-y-1">
              {analysis.preparationGuidance.map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-sage" aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="item-details-title">
        <h3 id="item-details-title" className="text-sm font-semibold text-foreground">Add item details</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your estimate helps the next owner or recycler plan. AI does not fill these in.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-foreground" htmlFor="scan-condition">
            Condition <span aria-hidden="true" className="text-destructive">*</span>
            <Select id="scan-condition" required value={condition} onChange={(event) => { setCondition(event.target.value as ItemCondition | ""); setDetailsError(false); }} options={[{ value: "", label: "Choose condition" }, ...["New", "Good", "Fair", "For parts"].map((item) => ({ value: item, label: item }))]} />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground" htmlFor="scan-weight">
            Approximate weight (kg) <span aria-hidden="true" className="text-destructive">*</span>
            <Input id="scan-weight" type="number" inputMode="decimal" min="0.01" step="0.01" required value={weightKg} onChange={(event) => { setWeightKg(event.target.value); setDetailsError(false); }} placeholder="e.g. 2.5" />
          </label>
        </div>
        {detailsError && <p className="mt-2 text-sm text-destructive" role="alert">Choose a condition and enter a weight greater than 0 kg before continuing.</p>}
      </section>

      <section className="mt-4 rounded-2xl border border-brand-sage/40 bg-brand-soft/35 p-4 sm:p-5" aria-labelledby="scan-recommendation-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="scan-recommendation-title" className="text-sm font-semibold text-brand-forest">Recommended next step</h3>
          <StatusBadge label={analysis.analysisSource === "demo" ? "Demo estimate" : "Gemini vision"} tone="neutral" dot={false} />
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground">{analysis.recommendationRationale}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">A useful next use:</span> {analysis.recommendedUse}</p>
        {analysis.alternativeRecommendations.length > 0 && (
          <div className="mt-4 border-t border-brand-sage/25 pt-3">
            <p className="text-xs font-medium text-muted-foreground">Other options to consider</p>
            <ul className="mt-2 space-y-1.5">
              {analysis.alternativeRecommendations.map((recommendation) => <li key={recommendation} className="flex gap-2 text-sm leading-5 text-foreground/85"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-sage" aria-hidden="true" />{recommendation}</li>)}
            </ul>
          </div>
        )}
      </section>

      {/* Circular pathways */}
      <div className="mt-6">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          What can you do with it?
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Choose a circular pathway for this item.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SCAN_ACTIONS.map((action) => (
            <PathwayCard
              key={action}
              action={action}
              recommended={action === recommended}
              onSelect={() => chooseAction(action)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center border-t border-border/70 pt-5">
        <Button variant="ghost" className="gap-2" onClick={onRetake}>
          <RotateCcw className="h-4 w-4" />
          Scan another item
        </Button>
      </div>
    </div>
  );
};

const PathwayCard: React.FC<{
  action: ScanAction;
  recommended: boolean;
  onSelect: () => void;
}> = ({ action, recommended, onSelect }) => {
  const meta = ACTION_META[action];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex items-start gap-3 rounded-[10px] border bg-card p-3.5 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        recommended
          ? "border-brand-sage/60 bg-brand-soft/40"
          : "border-border hover:border-brand-sage/40 hover:bg-accent/30"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          recommended ? "bg-brand-forest text-brand-white" : "bg-brand-soft text-brand-sage"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {meta.label}
          {recommended && (
            <span className="rounded-full bg-brand-forest px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-white">
              Recommended
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{meta.blurb}</span>
      </span>
    </button>
  );
};
