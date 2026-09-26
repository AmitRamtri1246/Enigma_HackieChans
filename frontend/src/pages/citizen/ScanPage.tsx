import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { CircularityRing } from "@/components/common/CircularityRing";
import { MaterialThumb, RowItem, RowList } from "@/components/common/DataDisplay";
import { ChoiceGroup } from "@/components/common/FormField";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { parseKm } from "@/lib/format";
import type { ExchangeType, MapPointKind, Material } from "@/lib/domain";
import { ArrowRight, ImageUp, Loader2, RefreshCw, RotateCcw, X } from "lucide-react";

type Phase = "idle" | "preview" | "analyzing" | "result";

const MAX_BYTES = 10 * 1024 * 1024;

const ACTION_OPTIONS: { value: ExchangeType; label: string }[] = [
  { value: "exchange", label: "Exchange" },
  { value: "donation", label: "Donate" },
  { value: "pickup", label: "Recycle" },
];

const KIND_LABEL: Record<MapPointKind, string> = {
  reuse: "Reuse opportunity",
  recycler: "Recycler",
  exchange: "Exchange point",
  collection: "Collection point",
};

const SAMPLES = [
  { name: "office-chair.jpg", label: "Office chair" },
  { name: "plastic-bottle.jpg", label: "Plastic bottle" },
];

/**
 * Scanner — job: identify one item and decide its next step.
 * Upload → preview → analyzing → result (deterministic mock; no browser AI calls).
 */
