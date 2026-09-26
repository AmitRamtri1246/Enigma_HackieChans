import * as React from "react";
import { X } from "lucide-react";
import { useModal } from "./use-modal";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Sticky footer, typically the form's primary action. */
  footer?: React.ReactNode;
  busy?: boolean;
  children: React.ReactNode;
}

/**
 * Right-hand sheet for create/edit forms (shadcn Sheet equivalent). Full width
 * on mobile, 440px on larger screens.
 */
export const Sheet: React.FC<SheetProps> = ({ open, onClose, title, description, footer, busy = false, children }) => {
  const ref = useModal<HTMLDivElement>(open, onClose, busy);
  const titleId = React.useId();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden="true"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-brand-ink/35 motion-safe:animate-overlayIn"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[440px] flex-col border-l border-border bg-card shadow-[0_0_48px_-12px_rgba(14,21,19,0.25)] motion-safe:animate-panelIn"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            aria-label="Close"
            className="-mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};
