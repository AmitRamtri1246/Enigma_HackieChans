import React from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { usePreviewRole } from "@/lib/use-preview-role";
import type { CommunityActivity, CommunityEventKind } from "@/lib/domain";
import { Gift, Search, Sprout, UserPlus, Building2, User, type LucideIcon } from "lucide-react";

const KIND_META: Record<CommunityEventKind, { icon: LucideIcon; verb: string }> = {
  offer: { icon: Gift, verb: "offered" },
  request: { icon: Search, verb: "is looking for" },
  reused: { icon: Sprout, verb: "reused" },
  joined: { icon: UserPlus, verb: "joined the community" },
};

export const CommunityPage: React.FC = () => {
  const { role } = usePreviewRole();
  const activity = useAsync(() => circularityService.getCommunityActivity());
  const activeId = role === "organization" ? "community" : "community";

  return (
    <AppShell active={activeId} areaLabel={`${cap(role)} · Community`}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <PageHeader title="Community" subtitle="What your neighborhood is reusing and exchanging." />

        {activity.error ? (
          <ErrorState onRetry={activity.reload} />
        ) : activity.isLoading ? (
          <SkeletonList rows={5} />
        ) : (activity.data ?? []).length === 0 ? (
          <EmptyState title="No community activity yet." description="Offers, requests and reuse events show up here." />
        ) : (
          <ol className="overflow-hidden rounded-[10px] border border-border bg-card">
            {(activity.data ?? []).map((a, i) => (
              <ActivityRow key={a.id} activity={a} last={i === (activity.data ?? []).length - 1} />
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
};

const ActivityRow: React.FC<{ activity: CommunityActivity; last: boolean }> = ({ activity, last }) => {
  const meta = KIND_META[activity.kind];
  const Icon = meta.icon;
  const ActorIcon = activity.actorType === "Organization" ? Building2 : User;
  return (
    <li className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-border/60"}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft/70 text-brand-sage">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-medium">{activity.actor}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>{" "}
          {activity.material && <span className="font-medium">{activity.material}</span>}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <ActorIcon className="h-3 w-3" />
          {activity.actorType}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{activity.when}</span>
    </li>
  );
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
