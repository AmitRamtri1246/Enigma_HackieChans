import * as React from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthButtonProps extends ButtonProps {
  loading?: boolean;
  /** Shows a brief success check state (e.g. right after a successful submit). */
  success?: boolean;
  loadingText?: string;
  successText?: string;
  /** Trailing arrow on the idle state. Defaults to true. */
  showArrow?: boolean;
}

/**
 * Primary auth action button with idle, loading, and success states.
 * Wraps the shared Button so hover/press styling stays consistent.
 */
export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      children,
      loading = false,
      success = false,
      loadingText,
      successText,
      showArrow = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading || success}
        className={cn("h-11 w-full gap-2 font-medium", className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
            <span>{loadingText ?? "Please wait..."}</span>
          </>
        ) : success ? (
          <>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path className="animate-checkDraw" d="M20 6 9 17l-5-5" />
            </svg>
            <span>{successText ?? "Success"}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {showArrow && <ArrowRight className="h-4 w-4 opacity-80" />}
          </>
        )}
      </Button>
    );
  }
);
AuthButton.displayName = "AuthButton";

export { Check };
