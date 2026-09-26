import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Package, type LucideIcon } from "lucide-react";

export interface MarketplaceImageProps {
  src?: string;
  alt: string;
  aspectRatio?: "4/3" | "1/1" | "16/9" | "3/2" | string;
  className?: string;
  imageClassName?: string;
  loading?: "lazy" | "eager";
  fallbackIcon?: LucideIcon;
  objectPosition?: string;
}

const ASPECT_MAP: Record<string, string> = {
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
};

export const MarketplaceImage: React.FC<MarketplaceImageProps> = ({
  src,
  alt,
  aspectRatio = "4/3",
  className,
  imageClassName,
  loading = "lazy",
  fallbackIcon: FallbackIcon = Package,
  objectPosition = "center",
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClass = ASPECT_MAP[aspectRatio] ?? "aspect-[4/3]";
  const showFallback = !src || error;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[8px] bg-secondary/50",
        aspectClass,
        className
      )}
    >
      {/* Loading Skeleton */}
      {!loaded && !showFallback && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 animate-pulse bg-secondary/80"
        />
      )}

      {/* Actual Image */}
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{ objectPosition }}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName
          )}
        />
      )}

      {/* Fallback Neutral Placeholder with Icon */}
      {showFallback && (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-secondary/40 text-muted-foreground p-3 text-center"
        >
          <FallbackIcon className="h-6 w-6 stroke-[1.5] text-muted-foreground/70" />
          <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80 line-clamp-1">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
};
