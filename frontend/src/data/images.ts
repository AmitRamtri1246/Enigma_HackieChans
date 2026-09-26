/**
 * Centralized Image Catalog for TraceIQ
 *
 * All external image URLs and image metadata are defined here.
 * Do not scatter raw image URLs across components.
 *
 * Sourcing & License Notice:
 * Photography is sourced from Unsplash via its CDN, utilizing web-optimized
 * parameters (auto=format, fit=crop, responsive widths) for non-commercial demo
 * presentation.
 */

export interface ImageAsset {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
}

const buildUnsplashUrl = (photoId: string, width = 600, quality = 80): string =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=${quality}`;

export const IMAGES = {
  marketplace: {
    officeChair: {
      id: "mp-office-chair",
      url: buildUnsplashUrl("photo-1580481077195-c322b794125f", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1580481077195-c322b794125f", 140, 70),
      alt: "Black mesh ergonomic office chair with adjustable armrests",
      category: "Furniture",
    },
    bicycle: {
      id: "mp-bicycle",
      url: buildUnsplashUrl("photo-1485965120184-e220f721d03e", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1485965120184-e220f721d03e", 140, 70),
      alt: "Steel-frame city commuter bicycle leaning against a wall",
      category: "Metal",
    },
    books: {
      id: "mp-books",
      url: buildUnsplashUrl("photo-1512820790803-83ca734da794", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1512820790803-83ca734da794", 140, 70),
      alt: "Neat stack of hardcover and paperback books",
      category: "Cardboard",
    },
    desk: {
      id: "mp-desk",
      url: buildUnsplashUrl("photo-1518455027359-f3f8164ba6bd", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1518455027359-f3f8164ba6bd", 140, 70),
      alt: "Solid wood minimalist work desk with natural grain",
      category: "Furniture",
    },
    table: {
      id: "mp-table",
      url: buildUnsplashUrl("photo-1530018607912-eff2daa1bac4", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1530018607912-eff2daa1bac4", 140, 70),
      alt: "Four-person wooden dining table with simple legs",
      category: "Furniture",
    },
    lamp: {
      id: "mp-lamp",
      url: buildUnsplashUrl("photo-1507473885765-e6ed057f782c", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1507473885765-e6ed057f782c", 140, 70),
      alt: "Brushed brass architectural task desk lamp",
      category: "Electronics",
    },
    monitor: {
      id: "mp-monitor",
      url: buildUnsplashUrl("photo-1527443224154-c4a3942d3acf", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1527443224154-c4a3942d3acf", 140, 70),
      alt: "Slim bezel 24-inch widescreen computer monitor",
      category: "Electronics",
    },
    smallAppliance: {
      id: "mp-appliance",
      url: buildUnsplashUrl("photo-1570222094114-d054a817e56b", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1570222094114-d054a817e56b", 140, 70),
      alt: "Stainless steel electric water kettle on a counter",
      category: "Electronics",
    },
    cardboardBoxes: {
      id: "mp-boxes",
      url: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 140, 70),
      alt: "Stack of clean, flattened corrugated cardboard moving boxes",
      category: "Cardboard",
    },
    furniture: {
      id: "mp-furniture",
      url: buildUnsplashUrl("photo-1555041469-a586c61ea9bc", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1555041469-a586c61ea9bc", 140, 70),
      alt: "Modern upholstered olive-green accent armchair",
      category: "Furniture",
    },
    electronics: {
      id: "mp-electronics",
      url: buildUnsplashUrl("photo-1546868871-7041f2a55e12", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1546868871-7041f2a55e12", 140, 70),
      alt: "Compact desktop audio DAC and monitoring equipment",
      category: "Electronics",
    },
    sportsEquipment: {
      id: "mp-sports",
      url: buildUnsplashUrl("photo-1584735935682-2f2b69dff9d2", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1584735935682-2f2b69dff9d2", 140, 70),
      alt: "Pair of cast iron workout kettlebells on floor",
      category: "Metal",
    },
    householdItems: {
      id: "mp-household",
      url: buildUnsplashUrl("photo-1610701596007-11502861dcfa", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1610701596007-11502861dcfa", 140, 70),
      alt: "Ceramic stoneware bowls and tableware plates",
      category: "Glass",
    },
    plasticBottles: {
      id: "mp-plastic-bottles",
      url: buildUnsplashUrl("photo-1563861826100-9cb868fdbe1c", 600),
      thumbnailUrl: buildUnsplashUrl("photo-1563861826100-9cb868fdbe1c", 140, 70),
      alt: "Bundle of sorted clear PET plastic beverage bottles",
      category: "Plastic",
    },
  },

  materials: {
    plasticBottle: {
      id: "mat-plastic-bottle",
      name: "Plastic bottle",
      url: buildUnsplashUrl("photo-1563861826100-9cb868fdbe1c", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1563861826100-9cb868fdbe1c", 120, 70),
      alt: "Clear recyclable PET plastic beverage bottle",
      category: "Plastic",
      subtype: "PET Plastic",
      stream: "Dry Recyclable",
      confidence: 94,
      circularity: 91,
    },
    cardboard: {
      id: "mat-cardboard",
      name: "Cardboard boxes",
      url: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 120, 70),
      alt: "Corrugated cardboard packaging cartons",
      category: "Cardboard",
      subtype: "Corrugated cardboard",
      stream: "Dry Recyclable",
      confidence: 92,
      circularity: 88,
    },
    officeChair: {
      id: "mat-office-chair",
      name: "Office chair",
      url: buildUnsplashUrl("photo-1580481077195-c322b794125f", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1580481077195-c322b794125f", 120, 70),
      alt: "Ergonomic mesh office task chair",
      category: "Furniture",
      subtype: "Reusable furniture",
      stream: "Reusable",
      confidence: 89,
      circularity: 85,
    },
    electronics: {
      id: "mat-electronics",
      name: "Small electronics",
      url: buildUnsplashUrl("photo-1546868871-7041f2a55e12", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1546868871-7041f2a55e12", 120, 70),
      alt: "Circuit board and compact electronic hardware components",
      category: "Electronics",
      subtype: "E-waste / Hardware",
      stream: "Special Collection",
      confidence: 91,
      circularity: 76,
    },
    metalObject: {
      id: "mat-metal-object",
      name: "Metal object",
      url: buildUnsplashUrl("photo-1533090161767-e6ffed986c88", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1533090161767-e6ffed986c88", 120, 70),
      alt: "Recyclable aluminum and stainless steel components",
      category: "Metal",
      subtype: "Aluminum / Steel",
      stream: "Dry Recyclable",
      confidence: 87,
      circularity: 93,
    },
  },

  organizations: {
    ecoPack: {
      id: "org-ecopack",
      name: "EcoPack",
      monogram: "EP",
      color: "bg-emerald-600",
      accent: "text-emerald-700 dark:text-emerald-400",
      type: "Packaging & Upcycling",
      area: "Riverside",
    },
    greenCycle: {
      id: "org-greencycle",
      name: "GreenCycle",
      monogram: "GC",
      color: "bg-teal-600",
      accent: "text-teal-700 dark:text-teal-400",
      type: "Material Processing",
      area: "Old Town",
    },
    communityWorkshop: {
      id: "org-community-workshop",
      name: "Community Workshop",
      monogram: "CW",
      color: "bg-brand-forest",
      accent: "text-brand-sage",
      type: "Repair & Refurbishing",
      area: "Riverside",
    },
    reVoltRecyclers: {
      id: "org-revolt",
      name: "Re-Volt Recyclers",
      monogram: "RV",
      color: "bg-slate-700",
      accent: "text-slate-600 dark:text-slate-300",
      type: "E-Waste Specialist",
      area: "Harbor View",
    },
  },

  recyclers: {
    facility: {
      id: "rec-facility",
      url: buildUnsplashUrl("photo-1532996122724-e3c354a0b15b", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1532996122724-e3c354a0b15b", 120, 70),
      alt: "Municipal materials recovery facility sorting floor",
    },
    sorting: {
      id: "rec-sorting",
      url: buildUnsplashUrl("photo-1611284446314-60a58ac0deb9", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1611284446314-60a58ac0deb9", 120, 70),
      alt: "Automated conveyor line sorting recyclable commodities",
    },
    cardboard: {
      id: "rec-cardboard",
      url: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1530587191325-3db32d826c18", 120, 70),
      alt: "Baled and stacked corrugated cardboard awaiting pulping",
    },
    plastic: {
      id: "rec-plastic",
      url: buildUnsplashUrl("photo-1528323273322-d81458248d40", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1528323273322-d81458248d40", 120, 70),
      alt: "Clean recycled polymer flakes ready for remanufacturing",
    },
  },

  community: {
    workshop: {
      id: "comm-workshop",
      url: buildUnsplashUrl("photo-1581092160607-ee22621dd758", 500),
      thumbnailUrl: buildUnsplashUrl("photo-1581092160607-ee22621dd758", 120, 70),
      alt: "Shared maker workbench with restoration hand tools",
    },
  },

  hero: {
    subtleTexture: {
      id: "hero-texture",
      url: buildUnsplashUrl("photo-1518709268805-4e9042af9f23", 800),
      alt: "Subtle warm mineral slate texture",
    },
  },
} as const;

/**
 * Match a material name or category to its best marketplace image.
 */
export function getMarketplaceImage(keyOrMaterial?: string): ImageAsset {
  const norm = (keyOrMaterial ?? "").toLowerCase();

  if (norm.includes("chair")) return IMAGES.marketplace.officeChair;
  if (norm.includes("bicycle") || norm.includes("bike")) return IMAGES.marketplace.bicycle;
  if (norm.includes("book")) return IMAGES.marketplace.books;
  if (norm.includes("desk")) return IMAGES.marketplace.desk;
  if (norm.includes("table")) return IMAGES.marketplace.table;
  if (norm.includes("lamp") || norm.includes("light")) return IMAGES.marketplace.lamp;
  if (norm.includes("monitor") || norm.includes("screen")) return IMAGES.marketplace.monitor;
  if (norm.includes("kettle") || norm.includes("appliance")) return IMAGES.marketplace.smallAppliance;
  if (norm.includes("box") || norm.includes("cardboard")) return IMAGES.marketplace.cardboardBoxes;
  if (norm.includes("kettlebell") || norm.includes("sport") || norm.includes("dumbbell")) return IMAGES.marketplace.sportsEquipment;
  if (norm.includes("dish") || norm.includes("bowl") || norm.includes("ceramic") || norm.includes("pottery") || norm.includes("plate")) return IMAGES.marketplace.householdItems;
  if (norm.includes("bottle") || norm.includes("pet") || norm.includes("plastic")) return IMAGES.marketplace.plasticBottles;
  if (norm.includes("electronics") || norm.includes("audio") || norm.includes("gadget")) return IMAGES.marketplace.electronics;
  if (norm.includes("furniture") || norm.includes("shelf") || norm.includes("sofa")) return IMAGES.marketplace.furniture;

  // Generic fallback
  return IMAGES.marketplace.cardboardBoxes;
}

/**
 * Return thumbnail URL for a category or material name.
 */
export function getMaterialThumbnail(categoryOrMaterial?: string): string {
  return getMarketplaceImage(categoryOrMaterial).thumbnailUrl;
}
