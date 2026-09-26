import React, { useMemo, useState } from "react";
import { ArrowRight, Gavel, Leaf, ShoppingBag, Truck } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { CommunitySelector } from "@/components/common/CommunitySelector";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { MaterialThumb } from "@/components/common/DataDisplay";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { SkeletonCards } from "@/components/ui/skeleton";
import { useToast } from "@/components/common/ToastProvider";
import { calculateSellerFee, circularityService } from "@/lib/circularity-service";
import { formatDate } from "@/lib/format";
import { useAsync } from "@/lib/use-async";
import type { MaterialListing, UnsoldReview, UnsoldReviewOutcome } from "@/lib/domain";

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const CommunityAdminPage: React.FC = () => {
  const active = useAsync(() => circularityService.getActiveCommunity());
  const reviews = useAsync(() => circularityService.getUnsoldReviews(active.data?.id), [active.data?.id]);
  const listings = useAsync(() => circularityService.getCommunityListings(active.data?.id), [active.data?.id]);
  const [decision, setDecision] = useState<{ review: UnsoldReview; listing: MaterialListing; outcome: UnsoldReviewOutcome } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const rows = useMemo(() => (reviews.data ?? []).flatMap((review) => {
    const listing = listings.data?.find((item) => item.id === review.listingId);
    return listing ? [{ review, listing }] : [];
  }), [reviews.data, listings.data]);

  const decide = async () => {
    if (!decision) return;
    setSaving(true);
    try {
      await circularityService.resolveUnsoldReview(decision.review.id, decision.outcome);
      const message = decision.outcome === "community_buy_in" ? "Community buy-in recorded." : decision.outcome === "auction_queue" ? "Item added to the auction queue (no bids in this demo)." : "Recycler handoff recorded.";
      toast(message);
      setDecision(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save this review decision.");
    } finally {
      setSaving(false);
    }
  };

  const confirmation = decision ? decision.outcome === "community_buy_in"
    ? `Record a simulated community purchase for ${money(decision.listing.priceAmount ?? 0)}? The 2% seller fee is ${money(calculateSellerFee(decision.listing.priceAmount ?? 0).sellerFee)}; estimated seller payout is ${money(calculateSellerFee(decision.listing.priceAmount ?? 0).sellerPayout)}. No money is processed.`
    : decision.outcome === "auction_queue"
      ? "Queue this item for a future community auction. This prototype records the destination only; it has no bids or payment."
      : "Record a handoff to a reuse or recycling organization. This demo updates the item passport and community activity." : undefined;

  return (
    <AppShell active="review-queue" title="Community Admin">
      <PageContainer size="wide">
        <PageHeader title="Give unsold items a next step." subtitle="Review listings that have been available for seven days and choose a community outcome. Decisions are recorded in the demo timeline." />
        <CommunitySelector />

        <section className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div><p className="text-sm text-muted-foreground">Awaiting community decision</p><p className="mt-1 font-mono text-3xl font-medium text-foreground">{reviews.isLoading ? "—" : rows.length}<span className="ml-2 font-sans text-base font-normal text-muted-foreground">items</span></p></div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">After seven days without a sale, a listing is routed here for community buy-in, an auction queue, or a recycler handoff.</p>
        </section>

        {reviews.error || listings.error ? <div className="mt-6"><ErrorState onRetry={() => { reviews.reload(); listings.reload(); }} /></div> : reviews.isLoading || listings.isLoading ? <div className="mt-6"><SkeletonCards count={3} /></div> : rows.length === 0 ? (
          <div className="mt-6"><EmptyState icon={Leaf} title="The review queue is clear." description="Unsold listings will appear here after seven days in the marketplace." /></div>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map(({ review, listing }) => <li key={review.id}><ReviewCard review={review} listing={listing} onChoose={(outcome) => setDecision({ review, listing, outcome })} /></li>)}
          </ul>
        )}
      </PageContainer>
      <ConfirmationDialog open={decision !== null} title={decision ? outcomeTitle(decision.outcome) : "Review item"} description={confirmation} confirmLabel="Record decision" cancelLabel="Go back" loading={saving} onConfirm={() => void decide()} onCancel={() => !saving && setDecision(null)} />
    </AppShell>
  );
};

const outcomeTitle = (outcome: UnsoldReviewOutcome) => outcome === "community_buy_in" ? "Community buy-in" : outcome === "auction_queue" ? "Queue for auction" : "Send to recycler";

const ReviewCard: React.FC<{ review: UnsoldReview; listing: MaterialListing; onChoose: (outcome: UnsoldReviewOutcome) => void }> = ({ review, listing, onChoose }) => {
  const ageDays = Math.max(7, Math.floor((Date.now() - Date.parse(listing.createdAt)) / 86_400_000));
  return (
    <article className="grid gap-5 rounded-xl border border-border bg-card p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
      <MaterialThumb category={listing.category} size="lg" imageUrl={listing.imageUrl} alt={listing.imageAlt ?? listing.title} className="aspect-[4/3] w-full" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Listed {ageDays} days · entered review {formatDate(review.enteredReviewAt)}</p><h2 className="mt-1 text-lg font-semibold text-foreground">{listing.title}</h2></div><StatusBadge status="Needs community review" /></div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{listing.description}</p>
        <p className="mt-2 text-sm"><span className="font-medium text-foreground">{money(listing.priceAmount ?? 0)}</span><span className="text-muted-foreground"> · {listing.condition} · {listing.area} · {listing.owner}</span></p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onChoose("community_buy_in")}><ShoppingBag className="mr-1.5 h-4 w-4" />Community buy-in</Button>
          <Button size="sm" variant="outline" onClick={() => onChoose("auction_queue")}><Gavel className="mr-1.5 h-4 w-4" />Queue auction</Button>
          <Button size="sm" variant="outline" onClick={() => onChoose("recycler_handoff")}><Truck className="mr-1.5 h-4 w-4" />Send to recycler</Button>
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">Choose an outcome to record it in the item passport <ArrowRight className="h-3 w-3" /></p>
      </div>
    </article>
  );
};
