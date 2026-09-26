import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { CircularityRing } from "@/components/common/CircularityRing";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { circularityService } from "@/lib/circularity-service";
import type { Material } from "@/lib/domain";
import { ScanLine, Loader2, ArrowRight, RotateCcw } from "lucide-react";

type Phase = "idle" | "analyzing" | "result";

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Material | null>(null);

  const runScan = (fileName?: string) => {
    setPhase("analyzing");
    circularityService.analyzeScan(fileName).then((mat) => {
      setResult(mat);
      setPhase("result");
    });
  };

  const reset = () => {
    setResult(null);
    setPhase("idle");
  };

  const startListing = () => {
    toast("Scan captured. Continue on the exchange to find a match.");
    navigate("/exchange");
  };

  return (
    <AppShell active="scan">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="Scan an item"
          subtitle="Identify a material and find its best circular destination."
        />

        {phase === "idle" && <ScanIdle onScan={() => runScan()} />}
        {phase === "analyzing" && <ScanAnalyzing />}
        {phase === "result" && result && (
          <ScanResult result={result} onReset={reset} onContinue={startListing} />
        )}
      </div>
    </AppShell>
  );
};

const ScanIdle: React.FC<{ onScan: () => void }> = ({ onScan }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
      <ScanLine className="h-7 w-7" strokeWidth={1.75} />
    </span>
    <h2 className="mt-5 text-base font-semibold text-foreground">
      Point your camera at an item
    </h2>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
      We'll estimate the material type and suggest what to do with it. This is a
      demo scan — no camera access needed.
    </p>
    <Button size="lg" className="mt-6 gap-2" onClick={onScan}>
      <ScanLine className="h-4 w-4" />
      Start scan
    </Button>
  </div>
);

const ScanAnalyzing: React.FC = () => (
  <div
    className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center"
    role="status"
    aria-live="polite"
  >
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
      <Loader2 className="h-7 w-7 motion-safe:animate-spin" strokeWidth={1.75} />
    </span>
    <h2 className="mt-5 text-base font-semibold text-foreground">Analyzing material…</h2>
    <p className="mt-1 text-sm text-muted-foreground">Estimating type and circularity.</p>
  </div>
);

const ScanResult: React.FC<{
  result: Material;
  onReset: () => void;
  onContinue: () => void;
}> = ({ result, onReset, onContinue }) => (
  <div className="rounded-2xl border border-border bg-card p-6 motion-safe:animate-fadeIn">
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <CircularityRing value={result.circularity} label="Circularity" />
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {result.name}
          </h2>
          <StatusBadge label={`${result.confidence}% confidence`} tone="active" dot={false} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.subtype} · {result.stream}
        </p>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Suggested actions
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {result.suggestedActions.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs font-medium capitalize text-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/70 pt-5">
      <Button className="gap-2" onClick={onContinue}>
        Find a match
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="gap-2" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Scan again
      </Button>
    </div>
  </div>
);
