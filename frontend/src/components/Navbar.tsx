import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-all">
      <div className="container flex h-16 max-w-6xl items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-foreground text-base leading-none">
              TraceIQ
            </span>
            <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
              Sustainability intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link
            to="/#capabilities"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
          >
            Framework
          </Link>
          <Link
            to="/#simulator"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
          >
            Decisions preview
          </Link>
          <Link
            to="/#pathway"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
          >
            Action steps
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {location.pathname !== "/login" && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}

          {location.pathname !== "/signup" && (
            <Button size="sm" asChild className="gap-1.5">
              <Link to="/signup">
                <span>Open account</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-80" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
