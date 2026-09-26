import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "./use-modal";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** Prevent closing while a request is in flight. */
  busy?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Centered modal dialog (shadcn Dialog equivalent). */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  busy = false,
  footer,
  children,
  className,
}) => {
  const ref = useModal<HTMLDivElement>(open, onClose, busy);
  const titleId = React.useId();
  const descId = React.useId();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-4 sm:items-center">
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
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-[0_16px_48px_-12px_rgba(14,21,19,0.25)] motion-safe:animate-dialogIn",
          className
        )}
      >
        <button
          type="button"
          onClick={() => !busy && onClose()}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id={titleId} className="pr-8 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <div id={descId} className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </div>
        )}
        {children && <div className="mt-5">{children}</div>}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
};
