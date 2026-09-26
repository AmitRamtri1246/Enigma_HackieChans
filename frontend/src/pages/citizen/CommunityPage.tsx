import React, { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { SkeletonList } from "@/components/ui/skeleton";
import { TabsList, TabsPanel } from "@/components/ui/tabs";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { CommunityActivity } from "@/lib/domain";
import { Users } from "lucide-react";
import { CommunitySelector } from "@/components/common/CommunitySelector";

type Filter = "all" | "offer" | "request" | "marketplace";

const VERB: Record<CommunityActivity["kind"], string> = {
  offer: "offered",
  request: "is looking for",
  reused: "gave a second life to",
  joined: "joined the community",
  sale: "listed for sale",
  purchase: "gave a second life to",
  community_buy_in: "brought into the community",
  auction: "queued for community auction",
  recycler_handoff: "sent to a recycler",
};

/** Community — a lightweight feed of what neighbours are offering and asking for. */
export const CommunityPage: React.FC = () => {
  const activity = useAsync(() => circularityService.getCommunityActivity());
  const [filter, setFilter] = useState<Filter>("all");
  const rows = (activity.data ?? []).filter((a) => filter === "all" || (filter === "marketplace" ? a.kind !== "offer" && a.kind !== "request" : a.kind === filter));

  return (
    <AppShell active="community" title="Community">
      <PageContainer size="narrow">
        <PageHeader title="Community" subtitle="What residents and organizations nearby are offering and asking for." />

        <CommunitySelector />

        <TabsList<Filter>
          idBase="community"
          label="Filter activity"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: "all", label: "All" },
            { value: "offer", label: "Offers" },
            { value: "request", label: "Requests" },
            { value: "marketplace", label: "Marketplace" },
          ]}
        />

        <TabsPanel idBase="community" value={filter} className="pt-2">
          {activity.error ? (
            <div className="pt-4"><ErrorState onRetry={activity.reload} /></div>
          ) : activity.isLoading ? (
            <div className="pt-4"><SkeletonList rows={5} /></div>
          ) : rows.length === 0 ? (
            <div className="pt-4"><EmptyState icon={Users} title="Nothing here yet." description="Offers and requests from your area will appear here." /></div>
          ) : (
            <ol className="divide-y divide-border/80">
              {rows.map((a) => (
                <FeedItem key={a.id} activity={a} />
              ))}
            </ol>
          )}
        </TabsPanel>
      </PageContainer>
    </AppShell>
  );
};

const FeedItem: React.FC<{ activity: CommunityActivity }> = ({ activity }) => {
  const initials = activity.actor
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const org = activity.actorType === "Organization";
  return (
    <li className="flex items-start gap-3.5 py-4">
      <span
        aria-hidden="true"
        className={
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold " +
          (org ? "rounded-md bg-brand-forest text-brand-white" : "rounded-full bg-secondary text-foreground")
        }
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-6 text-foreground">
          <span className="font-medium">{activity.actor}</span> <span className="text-muted-foreground">{VERB[activity.kind]}</span>
          {activity.material && <span className="font-medium"> {activity.material}</span>}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {activity.actorType} · {activity.when}
        </p>
      </div>
    </li>
  );
};
