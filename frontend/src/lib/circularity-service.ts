/**
 * Mock circularity service for the TraceIQ prototype.
 *
 * This is the single source of truth for demo data. Every UI component calls
 * these methods rather than importing fixtures directly. State is seeded once
 * and persisted to localStorage so demo changes survive reloads. A
 * `resetDemoData()` helper restores the seed.
 *
 * API-READY: each method is named and shaped to map cleanly onto a future
 * FastAPI endpoint (see the contract comments). Swap the bodies for
 * `apiRequest(...)` calls without changing the UI.
 *
 * NOTE: Frontend-only. Simulated latency keeps loading states honest. Nothing
 * here enforces authorization.
 */

import type {
  CommunityActivity,
  ExchangeRequest,
  ImpactSummary,
  ItemCondition,
  MapPoint,
  Match,
  Material,
  MaterialCategory,
  MaterialListing,
  MaterialOutcome,
  OrganizationNeed,
  PickupTask,
  Role,
  SmartBin,
  TimelineEvent,
  User,
  WastePassport,
  ExchangeType,
} from "./domain";
import { JOURNEY_STAGES } from "./domain";

/* ============================ Persistence ============================= */

const STORAGE_KEY = "traceiq.circularity.v1";
const CHANGE_EVENT = "traceiq:circularity-change";

interface DemoState {
  listings: MaterialListing[];
  needs: OrganizationNeed[];
  matches: Match[];
  requests: ExchangeRequest[];
  tasks: PickupTask[];
  bins: SmartBin[];
  passports: WastePassport[];
  community: CommunityActivity[];
}

function clone<T>(v: T): T {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v)) as T;
}

