import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowLeft } from "lucide-react";
import { EnvironmentalVisual } from "./EnvironmentalVisual";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground antialiased selection:bg-[#2D6A4F]/20 selection:text-[#163326]">
      {/* Left Column: Focused Authentication (~42% desktop, full on mobile) */}
      <div className="w-full lg:w-[42%] xl:w-[40%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background z-10 border-r border-border/70">
        {/* Header / Brand */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm tracking-tight leading-none">
                TraceIQ
              </span>
              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Sustainability intelligence
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1.5 py-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none" />
            <span>Overview</span>
          </Link>
        </div>

        {/* Center: Form Container with Generous Whitespace & Calm Hierarchy */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between pt-4 border-t border-border/40">
          <span>TraceIQ platform</span>
          <span>Encrypted and secure</span>
        </div>
      </div>

      {/* Right Column: Refined Environmental Visual (~58% desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:w-[58%] xl:w-[60%] sticky top-0 h-screen overflow-hidden">
        <EnvironmentalVisual />
      </div>
    </div>
  );
};
