import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { MaterialThumb, ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SkeletonCards, SkeletonTable } from "@/components/ui/skeleton";
import { TabsList, TabsPanel } from "@/components/ui/tabs";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { EXCHANGE_TYPE_LABEL, OFFER_LABEL, formatDate, parseKm } from "@/lib/format";
import type { ExchangeRequest, ExchangeType, Match, MaterialCategory, MaterialListing } from "@/lib/domain";
import { Plus, Repeat, Search } from "lucide-react";

type Tab = "foryou" | "offers" | "requests" | "mine";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All materials" },
  ...(["Plastic", "Cardboard", "Metal", "Electronics", "Furniture", "Textile", "Glass"] as MaterialCategory[]).map((c) => ({ value: c, label: c })),
];
const DISTANCE_OPTIONS = [
  { value: "any", label: "Any distance" },
  { value: "1", label: "Within 1 km" },
  { value: "2", label: "Within 2 km" },
  { value: "5", label: "Within 5 km" },
];
const TYPE_OPTIONS = [
  { value: "any", label: "Any type" },
  { value: "exchange", label: "Swap" },
  { value: "donation", label: "Free" },
  { value: "pickup", label: "Free pickup" },
];

/**
 * Exchange — a classifieds marketplace, not a dashboard.
 * Large visuals, clear "price" (how it changes hands), condition, distance, community.
 */
