import React from "react";
import { Link } from "react-router-dom";
import { Recycle } from "lucide-react";
import { EnvironmentalVisual } from "./EnvironmentalVisual";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Hides the top brand logo on the form side (e.g. onboarding uses its own header). */
  hideBrand?: boolean;
}

/**
 * Premium split-screen auth shell for TraceIQ.
 * Left: circular material-flow visual panel (~58%, hidden on mobile/tablet).
 * Right: warm-white authentication form (~42%), vertically centered.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  hideBrand = false,
}) => {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
      {/* Left: visual panel — hidden below lg, narrower on md/lg, full on xl */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[58%]">
        <div className="sticky top-0 h-screen">
          <EnvironmentalVisual />
        </div>
      </div>

      {/* Right: authentication form */}
      <div className="flex w-full flex-col bg-brand-white lg:w-[45%] xl:w-[42%]">
        {/* Brand — top of the form column */}
        {!hideBrand && (
          <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest text-brand-white">
                <Recycle className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                TraceIQ
              </span>
            </Link>
          </header>
        )}

        {/* Centered form area */}
        <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 pb-6 text-center text-[11px] text-muted-foreground/80 sm:px-10">
          Give useful materials a second life.
        </footer>
      </div>
    </div>
  );
};
