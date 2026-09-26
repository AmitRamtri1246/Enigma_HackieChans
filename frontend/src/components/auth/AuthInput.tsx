import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  /** Renders a show/hide toggle and manages the text/password type internally. */
  password?: boolean;
  /** Optional right-aligned control rendered next to the label (e.g. "Forgot password?"). */
  labelAction?: React.ReactNode;
}

/**
 * Field primitive for the TraceIQ auth surfaces: label, input, inline error,
 * and an optional password visibility toggle. Keeps every auth field
 * consistent so pages stay declarative.
 */
export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ id, label, error, password, labelAction, className, disabled, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-xs font-medium text-foreground">
            {label}
          </Label>
          {labelAction}
        </div>

        <div className="relative">
          <Input
            id={id}
            ref={ref}
            type={password ? (visible ? "text" : "password") : props.type}
            error={Boolean(error)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(password && "pr-10", className)}
            {...props}
          />

          {password && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              disabled={disabled}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs font-medium text-destructive motion-safe:animate-fadeIn"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
