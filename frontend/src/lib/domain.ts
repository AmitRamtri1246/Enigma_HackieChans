/**
 * Centralized domain models for the TraceIQ circular-economy prototype.
 *
 * These types describe the shared vocabulary used across every role workspace
 * (citizen, organization, collector, municipality). They mirror the shape a
 * real REST API would return so the mock service layer in
 * `circularity-service.ts` can later be swapped for `apiRequest` calls without
 * touching the UI.
 *
 * NOTE: Frontend-only. Nothing here is an authorization mechanism.
 */

/* ------------------------------- Roles -------------------------------- */

export type Role = "citizen" | "organization" | "collector" | "municipality" | "community_admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  /** Fictional demo area/neighborhood — never a real address. */
  area: string;
}

/* ------------------------------ Materials ----------------------------- */

/** High-level material family used for filtering and impact breakdowns. */
export type MaterialCategory =
  | "Plastic"
  | "Cardboard"
  | "Metal"
  | "Electronics"
  | "Furniture"
  | "Textile"
  | "Glass"
  | "Organic"
  | "Sports equipment"
  | "Household items";

/** How the material is intended to leave the citizen's hands. */
export type ExchangeType = "sell" | "exchange" | "donation" | "repair" | "recycle" | "pickup";

/** Condition of a listed item. */
export type ItemCondition = "New" | "Good" | "Fair" | "For parts";

/** Where a listing is in its lifecycle. */
export type ListingStatus =
  | "Draft"
  | "Listed"
  | "Matched"
  | "Accepted"
  | "In transit"
  | "Completed"
  | "Cancelled"
  | "Needs community review"
  | "Sold"
  | "Community buy-in"
  | "Auction queued"
  | "Recycler handoff";

/**
 * A material a citizen has scanned/analyzed. Captures the AI-style result so it
 * can seed a listing.
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  /** e.g. "PET Plastic", "Corrugated cardboard". */
  subtype: string;
  /** e.g. "Dry Recyclable", "Reusable". */
  stream: string;
  /** 0–100 detection confidence. */
  confidence: number;
  /** 0–100 circularity score. */
  circularity: number;
  /** Suggested next actions, ordered by preference. */
  suggestedActions: ExchangeType[];
  /** Optional representative image for scan preview. */
  imageUrl?: string;
  imageAlt?: string;
}

/** A material a citizen has published for reuse/exchange/collection. */
export interface MaterialListing {
  id: string;
  title: string;
  material: string;
  category: MaterialCategory;
  description: string;
  condition: ItemCondition;
  /** Approximate weight, pre-formatted (e.g. "8 kg"). */
  weight: string;
  /** Human quantity, pre-formatted (e.g. "1 unit", "10 kg"). */
  quantity: string;
  exchangeType: ExchangeType;
  /** Fictional demo area. */
  area: string;
  status: ListingStatus;
  /** Best match confidence 0–100, or null when not yet matched. */
  matchPercent: number | null;
  /** Owner display name (citizen). */
  owner: string;
  /** ISO date the listing was created. */
  createdAt: string;
  /** Linked waste-passport id once the journey begins. */
  passportId?: string;
  /** Primary product image URL. */
  imageUrl?: string;
  /** Accessible descriptive alt text. */
  imageAlt?: string;
  /** Display price / cost indicator, e.g. "Free", "$15", "Exchange". */
  price?: string;
  /** Exact rupee amount for paid community-marketplace listings. */
  priceAmount?: number;
  communityId?: string;
  pickupPreference?: PickupPreference;
}

export type CommunityType = "housing_society" | "local_association";

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  area: string;
  description: string;
  memberCount: number;
  adminName: string;
}

export interface CommunityMembership {
  id: string;
  communityId: string;
  userId: string;
  memberName: string;
  role: "member" | "admin";
  joinedAt: string;
}

export type PickupPreference = "Seller pickup" | "Buyer pickup" | "Coordinate locally";

export interface PurchaseFeeBreakdown {
  listingId: string;
  listedPrice: number;
  sellerFeeRate: 2;
  sellerFee: number;
  sellerPayout: number;
  buyerPays: number;
  currency: "INR";
  simulated: true;
}

export interface MarketplacePurchase {
  id: string;
  listingId: string;
  communityId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  breakdown: PurchaseFeeBreakdown;
  purchasedAt: string;
  communityBuyIn: boolean;
}

