import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { JourneyTimeline } from "@/components/common/JourneyTimeline";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { ArrowLeft, FileText, Leaf } from "lucide-react";

export const PassportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const passport = useAsync(() => circularityService.getWastePassport(id ?? ""), [id]);

  const completed = passport.data?.currentStage === "Completed";

  return (
    <AppShell active="passports" areaLabel="Citizen · Passports">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <button
          type="button"
          onClick={() => navigate("/passports")}
          className="mb-5 inline-flex items-center gap-1.5 rounded px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Passports
        </button>

        {passport.error ? (
          <ErrorState onRetry={passport.reload} />
        ) : passport.isLoading ? (
          <SkeletonList rows={4} />
        ) : !passport.data ? (
          <EmptyState icon={FileText} title="Passport not found." action={<Button variant="outline" onClick={() => navigate("/passports")}>All passports</Button>} />
        ) : (
          <>
            <PageHeader
              title={passport.data.material}
              subtitle={`Waste Passport · ${passport.data.quantity} · ${passport.data.owner}`}
              action={<StatusBadge label={passport.data.currentStage} tone={toneFor(passport.data.currentStage)} />}
            />

            {/* Journey timeline */}
            <section className="rounded-[10px] border border-border bg-card p-5">
              <h2 className="mb-5 text-sm font-semibold tracking-tight text-foreground">Material journey</h2>
              <JourneyTimeline events={passport.data.timeline} />
            </section>

            {/* Impact — only meaningful once completed */}
            <section className="mt-6 rounded-[10px] border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-brand-sage" />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Impact</h2>
              </div>
              {completed ? (
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dd className="font-mono text-xl font-medium text-brand-forest">{passport.data.diverted}</dd>
                    <dt className="mt-0.5 text-xs text-muted-foreground">Material diverted</dt>
                  </div>
                  <div>
                    <dd className="font-mono text-xl font-medium text-brand-forest">{passport.data.co2eEstimate} kg</dd>
                    <dt className="mt-0.5 text-xs text-muted-foreground">CO₂e avoided · illustrative estimate</dt>
                  </div>
                  {passport.data.outcome && (
                    <div className="col-span-2">
                      <dd className="text-sm font-medium text-foreground">Outcome: {passport.data.outcome}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Impact will be shown once this material's journey is complete.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};
