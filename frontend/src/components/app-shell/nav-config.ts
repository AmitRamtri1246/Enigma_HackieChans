import {
  Home,
  ScanLine,
  Repeat,
  Leaf,
  Users,
  Map,
  Package,
  FileText,
  Building2,
  Inbox,
  Sparkles,
  Truck,
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
  /** Short label shown in the top bar demo pill, e.g. "Citizen". */
  areaLabel: string;
  /** The route this role lands on (used by the role switcher). */
  home: string;
  /** Sidebar groups (desktop). */
  groups: NavGroup[];
  /** Primary destinations on the mobile bottom nav. */
  mobile: NavItem[];
}

const CITIZEN: RoleNav = {
  areaLabel: "Citizen",
  home: "/app",
  groups: [
    {
      heading: "Overview",
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
    { id: "impact", label: "Impact", icon: Leaf, path: "/impact" },
  ],
};

const ORGANIZATION: RoleNav = {
  areaLabel: "Organization",
  home: "/org",
  groups: [
    {
      heading: "Overview",
      items: [
        { id: "home", label: "Home", icon: Home, path: "/org" },
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
      heading: "Workspace",
      items: [
        { id: "needs", label: "Needs", icon: Inbox, path: "/org/needs" },
        { id: "matches", label: "Matches", icon: Sparkles, path: "/org/matches" },
        { id: "receipts", label: "Receipts", icon: Building2, path: "/org/receipts" },
      ],
    },
    {
      heading: "Management",
      items: [{ id: "passports", label: "Waste Passports", icon: FileText, path: "/passports" }],
    },
  ],
  mobile: [
    { id: "home", label: "Home", icon: Home, path: "/org" },
    { id: "needs", label: "Needs", icon: Inbox, path: "/org/needs" },
    { id: "matches", label: "Matches", icon: Sparkles, path: "/org/matches" },
    { id: "receipts", label: "Receipts", icon: Building2, path: "/org/receipts" },
  ],
};

const COLLECTOR: RoleNav = {
  areaLabel: "Collector",
  home: "/collector",
  groups: [
    {
      heading: "Workspace",
      items: [
        { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/collector" },
        { id: "history", label: "History", icon: History, path: "/collector?tab=history" },
      ],
    },
    {
      heading: "Community",
      items: [{ id: "circular-map", label: "Circular Map", icon: Map, path: "/map" }],
    },
  ],
  mobile: [
    { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/collector" },
    { id: "current", label: "Current", icon: Truck, path: "/collector" },
    { id: "circular-map", label: "Map", icon: Map, path: "/map" },
  ],
};

const MUNICIPALITY: RoleNav = {
  areaLabel: "Municipality",
  home: "/admin",
  groups: [
    {
      heading: "Overview",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin" },
      ],
    },
    {
      heading: "Workspace",
      items: [
        { id: "tasks", label: "Collection Tasks", icon: ClipboardList, path: "/admin/tasks" },
        { id: "bins", label: "Smart Bins", icon: Trash2, path: "/admin/bins" },
      ],
    },
    {
      heading: "Community",
      items: [{ id: "circular-map", label: "Circular Map", icon: Map, path: "/map" }],
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
