import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Layers,
  TrendingDown,
  Building2,
  Truck,
  Server,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface SectorData {
  name: string;
  icon: React.ElementType;
  baseline: number;
  unit: string;
  recommendedActions: string[];
}

const SECTORS: Record<string, SectorData> = {
  manufacturing: {
    name: "Manufacturing facilities",
    icon: Building2,
    baseline: 14200,
    unit: "tCO₂e / yr",
    recommendedActions: [
      "Waste heat recovery on primary furnaces",
      "Variable frequency drives on heavy pumps",
      "Process electrification during low-grid intensity hours",
    ],
  },
  logistics: {
    name: "Distribution & logistics",
    icon: Truck,
    baseline: 8900,
    unit: "tCO₂e / yr",
    recommendedActions: [
      "Route consolidation and load optimization",
      "Depot charging scheduling for electric delivery vans",
      "Aerodynamic retrofits across long-haul trailers",
    ],
  },
  datacenter: {
    name: "Computing & data operations",
    icon: Server,
    baseline: 4600,
    unit: "tCO₂e / yr",
    recommendedActions: [
      "Power usage effectiveness (PUE) cooling optimization",
      "Workload shifting to regions with lower marginal grid emissions",
      "Server retirement and hardware virtualization",
    ],
  },
};

export const LandingPage: React.FC = () => {
  const [selectedSectorKey, setSelectedSectorKey] = useState<string>("manufacturing");
  const [reductionTarget, setReductionTarget] = useState<number>(20);

  const activeSector = SECTORS[selectedSectorKey];
  const reducedAmount = Math.round((activeSector.baseline * reductionTarget) / 100);
  const remainingEmissions = activeSector.baseline - reducedAmount;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-border/70 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-grid-subtle">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              {/* Product badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-card text-xs text-foreground/85 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>Sustainability intelligence platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.18]">
                Environmental intelligence for measurable reduction decisions.
              </h1>

              {/* Editorial Subheading */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
                TraceIQ helps organizations monitor environmental impact, diagnose underlying operational drivers, and prioritize high-yield reduction actions with clear accountability.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/signup">
                    <span>Create workspace</span>
                    <ArrowRight className="h-4 w-4 opacity-80" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">
                    <span>Sign in to platform</span>
                  </Link>
                </Button>
              </div>

              {/* High-level telemetry line in clean sentence-case */}
              <div className="pt-6 border-t border-border/50 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Continuous monitoring</span>
                  <span>· Facility baselines</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Root-cause clarity</span>
                  <span>· Driver breakdown</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Action roadmaps</span>
                  <span>· Prioritized interventions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Measure → Understand → Act Section */}
        <section id="capabilities" className="py-20 md:py-24 border-b border-border/70">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="space-y-3 mb-12">
              <span className="text-xs font-semibold text-primary">
                Core methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                A disciplined progression from measurement to execution.
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Most sustainability initiatives stall because metrics aren't connected to operational choices. TraceIQ bridges that gap.
              </p>
            </div>

            {/* The 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Measure */}
              <div className="rounded-lg border border-border/80 bg-card p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      01 · Measure
                    </span>
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Continuous impact tracking
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aggregate energy consumption, direct fuel use, and operational inputs across your portfolio into transparent, standardized baselines.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                  Outcome: Verified carbon &amp; energy baselines
                </div>
              </div>

              {/* 2. Understand */}
              <div className="rounded-lg border border-border/80 bg-card p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      02 · Understand
                    </span>
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Driver &amp; cause diagnostics
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Isolate what causes emission spikes: separate weather severity and utility grid shifts from production volume and equipment anomalies.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                  Outcome: Granular driver attribution
                </div>
              </div>

              {/* 3. Act */}
              <div className="rounded-lg border border-border/80 bg-card p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      03 · Act
                    </span>
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Prioritized reduction pathways
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluate concrete abatement interventions by capital requirement and abatement yield to schedule realistic reduction milestones.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                  Outcome: Actionable decarbonization roadmaps
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Visual Section */}
        <section id="simulator" className="py-20 md:py-24 border-b border-border/70 bg-secondary/20">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="max-w-2xl space-y-3 mb-10">
              <span className="text-xs font-semibold text-primary">
                Interactive preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Simulate targeted reduction impact.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select an operational segment and adjust the target efficiency improvement to view projected emissions reduction and practical intervention pathways.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="rounded-lg border border-border/80 bg-card p-6 md:p-8 shadow-xs">
              {/* Sector selector tabs */}
              <div className="flex flex-wrap gap-2 pb-6 border-b border-border/60">
                {Object.entries(SECTORS).map(([key, item]) => {
                  const Icon = item.icon;
                  const isSelected = selectedSectorKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSectorKey(key)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Controls and metrics layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                {/* Left: Interactive Slider & Controls */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="reduction-slider"
                        className="text-xs font-medium text-foreground flex items-center gap-1.5"
                      >
                        <Sliders className="h-3.5 w-3.5 text-primary" />
                        Target efficiency improvement
                      </label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {reductionTarget}% reduction
                      </Badge>
                    </div>

                    <input
                      id="reduction-slider"
                      type="range"
                      min={5}
                      max={45}
                      step={5}
                      value={reductionTarget}
                      onChange={(e) => setReductionTarget(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#163326]"
                    />

                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                      <span>5% (Initial adjustments)</span>
                      <span>25% (Operational shift)</span>
                      <span>45% (Deep transformation)</span>
                    </div>
                  </div>

                  {/* Actions for this sector */}
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-medium text-foreground">
                      Sample intervention pathway for {activeSector.name.toLowerCase()}:
                    </h4>
                    <ul className="space-y-2">
                      {activeSector.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Real-time Telemetry Calculations */}
                <div className="lg:col-span-6 rounded-md border border-border/70 bg-secondary/30 p-5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Projected annual performance
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded border border-border/50 bg-card">
                        <span className="text-[11px] text-muted-foreground block">
                          Current baseline
                        </span>
                        <span className="font-mono text-xl font-bold text-foreground">
                          {activeSector.baseline.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {activeSector.unit}
                        </span>
                      </div>

                      <div className="p-3 rounded border border-border/50 bg-card">
                        <span className="text-[11px] text-muted-foreground block">
                          Projected target
                        </span>
                        <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                          {remainingEmissions.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {activeSector.unit}
                        </span>
                      </div>
                    </div>

                    {/* Abatement delta */}
                    <div className="p-3 rounded border border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300 block">
                          Estimated emissions avoided
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Based on modeled operational adjustments
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                          -{reducedAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 block">
                          tCO₂e avoided
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Simulations use standardized emission intensity metrics. Connect actual data inside the platform to generate facility-level roadmaps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action / Call to Action Strip */}
        <section id="pathway" className="py-20 md:py-24">
          <div className="container max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight max-w-xl mx-auto">
              Ready to replace environmental guesswork with measurable progress?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Create your organization account today to establish baselines, understand operational drivers, and build validated reduction pathways.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">
                  <span>Open organization account</span>
                  <ArrowRight className="h-4 w-4 opacity-80" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">
                  <span>Sign in to existing workspace</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
