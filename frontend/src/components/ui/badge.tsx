import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Restrained status badge. Soft tints only — never bright filled colors.
 * active    → soft green   (in progress, live)
 * pending   → soft amber   (waiting on someone)
 * completed → sage outline (done)
 * problem   → soft red     (cancelled, declined, overdue)
 * neutral   → grey         (informational)
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium leading-5 transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-transparent bg-secondary text-muted-foreground",
        active: "border-transparent bg-brand-soft/80 text-brand-forest",
        pending: "border-transparent bg-[#F5EFE2] text-[#7A5A1C]",
        completed: "border-brand-sage/25 bg-transparent text-brand-sage",
        problem: "border-transparent bg-brand-danger/10 text-[#A4463B]",
        outline: "border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
