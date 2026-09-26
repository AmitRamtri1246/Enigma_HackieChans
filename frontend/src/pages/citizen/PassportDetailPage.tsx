import React from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DetailList, MaterialThumb } from "@/components/common/DataDisplay";
import { JourneyTimeline } from "@/components/common/JourneyTimeline";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkeletonList } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { FileText } from "lucide-react";

/** Passport detail — the material's journey is the page; impact appears only once complete. */
export const PassportDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const passport = useAsync(() => circularityService.getWastePassport(id), [id]);
  const p = passport.data;
  const completed = p?.currentStage === "Completed";

  return (
    <AppShell active="passports" title={p ? `Passport · ${p.material}` : "Waste Passport"}>
      <PageContainer>
        {passport.error ? (
          <ErrorState onRetry={passport.reload} />
        ) : passport.isLoading ? (
          <SkeletonList rows={4} />
        ) : !p ? (
          <EmptyState
            icon={FileText}
            title="Passport not found."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/passports">All passports</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              back={{ label: "Waste Passports", to: "/passports" }}
              title={p.material}
              meta={<StatusBadge status={p.currentStage} />}
              subtitle={
                <>
                  Passport <span className="font-mono text-[13px]">{p.id.toUpperCase()}</span>
                </>
              }
            />

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section aria-labelledby="journey-h" className="min-w-0">
                <h2 id="journey-h" className="mb-6 text-lg font-semibold tracking-tight text-foreground">
                  Material journey
                </h2>
                <JourneyTimeline events={p.timeline} />
              </section>

              <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <MaterialThumb category={p.category} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{p.material}</p>
                      <p className="text-[13px] text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                  <Separator className="my-5" />
                  <DetailList
                    items={[
                      { label: "Quantity", value: p.quantity, mono: true },
                      { label: "Listed by", value: p.owner },
                      { label: "Outcome", value: p.outcome ?? "—" },
                    ]}
                  />

                  <Separator className="my-5" />
                  <h3 className="text-sm font-medium text-foreground">Impact</h3>
                  {completed ? (
                    <dl className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <dd className="font-mono text-xl font-medium text-foreground">{p.diverted}</dd>
                        <dt className="mt-0.5 text-[13px] text-muted-foreground">Diverted</dt>
                      </div>
                      <div>
                        <dd className="font-mono text-xl font-medium text-foreground">
                          {p.co2eEstimate} <span className="text-sm text-muted-foreground">kg</span>
                        </dd>
                        <dt className="mt-0.5 text-[13px] text-muted-foreground">CO₂e avoided</dt>
                      </div>
                      <p className="col-span-2 text-xs text-muted-foreground">Illustrative estimate, not a verified measurement.</p>
                    </dl>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Impact is recorded once the journey is complete.</p>
                  )}
                </Card>
              </aside>
            </div>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
};
