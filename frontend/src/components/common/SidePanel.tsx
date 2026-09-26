import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
  title: string;
  onClose: () => void;
  /** Sticky footer actions. */
  footer?: React.ReactNode;
  /** Disable close (e.g. while a request is in flight). */
  busy?: boolean;
  children: React.ReactNode;
}

/**
 * Right-hand overlay work surface. Used for detail/review/create flows so the
 * primary screen stays visible behind a focused task panel.
 */
export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  onClose,
  footer,
  busy = false,
  children,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close panel"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-brand-ink/40 motion-safe:animate-overlayIn"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-xl motion-safe:animate-panelIn">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => !busy && onClose()}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};
