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
import { IMAGES, getMarketplaceImage } from "@/data/images";

/* ============================ Persistence ============================= */

const STORAGE_KEY = "traceiq.circularity.v2";
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
      id: "lst-chair",
      title: "Ergonomic mesh office chair",
      material: "Office chair",
      category: "Furniture",
      description: "Breathable mesh back with adjustable lumbar and arms. Gas lift fully functional.",
      condition: "Good",
      weight: "12 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Riverside",
      status: "Completed",
      matchPercent: 78,
      owner: "Alex Rivera",
      createdAt: iso(6),
      passportId: "wp-chair",
      imageUrl: IMAGES.marketplace.officeChair.url,
      imageAlt: IMAGES.marketplace.officeChair.alt,
      price: "Exchange",
    },
    {
      id: "lst-bike",
      title: "City commuter bicycle",
      material: "Bicycle",
      category: "Metal",
      description: "Steel frame 7-speed commuter with rear luggage rack and chain guard.",
      condition: "Good",
      weight: "14 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Old Town",
      status: "Listed",
      matchPercent: 95,
      owner: "Elena Vance",
      createdAt: iso(1),
      imageUrl: IMAGES.marketplace.bicycle.url,
      imageAlt: IMAGES.marketplace.bicycle.alt,
      price: "Exchange",
    },
    {
      id: "lst-books",
      title: "Hardcover science & ecology books",
      material: "Books",
      category: "Cardboard",
      description: "Box of 14 clean ecology, natural science, and gardening reference books.",
      condition: "Good",
      weight: "7 kg",
      quantity: "14 books",
      exchangeType: "donation",
      area: "Riverside",
      status: "Listed",
      matchPercent: 88,
      owner: "Marcus Brody",
      createdAt: iso(1),
      imageUrl: IMAGES.marketplace.books.url,
      imageAlt: IMAGES.marketplace.books.alt,
      price: "Free",
    },
    {
      id: "lst-desk",
      title: "Solid pine work desk",
      material: "Desk",
      category: "Furniture",
      description: "Minimalist Scandinavian design writing desk with twin shallow cable drawers.",
      condition: "Good",
      weight: "18 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Harbor View",
      status: "Listed",
      matchPercent: 84,
      owner: "Kenji Sato",
      createdAt: iso(2),
      imageUrl: IMAGES.marketplace.desk.url,
      imageAlt: IMAGES.marketplace.desk.alt,
      price: "Exchange",
    },
    {
      id: "lst-table",
      title: "Four-person wooden dining table",
      material: "Table",
      category: "Furniture",
      description: "Sturdy solid timber dining table, clean surface with warm matte finish.",
      condition: "Fair",
      weight: "22 kg",
      quantity: "1 unit",
      exchangeType: "donation",
      area: "Riverside",
      status: "Listed",
      matchPercent: 79,
      owner: "Claire Dupont",
      createdAt: iso(3),
      imageUrl: IMAGES.marketplace.table.url,
      imageAlt: IMAGES.marketplace.table.alt,
      price: "Free",
    },
    {
      id: "lst-lamp",
      title: "Brass architectural task lamp",
      material: "Lamp",
      category: "Electronics",
      description: "Adjustable counterbalanced desk lamp, warm E27 LED bulb included.",
      condition: "Good",
      weight: "2 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Old Town",
      status: "Listed",
      matchPercent: 91,
      owner: "Liam Gallagher",
      createdAt: iso(2),
      imageUrl: IMAGES.marketplace.lamp.url,
      imageAlt: IMAGES.marketplace.lamp.alt,
      price: "Exchange",
    },
    {
      id: "lst-monitor",
      title: "24-inch IPS computer monitor",
      material: "Monitor",
      category: "Electronics",
      description: "Full HD 1080p panel, HDMI and DisplayPort inputs, power brick included.",
      condition: "Good",
      weight: "4 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Harbor View",
      status: "Listed",
      matchPercent: 93,
      owner: "Devon Chen",
      createdAt: iso(1),
      imageUrl: IMAGES.marketplace.monitor.url,
      imageAlt: IMAGES.marketplace.monitor.alt,
      price: "$20",
    },
    {
      id: "lst-appliance",
      title: "Stainless steel electric kettle",
      material: "Small appliance",
      category: "Electronics",
      description: "1.7L cordless kettle with rapid-boil element and auto shutoff.",
      condition: "New",
      weight: "1.5 kg",
      quantity: "1 unit",
      exchangeType: "donation",
      area: "Riverside",
      status: "Listed",
      matchPercent: 86,
      owner: "Sofia Reyes",
      createdAt: iso(0),
      imageUrl: IMAGES.marketplace.smallAppliance.url,
      imageAlt: IMAGES.marketplace.smallAppliance.alt,
      price: "Free",
    },
    {
      id: "lst-cardboard",
      title: "Flattened moving boxes",
      material: "Cardboard boxes",
      category: "Cardboard",
      description: "20 clean, double-walled corrugated packing boxes from a recent move.",
      condition: "Good",
      weight: "10 kg",
      quantity: "10 kg",
      exchangeType: "donation",
      area: "Riverside",
      status: "Listed",
      matchPercent: 92,
      owner: "Alex Rivera",
      createdAt: iso(0),
      passportId: "wp-cardboard",
      imageUrl: IMAGES.marketplace.cardboardBoxes.url,
      imageAlt: IMAGES.marketplace.cardboardBoxes.alt,
      price: "Free",
    },
    {
      id: "lst-furniture",
      title: "Modern upholstered olive armchair",
      material: "Furniture",
      category: "Furniture",
      description: "Compact lounge accent chair with tapered natural wood legs.",
      condition: "Good",
      weight: "16 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Old Town",
      status: "Listed",
      matchPercent: 82,
      owner: "Hannah Abbott",
      createdAt: iso(4),
      imageUrl: IMAGES.marketplace.furniture.url,
      imageAlt: IMAGES.marketplace.furniture.alt,
      price: "Exchange",
    },
    {
      id: "lst-electronics",
      title: "USB audio interface & mixer",
      material: "Electronics",
      category: "Electronics",
      description: "Two-channel desktop audio interface with XLR inputs and headphone monitor.",
      condition: "Good",
      weight: "1.8 kg",
      quantity: "1 unit",
      exchangeType: "exchange",
      area: "Harbor View",
      status: "Listed",
      matchPercent: 89,
      owner: "Priya Nair",
      createdAt: iso(2),
      imageUrl: IMAGES.marketplace.electronics.url,
      imageAlt: IMAGES.marketplace.electronics.alt,
      price: "Exchange",
    },
    {
      id: "lst-sports",
      title: "Cast iron kettlebell pair",
      material: "Sports equipment",
      category: "Metal",
      description: "12 kg and 16 kg powder-coated cast iron bells with smooth grip handles.",
      condition: "Good",
      weight: "28 kg",
      quantity: "2 units",
      exchangeType: "exchange",
      area: "Riverside",
      status: "Listed",
      matchPercent: 90,
      owner: "Tom Hansen",
      createdAt: iso(3),
      imageUrl: IMAGES.marketplace.sportsEquipment.url,
      imageAlt: IMAGES.marketplace.sportsEquipment.alt,
      price: "Exchange",
    },
    {
      id: "lst-household",
      title: "Ceramic tableware & bowls set",
      material: "Household items",
      category: "Glass",
      description: "Set of 6 handcrafted speckled stoneware bowls and two serving platters.",
      condition: "New",
      weight: "5 kg",
      quantity: "8 pieces",
      exchangeType: "donation",
      area: "Old Town",
      status: "Listed",
      matchPercent: 92,
      owner: "Aria Montgomery",
      createdAt: iso(1),
      imageUrl: IMAGES.marketplace.householdItems.url,
      imageAlt: IMAGES.marketplace.householdItems.alt,
      price: "Free",
    },
    {
      id: "lst-pet",
      title: "PET bottle bundle",
      material: "PET bottles",
      category: "Plastic",
      description: "Rinsed and sorted PET beverage bottles collected over four weeks.",
      condition: "Good",
      weight: "5 kg",
      quantity: "5 kg",
      exchangeType: "pickup",
      area: "Riverside",
      status: "Matched",
      matchPercent: 86,
      owner: "Alex Rivera",
      createdAt: iso(1),
      passportId: "wp-pet",
      imageUrl: IMAGES.marketplace.plasticBottles.url,
      imageAlt: IMAGES.marketplace.plasticBottles.alt,
      price: "Donation",
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
      id: "match-chair",
      listingId: "lst-chair",
      material: "Office chair",
      category: "Furniture",
      quantity: "1 unit",
      distance: "2.4 km",
      matchPercent: 78,
      counterparty: "Community Workshop",
      counterpartyType: "Community Workshop",
      reasons: ["Reusable condition", "Within service range", "Fits refurbishing program"],
      co2eEstimate: 22.0,
      diverted: "12 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.officeChair.url,
      imageAlt: IMAGES.marketplace.officeChair.alt,
    },
    {
      id: "match-bike",
      listingId: "lst-bike",
      material: "Bicycle",
      category: "Sports equipment",
      quantity: "1 unit",
      distance: "0.9 km",
      matchPercent: 95,
      counterparty: "Elena Vance",
      counterpartyType: "Resident",
      reasons: ["High demand item", "Walking distance", "Excellent condition"],
      co2eEstimate: 35.0,
      diverted: "14 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.bicycle.url,
      imageAlt: IMAGES.marketplace.bicycle.alt,
    },
    {
      id: "match-books",
      listingId: "lst-books",
      material: "Books",
      category: "Household items",
      quantity: "14 books",
      distance: "1.1 km",
      matchPercent: 88,
      counterparty: "Riverside Library",
      counterpartyType: "Organization",
      reasons: ["Community reading swap", "Local drop-off available", "Preserves book lifecycle"],
      co2eEstimate: 6.2,
      diverted: "7 kg",
      status: "Suggested",
      condition: "Good",
      price: "Free",
      imageUrl: IMAGES.marketplace.books.url,
      imageAlt: IMAGES.marketplace.books.alt,
    },
    {
      id: "match-desk",
      listingId: "lst-desk",
      material: "Desk",
      category: "Furniture",
      quantity: "1 unit",
      distance: "3.1 km",
      matchPercent: 84,
      counterparty: "Kenji Sato",
      counterpartyType: "Resident",
      reasons: ["Direct resident swap", "Pine wood repairable", "Fits home office need"],
      co2eEstimate: 18.5,
      diverted: "18 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.desk.url,
      imageAlt: IMAGES.marketplace.desk.alt,
    },
    {
      id: "match-table",
      listingId: "lst-table",
      material: "Table",
      category: "Furniture",
      quantity: "1 unit",
      distance: "1.4 km",
      matchPercent: 79,
      counterparty: "Claire Dupont",
      counterpartyType: "Resident",
      reasons: ["Solid wood reuse", "Local pickup eligible", "Direct donation"],
      co2eEstimate: 24.0,
      diverted: "22 kg",
      status: "Suggested",
      condition: "Fair",
      price: "Free",
      imageUrl: IMAGES.marketplace.table.url,
      imageAlt: IMAGES.marketplace.table.alt,
    },
    {
      id: "match-lamp",
      listingId: "lst-lamp",
      material: "Lamp",
      category: "Household items",
      quantity: "1 unit",
      distance: "1.8 km",
      matchPercent: 91,
      counterparty: "Liam Gallagher",
      counterpartyType: "Resident",
      reasons: ["Working electrical condition", "Near transit line", "Immediate swap available"],
      co2eEstimate: 4.8,
      diverted: "2 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.lamp.url,
      imageAlt: IMAGES.marketplace.lamp.alt,
    },
    {
      id: "match-monitor",
      listingId: "lst-monitor",
      material: "Monitor",
      category: "Electronics",
      quantity: "1 unit",
      distance: "2.8 km",
      matchPercent: 93,
      counterparty: "Devon Chen",
      counterpartyType: "Resident",
      reasons: ["E-waste diversion", "Tested display panel", "High circularity score"],
      co2eEstimate: 16.0,
      diverted: "4 kg",
      status: "Suggested",
      condition: "Good",
      price: "$20",
      imageUrl: IMAGES.marketplace.monitor.url,
      imageAlt: IMAGES.marketplace.monitor.alt,
    },
    {
      id: "match-appliance",
      listingId: "lst-appliance",
      material: "Small appliance",
      category: "Electronics",
      quantity: "1 unit",
      distance: "0.8 km",
      matchPercent: 86,
      counterparty: "Sofia Reyes",
      counterpartyType: "Resident",
      reasons: ["Functional heating unit", "Stainless steel construction", "Free donation"],
      co2eEstimate: 5.5,
      diverted: "1.5 kg",
      status: "Suggested",
      condition: "New",
      price: "Free",
      imageUrl: IMAGES.marketplace.smallAppliance.url,
      imageAlt: IMAGES.marketplace.smallAppliance.alt,
    },
    {
      id: "match-cardboard",
      listingId: "lst-cardboard",
      material: "Cardboard boxes",
      category: "Cardboard",
      quantity: "10 kg",
      distance: "1.2 km",
      matchPercent: 92,
      counterparty: "EcoPack",
      counterpartyType: "Organization",
      reasons: ["Material matches your need", "Quantity within range", "1.2 km away"],
      co2eEstimate: 3.1,
      diverted: "10 kg",
      status: "Suggested",
      condition: "Good",
      price: "Free",
      imageUrl: IMAGES.marketplace.cardboardBoxes.url,
      imageAlt: IMAGES.marketplace.cardboardBoxes.alt,
    },
    {
      id: "match-furniture",
      listingId: "lst-furniture",
      material: "Furniture",
      category: "Furniture",
      quantity: "1 unit",
      distance: "1.9 km",
      matchPercent: 82,
      counterparty: "Hannah Abbott",
      counterpartyType: "Resident",
      reasons: ["Clean upholstery", "Refurbishing fit", "Immediate reuse opportunity"],
      co2eEstimate: 19.0,
      diverted: "16 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.furniture.url,
      imageAlt: IMAGES.marketplace.furniture.alt,
    },
    {
      id: "match-electronics",
      listingId: "lst-electronics",
      material: "Electronics",
      category: "Electronics",
      quantity: "1 unit",
      distance: "2.3 km",
      matchPercent: 89,
      counterparty: "Re-Volt Recyclers",
      counterpartyType: "Organization",
      reasons: ["Component recovery program", "Specialized e-waste handler", "Certified reuse"],
      co2eEstimate: 12.0,
      diverted: "1.8 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.electronics.url,
      imageAlt: IMAGES.marketplace.electronics.alt,
    },
    {
      id: "match-sports",
      listingId: "lst-sports",
      material: "Sports equipment",
      category: "Sports equipment",
      quantity: "2 units",
      distance: "1.5 km",
      matchPercent: 90,
      counterparty: "Tom Hansen",
      counterpartyType: "Resident",
      reasons: ["Indestructible cast iron", "Zero degradation over time", "Direct resident swap"],
      co2eEstimate: 42.0,
      diverted: "28 kg",
      status: "Suggested",
      condition: "Good",
      price: "Exchange",
      imageUrl: IMAGES.marketplace.sportsEquipment.url,
      imageAlt: IMAGES.marketplace.sportsEquipment.alt,
    },
    {
      id: "match-household",
      listingId: "lst-household",
      material: "Household items",
      category: "Household items",
      quantity: "8 pieces",
      distance: "0.7 km",
      matchPercent: 92,
      counterparty: "Aria Montgomery",
      counterpartyType: "Resident",
      reasons: ["Zero chips or cracks", "Walking distance", "Immediate reuse"],
      co2eEstimate: 7.0,
      diverted: "5 kg",
      status: "Suggested",
      condition: "New",
      price: "Free",
      imageUrl: IMAGES.marketplace.householdItems.url,
      imageAlt: IMAGES.marketplace.householdItems.alt,
    },
    {
      id: "match-pet",
      listingId: "lst-pet",
      material: "PET bottles",
      category: "Plastic",
      quantity: "5 kg",
      distance: "1.8 km",
      matchPercent: 86,
      counterparty: "EcoPack",
      counterpartyType: "Organization",
      reasons: ["Material matches your need", "Quantity within range", "1.8 km away"],
      co2eEstimate: 1.9,
      diverted: "5 kg",
      status: "Suggested",
      condition: "Good",
      price: "Donation",
      imageUrl: IMAGES.marketplace.plasticBottles.url,
      imageAlt: IMAGES.marketplace.plasticBottles.alt,
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
      imageUrl: IMAGES.marketplace.officeChair.url,
      imageAlt: IMAGES.marketplace.officeChair.alt,
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
      imageUrl: IMAGES.marketplace.plasticBottles.url,
      imageAlt: IMAGES.marketplace.plasticBottles.alt,
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
      imageUrl: IMAGES.marketplace.cardboardBoxes.url,
      imageAlt: IMAGES.marketplace.cardboardBoxes.alt,
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
    const img = getMarketplaceImage(input.material || input.title);
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
      imageUrl: img.url,
      imageAlt: img.alt,
      price: input.exchangeType === "donation" ? "Free" : "Exchange",
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
      imageUrl: img.url,
      imageAlt: img.alt,
    };
    listing.passportId = passport.id;
    mutate((d) => {
      // Match the new listing against active organization needs so it shows
      // up in the organization's Matches (core demo lifecycle).
      const need = d.needs.find((n) => n.status === "Active" && n.category === input.category);
      if (need) {
        listing.status = "Matched";
        listing.matchPercent = 88;
        d.matches.unshift({
          id: uid("match"),
          listingId: listing.id,
          material: input.material,
          category: input.category,
          quantity: input.weight,
          distance: "1.4 km",
          matchPercent: 88,
          counterparty: CURRENT_USER.fullName,
          counterpartyType: "Resident",
          reasons: [
            `Fits ${need.orgName}'s ${need.material.toLowerCase()} need`,
            `Quantity within ${need.quantity}`,
            `1.4 km from ${need.area}`,
          ],
          co2eEstimate: passport.co2eEstimate,
          diverted: input.weight,
          status: "Suggested",
        });
      }
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
    const lower = (fileName ?? "").toLowerCase();
    type MaterialAsset = (typeof IMAGES.materials)[keyof typeof IMAGES.materials];
    let selected: MaterialAsset = IMAGES.materials.plasticBottle;

    if (lower.includes("chair") || lower.includes("furniture") || lower.includes("desk")) {
      selected = IMAGES.materials.officeChair;
    } else if (lower.includes("cardboard") || lower.includes("box") || lower.includes("carton")) {
      selected = IMAGES.materials.cardboard;
    } else if (lower.includes("electronic") || lower.includes("circuit") || lower.includes("e-waste") || lower.includes("device") || lower.includes("phone")) {
      selected = IMAGES.materials.electronics;
    } else if (lower.includes("metal") || lower.includes("aluminum") || lower.includes("steel") || lower.includes("can")) {
      selected = IMAGES.materials.metalObject;
    } else if (lower.includes("bottle") || lower.includes("pet") || lower.includes("plastic")) {
      selected = IMAGES.materials.plasticBottle;
    }

    const result: Material = {
      id: uid("mat"),
      name: selected.name,
      category: selected.category,
      subtype: selected.subtype,
      stream: selected.stream,
      confidence: selected.confidence,
      circularity: selected.circularity,
      suggestedActions: ["exchange", "donation", "pickup"],
      imageUrl: selected.url,
      imageAlt: selected.alt,
    };
    return delay(result, 1200);
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
      if (listing && listing.status !== "Completed") listing.status = "Accepted";
      advancePassportByListing(d, m.listingId, "Accepted", "EcoPack");

      // Accepting creates a collection job for the municipality to assign.
      const hasTask = d.tasks.some((t) => t.listingId === m.listingId);
      if (!hasTask && listing?.status !== "Completed") {
        const passport = d.passports.find((p) => p.listingId === m.listingId);
        d.tasks.unshift({
          id: uid("task"),
          material: m.material,
          category: m.category,
          estimatedQuantity: m.quantity,
          actualQuantity: null,
          pickupArea: listing?.area ?? "Riverside",
          destination: "EcoPack facility",
          priority: "Normal",
          status: "Unassigned",
          collector: null,
          listingId: m.listingId,
          passportId: passport?.id,
          window: "Tomorrow, 10:00–12:00",
        });
      }
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
  // A journey only moves forward; never regress a passport (e.g. re-accepting).
  if (target <= JOURNEY_STAGES.indexOf(p.currentStage) && stage !== p.currentStage) return;
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
