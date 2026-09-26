/**
 * Listings API service — wraps POST/GET/PATCH /api/listings.
 *
 * Each listing persists to MongoDB with a Unsplash imageUrl derived from
 * the item's category/title so both Exchange and Listing pages render
 * real photography instead of category icons.
 *
 * NOTE: the mock circularity-service remains the primary demo data source.
 * This service is used when creating a real authenticated listing or when
 * fetching the authenticated user's listings from the backend.
 */

import { apiRequest } from "./api";
import { getMarketplaceImage } from "@/data/images";
import type { ExchangeType, ItemCondition, MaterialCategory } from "./domain";

/* ─────────────────────────── Types ──────────────────────────────── */

export interface ListingPayload {
  title: string;
  material: string;
  category: MaterialCategory;
  description?: string;
  condition: ItemCondition;
  weight: string;
  quantity?: string;
  exchange_type: ExchangeType;
  area?: string;
  /** Caller can supply an explicit image URL (e.g. from a scan).
   *  If absent we derive it from category/title via IMAGES catalog. */
  image_url?: string;
  image_alt?: string;
  price?: string;
  price_amount?: number;
  community_id?: string;
}

export interface BackendListing {
  id: string;
  user_id: string;
  owner: string;
  title: string;
  material: string;
  category: string;
  description: string;
  condition: string;
  weight: string;
  quantity: string;
  exchange_type: string;
  area: string;
  status: string;
  match_percent: number | null;
  image_url: string | null;
  image_alt: string | null;
  price: string | null;
  price_amount: number | null;
  community_id: string | null;
  passport_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ListingPatch = Partial<
  Pick<
    BackendListing,
    | "title"
    | "material"
    | "category"
    | "description"
    | "condition"
    | "weight"
    | "quantity"
    | "exchange_type"
    | "area"
    | "status"
    | "match_percent"
    | "image_url"
    | "image_alt"
    | "price"
    | "price_amount"
    | "community_id"
    | "passport_id"
  >
>;

/* ─────────────────────── Image resolution ─────────────────────── */

/**
 * Resolve an Unsplash image for a listing based on its title + category.
 * Returns { image_url, image_alt } so callers can include it in the payload.
 */
export function resolveListingImage(
  titleOrMaterial: string,
  category: MaterialCategory
): { image_url: string; image_alt: string } {
  // Try to match by title first (more specific), fall back to category.
  const asset = getMarketplaceImage(titleOrMaterial) ?? getMarketplaceImage(category);
  return {
    image_url: asset.url,
    image_alt: asset.alt,
  };
}

/* ─────────────────────── API calls ──────────────────────────────── */

/**
 * POST /api/listings — create a new listing.
 * Auto-derives an Unsplash image if image_url is not provided.
 */
export async function createBackendListing(
  payload: ListingPayload
): Promise<BackendListing> {
  const imageFields =
    payload.image_url
      ? { image_url: payload.image_url, image_alt: payload.image_alt ?? "" }
      : resolveListingImage(payload.title, payload.category);

  return apiRequest<BackendListing>("/api/listings", {
    method: "POST",
    body: JSON.stringify({ ...payload, ...imageFields }),
  });
}

/**
 * GET /api/listings — fetch the authenticated user's listings.
 */
export async function fetchMyListings(): Promise<BackendListing[]> {
  return apiRequest<BackendListing[]>("/api/listings");
}

/**
 * GET /api/listings/:id — fetch a single listing.
 */
export async function fetchListing(id: string): Promise<BackendListing> {
  return apiRequest<BackendListing>(`/api/listings/${id}`);
}

/**
 * PATCH /api/listings/:id — partially update a listing.
 */
export async function patchListing(
  id: string,
  patch: ListingPatch
): Promise<BackendListing> {
  return apiRequest<BackendListing>(`/api/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