export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Material | null>(null);
  const [action, setAction] = useState<ExchangeType>("exchange");
  const [publishing, setPublishing] = useState(false);

  // Release object URLs when replaced or on unmount.
  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const acceptFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFileError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("That image is over 10 MB. Try a smaller photo.");
      return;
    }
    setFileError(null);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setResult(null);
    setPhase("preview");
  };

  const analyze = async (name = fileName) => {
    setPhase("analyzing");
    const material = await circularityService.analyzeScan(name);
    setResult(material);
    setAction(material.suggestedActions[0] ?? "exchange");
    setPhase("result");
  };

  const runSample = (name: string) => {
    setImageUrl(null);
    setFileName(name);
    setFileError(null);
    void analyze(name);
  };

  const removeImage = () => {
    setImageUrl(null);
    setFileName("");
    setResult(null);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const publish = async () => {
    if (!result) return;
    setPublishing(true);
    await circularityService.createListing({
      title: result.name,
      material: result.name,
      category: result.category,
      description: `${result.subtype}. Identified by scan.`,
      condition: result.category === "Furniture" ? "Fair" : "Good",
      weight: result.category === "Furniture" ? "12 kg" : "5 kg",
      exchangeType: action,
      area: "Riverside",
    });
    setPublishing(false);
    toast("Listing published. Matching organizations can now see it.");
    navigate("/listings");
  };

  return (
    <AppShell active="scan">
      <PageContainer size="narrow">
        <PageHeader title="Scan an item" subtitle="Add a photo and we'll suggest the most useful next step for it." />

        <input
          ref={inputRef}
          id="scan-file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) acceptFile(f);
            e.target.value = ""; // allow picking the same file again
          }}
        />

        {phase === "idle" && (
          <div>
            <label
              htmlFor="scan-file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) acceptFile(f);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center transition-colors duration-150 focus-within:ring-1 focus-within:ring-ring",
                dragging ? "border-brand-sage bg-brand-soft/30" : "border-border hover:border-foreground/25"
              )}
            >
              <ImageUp className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              <span className="mt-4 text-[15px] font-medium text-foreground">Upload or take a photo</span>
              <span className="mt-1 text-sm text-muted-foreground">Drag an image here, or click to browse. Up to 10 MB.</span>
            </label>
            {fileError && (
              <p role="alert" className="mt-3 text-[13px] font-medium text-[#A4463B]">
                {fileError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>No photo handy? Try a sample:</span>
              {SAMPLES.map((s) => (
                <Button key={s.name} variant="outline" size="sm" onClick={() => runSample(s.name)}>
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {(phase === "preview" || (phase === "analyzing" && imageUrl)) && imageUrl && (
          <div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-card">
              <img src={imageUrl} alt="Photo of the item to analyze" className="max-h-[420px] w-full object-cover" />
              {phase === "analyzing" && (
                <div role="status" aria-live="polite" className="absolute inset-0 flex items-center justify-center bg-brand-ink/40 motion-safe:animate-overlayIn">
                  <span className="inline-flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm font-medium text-foreground">
                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                    Analyzing material…
                  </span>
                </div>
              )}
            </div>
            {phase === "preview" && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button onClick={() => analyze()} className="gap-2">
                  Analyze item
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Replace image
                </Button>
                <Button variant="ghost" onClick={removeImage} className="gap-2 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}

        {phase === "analyzing" && !imageUrl && (
          <div role="status" aria-live="polite" className="flex items-center gap-5 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
              <p className="pt-1 text-sm text-muted-foreground">Analyzing material…</p>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <ScanResult
            result={result}
            imageUrl={imageUrl}
            action={action}
            onActionChange={setAction}
            publishing={publishing}
            onFindMatches={() => navigate(`/exchange?category=${encodeURIComponent(result.category)}`)}
            onPublish={publish}
            onRetry={() => analyze()}
            onReplace={() => inputRef.current?.click()}
            onReset={removeImage}
          />
        )}
      </PageContainer>
    </AppShell>
  );
};

const ScanResult: React.FC<{
  result: Material;
  imageUrl: string | null;
  action: ExchangeType;
  onActionChange: (a: ExchangeType) => void;
  publishing: boolean;
  onFindMatches: () => void;
  onPublish: () => void;
  onRetry: () => void;
  onReplace: () => void;
  onReset: () => void;
}> = ({ result, imageUrl, action, onActionChange, publishing, onFindMatches, onPublish, onRetry, onReplace, onReset }) => {
  const points = useAsync(() => circularityService.getMapPoints());
  const nearby = [...(points.data ?? [])].sort((a, b) => parseKm(a.distance) - parseKm(b.distance)).slice(0, 3);
  const suggested = ACTION_OPTIONS.filter((o) => result.suggestedActions.includes(o.value));

  return (
    <div className="motion-safe:animate-fadeIn">
      <article className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-labelledby="scan-result-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <MaterialThumb category={result.category} size="md" imageUrl={imageUrl ?? undefined} alt={result.name} className="h-20 w-20" />
          <div className="min-w-0 flex-1">
            <h2 id="scan-result-title" className="text-xl font-semibold tracking-tight text-foreground">
              {result.name}
            </h2>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {result.subtype} · {result.stream}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Confidence <span className="font-mono text-foreground">{result.confidence}%</span>
            </p>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:gap-1.5">
            <CircularityRing value={result.circularity} size={84} />
            <span className="text-xs text-muted-foreground">Circularity score</span>
          </div>
        </div>

        <Separator className="my-6" />

        <ChoiceGroup label="What would you like to do with it?" value={action} options={suggested} onChange={onActionChange} />
      </article>

      <section className="mt-10" aria-labelledby="nearby-h">
        <h2 id="nearby-h" className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Nearby destinations
        </h2>
        {points.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <RowList label="Nearby destinations">
            {nearby.map((p) => (
              <RowItem
                key={p.id}
                title={p.name}
                meta={
                  <>
                    {KIND_LABEL[p.kind]} · {p.area}
                  </>
                }
                trailing={<span className="font-mono text-sm text-muted-foreground">{p.distance}</span>}
              />
            ))}
          </RowList>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button onClick={onFindMatches} className="gap-2">
          Find circular matches
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onPublish} disabled={publishing} className="gap-2">
          {publishing && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
          Publish listing
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
        <Button variant="ghost" onClick={onRetry} className="gap-2 text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
        {imageUrl ? (
          <Button variant="ghost" onClick={onReplace} className="text-muted-foreground">
            Replace image
          </Button>
        ) : (
          <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
            Scan another
          </Button>
        )}
      </div>
    </div>
  );
};
