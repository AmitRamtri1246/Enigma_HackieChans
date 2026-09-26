import React from "react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * The live camera preview surface. Fills a clean, dark camera frame with a
 * subtle bounding guide for positioning — NOT a fake AI detection box.
 */
export const CameraPreview: React.FC<CameraPreviewProps> = ({ videoRef }) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-ink sm:aspect-[4/3]">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="h-full w-full object-cover"
      aria-label="Live camera preview"
    />

    {/* Positioning guide — corners only, purely a framing aid. */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-[68%] w-[76%] max-w-sm">
        {CORNERS.map((c) => (
          <span
            key={c}
            className={`absolute h-7 w-7 border-brand-white/70 ${CORNER_CLASS[c]}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  </div>
);

const CORNERS = ["tl", "tr", "bl", "br"] as const;
const CORNER_CLASS: Record<(typeof CORNERS)[number], string> = {
  tl: "left-0 top-0 rounded-tl-lg border-l-2 border-t-2",
  tr: "right-0 top-0 rounded-tr-lg border-r-2 border-t-2",
  bl: "bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2",
  br: "bottom-0 right-0 rounded-br-lg border-b-2 border-r-2",
};
