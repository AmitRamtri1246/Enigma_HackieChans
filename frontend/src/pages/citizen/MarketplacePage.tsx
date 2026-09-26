import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, MapPin, PackagePlus, Search, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { CommunitySelector } from "@/components/common/CommunitySelector";
import { MaterialThumb } from "@/components/common/DataDisplay";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonCards } from "@/components/ui/skeleton";
import { useToast } from "@/components/common/ToastProvider";
import { useScan } from "@/contexts/ScanContext";
import { useAsync } from "@/lib/use-async";
import { calculateSellerFee, circularityService } from "@/lib/circularity-service";
import type { ItemCondition, MaterialCategory, MaterialListing, PickupPreference } from "@/lib/domain";
import { formatDate } from "@/lib/format";

const CATEGORIES: MaterialCategory[] = ["Furniture", "Electronics", "Sports equipment", "Household items", "Textile", "Metal", "Cardboard", "Plastic", "Glass", "Organic"];
const CONDITIONS: ItemCondition[] = ["New", "Good", "Fair", "For parts"];
const PICKUP_OPTIONS: PickupPreference[] = ["Buyer pickup", "Seller pickup", "Coordinate locally"];
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const MarketplacePage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState<MaterialListing | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();
  const scan = useScan();
  const active = useAsync(() => circularityService.getActiveCommunity());
  const listings = useAsync(() => circularityService.getCommunityListings(active.data?.id), [active.data?.id]);
  const purchases = useAsync(() => circularityService.getMarketplacePurchases(active.data?.id), [active.data?.id]);
  const me = useAsync(() => circularityService.getCurrentUser());

  useEffect(() => {
    if (params.get("new") === "1") {
      setCreateOpen(true);
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const saleListings = useMemo(() => (listings.data ?? [])
    .filter((listing) => listing.exchangeType === "sell")
    .filter((listing) => listing.status === "Listed" || listing.status === "Sold" || listing.status === "Community buy-in")
    .filter((listing) => category === "all" || listing.category === category)
    .filter((listing) => !query.trim() || `${listing.title} ${listing.material} ${listing.area}`.toLowerCase().includes(query.trim().toLowerCase())),
  [listings.data, category, query]);

  const availableCount = saleListings.filter((listing) => listing.status === "Listed").length;
  const completePurchase = async () => {
    if (!purchaseTarget) return;
    setPurchasing(true);
    try {
      await circularityService.completeSimulatedPurchase(purchaseTarget.id);
      toast("Simulated purchase complete. No payment was processed.");
      setPurchaseTarget(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not complete the demo purchase.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <AppShell active="marketplace" title="Community marketplace">
      <PageContainer size="wide">
        <PageHeader
          title="Good things find a next home."
          subtitle="Buy useful items from people in your community instead of sending them to waste. Demo purchases are simulated."
          action={<Button className="gap-2" onClick={() => setCreateOpen(true)}><PackagePlus className="h-4 w-4" />List an item</Button>}
        />

        <CommunitySelector />

        <section className="mt-6 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between" aria-label="Marketplace summary">
          <div>
            <p className="text-sm text-muted-foreground">Available in this community</p>
            <p className="mt-1 font-mono text-3xl font-medium tracking-tight text-foreground">{listings.isLoading ? "—" : availableCount}<span className="ml-2 font-sans text-base font-normal text-muted-foreground">items for sale</span></p>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Every completed handoff keeps a useful item in circulation. Sellers see the 2% demo fee before checkout; no real money changes hands.</p>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative">
            <span className="sr-only">Search community listings</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this community" className="pl-9" />
          </label>
          <Select aria-label="Filter by item category" value={category} onChange={(event) => setCategory(event.target.value)} options={[{ value: "all", label: "All categories" }, ...CATEGORIES.map((item) => ({ value: item, label: item }))]} />
        </div>

        {listings.error ? <div className="mt-6"><ErrorState onRetry={listings.reload} /></div> : listings.isLoading ? <div className="mt-6"><SkeletonCards count={6} /></div> : saleListings.length === 0 ? (
          <div className="mt-6"><EmptyState icon={ShoppingBag} title="No listings match yet." description="Try another search or category, or list something useful for your neighbours." action={<Button size="sm" onClick={() => setCreateOpen(true)}>List an item</Button>} /></div>
        ) : (
          <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {saleListings.map((listing) => <li key={listing.id}><MarketplaceCard listing={listing} currentUser={me.data?.fullName ?? ""} onBuy={() => setPurchaseTarget(listing)} /></li>)}
          </ul>
        )}

        {(purchases.data?.length ?? 0) > 0 && (
          <section className="mt-12 border-t border-border pt-6" aria-labelledby="recent-purchases">
            <h2 id="recent-purchases" className="text-lg font-semibold text-foreground">Recent circular handoffs</h2>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {purchases.data?.slice(0, 4).map((purchase) => (
                <li key={purchase.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{purchase.listingId === purchase.breakdown.listingId ? (listings.data?.find((item) => item.id === purchase.listingId)?.title ?? "Community item") : "Community item"}</span>
                  <span className="text-xs text-muted-foreground">{purchase.communityBuyIn ? "Community buy-in" : `Bought by ${purchase.buyerName}`} · {formatDate(purchase.purchasedAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>

      {createOpen && <MarketplaceListingSheet communityArea={active.data?.area ?? "Riverside"} onClose={() => setCreateOpen(false)} onCreated={(title) => { setCreateOpen(false); scan.clear(); toast(`${title} listed for your community.`); }} />}

      <ConfirmationDialog
        open={purchaseTarget !== null}
        title="Review simulated purchase"
        description={purchaseTarget ? <PurchaseBreakdown listing={purchaseTarget} /> : undefined}
        confirmLabel="Complete demo purchase"
        cancelLabel="Go back"
        loading={purchasing}
        onConfirm={() => void completePurchase()}
        onCancel={() => !purchasing && setPurchaseTarget(null)}
      />
    </AppShell>
  );
};

const MarketplaceCard: React.FC<{ listing: MaterialListing; currentUser: string; onBuy: () => void }> = ({ listing, currentUser, onBuy }) => {
  const canBuy = listing.status === "Listed" && listing.owner !== currentUser;
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#EEF1EC]">
        <MaterialThumb category={listing.category} size="lg" imageUrl={listing.imageUrl} alt={listing.imageAlt ?? listing.title} className="aspect-[4/3] w-full rounded-none transition-transform duration-300 group-hover:scale-[1.025]" />
        <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 font-mono text-sm font-medium text-foreground shadow-sm">{money(listing.priceAmount ?? 0)}</span>
        {listing.status !== "Listed" && <StatusBadge status={listing.status} className="absolute right-3 top-3" />}
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-foreground">{listing.title}</h3>
          <span className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">{listing.condition}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{listing.description}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{listing.area} · {listing.owner}</p>
        <p className="mt-1 text-xs text-muted-foreground">{listing.pickupPreference ?? "Coordinate locally"}</p>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-brand-forest"><BadgeCheck className="h-3.5 w-3.5" />Community listing</span>
          {canBuy ? <Button size="sm" onClick={onBuy}>Review purchase <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button> : <span className="text-xs text-muted-foreground">{listing.status === "Listed" ? "Your listing" : "Handoff recorded"}</span>}
        </div>
      </div>
    </article>
  );
};

const PurchaseBreakdown: React.FC<{ listing: MaterialListing }> = ({ listing }) => {
  const fee = calculateSellerFee(listing.priceAmount ?? 0);
  return (
    <div className="space-y-4 text-sm">
      <p><span className="font-medium text-foreground">{listing.title}</span><br />The buyer’s demo total is {money(fee.buyerPays)}. No payment is processed.</p>
      <dl className="divide-y divide-border rounded-lg border border-border bg-background px-4">
        <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Listed price / buyer pays</dt><dd className="font-mono text-foreground">{money(fee.buyerPays)}</dd></div>
        <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Seller fee (2%)</dt><dd className="font-mono text-foreground">−{money(fee.sellerFee)}</dd></div>
        <div className="flex justify-between gap-4 py-3 font-medium"><dt className="text-foreground">Illustrative seller payout</dt><dd className="font-mono text-foreground">{money(fee.sellerPayout)}</dd></div>
      </dl>
      <p className="text-xs leading-5 text-muted-foreground">The seller fee is shown for the prototype only. This is a simulated checkout, not a transaction.</p>
    </div>
  );
};

const MarketplaceListingSheet: React.FC<{ communityArea: string; onClose: () => void; onCreated: (title: string) => void }> = ({ communityArea, onClose, onCreated }) => {
  const [params] = useSearchParams();
  const { pending } = useScan();
  const analysis = pending?.analysis;
  const [title, setTitle] = useState(analysis?.materialName ?? params.get("title") ?? "");
  const [material, setMaterial] = useState(analysis?.subtype ?? params.get("material") ?? "");
  const [category, setCategory] = useState<MaterialCategory>(analysis?.category ?? ((params.get("category") as MaterialCategory) || "Furniture"));
  const [description, setDescription] = useState(analysis?.description ?? params.get("description") ?? "");
  const [condition, setCondition] = useState<ItemCondition | "">(analysis?.condition ?? ((params.get("condition") as ItemCondition) || ""));
  const [weight, setWeight] = useState(analysis ? String(analysis.estimatedWeightKg) : params.get("weight") ?? "");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [pickup, setPickup] = useState<PickupPreference>("Buyer pickup");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(price);
    const weightKg = Number(weight);
    if (!title.trim() || !material.trim() || !description.trim() || !condition || !Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(amount) || amount <= 0) {
      setError("Add item details, choose a condition, enter a weight above 0 kg, and set a sale price above ₹0.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await circularityService.createMarketplaceListing({ title: title.trim(), material: material.trim(), category, description: description.trim(), condition: condition as ItemCondition, weight: `${weightKg} kg`, area: area.trim() || communityArea, priceAmount: amount, pickupPreference: pickup, imageUrl: pending?.imageDataUrl });
      onCreated(title.trim());
    } catch {
      setError("We couldn't publish this listing. Check the details and try again.");
      setSaving(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title="List for sale" description="Offer a useful item to members of your selected community." busy={saving} footer={<div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancel</Button><Button type="submit" form="market-listing-form" disabled={saving} className="flex-1">{saving ? "Publishing…" : "Publish listing"}</Button></div>}>
      <form id="market-listing-form" onSubmit={(event) => void submit(event)} className="space-y-4">
        <Field label="Item title"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Three-seat sofa" required /></Field>
        <Field label="What is it made of / what is it?"><Input value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="e.g. Solid wood furniture" required /></Field>
        <Field label="Category"><Select value={category} onChange={(event) => setCategory(event.target.value as MaterialCategory)} options={CATEGORIES.map((item) => ({ value: item, label: item }))} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Condition *"><Select required value={condition} onChange={(event) => setCondition(event.target.value as ItemCondition | "")} options={[{ value: "", label: "Choose condition" }, ...CONDITIONS.map((item) => ({ value: item, label: item }))]} /></Field><Field label="Approx. weight (kg) *"><Input type="number" inputMode="decimal" min="0.01" step="0.01" required value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="e.g. 2.5" /></Field></div>
        <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Share useful condition or pickup details." rows={3} required /></Field>
        <Field label="Sale price (₹)"><Input type="number" inputMode="decimal" min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="1000" required /></Field>
        <Field label="Approximate area"><Input value={area || communityArea} onChange={(event) => setArea(event.target.value)} placeholder="Building or neighbourhood" /></Field>
        <Field label="Pickup preference"><Select value={pickup} onChange={(event) => setPickup(event.target.value as PickupPreference)} options={PICKUP_OPTIONS.map((item) => ({ value: item, label: item }))} /></Field>
        <p className="rounded-lg bg-brand-soft/60 p-3 text-xs leading-5 text-muted-foreground">Demo fee disclosure: if sold for ₹1,000, the 2% seller fee is ₹20 and the illustrative seller payout is ₹980. No real payment is taken.</p>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      </form>
    </Sheet>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block space-y-1.5 text-sm font-medium text-foreground">{label}{children}</label>;
