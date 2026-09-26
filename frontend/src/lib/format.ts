import type { ExchangeType } from "./domain";

/** "26 Sep" style short date. Empty string for invalid input. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Whole days since an ISO date (0 for today). */
export function daysSince(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

/** Human "listed" age: "Today", "1 day", "4 days". */
export function listedAge(iso: string): string {
  const n = daysSince(iso);
  if (n === 0) return "Today";
  return `${n} ${n === 1 ? "day" : "days"}`;
}

/** How an item changes hands, phrased as the "price" line of a listing. */
export const OFFER_LABEL: Record<ExchangeType, string> = {
  sell: "For sale",
  exchange: "Swap",
  donation: "Free",
  repair: "Repair",
  recycle: "Recycle",
  pickup: "Free pickup",
};

export const EXCHANGE_TYPE_LABEL: Record<ExchangeType, string> = {
  sell: "Sale",
  exchange: "Exchange",
  donation: "Donation",
  repair: "Repair",
  recycle: "Recycling",
  pickup: "Pickup",
};

/** Parse "1.8 km" → 1.8 (Infinity when unknown). */
export function parseKm(distance: string): number {
  const n = parseFloat(distance);
  return Number.isFinite(n) ? n : Infinity;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Progress tone for a bin fill level: ≥85% problem, ≥60% watch, else normal. */
export function binTone(fill: number): "default" | "warning" | "danger" {
  if (fill >= 85) return "danger";
  if (fill >= 60) return "warning";
  return "default";
}