function iso(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/* ============================== Seed data ============================= */

const CURRENT_USER: User = {
  id: "u-alex",
  fullName: "Alex Rivera",
  email: "alex@example.com",
  role: "citizen",
  area: "Riverside",
};

function buildTimeline(reached: number): TimelineEvent[] {
  const actors: Record<string, string> = {
    Listed: "Alex Rivera",
    Accepted: "EcoPack",
    "Pickup assigned": "Riverside Municipality",
    Collected: "Sam Ortiz",
    Delivered: "Sam Ortiz",
    Received: "EcoPack",
    Completed: "TraceIQ",
  };
  return JOURNEY_STAGES.map((stage, i) => ({
    id: `evt-${stage.replace(/\s+/g, "-").toLowerCase()}`,
    stage,
    actor: actors[stage] ?? "TraceIQ",
    date: i <= reached ? iso(JOURNEY_STAGES.length - i) : "",
    done: i <= reached,
  }));
}

function seed(): DemoState {
  const listings: MaterialListing[] = [
    {
      id: "lst-cardboard",
      title: "Flattened moving boxes",
      material: "Cardboard boxes",
      category: "Cardboard",
      description: "About 20 clean, flattened boxes from a recent move.",
      condition: "Good",
      weight: "10 kg",
      quantity: "10 kg",
      exchangeType: "donation",
      area: "Riverside",
      status: "Listed",
      matchPercent: 92,
      owner: "Alex Rivera",
      createdAt: iso(0),
    },
    {
      id: "lst-pet",
      title: "PET bottle bundle",
      material: "PET bottles",
      category: "Plastic",
      description: "Rinsed PET bottles collected over a month.",
      condition: "Good",
      weight: "5 kg",
      quantity: "5 kg",
      exchangeType: "pickup",
      area: "Riverside",
      status: "Matched",
      matchPercent: 86,
      owner: "Alex Rivera",
      createdAt: iso(1),
    },
    {
      id: "lst-chair",
      title: "Office chair",
      material: "Office chair",
      category: "Furniture",
      description: "Ergonomic office chair, gas lift works, minor wear.",
      condition: "Fair",
      weight: "12 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Riverside",
      status: "Completed",
      matchPercent: 78,
      owner: "Alex Rivera",
      createdAt: iso(6),
      passportId: "wp-chair",
    },
  ];

  const needs: OrganizationNeed[] = [
    {
      id: "need-pet",
      orgName: "EcoPack",
      material: "PET Plastic",
      category: "Plastic",
      quantity: "20–50 kg",
      area: "Riverside",
      neededBy: "30 Sep",
      status: "Active",
    },
    {
      id: "need-cardboard",
      orgName: "EcoPack",
      material: "Cardboard",
      category: "Cardboard",
      quantity: "10–30 kg",
      area: "Old Town",
      neededBy: "2 Oct",
      status: "Active",
    },
    {
      id: "need-furniture",
      orgName: "EcoPack",
      material: "Old furniture",
      category: "Furniture",
      quantity: "1–10 units",
      area: "Riverside",
      neededBy: "5 Oct",
      status: "Active",
    },
  ];

  const matches: Match[] = [
    {
      id: "match-cardboard",
      listingId: "lst-cardboard",
      material: "Cardboard boxes",
      category: "Cardboard",
      quantity: "10 kg",
      distance: "1.2 km",
      matchPercent: 92,
      counterparty: "Alex Rivera",
      counterpartyType: "Resident",
      reasons: ["Material matches your need", "Quantity within range", "1.2 km away"],
      co2eEstimate: 3.1,
      diverted: "10 kg",
      status: "Suggested",
    },
    {
      id: "match-pet",
      listingId: "lst-pet",
      material: "PET bottles",
      category: "Plastic",
      quantity: "5 kg",
      distance: "1.8 km",
      matchPercent: 86,
      counterparty: "Alex Rivera",
      counterpartyType: "Resident",
      reasons: ["Material matches your need", "Quantity within range", "1.8 km away"],
      co2eEstimate: 1.9,
      diverted: "5 kg",
      status: "Suggested",
    },
    {
      id: "match-chairs",
      listingId: "lst-chair",
      material: "Office chairs",
      category: "Furniture",
      quantity: "2 units",
      distance: "2.4 km",
      matchPercent: 78,
      counterparty: "Community Workshop",
      counterpartyType: "Community Workshop",
      reasons: ["Reusable condition", "Within service range", "Fits refurbishing program"],
      co2eEstimate: 22.0,
      diverted: "24 kg",
      status: "Suggested",
    },
  ];

  const requests: ExchangeRequest[] = [
    {
      id: "req-1",
      listingId: "lst-chair",
      material: "Office chair",
      fromName: "Jordan Lee",
      toName: "Alex Rivera",
      kind: "request",
      status: "Pending",
      createdAt: iso(1),
    },
  ];

  const tasks: PickupTask[] = [
    {
      id: "task-pet",
      material: "PET bottles",
      category: "Plastic",
      estimatedQuantity: "5 kg",
      actualQuantity: null,
      pickupArea: "Riverside, Maple St",
      destination: "EcoPack facility",
      priority: "High",
      status: "Assigned",
      collector: "Sam Ortiz",
      listingId: "lst-pet",
      passportId: "wp-pet",
      window: "Today, 14:00–16:00",
    },
    {
      id: "task-cardboard",
      material: "Cardboard boxes",
      category: "Cardboard",
      estimatedQuantity: "10 kg",
      actualQuantity: null,
      pickupArea: "Old Town, 4th Ave",
      destination: "Community Centre",
      priority: "Normal",
      status: "Unassigned",
      collector: null,
      listingId: "lst-cardboard",
      window: "Tomorrow, 09:00–11:00",
    },
    {
      id: "task-ewaste",
      material: "Small electronics",
      category: "Electronics",
      estimatedQuantity: "3 kg",
      actualQuantity: null,
      pickupArea: "Harbor View",
      destination: "Re-Volt Recyclers",
      priority: "Low",
      status: "Unassigned",
      collector: null,
      window: "Fri, 10:00–12:00",
    },
  ];

  const bins: SmartBin[] = [
    {
      id: "bin-riverside-01",
      area: "Riverside, Maple St",
      category: "Plastic",
      fillLevel: 88,
      lastCollection: "2 days ago",
      priority: "High",
      overflowEstimateHrs: 6,
    },
    {
      id: "bin-oldtown-03",
      area: "Old Town, 4th Ave",
      category: "Cardboard",
      fillLevel: 64,
      lastCollection: "1 day ago",
      priority: "Normal",
      overflowEstimateHrs: 20,
    },
    {
      id: "bin-harbor-02",
      area: "Harbor View",
      category: "Glass",
      fillLevel: 41,
      lastCollection: "3 days ago",
      priority: "Low",
      overflowEstimateHrs: 40,
    },
    {
      id: "bin-central-05",
      area: "Central Market",
      category: "Organic",
      fillLevel: 92,
      lastCollection: "3 days ago",
      priority: "High",
      overflowEstimateHrs: 3,
    },
  ];

  const passports: WastePassport[] = [
    {
      id: "wp-chair",
      material: "Office chair",
      category: "Furniture",
      quantity: "1 unit",
      owner: "Alex Rivera",
      currentStage: "Completed",
      timeline: buildTimeline(6),
      co2eEstimate: 11.0,
      diverted: "12 kg",
      outcome: "Reused",
      listingId: "lst-chair",
    },
    {
      id: "wp-pet",
      material: "PET bottles",
      category: "Plastic",
      quantity: "5 kg",
      owner: "Alex Rivera",
      currentStage: "Pickup assigned",
      timeline: buildTimeline(2),
      co2eEstimate: 1.9,
      diverted: "5 kg",
      listingId: "lst-pet",
    },
    {
      id: "wp-cardboard",
      material: "Cardboard boxes",
      category: "Cardboard",
      quantity: "10 kg",
      owner: "Alex Rivera",
      currentStage: "Listed",
      timeline: buildTimeline(0),
      co2eEstimate: 3.1,
      diverted: "10 kg",
      listingId: "lst-cardboard",
    },
  ];

  const community: CommunityActivity[] = [
    { id: "ca-1", actor: "Priya N.", actorType: "Resident", kind: "offer", material: "Glass jars", when: "20m ago" },
    { id: "ca-2", actor: "EcoPack", actorType: "Organization", kind: "request", material: "PET Plastic", when: "1h ago" },
    { id: "ca-3", actor: "Marco T.", actorType: "Resident", kind: "reused", material: "Bookshelf", when: "3h ago" },
    { id: "ca-4", actor: "Re-Volt Recyclers", actorType: "Organization", kind: "request", material: "Small electronics", when: "5h ago" },
    { id: "ca-5", actor: "Dana K.", actorType: "Resident", kind: "joined", material: "", when: "Yesterday" },
  ];

  return { listings, needs, matches, requests, tasks, bins, passports, community };
}

/* ============================= State access ============================ */

/**
 * Loads persisted state, or seeds fresh state. Note: this must NOT call
 * `persist()` — it runs during the module-level `state` initializer, so `state`
 * is still in its temporal dead zone. Seeding is persisted separately below.
 */
function load(): { data: DemoState; fromStorage: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { data: JSON.parse(raw) as DemoState, fromStorage: true };
  } catch {
    // fall through to seed
  }
  return { data: seed(), fromStorage: false };
}

