import React from "react";
import { cn } from "@/lib/utils";

export interface OrgAvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  monogram?: string;
}

const COLOR_MAP: Record<string, string> = {
  EcoPack: "bg-emerald-700 text-emerald-100",
  GreenCycle: "bg-teal-700 text-teal-100",
  "Community Workshop": "bg-brand-forest text-brand-white",
  "Re-Volt Recyclers": "bg-slate-700 text-slate-100",
  "Riverside Municipality": "bg-brand-sage text-brand-forest",
};

const SIZE_MAP = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export const OrgAvatar: React.FC<OrgAvatarProps> = ({
  name,
  className,
  size = "md",
  monogram,
}) => {
  const letters =
    monogram ||
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const colorClass =
    COLOR_MAP[name] ??
    "bg-secondary text-secondary-foreground border border-border";

  return (
    <span
      title={name}
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-mono font-medium tracking-tight shadow-sm",
        SIZE_MAP[size],
        colorClass,
        className
      )}
    >
      {letters}
    </span>
  );
};
