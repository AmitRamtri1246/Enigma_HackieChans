/**
 * Scan service — the single abstraction the UI uses to analyze a captured
 * item image. It attempts the backend vision endpoint first and transparently
 * falls back to a deterministic local mock when the backend is unavailable.
 *
 * The UI must NOT know whether a result came from the real service or the mock.
 * No AI provider keys ever live in the frontend — the backend owns that.
 *
 * Backend contract:
 *   POST /scan/analyze
 *   Content-Type: multipart/form-data
 *   Fields: image (file, required), communityId? , scanContext?
 *   Response: MaterialAnalysis (JSON)
 */

import type {
  MaterialAnalysis,
  MaterialCategory,
  ItemCondition,
  ScanAction,
} from "./domain";

// Routed through the Vite `/api` proxy to the backend `/api/scan/analyze`.
const ANALYZE_ENDPOINT = "/api/scan/analyze";

export interface AnalyzeOptions {
  /** Optional community scope passed to the backend. */
  communityId?: string;
  /** Optional free-form context (e.g. "sell-flow", "home"). */
  scanContext?: string;
  /**
   * Escape hatch for tests/dev: force the local mock. Normal callers never set
   * this — the service decides based on backend availability.
   */
  forceMock?: boolean;
}

export const scanService = {
  /**
   * Analyze a captured image and return a typed MaterialAnalysis. Tries the
   * backend; on network/HTTP failure, falls back to the local mock so the
   * prototype keeps working end-to-end.
   */
  async analyzeMaterial(image: File, options: AnalyzeOptions = {}): Promise<MaterialAnalysis> {
    if (options.forceMock) {
      return mockAnalyze(image);
    }

    try {
      const form = new FormData();
      form.append("image", image, image.name || "scan.jpg");
      if (options.communityId) form.append("communityId", options.communityId);
      if (options.scanContext) form.append("scanContext", options.scanContext);

      const res = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        body: form,
        credentials: "include",
        // Do NOT set Content-Type; the browser sets the multipart boundary.
      });

      if (!res.ok) throw new Error(`Analyze failed with ${res.status}`);
      const data = (await res.json()) as MaterialAnalysis;
      return normalize(data);
    } catch {
      // Backend not available (common in the prototype) — use the local mock.
      return mockAnalyze(image);
    }
  },

  /**
   * Optional: recommendations for a previously analyzed material. Currently a
   * thin mock; kept behind the service so the UI stays provider-agnostic.
   */
  async getScanRecommendations(materialName: string): Promise<ScanAction[]> {
    const profile = matchProfile(materialName.toLowerCase());
    return profile.suggestedActions;
  },
};

/* ============================ Local mock ============================= */

interface MockProfile {
  materialName: string;
  category: MaterialCategory;
  condition: ItemCondition;
  confidence: number;
  circularityScore: number;
  suggestedActions: ScanAction[];
  recommendedAction: ScanAction;
  preparationGuidance: string[];
  estimatedWeightKg: number;
}

const PROFILES: MockProfile[] = [
  {
    materialName: "Office Chair",
    category: "Furniture",
    condition: "Good",
    confidence: 0.94,
    circularityScore: 91,
    suggestedActions: ["sell", "exchange", "donate", "repair", "recycle"],
    recommendedAction: "sell",
    preparationGuidance: ["Wipe down the surfaces", "Check the gas lift and wheels", "Remove any loose parts"],
    estimatedWeightKg: 8,
  },
  {
    materialName: "PET Bottle",
    category: "Plastic",
    condition: "Good",
    confidence: 0.92,
    circularityScore: 88,
    suggestedActions: ["recycle", "donate", "exchange"],
    recommendedAction: "recycle",
    preparationGuidance: ["Rinse and empty", "Remove the cap and label if required locally"],
    estimatedWeightKg: 1,
  },
  {
    materialName: "Cardboard Boxes",
    category: "Cardboard",
    condition: "Good",
    confidence: 0.9,
    circularityScore: 85,
    suggestedActions: ["donate", "exchange", "recycle"],
    recommendedAction: "donate",
    preparationGuidance: ["Flatten the boxes", "Remove tape and labels"],
    estimatedWeightKg: 4,
  },
  {
    materialName: "Small Electronics",
    category: "Electronics",
    condition: "Fair",
    confidence: 0.86,
    circularityScore: 72,
    suggestedActions: ["repair", "recycle", "sell"],
    recommendedAction: "repair",
    preparationGuidance: ["Back up and wipe personal data", "Include the charger if you have it"],
    estimatedWeightKg: 2,
  },
];

/** Pick a profile from a filename hint; defaults to the office-chair demo path. */
function matchProfile(hint: string): MockProfile {
  if (hint.includes("bottle") || hint.includes("pet") || hint.includes("plastic")) return PROFILES[1];
  if (hint.includes("box") || hint.includes("cardboard")) return PROFILES[2];
  if (hint.includes("phone") || hint.includes("laptop") || hint.includes("electronic")) return PROFILES[3];
  return PROFILES[0];
}

async function mockAnalyze(image: File): Promise<MaterialAnalysis> {
  // Simulate a realistic vision round-trip so the analyzing UI is exercised.
  await new Promise((r) => setTimeout(r, 1600));
  const p = matchProfile((image.name || "").toLowerCase());
  return {
    materialName: p.materialName,
    category: p.category,
    condition: p.condition,
    confidence: p.confidence,
    circularityScore: p.circularityScore,
    suggestedActions: p.suggestedActions,
    recommendedAction: p.recommendedAction,
    preparationGuidance: p.preparationGuidance,
    estimatedWeightKg: p.estimatedWeightKg,
    matches: [],
  };
}

/** Defensive normalization of a backend payload into a valid MaterialAnalysis. */
function normalize(data: Partial<MaterialAnalysis>): MaterialAnalysis {
  const actions = (data.suggestedActions ?? []).filter(Boolean) as ScanAction[];
  return {
    materialName: data.materialName ?? "Unknown item",
    category: (data.category ?? "Plastic") as MaterialCategory,
    condition: (data.condition ?? "Good") as ItemCondition,
    confidence: clamp01(data.confidence ?? 0.8),
    circularityScore: clampScore(data.circularityScore ?? 70),
    suggestedActions: actions.length ? actions : ["recycle"],
    recommendedAction: data.recommendedAction ?? actions[0],
    preparationGuidance: data.preparationGuidance ?? [],
    estimatedWeightKg: Math.max(0, data.estimatedWeightKg ?? 1),
    matches: data.matches ?? [],
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
