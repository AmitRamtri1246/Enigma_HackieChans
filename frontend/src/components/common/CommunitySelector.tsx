import React from "react";
import { MapPin, Users } from "lucide-react";
import { Select } from "@/components/ui/select";
import { circularityService } from "@/lib/circularity-service";
import { useAsync } from "@/lib/use-async";

/** Shared persisted community context used by member and Community Admin views. */
export const CommunitySelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const communities = useAsync(() => circularityService.getCommunities());
  const active = useAsync(() => circularityService.getActiveCommunity());
  const options = (communities.data ?? []).map((community) => ({ value: community.id, label: community.name }));

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Active community">
      <div className="min-w-0">
        <label htmlFor="active-community" className="text-sm font-medium text-foreground">Your community</label>
        {active.data && !compact && (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{active.data.area}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{active.data.memberCount} members</span>
          </p>
        )}
      </div>
      <Select
        id="active-community"
        aria-label="Select active community"
        value={active.data?.id ?? ""}
        disabled={communities.isLoading || options.length === 0}
        options={options.length ? options : [{ value: "", label: "Loading communities…" }]}
        className="w-full sm:max-w-[340px]"
        onChange={(event) => circularityService.setActiveCommunity(event.target.value)}
      />
      {active.data && compact && <span className="sr-only">{active.data.description}</span>}
    </section>
  );
};
