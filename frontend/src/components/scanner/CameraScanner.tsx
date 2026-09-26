import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCameraScanner } from "@/lib/use-camera-scanner";
import { scanService } from "@/lib/scan-service";
import type { MaterialAnalysis, ScanAction } from "@/lib/domain";
import { CameraPreview } from "./CameraPreview";
import { CaptureButton } from "./CaptureButton";
import { StabilityIndicator } from "./StabilityIndicator";
import { CapturedImage } from "./CapturedImage";
import { ScanResult } from "./ScanResult";
import {
  Camera,
  Upload,
  CameraOff,
  ShieldAlert,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

interface CameraScannerProps {
  /**
   * Called when the user picks a circular pathway on the result screen.
   * Receives the analysis, the captured file, and a fresh preview URL owned by
   * the caller's flow (the scanner revokes its own).
   */
  onAction: (action: ScanAction, payload: { analysis: MaterialAnalysis; file: File }) => void;
  /** Optional cancel handler (e.g. close a modal / go back). */
  onCancel?: () => void;
  /** Passed through to the analysis service for backend context. */
  scanContext?: string;
  communityId?: string;
}

type Analysis =
  | { phase: "none" }
  | { phase: "analyzing" }
  | { phase: "success"; result: MaterialAnalysis }
  | { phase: "error"; message: string };

/**
 * The single reusable camera scanning experience for TraceIQ. Every "Scan"
 * entry point renders this component so camera logic is never duplicated.
 */
export const CameraScanner: React.FC<CameraScannerProps> = ({
  onAction,
  onCancel,
  scanContext,
  communityId,
}) => {
  const scanner = useCameraScanner();
  const { state } = scanner;
  const [analysis, setAnalysis] = useState<Analysis>({ phase: "none" });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = (file: File) => {
    setAnalysis({ phase: "analyzing" });
    scanService
      .analyzeMaterial(file, { scanContext, communityId })
      .then((result) => setAnalysis({ phase: "success", result }))
      .catch((error: unknown) => setAnalysis({
        phase: "error",
        message: error instanceof Error ? error.message : "Couldn't analyze this image.",
      }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file, such as JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Choose an image smaller than 10 MB.");
      return;
    }
    setUploadError(null);
    scanner.useUploadedFile(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  /* ---------------------------- Analysis views ---------------------------- */

  if (state.status === "captured" && analysis.phase === "analyzing") {
    return <AnalyzingView previewUrl={state.previewUrl} />;
  }

  if (state.status === "captured" && analysis.phase === "success") {
    return (
      <ScanResult
        analysis={analysis.result}
        previewUrl={state.previewUrl}
        onRetake={() => {
          setAnalysis({ phase: "none" });
          void scanner.retake();
        }}
        onAction={(action, details) => onAction(action, {
          analysis: { ...analysis.result, condition: details.condition, estimatedWeightKg: details.weightKg },
          file: state.file,
        })}
      />
    );
  }

  if (state.status === "captured" && analysis.phase === "error") {
    return (
      <AnalyzeError
        message={analysis.message}
        onTryAgain={() => runAnalysis(state.file)}
        onRetake={() => {
          setAnalysis({ phase: "none" });
          void scanner.retake();
        }}
      />
    );
  }

  /* ------------------------------ Capture view ---------------------------- */

  if (state.status === "captured") {
    return (
      <CapturedImage
        previewUrl={state.previewUrl}
        onRetake={() => void scanner.retake()}
        onAnalyze={() => runAnalysis(state.file)}
      />
    );
  }

  /* -------------------------- Permission / errors ------------------------- */

  if (state.status === "permission-denied") {
    return (
      <ScannerNotice
        icon={ShieldAlert}
        title="Camera access is blocked"
        description="Allow camera access in your browser settings to scan an item."
        primary={{ label: "Try again", onClick: () => void scanner.start() }}
        secondary={{ label: "Upload photo instead", onClick: openFilePicker }}
        fileInputRef={fileInputRef}
        onUpload={handleUpload}
        onCancel={onCancel}
        uploadError={uploadError}
      />
    );
  }

  if (state.status === "unsupported") {
    return (
      <ScannerNotice
        icon={CameraOff}
        title="Camera isn't available on this device."
        description={!window.isSecureContext ? "Phone camera access requires a secure HTTPS page. Open TraceIQ through HTTPS, or upload a photo instead." : "You can upload a photo of the item instead."}
        primary={{ label: "Upload a photo", onClick: openFilePicker }}
        fileInputRef={fileInputRef}
        onUpload={handleUpload}
        onCancel={onCancel}
        uploadError={uploadError}
      />
    );
  }

  if (state.status === "error") {
    return (
      <ScannerNotice
        icon={CameraOff}
        title="Something went wrong"
        description={state.message}
        primary={{ label: "Try again", onClick: () => void scanner.start() }}
        secondary={{ label: "Upload photo instead", onClick: openFilePicker }}
        fileInputRef={fileInputRef}
        onUpload={handleUpload}
        onCancel={onCancel}
        uploadError={uploadError}
      />
    );
  }

  /* ------------------------------ Idle intro ------------------------------ */

  if (state.status === "idle") {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-sage">
            <Camera className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 text-base font-semibold text-foreground">Scan with camera</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            TraceIQ uses your camera to capture the item you're scanning. Your photo is
            sent for material analysis only after you choose Analyze.
          </p>
          <Button size="lg" className="mt-6 gap-2" onClick={() => void scanner.start()}>
            <Camera className="h-4 w-4" />
            Scan with camera
          </Button>
          <button
            type="button"
            onClick={openFilePicker}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Upload className="h-4 w-4" />
            Upload a photo instead
          </button>
          {uploadError && <p role="alert" className="mt-3 text-sm text-destructive">{uploadError}</p>}
        </div>
        <HiddenFileInput ref={fileInputRef} onChange={handleUpload} />
      </div>
    );
  }

  /* ------------------------- Live camera / starting ----------------------- */

  const stability = state.status === "camera-ready" ? state.stability : "initializing";
  const starting = state.status === "requesting-permission" || state.status === "starting-camera";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 text-center">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Scan an item</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Place the item inside the frame.</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-ink">
        <CameraPreview videoRef={scanner.videoRef} />

        {/* Close */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close scanner"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink/50 text-brand-white backdrop-blur transition-colors hover:bg-brand-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {starting && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-ink/60" role="status" aria-live="polite">
            <span className="flex items-center gap-2 text-sm text-brand-white">
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
              {state.status === "requesting-permission" ? "Requesting camera…" : "Starting camera…"}
            </span>
          </div>
        )}

        {/* Controls overlay */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-brand-ink/80 to-transparent px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8"
        >
          <StabilityIndicator stability={stability} ready={scanner.canCapture} />
          <CaptureButton onCapture={scanner.capture} enabled={scanner.canCapture} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <button
          type="button"
          onClick={openFilePicker}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Upload className="h-4 w-4" />
          Upload a photo instead
        </button>
      </div>

      <HiddenFileInput ref={fileInputRef} onChange={handleUpload} />
    </div>
  );
};

/* ------------------------------ Sub-views ------------------------------ */

const AnalyzingView: React.FC<{ previewUrl: string }> = ({ previewUrl }) => (
  <div className="mx-auto w-full max-w-md text-center" role="status" aria-live="polite">
    <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-ink">
      <img src={previewUrl} alt="Item being analyzed" className="max-h-[52vh] w-full object-contain opacity-80" />
      <div className="absolute inset-0 flex items-center justify-center bg-brand-ink/40">
        <Loader2 className="h-8 w-8 text-brand-white motion-safe:animate-spin" />
      </div>
    </div>
    <h2 className="mt-5 text-base font-semibold text-foreground">Analyzing your item…</h2>
    <AnalysisSteps />
  </div>
);

/** Cycles through honest phase labels — not a fake percentage. */
const AnalysisSteps: React.FC = () => {
  const steps = ["Reading image", "Identifying material", "Finding circular pathways"];
  const [i, setI] = useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % steps.length), 900);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <p className="mt-1 text-sm text-muted-foreground">{steps[i]}…</p>;
};