export const ExchangePage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "foryou";
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const [distance, setDistance] = useState("any");
  const [type, setType] = useState("any");

  const matches = useAsync(() => circularityService.getMatches());
  const listings = useAsync(() => circularityService.getListings());
  const requests = useAsync(() => circularityService.getExchangeRequests());
  const me = useAsync(() => circularityService.getCurrentUser());

  const setParam = (key: string, value: string, empty: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === empty) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const listingById = useMemo(() => {
    const map = new Map<string, MaterialListing>();
    (listings.data ?? []).forEach((l) => map.set(l.id, l));
    return map;
  }, [listings.data]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (matches.data ?? [])
      .filter((m) => m.status !== "Declined")
      .filter((m) => !q || m.material.toLowerCase().includes(q) || m.counterparty.toLowerCase().includes(q))
      .filter((m) => category === "all" || m.category === category)
      .filter((m) => distance === "any" || parseKm(m.distance) <= Number(distance))
      .filter((m) => type === "any" || listingById.get(m.listingId)?.exchangeType === type)
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [matches.data, query, category, distance, type, listingById]);

  const offers = (requests.data ?? []).filter((r) => r.kind === "offer");
  const asks = (requests.data ?? []).filter((r) => r.kind === "request");
  const mine = listings.data ?? [];
  const filtersActive = query || category !== "all" || distance !== "any" || type !== "any";

  const clearFilters = () => {
    setDistance("any");
    setType("any");
    const next = new URLSearchParams(params);
    next.delete("q");
    next.delete("category");
    setParams(next, { replace: true });
  };

  return (
    <AppShell active="exchange">
      <PageContainer size="wide">
        <PageHeader
          title="Exchange"
          subtitle="Useful materials from neighbours and organizations near Riverside."
          action={
            <Button asChild className="gap-2">
              <Link to="/listings?new=1">
                <Plus className="h-4 w-4" />
                List an item
              </Link>
            </Button>
          }
        />

        <TabsList<Tab>
          idBase="exchange"
          label="Exchange views"
          value={tab}
          onValueChange={(v) => setParam("tab", v, "foryou")}
          items={[
            { value: "foryou", label: "For You" },
            { value: "offers", label: "Offers", count: offers.length || undefined },
            { value: "requests", label: "Requests", count: asks.length || undefined },
            { value: "mine", label: "My Listings", count: mine.length || undefined },
          ]}
        />

        <TabsPanel idBase="exchange" value={tab} className="pt-6">
          {tab === "foryou" && (
            <>
              {/* Filters */}
              <div className="mb-8 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_180px_160px_150px_auto]">
                <div className="relative col-span-2 lg:col-span-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(e) => setParam("q", e.target.value, "")}
                    placeholder="Search items or people"
                    aria-label="Search items"
                    className="h-9 pl-9"
                  />
                </div>
                <Select aria-label="Material" value={category} onChange={(e) => setParam("category", e.target.value, "all")} options={CATEGORY_OPTIONS} />
                <Select aria-label="Distance" value={distance} onChange={(e) => setDistance(e.target.value)} options={DISTANCE_OPTIONS} />
                <Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} />
                {filtersActive ? (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground">
                    Clear
                  </Button>
                ) : (
                  <span className="hidden lg:block" />
                )}
              </div>

              {matches.error || listings.error ? (
                <ErrorState onRetry={() => { matches.reload(); listings.reload(); }} />
              ) : matches.isLoading || listings.isLoading ? (
                <SkeletonCards count={6} />
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Repeat}
                  title={filtersActive ? "Nothing matches these filters." : "No materials available nearby."}
                  description={filtersActive ? "Try a wider distance or a different material." : "New items appear as neighbours list them."}
                  action={filtersActive ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button> : undefined}
                />
              ) : (
                <>
                  <p className="sr-only" aria-live="polite">{items.length} items</p>
                  <ul className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((m) => (
                      <li key={m.id}>
                        <ListingCard match={m} listing={listingById.get(m.listingId)} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {tab === "offers" && (
            <RequestTable
              rows={offers}
              loading={requests.isLoading}
              error={Boolean(requests.error)}
              onRetry={requests.reload}
              empty="No offers yet. Offer an item from any match to see it here."
              me={me.data?.fullName}
            />
          )}

          {tab === "requests" && (
            <RequestTable
              rows={asks}
              loading={requests.isLoading}
              error={Boolean(requests.error)}
              onRetry={requests.reload}
              empty="No requests on your items yet."
              me={me.data?.fullName}
              actionable
            />
          )}

          {tab === "mine" && <MyListingsTable listings={mine} loading={listings.isLoading} />}
        </TabsPanel>
      </PageContainer>
    </AppShell>
  );
};

/* ------------------------------ Listing card ------------------------------ */

const ListingCard: React.FC<{ match: Match; listing?: MaterialListing }> = ({ match, listing }) => {
  const exchangeType: ExchangeType = listing?.exchangeType ?? "donation";
  return (
    <Link
      to={`/exchange/${match.id}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="overflow-hidden rounded-lg border border-border">
        <MaterialThumb category={match.category} size="lg" className="rounded-none transition-transform duration-200 ease-out group-hover:scale-[1.02]" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-medium text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
          {match.material}
        </h3>
        <span className="shrink-0 font-mono text-[13px] text-muted-foreground">{match.matchPercent}% match</span>
      </div>
      <p className="mt-0.5 text-[15px] font-semibold text-foreground">{OFFER_LABEL[exchangeType]}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {listing?.condition ?? "Good"} condition · <span className="font-mono">{match.quantity}</span> · <span className="font-mono">{match.distance}</span>
      </p>
      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
        {match.counterparty} · {listing?.area ?? "Riverside"}
      </p>
    </Link>
  );
};

/* ---------------------------- Requests / offers ---------------------------- */

const RequestTable: React.FC<{
  rows: ExchangeRequest[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  empty: string;
  me?: string;
  actionable?: boolean;
}> = ({ rows, loading, error, onRetry, empty, me, actionable }) => {
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const respond = async (r: ExchangeRequest, accept: boolean) => {
    setBusyId(r.id);
    if (accept) await circularityService.acceptExchangeRequest(r.id);
    else await circularityService.declineExchangeRequest(r.id);
    setBusyId(null);
    toast(accept ? `Accepted ${r.fromName}'s request. Arrange the handover in person.` : "Request declined.");
  };

  if (error) return <ErrorState onRetry={onRetry} />;
  if (loading) return <SkeletonTable rows={2} />;
  if (rows.length === 0) return <EmptyState title={empty} />;

  const columns: Column<ExchangeRequest>[] = [
    { id: "item", header: "Item", mobile: "primary", cell: (r) => <span className="font-medium">{r.material}</span> },
    {
      id: "who",
      header: "With",
      cell: (r) => (r.fromName === me ? `To ${r.toName}` : `From ${r.fromName}`),
    },
    { id: "date", header: "Date", cell: (r) => <span className="font-mono">{formatDate(r.createdAt)}</span> },
    {
      id: "status",
      header: "Status",
      mobile: "trailing",
      align: "right",
      cell: (r) =>
        actionable && r.status === "Pending" && r.fromName !== me ? (
          <span className="flex justify-end gap-2">
            <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => respond(r, false)}>
              Decline
            </Button>
            <Button size="sm" disabled={busyId === r.id} onClick={() => respond(r, true)}>
              Accept
            </Button>
          </span>
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
  ];

  return <DataTable label="Exchange requests" columns={columns} rows={rows} rowKey={(r) => r.id} />;
};

/* ------------------------------ My listings ------------------------------ */

const MyListingsTable: React.FC<{ listings: MaterialListing[]; loading: boolean }> = ({ listings, loading }) => {
  if (loading) return <SkeletonTable rows={3} />;
  if (listings.length === 0) {
    return (
      <EmptyState
        title="You haven't listed anything yet."
        action={
          <Button asChild size="sm">
            <Link to="/listings?new=1">List an item</Link>
          </Button>
        }
      />
    );
  }
  const columns: Column<MaterialListing>[] = [
    { id: "item", header: "Item", mobile: "primary", cell: (l) => <ItemCell category={l.category} title={l.title} /> },
    { id: "type", header: "Type", cell: (l) => EXCHANGE_TYPE_LABEL[l.exchangeType] },
    { id: "qty", header: "Quantity", cell: (l) => <span className="font-mono">{l.quantity}</span> },
    { id: "status", header: "Status", mobile: "trailing", cell: (l) => <StatusBadge status={l.status} /> },
  ];
  return (
    <>
      <DataTable
        label="My listings"
        columns={columns}
        rows={listings}
        rowKey={(l) => l.id}
        rowHref={(l) => (l.passportId ? `/passports/${l.passportId}` : "/listings")}
      />
      <p className="mt-4 text-sm">
        <Link to="/listings" className="font-medium text-brand-sage hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
          Manage listings
        </Link>
      </p>
    </>
  );
};