export type UnsoldReviewOutcome = "community_buy_in" | "auction_queue" | "recycler_handoff";

export interface UnsoldReview {
  id: string;
  listingId: string;
  communityId: string;
  enteredReviewAt: string;
  status: "pending" | "resolved";
  outcome?: UnsoldReviewOutcome;
  decidedAt?: string;
  decidedBy?: string;
}

/* --------------------------- Organization ---------------------------- */

export type NeedStatus = "Active" | "Paused" | "Fulfilled";

/** The circular outcome recorded when a material is received. */
export type MaterialOutcome = "Reused" | "Repaired" | "Upcycled" | "Recycled";

/** A material an organization is looking to receive. */
export interface OrganizationNeed {
  id: string;
  orgName: string;
  material: string;
  category: MaterialCategory;
  /** Quantity range, pre-formatted (e.g. "20–50 kg"). */
  quantity: string;
  area: string;
  /** Deadline, pre-formatted (e.g. "30 Sep"). */
  neededBy: string;
  notes?: string;
  status: NeedStatus;
}

/** A candidate listing that may satisfy a need or a citizen-to-citizen swap. */
export interface Match {
  id: string;
  listingId: string;
  material: string;
  category: MaterialCategory;
  quantity: string;
  /** Distance, pre-formatted (e.g. "1.2 km"). */
  distance: string;
  /** 0–100 confidence. */
  matchPercent: number;
  /** Counterparty display name (person or organization). */
  counterparty: string;
  /** Whether the counterparty is a person or an organization. */
  counterpartyType: "Resident" | "Organization" | "Community Workshop";
  /** Short human-readable reasons this match fits. */
  reasons: string[];
  /** Illustrative CO2e estimate in kg. */
  co2eEstimate: number;
  /** Illustrative material diverted, pre-formatted. */
  diverted: string;
  status: "Suggested" | "Requested" | "Accepted" | "Declined";
  /** Item condition for marketplace card. */
  condition?: ItemCondition;
  /** Price or exchange model indicator ("Free", "Exchange", "Donation"). */
  price?: string;
  /** Representative product image. */
  imageUrl?: string;
  imageAlt?: string;
}

/** A citizen-to-citizen or citizen-to-org offer/request against a listing. */
export interface ExchangeRequest {
  id: string;
  listingId: string;
  material: string;
  fromName: string;
  toName: string;
  kind: "offer" | "request";
  status: "Pending" | "Accepted" | "Declined";
  createdAt: string;
}

/* ----------------------- Collection / logistics ---------------------- */

export type PickupPriority = "Low" | "Normal" | "High";

export type PickupStatus =
  | "Unassigned"
  | "Assigned"
  | "Collected"
  | "Delivered";

/** A pickup/delivery job handled by a collector, coordinated by a municipality. */
export interface PickupTask {
  id: string;
  material: string;
  category: MaterialCategory;
  /** Estimated quantity, pre-formatted. */
  estimatedQuantity: string;
  /** Actual quantity recorded on collection, pre-formatted, or null. */
  actualQuantity: string | null;
  pickupArea: string;
  destination: string;
  priority: PickupPriority;
  status: PickupStatus;
  /** Assigned collector name, or null when unassigned. */
  collector: string | null;
  /** Linked listing/passport for shared timeline updates. */
  listingId?: string;
  passportId?: string;
  /** Scheduled window, pre-formatted (e.g. "Today, 14:00–16:00"). */
  window: string;
}

/* ------------------------------ Smart bins ---------------------------- */

/** A seeded demo smart bin (NOT live IoT data). */
export interface SmartBin {
  id: string;
  area: string;
  category: MaterialCategory;
  /** Fill level 0–100. */
  fillLevel: number;
  /** Last collection, pre-formatted (e.g. "2 days ago"). */
  lastCollection: string;
  priority: PickupPriority;
  /** Illustrative estimated hours until overflow. */
  overflowEstimateHrs: number;
}

/* -------------------------- Waste passports --------------------------- */

/** The ordered lifecycle stages of a material's circular journey. */
export type JourneyStage =
  | "Listed"
  | "Accepted"
  | "Pickup assigned"
  | "Collected"
  | "Delivered"
  | "Received"
  | "Completed";