const AnalyzeError: React.FC<{
  message: string;
  onTryAgain: () => void;
  onRetake: () => void;
}> = ({ message, onTryAgain, onRetake }) => (
  <div className="mx-auto w-full max-w-md text-center">
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">{message}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your photo is still here — try again or retake.</p>
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="outline" className="gap-2" onClick={onRetake}>
          Retake photo
        </Button>
        <Button className="gap-2" onClick={onTryAgain}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  </div>
);

interface ScannerNoticeProps {
  icon: typeof CameraOff;
  title: string;
  description: string;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel?: () => void;
  uploadError?: string | null;
}

const ScannerNotice: React.FC<ScannerNoticeProps> = ({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
  fileInputRef,
  onUpload,
  onCancel,
  uploadError,
}) => (
  <div className="mx-auto w-full max-w-md text-center">
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {uploadError && <p role="alert" className="mt-2 text-sm text-destructive">{uploadError}</p>}
      <div className="mt-5 flex flex-col gap-2.5">
        <Button className={cn("gap-2")} onClick={primary.onClick}>
          {primary.label}
        </Button>
        {secondary && (
          <Button variant="outline" className="gap-2" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
    <HiddenFileInput ref={fileInputRef} onChange={onUpload} />
  </div>
);

const HiddenFileInput = React.forwardRef<HTMLInputElement, {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ onChange }, ref) => (
  <input
    ref={ref}
    type="file"
    accept="image/*"
    capture="environment"
    className="sr-only"
    aria-hidden="true"
    tabIndex={-1}
    onChange={onChange}
  />
));
HiddenFileInput.displayName = "HiddenFileInput";
