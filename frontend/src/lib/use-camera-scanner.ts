import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reusable camera scanning lifecycle for TraceIQ.
 *
 * Owns the getUserMedia stream, a lightweight frame-stability heuristic, and
 * frame capture. It exposes a single typed state machine so pages never juggle
 * scattered booleans. All camera hardware is released on capture, cancel,
 * unmount, and when analysis begins.
 *
 * Permission is requested ONLY when `start()` is called — never on mount.
 */

/* ----------------------------- State model ----------------------------- */

/** Stability of the live preview, used to gate the capture button. */
export type Stability = "initializing" | "moving" | "stabilizing" | "stable";

export type ScannerState =
  | { status: "idle" }
  | { status: "requesting-permission" }
  | { status: "permission-denied" }
  | { status: "unsupported" }
  | { status: "starting-camera" }
  | { status: "camera-ready"; stability: Stability }
  | { status: "captured"; file: File; previewUrl: string }
  | { status: "error"; message: string };

export interface UseCameraScanner {
  state: ScannerState;
  /** Attach to the <video> element. */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** True once initialization grace period has passed and the frame is stable. */
  canCapture: boolean;
  /** Request permission and start the live preview. */
  start: () => Promise<void>;
  /** Capture the current frame; stops the stream and moves to `captured`. */
  capture: () => void;
  /** Discard the snapshot and restart the live preview. */
  retake: () => Promise<void>;
  /** Stop everything and return to idle (also revokes the preview URL). */
  cancel: () => void;
  /** Accept an uploaded file as the captured image (upload fallback). */
  useUploadedFile: (file: File) => void;
}

/* ------------------------------ Constants ------------------------------ */

// Stability heuristic tuning. Tolerant thresholds so sensor noise doesn't block.
const SAMPLE_INTERVAL_MS = 140;
const SAMPLE_SIZE = 32; // downscaled square used for motion diff
const MOTION_STABLE_THRESHOLD = 9; // mean per-pixel luma diff (0–255) considered "still"
const MOTION_MOVING_THRESHOLD = 20; // above this = clearly moving
const STABLE_HOLD_MS = 700; // must stay still this long to be "stable"
const INIT_GRACE_MS = 900; // allow manual capture after this even if heuristic never settles

export function useCameraScanner(): UseCameraScanner {
  const [state, setState] = useState<ScannerState>({ status: "idle" });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevSampleRef = useRef<Uint8ClampedArray | null>(null);
  const stableSinceRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const rafTimerRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const initGraceElapsedRef = useRef(false);

  /* --------------------------- Cleanup helpers --------------------------- */

  const stopStream = useCallback(() => {
    if (rafTimerRef.current !== null) {
      window.clearInterval(rafTimerRef.current);
      rafTimerRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    prevSampleRef.current = null;
    stableSinceRef.current = null;
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  /* --------------------------- Stability loop ---------------------------- */

  const sampleFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return;

    let canvas = sampleCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = SAMPLE_SIZE;
      canvas.height = SAMPLE_SIZE;
      sampleCanvasRef.current = canvas;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    const prev = prevSampleRef.current;
    prevSampleRef.current = data.slice();

    // First sample — nothing to compare against yet.
    if (!prev) return;

    // Mean absolute luma difference across the downscaled frame.
    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lumaNow = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const lumaPrev = 0.299 * prev[i] + 0.587 * prev[i + 1] + 0.114 * prev[i + 2];
      sum += Math.abs(lumaNow - lumaPrev);
      count++;
    }
    const motion = count ? sum / count : 0;

    const now = performance.now();
    let stability: Stability;
    if (motion <= MOTION_STABLE_THRESHOLD) {
      if (stableSinceRef.current === null) stableSinceRef.current = now;
      stability = now - stableSinceRef.current >= STABLE_HOLD_MS ? "stable" : "stabilizing";
    } else if (motion <= MOTION_MOVING_THRESHOLD) {
      stableSinceRef.current = null;
      stability = "stabilizing";
    } else {
      stableSinceRef.current = null;
      stability = "moving";
    }

    setState((s) => (s.status === "camera-ready" ? { status: "camera-ready", stability } : s));
  }, []);

  /* ------------------------------- Start -------------------------------- */

  const start = useCallback(async () => {
    revokePreview();

    const supported =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!supported) {
      setState({ status: "unsupported" });
      return;
    }

    setState({ status: "requesting-permission" });

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setState({ status: "permission-denied" });
      } else if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") {
        setState({ status: "unsupported" });
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setState({ status: "error", message: "The camera is in use by another app. Close it and try again." });
      } else {
        setState({ status: "error", message: "We couldn't start the camera. Please try again." });
      }
      return;
    }

    streamRef.current = stream;
    setState({ status: "starting-camera" });

    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // Autoplay can reject on some browsers; the <video> autoPlay attr covers it.
      }
    }

    // Reset stability tracking and begin sampling.
    prevSampleRef.current = null;
    stableSinceRef.current = null;
    startedAtRef.current = performance.now();
    initGraceElapsedRef.current = false;
    window.setTimeout(() => {
      initGraceElapsedRef.current = true;
    }, INIT_GRACE_MS);

    setState({ status: "camera-ready", stability: "initializing" });

    if (rafTimerRef.current !== null) window.clearInterval(rafTimerRef.current);
    rafTimerRef.current = window.setInterval(sampleFrame, SAMPLE_INTERVAL_MS);
  }, [revokePreview, sampleFrame]);

  /* ------------------------------ Capture ------------------------------- */

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setState({ status: "error", message: "Capture failed. Please try again." });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; // full sensor resolution, no upscaling
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setState({ status: "error", message: "Capture failed. Please try again." });
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setState({ status: "error", message: "Capture failed. Please try again." });
          return;
        }
        // Stop the camera immediately after a successful capture.
        stopStream();
        const filename = `traceiq-scan-${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: "image/jpeg" });
        revokePreview();
        const previewUrl = URL.createObjectURL(blob);
        previewUrlRef.current = previewUrl;
        setState({ status: "captured", file, previewUrl });
      },
      "image/jpeg",
      0.9
    );
  }, [stopStream, revokePreview]);

  /* --------------------------- Retake / cancel --------------------------- */

  const retake = useCallback(async () => {
    revokePreview();
    stopStream();
    await start();
  }, [revokePreview, stopStream, start]);

  const cancel = useCallback(() => {
    stopStream();
    revokePreview();
    setState({ status: "idle" });
  }, [stopStream, revokePreview]);

  const useUploadedFile = useCallback(
    (file: File) => {
      stopStream();
      revokePreview();
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setState({ status: "captured", file, previewUrl });
    },
    [stopStream, revokePreview]
  );

  /* --------------------------- Unmount cleanup --------------------------- */

  useEffect(() => {
    return () => {
      stopStream();
      revokePreview();
    };
  }, [stopStream, revokePreview]);

  const canCapture =
    state.status === "camera-ready" &&
    (state.stability === "stable" || initGraceElapsedRef.current);

  return { state, videoRef, canCapture, start, capture, retake, cancel, useUploadedFile };
}