export type MarketplaceJourneyStage = "Sold" | "Community buy-in" | "Auction queued" | "Recycler handoff";

export const JOURNEY_STAGES: JourneyStage[] = [
  "Listed",
  "Accepted",
  "Pickup assigned",
  "Collected",
  "Delivered",
  "Received",
  "Completed",
];

/** A single recorded event in a material's journey. */
export interface TimelineEvent {
  id: string;
  stage: JourneyStage | MarketplaceJourneyStage;
  /** Who performed this step (person, org, collector, municipality). */
  actor: string;
  /** ISO date the step occurred. */
  date: string;
  /** Whether this stage has been reached yet. */
  done: boolean;
}

/** The traceable record of a material from listing to completion. */
export interface WastePassport {
  id: string;
  material: string;
  category: MaterialCategory;
  quantity: string;
  owner: string;
  currentStage: JourneyStage;
  timeline: TimelineEvent[];
  /** Illustrative impact, only meaningful once Completed. */
  co2eEstimate: number;
  diverted: string;
  outcome?: MaterialOutcome;
  listingId?: string;
  imageUrl?: string;
  imageAlt?: string;
}

/* ------------------------------- Impact ------------------------------- */

export interface ImpactMetric {
  id: string;
  value: string;
  unit?: string;
  label: string;
  estimated?: boolean;
}

export interface MaterialBreakdownItem {
  category: MaterialCategory;
  /** Pre-formatted amount (e.g. "12.4 kg"). */
  amount: string;
  /** Share 0–100 for the simple chart. */
  percent: number;
}

/** A single monthly point for the simple impact trend chart. */
export interface ImpactTrendPoint {
  label: string;
  /** kg diverted that month. */
  value: number;
}

export interface ImpactSummary {
  metrics: ImpactMetric[];
  breakdown: MaterialBreakdownItem[];
  trend: ImpactTrendPoint[];
}

/* ------------------------------ Community ----------------------------- */

export type CommunityEventKind = "offer" | "request" | "reused" | "joined";

export interface CommunityActivity {
  id: string;
  actor: string;
  actorType: "Resident" | "Organization" | "Community Admin";
  kind: CommunityEventKind | "sale" | "purchase" | "community_buy_in" | "auction" | "recycler_handoff";
  material: string;
  when: string;
  communityId?: string;
}

/* -------------------------------- Map --------------------------------- */

export type MapPointKind =
  | "reuse"
  | "recycler"
  | "exchange"
  | "collection";

export interface MapPoint {
  id: string;
  name: string;
  kind: MapPointKind;
  area: string;
  distance: string;
  /** Relative position on the mock map, 0–100 for x and y. */
  x: number;
  y: number;
}

/* ------------------------------ Scanning ------------------------------ */

/** The circular pathways a scanned item can be routed to. */
export type ScanAction = "sell" | "exchange" | "donate" | "repair" | "recycle";

export const SCAN_ACTIONS: ScanAction[] = [
  "sell",
  "exchange",
  "donate",
  "repair",
  "recycle",
];

/**
 * The typed result of analyzing a captured item image. Mirrors the shape the
 * backend `POST /scan/analyze` endpoint returns so the mock and real service
 * are interchangeable behind `scan-service.ts`.
 *
 * NOTE: environmental figures (circularityScore, estimatedWeightKg) are
 * illustrative estimates, not measured values.
 */
export interface MaterialAnalysis {
  materialName: string;
  subtype: string;
  description: string;
  stream: string;
  category: MaterialCategory;
  condition: ItemCondition;
  /** Detection confidence 0–1. */
  confidence: number;
  /** Illustrative circularity score 0–100. */
  circularityScore: number;
  /** Circular pathways, ordered by relevance. */
  suggestedActions: ScanAction[];
  /** The single most relevant action, if any. */
  recommendedAction?: ScanAction;
  recommendationRationale: string;
  recommendedUse: string;
  alternativeRecommendations: string[];
  /** Short preparation steps before handing the item on. */
  preparationGuidance: string[];
  /** Illustrative estimated weight in kg. */
  estimatedWeightKg: number;
  /** Optional pre-computed match ids (usually resolved later). */
  matches: string[];
  analysisSource?: "gemini" | "demo";
}
