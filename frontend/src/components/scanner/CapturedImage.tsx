import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";

interface CapturedImageProps {
  previewUrl: string;
  onRetake: () => void;
  onAnalyze: () => void;
}

/**
 * Review screen shown after capture. The user inspects the snapshot and
 * explicitly chooses to Analyze — nothing is uploaded before this confirmation.
 */
export const CapturedImage: React.FC<CapturedImageProps> = ({ previewUrl, onRetake, onAnalyze }) => (
  <div className="mx-auto w-full max-w-md">
    <div className="mb-4 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Review your scan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Check the photo, then analyze it or retake.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border bg-brand-ink">
      <img
        src={previewUrl}
        alt="Captured item to analyze"
        className="max-h-[60vh] w-full object-contain"
      />
    </div>

    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
      <Button variant="outline" className="gap-2" onClick={onRetake}>
        <RotateCcw className="h-4 w-4" />
        Retake
      </Button>
      <Button className="gap-2" onClick={onAnalyze}>
        <Sparkles className="h-4 w-4" />
        Analyze item
      </Button>
    </div>
  </div>
);
