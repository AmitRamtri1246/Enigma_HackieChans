import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge, toneFor } from "@/components/common/StatusBadge";
import { SidePanel } from "@/components/common/SidePanel";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { ExchangeType, ItemCondition, MaterialCategory, MaterialListing } from "@/lib/domain";
import { Plus, Package, Loader2, FileText } from "lucide-react";

const CATEGORIES: MaterialCategory[] = ["Plastic", "Cardboard", "Metal", "Electronics", "Furniture", "Textile", "Glass", "Organic"];
const CONDITIONS: ItemCondition[] = ["New", "Good", "Fair", "For parts"];
const EXCHANGE_TYPES: { value: ExchangeType; label: string }[] = [
  { value: "exchange", label: "Exchange" },
  { value: "donation", label: "Donation" },
  { value: "pickup", label: "Pickup" },
];

export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const listings = useAsync(() => circularityService.getListings());

  const [creating, setCreating] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MaterialListing | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const doCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    await circularityService.updateListing(cancelTarget.id, { status: "Cancelled" });
    setCancelling(false);
    setCancelTarget(null);
    toast("Listing cancelled.");
  };

  return (
    <AppShell active="listings" areaLabel="Citizen · Listings">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageHeader
          title="My Listings"
          subtitle="Materials you've published for reuse, exchange or collection."
          action={
            <Button className="gap-1.5" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              New listing
            </Button>
          }
        />

        {listings.error ? (
          <ErrorState onRetry={listings.reload} />
        ) : listings.isLoading ? (
          <SkeletonList rows={4} />
        ) : (listings.data ?? []).length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet."
            description="Publish something you no longer need to give it a second life."
            action={<Button className="gap-1.5" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />New listing</Button>}
          />
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-card">
            {(listings.data ?? []).map((l, i) => (
              <li key={l.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-5", i !== (listings.data ?? []).length - 1 && "border-b border-border/70")}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.material} · <span className="font-mono">{l.quantity}</span> · {formatDate(l.createdAt)}
                  </p>
                </div>
                {l.matchPercent != null && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-medium text-brand-forest">{l.matchPercent}% match</span>
                )}
                <StatusBadge label={l.status} tone={toneFor(l.status)} />
                <div className="ml-auto flex items-center gap-1 sm:ml-0">
                  {l.passportId && (
                    <button
                      type="button"
                      onClick={() => navigate(`/passports/${l.passportId}`)}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-brand-sage transition-colors hover:text-brand-forest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Passport
                    </button>
                  )}
                  {l.status !== "Completed" && l.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(l)}
                      className="rounded px-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {creating && (
        <CreateListingPanel
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            toast("Listing published. It's now visible to organizations.");
          }}
        />
      )}

      <ConfirmationDialog
        open={cancelTarget !== null}
        title="Cancel this listing?"
        description={cancelTarget ? `"${cancelTarget.title}" will be withdrawn from the exchange.` : ""}
        confirmLabel="Cancel listing"
        cancelLabel="Keep it"
        destructive
        loading={cancelling}
        onConfirm={doCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </AppShell>
  );
};

/* --------------------------- Create listing form --------------------------- */

const CreateListingPanel: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState<MaterialCategory>("Furniture");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<ItemCondition>("Good");
  const [weight, setWeight] = useState("");
  const [area, setArea] = useState("Riverside");
  const [exchangeType, setExchangeType] = useState<ExchangeType>("exchange");
  const [errors, setErrors] = useState<{ title?: string; material?: string; weight?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Add a short title.";
    if (!material.trim()) next.material = "Material is required.";
    if (!weight.trim()) next.weight = "Add an approximate weight.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    await circularityService.createListing({
      title: title.trim(),
      material: material.trim(),
      category,
      description: description.trim(),
      condition,
      weight: weight.trim(),
      exchangeType,
      area: area.trim() || "Riverside",
    });
    setSubmitting(false);
    onCreated();
  };

  return (
    <SidePanel
      title="New listing"
      onClose={onClose}
      busy={submitting}
      footer={
        <Button type="submit" form="create-listing-form" className="w-full gap-1.5" disabled={submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 motion-safe:animate-spin" />Publishing…</> : <><Plus className="h-4 w-4" />Publish listing</>}
        </Button>
      }
    >
      <form id="create-listing-form" onSubmit={submit} className="space-y-4" noValidate>
        <TextField id="l-title" label="Title" value={title} onChange={(v) => { setTitle(v); setErrors((p) => ({ ...p, title: undefined })); }} placeholder="e.g. Office chair" error={errors.title} />
        <TextField id="l-material" label="Material" value={material} onChange={(v) => { setMaterial(v); setErrors((p) => ({ ...p, material: undefined })); }} placeholder="e.g. Office chair" error={errors.material} />

        <SelectField id="l-category" label="Category" value={category} onChange={(v) => setCategory(v as MaterialCategory)} options={CATEGORIES} />

        <div className="space-y-1.5">
          <Label htmlFor="l-desc" className="text-xs font-medium text-foreground">Description</Label>
          <textarea
            id="l-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Condition details, quantity, anything useful."
            className="flex w-full rounded-[10px] border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>

        <SelectField id="l-condition" label="Condition" value={condition} onChange={(v) => setCondition(v as ItemCondition)} options={CONDITIONS} />
        <TextField id="l-weight" label="Approximate weight" value={weight} onChange={(v) => { setWeight(v); setErrors((p) => ({ ...p, weight: undefined })); }} placeholder="e.g. 12 kg" mono error={errors.weight} />
        <TextField id="l-area" label="Area" value={area} onChange={setArea} placeholder="e.g. Riverside" />

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-foreground">How do you want to hand it over?</legend>
          <div className="grid grid-cols-3 gap-2">
            {EXCHANGE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={exchangeType === t.value}
                onClick={() => setExchangeType(t.value)}
                className={cn(
                  "rounded-[10px] border px-3 py-2.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  exchangeType === t.value ? "border-brand-forest bg-brand-soft/60 font-medium text-brand-forest" : "border-border text-foreground hover:border-brand-sage/50 hover:bg-accent/40"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
      </form>
    </SidePanel>
  );
};

const TextField: React.FC<{
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; error?: string;
}> = ({ id, label, value, onChange, placeholder, mono, error }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-medium text-foreground">{label}</Label>
    <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} error={Boolean(error)} className={mono ? "font-mono" : undefined} />
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const SelectField: React.FC<{ id: string; label: string; value: string; onChange: (v: string) => void; options: readonly string[] }> = ({ id, label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-medium text-foreground">{label}</Label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-[10px] border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
