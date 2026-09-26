import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { FormField } from "@/components/common/FormField";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { SkeletonTable } from "@/components/ui/skeleton";
import { TabsList, TabsPanel } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import type { MaterialCategory, OrganizationNeed } from "@/lib/domain";
import { CheckCircle2, Inbox, Loader2, MoreHorizontal, Pencil, Plus } from "lucide-react";

const CATEGORIES: MaterialCategory[] = ["Plastic", "Cardboard", "Metal", "Electronics", "Furniture", "Textile", "Glass", "Organic"];
type Filter = "open" | "closed";

/** Material Needs — job: keep the list of wanted materials accurate. */
export const OrgNeedsPage: React.FC = () => {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const needs = useAsync(() => circularityService.getOrganizationNeeds());
  const [filter, setFilter] = useState<Filter>("open");
  const [sheet, setSheet] = useState<{ open: boolean; editing?: OrganizationNeed }>({ open: false });
  const [closing, setClosing] = useState<OrganizationNeed | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("new") === "1") {
      setSheet({ open: true });
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const all = needs.data ?? [];
  const open = all.filter((n) => n.status !== "Fulfilled");
  const closed = all.filter((n) => n.status === "Fulfilled");
  const rows = filter === "open" ? open : closed;

  const closeNeed = async () => {
    if (!closing) return;
    setBusy(true);
    await circularityService.updateOrganizationNeed(closing.id, { status: "Fulfilled" });
    setBusy(false);
    toast(`Closed "${closing.material}". It no longer attracts matches.`);
    setClosing(null);
  };

  const columns: Column<OrganizationNeed>[] = [
    {
      id: "material",
      header: "Material",
      mobile: "primary",
      cell: (n) => (
        <span className="block">
          <span className="block font-medium">{n.material}</span>
          {n.notes && <span className="block max-w-xs truncate text-[13px] font-normal text-muted-foreground">{n.notes}</span>}
        </span>
      ),
    },
    { id: "qty", header: "Quantity", cell: (n) => <span className="font-mono">{n.quantity}</span> },
    { id: "area", header: "Area", cell: (n) => <span className="text-muted-foreground">{n.area}</span> },
    { id: "by", header: "Needed by", cell: (n) => <span className="font-mono">{n.neededBy}</span> },
    { id: "status", header: "Status", mobile: "hidden", cell: (n) => <StatusBadge status={n.status} /> },
    {
      id: "actions",
      header: "Actions",
      hideHeader: true,
      mobile: "trailing",
      align: "right",
      className: "w-12",
      cell: (n) =>
        n.status === "Fulfilled" ? null : (
          <DropdownMenu
            label={`Actions for ${n.material}`}
            trigger={({ ref, ...props }) => (
              <button
                ref={ref}
                type="button"
                {...props}
                aria-label={`Actions for ${n.material}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          >
            <DropdownMenuItem icon={Pencil} onSelect={() => setSheet({ open: true, editing: n })}>
              Edit need
            </DropdownMenuItem>
            <DropdownMenuItem icon={CheckCircle2} onSelect={() => setClosing(n)}>
              Close need
            </DropdownMenuItem>
          </DropdownMenu>
        ),
    },
  ];

  return (
    <AppShell active="needs">
      <PageContainer>
        <PageHeader
          title="Material Needs"
          subtitle="What EcoPack is looking to receive. Listings are matched against these."
          action={
            <Button className="gap-2" onClick={() => setSheet({ open: true })}>
              <Plus className="h-4 w-4" />
              Add need
            </Button>
          }
        />

        <TabsList<Filter>
          idBase="needs"
          label="Need status"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: "open", label: "Open", count: open.length },
            { value: "closed", label: "Closed", count: closed.length },
          ]}
        />
        <TabsPanel idBase="needs" value={filter} className="pt-6">
          {needs.error ? (
            <ErrorState onRetry={needs.reload} />
          ) : needs.isLoading ? (
            <SkeletonTable rows={3} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={filter === "open" ? "No open needs." : "No closed needs yet."}
              description={filter === "open" ? "Add a need to start receiving matches." : undefined}
              action={filter === "open" ? <Button size="sm" onClick={() => setSheet({ open: true })}>Add need</Button> : undefined}
            />
          ) : (
            <DataTable label="Material needs" columns={columns} rows={rows} rowKey={(n) => n.id} />
          )}
        </TabsPanel>
      </PageContainer>

      {sheet.open && (
        <NeedSheet
          editing={sheet.editing}
          onClose={() => setSheet({ open: false })}
          onSaved={(created) => {
            setSheet({ open: false });
            toast(created ? "Need added. Matching listings will appear in Matches." : "Need updated.");
          }}
        />
      )}

      <ConfirmationDialog
        open={closing !== null}
        title="Close this need?"
        description={closing ? `"${closing.material}" will stop receiving new matches. Existing matches are kept.` : undefined}
        confirmLabel="Close need"
        loading={busy}
        onConfirm={closeNeed}
        onCancel={() => setClosing(null)}
      />
    </AppShell>
  );
};

/* ------------------------------ Need sheet ------------------------------ */

const NeedSheet: React.FC<{ editing?: OrganizationNeed; onClose: () => void; onSaved: (created: boolean) => void }> = ({
  editing,
  onClose,
  onSaved,
}) => {
  const [material, setMaterial] = useState(editing?.material ?? "");
  const [category, setCategory] = useState<MaterialCategory>(editing?.category ?? "Plastic");
  const [quantity, setQuantity] = useState(editing?.quantity ?? "");
  const [area, setArea] = useState(editing?.area ?? "Riverside");
  const [neededBy, setNeededBy] = useState(editing?.neededBy ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [errors, setErrors] = useState<{ material?: string; quantity?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!material.trim()) next.material = "Name the material you need.";
    if (!/\d/.test(quantity)) next.quantity = "Add a quantity range, e.g. 20–50 kg.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const values = {
      material: material.trim(),
      category,
      quantity: quantity.trim(),
      area: area.trim() || "Riverside",
      neededBy: neededBy.trim() || "—",
      notes: notes.trim() || undefined,
    };
    if (editing) await circularityService.updateOrganizationNeed(editing.id, values);
    else await circularityService.createOrganizationNeed(values);
    setSaving(false);
    onSaved(!editing);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      busy={saving}
      title={editing ? "Edit need" : "Add material need"}
      description={editing ? undefined : "Residents' listings in this category will be matched to it."}
      footer={
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="need-form" className="flex-1 gap-2" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
            {editing ? "Save changes" : "Add need"}
          </Button>
        </div>
      }
    >
      <form id="need-form" onSubmit={submit} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <FormField id="n-material" label="Material" error={errors.material}>
            <Input
              id="n-material"
              data-autofocus
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setErrors((p) => ({ ...p, material: undefined })); }}
              placeholder="PET plastic"
              error={Boolean(errors.material)}
              aria-invalid={Boolean(errors.material)}
              aria-describedby={errors.material ? "n-material-error" : undefined}
            />
          </FormField>
          <FormField id="n-category" label="Category">
            <Select
              id="n-category"
              className="h-10"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
        </div>
        <FormField id="n-qty" label="Quantity range" error={errors.quantity}>
          <Input
            id="n-qty"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: undefined })); }}
            placeholder="20–50 kg"
            className="font-mono"
            error={Boolean(errors.quantity)}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? "n-qty-error" : undefined}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="n-area" label="Area">
            <Input id="n-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Riverside" />
          </FormField>
          <FormField id="n-by" label="Needed by" optional>
            <Input id="n-by" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} placeholder="30 Sep" className="font-mono" />
          </FormField>
        </div>
        <FormField id="n-notes" label="Notes" optional>
          <Textarea id="n-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Condition requirements, drop-off hours…" />
        </FormField>
      </form>
    </Sheet>
  );
};