const initial = load();
let state: DemoState = initial.data;

// Persist the freshly-seeded state now that `state` is initialized. Skipped
// when we loaded existing data from storage.
if (!initial.fromStorage) {
  persist(state);
}

function persist(next: DemoState): void {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage may be unavailable; keep in-memory copy
  }
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // no window (SSR) — ignore
  }
}

function mutate(fn: (draft: DemoState) => void): void {
  const draft = clone(state);
  fn(draft);
  persist(draft);
}

/** Subscribe to any change in demo state. Returns an unsubscribe function. */
export function onCircularityChange(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Restore all demo data to its seeded state. */
export function resetDemoData(): void {
  persist(seed());
}

/** Simulated network latency so loading states are exercised. */
function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* =============================== Service =============================== */

export const circularityService = {
  /* ------- Auth / identity (GET /me) ------- */
  getCurrentUser(): Promise<User> {
    return delay(CURRENT_USER, 120);
  },

  /* ------- Materials / listings (GET|POST|PATCH|DELETE /materials) ------- */
  getListings(): Promise<MaterialListing[]> {
    return delay(state.listings);
  },

  getListing(id: string): Promise<MaterialListing | null> {
    return delay(state.listings.find((l) => l.id === id) ?? null);
  },

  createListing(input: {
    title: string;
    material: string;
    category: MaterialCategory;
    description: string;
    condition: ItemCondition;
    weight: string;
    exchangeType: ExchangeType;
    area: string;
  }): Promise<MaterialListing> {
    const listing: MaterialListing = {
      id: uid("lst"),
      title: input.title,
      material: input.material,
      category: input.category,
      description: input.description,
      condition: input.condition,
      weight: input.weight,
      quantity: input.weight,
      exchangeType: input.exchangeType,
      area: input.area,
      status: "Listed",
      matchPercent: null,
      owner: CURRENT_USER.fullName,
      createdAt: iso(0),
    };
    const passport: WastePassport = {
      id: uid("wp"),
      material: input.material,
      category: input.category,
      quantity: input.weight,
      owner: CURRENT_USER.fullName,
      currentStage: "Listed",
      timeline: buildTimeline(0),
      co2eEstimate: estimateCo2e(input.category, input.weight),
      diverted: input.weight,
      listingId: listing.id,
    };
    listing.passportId = passport.id;
    mutate((d) => {
      d.listings.unshift(listing);
      d.passports.unshift(passport);
      d.community.unshift({
        id: uid("ca"),
        actor: CURRENT_USER.fullName,
        actorType: "Resident",
        kind: "offer",
        material: input.material,
        when: "Just now",
      });
    });
    return delay(listing, 480);
  },

  updateListing(id: string, patch: Partial<MaterialListing>): Promise<MaterialListing | null> {
    mutate((d) => {
      const idx = d.listings.findIndex((l) => l.id === id);
      if (idx >= 0) d.listings[idx] = { ...d.listings[idx], ...patch };
    });
    return delay(state.listings.find((l) => l.id === id) ?? null);
  },

  deleteListing(id: string): Promise<void> {
    mutate((d) => {
      d.listings = d.listings.filter((l) => l.id !== id);
    });
    return delay(undefined as void);
  },

  /* ------- Scan (POST /scan/analyze) ------- */
  analyzeScan(fileName?: string): Promise<Material> {
    // Deterministic mock result. The office-chair path drives the core demo.
    const lower = (fileName ?? "").toLowerCase();
    const result: Material = lower.includes("chair") || lower.includes("furniture")
      ? {
          id: uid("mat"),
          name: "Office chair",
          category: "Furniture",
          subtype: "Reusable furniture",
          stream: "Reusable",
          confidence: 88,
          circularity: 84,
          suggestedActions: ["exchange", "donation", "pickup"],
        }
      : {
          id: uid("mat"),
          name: "Plastic bottle",
          category: "Plastic",
          subtype: "PET Plastic",
          stream: "Dry Recyclable",
          confidence: 94,
          circularity: 91,
          suggestedActions: ["exchange", "donation", "pickup"],
        };
    return delay(result, 1400);
  },

  /* ------- Matches (GET /matches, GET /matches/:id) ------- */
  getMatches(): Promise<Match[]> {
    return delay(state.matches);
  },

  getMatch(id: string): Promise<Match | null> {
    return delay(state.matches.find((m) => m.id === id) ?? null);
  },

  /* ------- Exchange requests (POST /exchange-requests, PATCH ...) ------- */
  getExchangeRequests(): Promise<ExchangeRequest[]> {
    return delay(state.requests);
  },

  createExchangeRequest(input: {
    listingId: string;
    material: string;
    kind: "offer" | "request";
  }): Promise<ExchangeRequest> {
    const req: ExchangeRequest = {
      id: uid("req"),
      listingId: input.listingId,
      material: input.material,
      fromName: CURRENT_USER.fullName,
      toName: "Listing owner",
      kind: input.kind,
      status: "Pending",
      createdAt: iso(0),
    };
    mutate((d) => {
      d.requests.unshift(req);
      const m = d.matches.find((x) => x.listingId === input.listingId);
      if (m) m.status = "Requested";
    });
    return delay(req, 420);
  },

  acceptExchangeRequest(id: string): Promise<void> {
    mutate((d) => {
      const r = d.requests.find((x) => x.id === id);
      if (r) r.status = "Accepted";
    });
    return delay(undefined as void);
  },

  declineExchangeRequest(id: string): Promise<void> {
    mutate((d) => {
      const r = d.requests.find((x) => x.id === id);
      if (r) r.status = "Declined";
    });
    return delay(undefined as void);
  },

  /* ------- Organization needs (GET|POST|PATCH /organization/needs) ------- */
  getOrganizationNeeds(): Promise<OrganizationNeed[]> {
    return delay(state.needs);
  },

  createOrganizationNeed(input: {
    material: string;
    category: MaterialCategory;
    quantity: string;
    area: string;
    neededBy: string;
    notes?: string;
  }): Promise<OrganizationNeed> {
    const need: OrganizationNeed = {
      id: uid("need"),
      orgName: "EcoPack",
      material: input.material,
      category: input.category,
      quantity: input.quantity,
      area: input.area,
      neededBy: input.neededBy,
      notes: input.notes,
      status: "Active",
    };
    mutate((d) => d.needs.unshift(need));
    return delay(need, 460);
  },

  updateOrganizationNeed(id: string, patch: Partial<OrganizationNeed>): Promise<void> {
    mutate((d) => {
      const idx = d.needs.findIndex((n) => n.id === id);
      if (idx >= 0) d.needs[idx] = { ...d.needs[idx], ...patch };
    });
    return delay(undefined as void);
  },

  /* ------- Org matching (POST /organization/matches/:id/accept) ------- */
  acceptMatch(id: string): Promise<void> {
    mutate((d) => {
      const m = d.matches.find((x) => x.id === id);
      if (!m) return;
      m.status = "Accepted";
      const listing = d.listings.find((l) => l.id === m.listingId);
      if (listing) listing.status = "Accepted";
      advancePassportByListing(d, m.listingId, "Accepted", "EcoPack");
    });
    return delay(undefined as void, 420);
  },

  declineMatch(id: string): Promise<void> {
    mutate((d) => {
      const m = d.matches.find((x) => x.id === id);
      if (m) m.status = "Declined";
    });
    return delay(undefined as void);
  },

  /* ------- Receipts (POST /organization/receipts) ------- */
  confirmReceipt(input: {
    matchId?: string;
    listingId: string;
    actualQuantity: string;
    outcome: MaterialOutcome;
  }): Promise<void> {
    mutate((d) => {
      const listing = d.listings.find((l) => l.id === input.listingId);
      if (listing) {
        listing.status = "Completed";
        listing.quantity = input.actualQuantity;
      }
      advancePassportByListing(d, input.listingId, "Received", "EcoPack");
      advancePassportByListing(d, input.listingId, "Completed", "TraceIQ", input.outcome);
      if (input.matchId) {
        d.matches = d.matches.filter((m) => m.id !== input.matchId);
      }
    });
    return delay(undefined as void, 520);
  },

  /* ------- Collector tasks (GET /collector/tasks, PATCH .../status) ------- */
  getPickupTasks(): Promise<PickupTask[]> {
    return delay(state.tasks);
  },

  getPickupTask(id: string): Promise<PickupTask | null> {
    return delay(state.tasks.find((t) => t.id === id) ?? null);
  },

  updatePickupStatus(
    id: string,
    status: PickupTask["status"],
    actualQuantity?: string
  ): Promise<void> {
    mutate((d) => {
      const t = d.tasks.find((x) => x.id === id);
      if (!t) return;
      t.status = status;
      if (actualQuantity) t.actualQuantity = actualQuantity;
      if (t.listingId) {
        if (status === "Collected") {
          advancePassportByListing(d, t.listingId, "Collected", t.collector ?? "Collector");
          const listing = d.listings.find((l) => l.id === t.listingId);
          if (listing) listing.status = "In transit";
        }
        if (status === "Delivered") {
          advancePassportByListing(d, t.listingId, "Delivered", t.collector ?? "Collector");
        }
      }
    });
    return delay(undefined as void, 420);
  },

  /* ------- Municipality (GET /admin/*, POST /admin/tasks/:id/assign) ------- */
  getSmartBins(): Promise<SmartBin[]> {
    return delay(state.bins);
  },

  assignCollector(taskId: string, collector: string): Promise<void> {
    mutate((d) => {
      const t = d.tasks.find((x) => x.id === taskId);
      if (!t) return;
      t.collector = collector;
      t.status = "Assigned";
      if (t.listingId) {
        advancePassportByListing(d, t.listingId, "Pickup assigned", "Riverside Municipality");
      }
    });
    return delay(undefined as void, 420);
  },

  /* ------- Passports (GET /passports, GET /passports/:id) ------- */
  getWastePassports(): Promise<WastePassport[]> {
    return delay(state.passports);
  },

  getWastePassport(id: string): Promise<WastePassport | null> {
    return delay(state.passports.find((p) => p.id === id) ?? null);
  },

  /* ------- Community ------- */
  getCommunityActivity(): Promise<CommunityActivity[]> {
    return delay(state.community);
  },

  /* ------- Map (mock discovery) ------- */
  getMapPoints(): Promise<MapPoint[]> {
    return delay(MAP_POINTS);
  },

  /* ------- Impact (GET /impact) ------- */
  getImpactSummary(): Promise<ImpactSummary> {
    return delay(computeImpact());
  },
};

/* ============================ Derived data ============================ */

/** Advance a passport (found by listing) to a stage, marking prior stages done. */
function advancePassportByListing(
  d: DemoState,
  listingId: string | undefined,
  stage: WastePassport["currentStage"],
  actor: string,
  outcome?: MaterialOutcome
): void {
  if (!listingId) return;
  const p = d.passports.find((x) => x.listingId === listingId);
  if (!p) return;
  const target = JOURNEY_STAGES.indexOf(stage);
  p.currentStage = stage;
  p.timeline = p.timeline.map((evt, i) => ({
    ...evt,
    actor: evt.stage === stage ? actor : evt.actor,
    done: i <= target,
    date: i <= target && !evt.date ? iso(0) : evt.date,
  }));
  if (outcome) p.outcome = outcome;
}

function estimateCo2e(category: MaterialCategory, weight: string): number {
  const kg = parseFloat(weight) || 1;
  const factor: Record<MaterialCategory, number> = {
    Plastic: 0.38,
    Cardboard: 0.31,
    Metal: 1.5,
    Electronics: 3.0,
    Furniture: 0.9,
    Textile: 1.1,
    Glass: 0.25,
    Organic: 0.15,
  };
  return Math.round(kg * (factor[category] ?? 0.4) * 10) / 10;
}

/** Derive the impact summary from completed passports + seed baseline. */
function computeImpact(): ImpactSummary {
  const completed = state.passports.filter((p) => p.currentStage === "Completed");
  const divertedKg = 24.8 + completed.reduce((s, p) => s + (parseFloat(p.diverted) || 0), 0);
  const co2e = 8.4 + completed.reduce((s, p) => s + p.co2eEstimate, 0);
  const reused = 17 + completed.length;

  return {
    metrics: [
      { id: "diverted", value: divertedKg.toFixed(1), unit: "kg", label: "Material diverted" },
      { id: "reused", value: String(reused), label: "Items reused" },
      { id: "co2e", value: co2e.toFixed(1), unit: "kg", label: "CO₂e avoided", estimated: true },
    ],
    breakdown: [
      { category: "Plastic", amount: "9.2 kg", percent: 37 },
      { category: "Cardboard", amount: "7.6 kg", percent: 31 },
      { category: "Metal", amount: "4.8 kg", percent: 19 },
      { category: "Electronics", amount: "3.2 kg", percent: 13 },
    ],
    trend: [
      { label: "May", value: 8 },
      { label: "Jun", value: 12 },
      { label: "Jul", value: 15 },
      { label: "Aug", value: 19 },
      { label: "Sep", value: Math.round(divertedKg) },
    ],
  };
}

const MAP_POINTS: MapPoint[] = [
  { id: "mp-1", name: "EcoPack facility", kind: "recycler", area: "Riverside", distance: "1.8 km", x: 62, y: 34 },
  { id: "mp-2", name: "Community Centre", kind: "reuse", area: "Old Town", distance: "1.2 km", x: 30, y: 52 },
  { id: "mp-3", name: "Community Workshop", kind: "exchange", area: "Riverside", distance: "2.4 km", x: 74, y: 60 },
  { id: "mp-4", name: "Maple St drop-point", kind: "collection", area: "Riverside", distance: "0.6 km", x: 46, y: 44 },
  { id: "mp-5", name: "Re-Volt Recyclers", kind: "recycler", area: "Harbor View", distance: "3.1 km", x: 20, y: 24 },
  { id: "mp-6", name: "Harbor exchange point", kind: "exchange", area: "Harbor View", distance: "3.4 km", x: 84, y: 20 },
];

/** Collectors available for assignment (municipality). */
export const AVAILABLE_COLLECTORS: string[] = ["Sam Ortiz", "Maya Chen", "Leo Park"];

/** Roles helper re-export for convenience. */
export type { Role };
