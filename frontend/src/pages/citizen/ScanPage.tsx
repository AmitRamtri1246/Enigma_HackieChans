import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Info } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { CameraScanner } from "@/components/scanner/CameraScanner";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { useToast } from "@/components/common/ToastProvider";
import { useScan } from "@/contexts/ScanContext";
import { apiRequest } from "@/lib/api";
import { circularityService } from "@/lib/circularity-service";
import { fileToDataUrl, makeListingImageDataUrl } from "@/lib/scan-image";
import { useAsync } from "@/lib/use-async";
import type { MaterialAnalysis, ScanAction } from "@/lib/domain";

interface SavedScan { id: string }

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPending } = useScan();
  const community = useAsync(() => circularityService.getActiveCommunity());
  const communityListings = useAsync(
    () => community.data ? circularityService.getCommunityListings(community.data.id) : Promise.resolve([]),
    [community.data?.id],
  );
  const organizationNeeds = useAsync(() => circularityService.getOrganizationNeeds());
  const localContext = [
    `TraceIQ citizen scan for ${community.data?.name ?? "the local community"} in ${community.data?.area ?? "the user's area"}.`,
    `Active community marketplace categories: ${[...new Set((communityListings.data ?? []).filter((item) => item.status === "Listed").map((item) => item.category))].slice(0, 5).join(", ") || "none loaded"}.`,
    `Reuse organization needs in the demo: ${[...new Set((organizationNeeds.data ?? []).filter((need) => need.status === "Active").map((need) => need.category))].slice(0, 5).join(", ") || "none loaded"}.`,
  ].join(" ").slice(0, 500);

  const handleAction = useCallback(async (
    action: ScanAction,
    payload: { analysis: MaterialAnalysis; file: File },
  ) => {
    const imageDataUrl = await makeListingImageDataUrl(payload.file);
    setPending({ file: payload.file, analysis: payload.analysis, imageDataUrl });

    // Keep the existing authenticated scan history in sync without blocking
    // the user from continuing into the selected circular flow.
    void fileToDataUrl(payload.file).then((imageData) => apiRequest<SavedScan>("/api/scans", {
      method: "POST",
      body: JSON.stringify({
        image_data: imageData,
        item_name: payload.analysis.materialName,
        category: payload.analysis.category,
        subtype: payload.analysis.subtype,
        stream: payload.analysis.stream,
        confidence: Math.round(payload.analysis.confidence * 100),
        circularity_score: payload.analysis.circularityScore,
        suggested_actions: payload.analysis.suggestedActions,
      }),
    })).catch(() => toast("Your item is ready, but this scan could not be saved to scan history."));

    if (action === "sell") {
      navigate("/marketplace?new=1");
      return;
    }
    navigate(`/listings?new=1&action=${action}`);
  }, [navigate, setPending, toast]);

  return (
    <AppShell active="scan" title="Scan an item">
      <PageContainer size="narrow">
        <PageHeader
          title="Give an item its next use."
          subtitle="Photograph an item. TraceIQ will identify it, suggest useful next steps, and prepare a listing you can review."
        />
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-5 text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" aria-hidden="true" />
          <p>AI identification and weight are estimates. Review and edit the suggested details before publishing; nearby matches are shown only when available in TraceIQ.</p>
        </div>
        <CameraScanner
          onAction={(action, payload) => void handleAction(action, payload)}
          scanContext={localContext}
          communityId={community.data?.id}
        />
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Camera className="h-3.5 w-3.5" />Camera access starts only after you choose “Scan with camera.”</p>
      </PageContainer>
    </AppShell>
  );
};
