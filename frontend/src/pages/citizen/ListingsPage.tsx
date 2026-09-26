import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { ItemCell } from "@/components/common/DataDisplay";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { ChoiceGroup, FormField } from "@/components/common/FormField";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { EXCHANGE_TYPE_LABEL, formatDate } from "@/lib/format";
import type { ExchangeType, ItemCondition, MaterialCategory, MaterialListing } from "@/lib/domain";
import { FileText, Loader2, MoreHorizontal, Package, Pencil, Plus, XCircle } from "lucide-react";

const CATEGORIES: MaterialCategory[] = ["Plastic", "Cardboard", "Metal", "Electronics", "Furniture", "Textile", "Glass", "Organic"];
const CONDITIONS: ItemCondition[] = ["New", "Good", "Fair", "For parts"];
const TYPES: { value: ExchangeType; label: string }[] = [
  { value: "exchange", label: "Exchange" },
  { value: "donation", label: "Donation" },
  { value: "pickup", label: "Pickup" },
];

const closed = (l: MaterialListing) => l.status === "Completed" || l.status === "Cancelled";

/** My Listings — job: keep track of what I've put out and manage it. */
export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const listings = useAsync(() => circularityService.getListings());

  const [sheet, setSheet] = useState<{ open: boolean; editing?: MaterialListing }>({ open: false });
  const [cancelTarget, setCancelTarget] = useState<MaterialListing | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Deep link: /listings?new=1 opens the create sheet.
  useEffect(() => {
    if (params.get("new") === "1") {
      setSheet({ open: true });
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const doCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    await circularityService.updateListing(cancelTarget.id, { status: "Cancelled" });
    setCancelling(false);
    setCancelTarget(null);
    toast("Listing cancelled.");
  };

  const columns: Column<MaterialListing>[] = [
    {
      id: "item",
      header: "Item",
      mobile: "primary",
      cell: (l) => <ItemCell category={l.category} title={l.title} sub={l.material} />,
    },
    { id: "qty", header: "Quantity", cell: (l) => <span className="font-mono">{l.quantity}</span> },
    { id: "type", header: "Type", mobile: "hidden", cell: (l) => <span className="text-muted-foreground">{EXCHANGE_TYPE_LABEL[l.exchangeType]}</span> },
    {
      id: "match",
      header: "Match",
      align: "right",
      cell: (l) => <span className="font-mono text-muted-foreground">{l.matchPercent != null ? `${l.matchPercent}%` : "—"}</span>,
    },
    { id: "status", header: "Status", mobile: "trailing", cell: (l) => <StatusBadge status={l.status} /> },
    {
      id: "date",
      header: "Listed",
      mobile: "hidden",
      cell: (l) => <span className="font-mono text-muted-foreground">{formatDate(l.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      hideHeader: true,
      mobile: "trailing",
      className: "w-12",
      align: "right",
      cell: (l) => (
        <DropdownMenu
          label={`Actions for ${l.title}`}
          trigger={({ ref, ...props }) => (
            <button
              ref={ref}
              type="button"
              {...props}
              aria-label={`Actions for ${l.title}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        >
          {l.passportId && (
            <DropdownMenuItem icon={FileText} onSelect={() => navigate(`/passports/${l.passportId}`)}>
              View passport
            </DropdownMenuItem>
          )}
          {!closed(l) && (
            <>
              <DropdownMenuItem icon={Pencil} onSelect={() => setSheet({ open: true, editing: l })}>
                Edit listing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={XCircle} destructive onSelect={() => setCancelTarget(l)}>
                Cancel listing
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>
      ),
    },
  ];

  const rows = listings.data ?? [];

  return (
    <AppShell active="listings">
      <PageContainer>
        <PageHeader
          title="My Listings"
          subtitle="Items you've published for exchange, donation or pickup."
          action={
            <Button className="gap-2" onClick={() => setSheet({ open: true })}>
              <Plus className="h-4 w-4" />
              New listing
            </Button>
          }
        />

        {listings.error ? (
          <ErrorState onRetry={listings.reload} />
        ) : listings.isLoading ? (
          <SkeletonTable rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet."
            description="Publish something you no longer need to give it a second life."
            action={<Button size="sm" onClick={() => setSheet({ open: true })}>New listing</Button>}
          />
        ) : (
          <DataTable
            label="My listings"
            columns={columns}
            rows={rows}
            rowKey={(l) => l.id}
            rowHref={(l) => (l.passportId ? `/passports/${l.passportId}` : undefined)}
          />
        )}
      </PageContainer>

      {/* Mounted only while open so each open starts from fresh form state. */}
      {sheet.open && (
        <ListingSheet
          open
          editing={sheet.editing}
          onClose={() => setSheet({ open: false })}
          onSaved={(created) => {
            setSheet({ open: false });
            toast(created ? "Listing published. Matching organizations can now see it." : "Listing updated.");
          }}
        />
      )}

      <ConfirmationDialog
        open={cancelTarget !== null}
        title="Cancel this listing?"
        description={cancelTarget ? `"${cancelTarget.title}" will be withdrawn from the exchange.` : undefined}
        confirmLabel="Cancel listing"
        cancelLabel="Keep listing"
        destructive
        loading={cancelling}
        onConfirm={doCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </AppShell>
  );
};

/* --------------------------- Create / edit sheet --------------------------- */

interface Errors {
  title?: string;
  material?: string;
  weight?: string;
}

const ListingSheet: React.FC<{
  open: boolean;
  editing?: MaterialListing;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}> = ({ open, editing, onClose, onSaved }) => {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [material, setMaterial] = useState(editing?.material ?? "");
  const [category, setCategory] = useState<MaterialCategory>(editing?.category ?? "Furniture");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [condition, setCondition] = useState<ItemCondition>(editing?.condition ?? "Good");
  const [weight, setWeight] = useState(editing?.weight ?? "");
  const [area, setArea] = useState(editing?.area ?? "Riverside");
  const [exchangeType, setExchangeType] = useState<ExchangeType>(editing?.exchangeType ?? "exchange");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = "Add a short title.";
    if (!material.trim()) next.material = "Say what the item is made of or what it is.";
    if (!/\d/.test(weight)) next.weight = "Add an approximate weight, e.g. 12 kg.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const values = {
      title: title.trim(),
      material: material.trim(),
      category,
      description: description.trim(),
      condition,
      weight: weight.trim(),
      exchangeType,
      area: area.trim() || "Riverside",
    };
    if (editing) await circularityService.updateListing(editing.id, { ...values, quantity: values.weight });
    else await circularityService.createListing(values);
    setSaving(false);
    onSaved(!editing);
  };

  const clear = (k: keyof Errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      busy={saving}
      title={editing ? "Edit listing" : "New listing"}
      description={editing ? undefined : "Listings are shown to neighbours and matched to organizations."}
      footer={
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" form="listing-form" disabled={saving} className="flex-1 gap-2">
            {saving && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
            {editing ? "Save changes" : "Publish listing"}
          </Button>
        </div>
      }
    >
      <form id="listing-form" onSubmit={submit} noValidate className="space-y-5">
        <FormField id="l-title" label="Title" error={errors.title}>
          <Input
            id="l-title"
            data-autofocus
            value={title}
            onChange={(e) => { setTitle(e.target.value); clear("title"); }}
            placeholder="e.g. Ergonomic office chair"
            error={Boolean(errors.title)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "l-title-error" : undefined}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="l-material" label="Material" error={errors.material}>
            <Input
              id="l-material"
              value={material}
              onChange={(e) => { setMaterial(e.target.value); clear("material"); }}
              placeholder="e.g. Office chair"
              error={Boolean(errors.material)}
              aria-invalid={Boolean(errors.material)}
              aria-describedby={errors.material ? "l-material-error" : undefined}
            />
          </FormField>
          <FormField id="l-category" label="Category">
            <Select
              id="l-category"
              className="h-10"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
        </div>

        <FormField id="l-desc" label="Description" optional>
          <Textarea
            id="l-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition details, dimensions, anything a new owner should know."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="l-condition" label="Condition">
            <Select
              id="l-condition"
              className="h-10"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              options={CONDITIONS.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
          <FormField id="l-weight" label="Approx. weight" error={errors.weight}>
            <Input
              id="l-weight"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); clear("weight"); }}
              placeholder="12 kg"
              className="font-mono"
              error={Boolean(errors.weight)}
              aria-invalid={Boolean(errors.weight)}
              aria-describedby={errors.weight ? "l-weight-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="l-area" label="Area" hint="A neighbourhood, never your street address.">
          <Input id="l-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Riverside" aria-describedby="l-area-hint" />
        </FormField>

        <ChoiceGroup label="Hand over by" value={exchangeType} options={TYPES} onChange={setExchangeType} />
      </form>
    </Sheet>
  );
};
