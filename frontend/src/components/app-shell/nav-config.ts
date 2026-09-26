import {
  Home,
  ScanLine,
  Repeat,
  Leaf,
  Users,
  Map,
  Package,
  FileText,
  Inbox,
  Sparkles,
  ClipboardCheck,
  ClipboardList,
  History,
  LayoutDashboard,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { TraceRole } from "@/lib/onboarding";

/** A single navigable item in the shell. */
export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Route path this item navigates to. */
  path: string;
}

/** A titled group of nav items in the sidebar. */
export interface NavGroup {
  heading?: string;
  items: NavItem[];
}

/** Full navigation description for one role. */
export interface RoleNav {
  /** Role name shown before the page title in the top bar. */
  areaLabel: string;
  /** The route this role lands on (used by the role switcher). */
  home: string;
  /** Sidebar groups (desktop). */
  groups: NavGroup[];
  /** Primary destinations on the mobile bottom nav (3–4 max). */
  mobile: NavItem[];
}

const CITIZEN: RoleNav = {
  areaLabel: "Citizen",
  home: "/app",
  groups: [
    {
      items: [
        { id: "home", label: "Home", icon: Home, path: "/app" },
        { id: "scan", label: "Scan", icon: ScanLine, path: "/scan" },
        { id: "exchange", label: "Exchange", icon: Repeat, path: "/exchange" },
        { id: "impact", label: "Impact", icon: Leaf, path: "/impact" },
      ],
    },
    {
      heading: "Community",
      items: [
        { id: "community", label: "Community", icon: Users, path: "/community" },
        { id: "circular-map", label: "Circular Map", icon: Map, path: "/map" },
      ],
    },
    {
      heading: "Management",
      items: [
        { id: "listings", label: "My Listings", icon: Package, path: "/listings" },
        { id: "passports", label: "Waste Passports", icon: FileText, path: "/passports" },
      ],
    },
  ],
  mobile: [
    { id: "home", label: "Home", icon: Home, path: "/app" },
    { id: "exchange", label: "Exchange", icon: Repeat, path: "/exchange" },
    { id: "scan", label: "Scan", icon: ScanLine, path: "/scan" },
    { id: "listings", label: "Listings", icon: Package, path: "/listings" },
    { id: "impact", label: "Impact", icon: Leaf, path: "/impact" },
  ],
};

const ORGANIZATION: RoleNav = {
  areaLabel: "EcoPack",
  home: "/org",
  groups: [
    {
      items: [
        { id: "home", label: "Home", icon: Home, path: "/org" },
        { id: "needs", label: "Material Needs", icon: Inbox, path: "/org/needs" },
        { id: "matches", label: "Matches", icon: Sparkles, path: "/org/matches" },
        { id: "receipts", label: "Receipts", icon: ClipboardCheck, path: "/org/receipts" },
      ],
    },
    {
      heading: "Community",
      items: [
        { id: "community", label: "Community", icon: Users, path: "/community" },
        { id: "circular-map", label: "Circular Map", icon: Map, path: "/map" },
      ],
    },
    {
      heading: "Records",
      items: [
        { id: "passports", label: "Waste Passports", icon: FileText, path: "/passports" },
        { id: "impact", label: "Impact", icon: Leaf, path: "/impact" },
      ],
    },
  ],
  mobile: [
    { id: "home", label: "Home", icon: Home, path: "/org" },
    { id: "needs", label: "Needs", icon: Inbox, path: "/org/needs" },
    { id: "matches", label: "Matches", icon: Sparkles, path: "/org/matches" },
    { id: "receipts", label: "Receipts", icon: ClipboardCheck, path: "/org/receipts" },
  ],
};

const COLLECTOR: RoleNav = {
  areaLabel: "Collector",
  home: "/collector",
  groups: [
    {
      items: [
        { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/collector" },
        { id: "history", label: "Delivered", icon: History, path: "/collector?tab=delivered" },
      ],
    },
    {
      heading: "Community",
      items: [{ id: "circular-map", label: "Circular Map", icon: Map, path: "/map" }],
    },
  ],
  mobile: [
    { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/collector" },
    { id: "history", label: "Delivered", icon: History, path: "/collector?tab=delivered" },
    { id: "circular-map", label: "Map", icon: Map, path: "/map" },
  ],
};

const MUNICIPALITY: RoleNav = {
  areaLabel: "Riverside",
  home: "/admin",
  groups: [
    {
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin" },
        { id: "tasks", label: "Collection Tasks", icon: ClipboardList, path: "/admin/tasks" },
        { id: "bins", label: "Smart Bins", icon: Trash2, path: "/admin/bins" },
      ],
    },
    {
      heading: "Community",
      items: [
        { id: "circular-map", label: "Circular Map", icon: Map, path: "/map" },
        { id: "passports", label: "Waste Passports", icon: FileText, path: "/passports" },
      ],
    },
  ],
  mobile: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin" },
    { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/admin/tasks" },
    { id: "bins", label: "Bins", icon: Trash2, path: "/admin/bins" },
    { id: "circular-map", label: "Map", icon: Map, path: "/map" },
  ],
};

export const ROLE_NAV: Record<TraceRole, RoleNav> = {
  citizen: CITIZEN,
  organization: ORGANIZATION,
  collector: COLLECTOR,
  municipality: MUNICIPALITY,
};

/** Find the label of a nav item for the current role (used for the top-bar title). */
export function navLabel(role: TraceRole, id: string): string | undefined {
  for (const g of ROLE_NAV[role].groups) {
    const hit = g.items.find((i) => i.id === id);
    if (hit) return hit.label;
  }
  return undefined;
}
