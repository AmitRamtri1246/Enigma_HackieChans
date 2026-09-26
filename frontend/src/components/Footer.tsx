import React from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/70 bg-secondary/25 text-sm text-muted-foreground">
      <div className="container max-w-6xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3 pr-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground shadow-xs">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-foreground text-sm tracking-tight">
                TraceIQ
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              A sustainability intelligence platform that helps organizations measure environmental impact, diagnose underlying causes, and guide measurable reduction decisions.
            </p>
            <p className="text-[11px] text-muted-foreground/75">
              © {new Date().getFullYear()} TraceIQ Technologies Inc. All rights reserved.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-foreground">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/#capabilities" className="hover:text-foreground transition-colors">
                  Measuring impact
                </Link>
              </li>
              <li>
                <Link to="/#capabilities" className="hover:text-foreground transition-colors">
                  Understanding causes
                </Link>
              </li>
              <li>
                <Link to="/#capabilities" className="hover:text-foreground transition-colors">
                  Taking action
                </Link>
              </li>
              <li>
                <Link to="/#simulator" className="hover:text-foreground transition-colors">
                  Reduction preview
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-foreground">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-foreground transition-colors">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
