import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { usePreviewRole } from "@/lib/use-preview-role";
import { ROLE_NAV, type NavItem } from "./nav-config";
import { RolePreviewSwitcher } from "./RolePreviewSwitcher";
import {
  Recycle,
  HelpCircle,
  Settings,
  Search,
  Bell,
  LogOut,
} from "lucide-react";

const BOTTOM_ITEMS: NavItem[] = [
  { id: "help", label: "Help", icon: HelpCircle, path: "/app" },
  { id: "settings", label: "Settings", icon: Settings, path: "/app" },
];

interface AppShellProps {
  /** The id of the currently active section (matches NavItem ids). */
  active: string;
  /**
   * Optional override for the top-bar area label. Defaults to the current
   * role's label (e.g. "Citizen"). Pages can append context if desired.
   */
  areaLabel?: string;
  /**
   * Called when a nav item is selected. Pages/router decide what to do.
   * If omitted, "home" navigates to /app and other items are placeholders.
   */
  onNavigate?: (id: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  active,
  areaLabel,
  onNavigate,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { role, setRole } = usePreviewRole();

  const nav = ROLE_NAV[role];
  const firstName = user?.full_name?.trim().split(" ")[0] ?? "there";
  const initials = getInitials(user?.full_name);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNav = (item: NavItem) => {
    if (onNavigate) {
      onNavigate(item.id);
      return;
    }
    navigate(item.path);
  };

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    navigate(ROLE_NAV[next].home);
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
      {/* ---------- Sidebar (desktop / tablet) ---------- */}
      <aside className="hidden md:flex md:w-16 lg:w-60 shrink-0 flex-col border-r border-border bg-card/40">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-4 lg:px-5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-forest text-brand-white">
            <Recycle className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="hidden lg:inline text-sm font-semibold tracking-tight text-foreground">
            TraceIQ
          </span>
        </div>

        {/* Nav groups (role-specific) */}
        <nav className="flex-1 overflow-y-auto px-2 lg:px-3 py-2" aria-label="Primary">
          {nav.groups.map((group, gi) => (
            <div key={group.heading ?? gi} className="mb-4">
              {group.heading && (
                <p className="hidden lg:block px-2.5 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.heading}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <SidebarLink
                      item={item}
                      active={item.id === active}
                      onSelect={() => handleNav(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: role preview + help / settings / profile */}
        <div className="border-t border-border px-2 lg:px-3 py-3">
          {/* Role preview switcher — full width on lg, hidden on collapsed rail */}
          <div className="hidden lg:block pb-2">
            <RolePreviewSwitcher role={role} onChange={handleRoleChange} variant="full" />
          </div>

          <ul className="space-y-0.5">
            {BOTTOM_ITEMS.map((item) => (
              <li key={item.id}>
                <SidebarLink item={item} active={false} onSelect={() => handleNav(item)} />
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-forest">
              {initials}
            </span>
            <div className="hidden lg:flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-foreground">
                {user?.full_name ?? "Guest"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user?.email ?? ""}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest text-brand-white">
              <Recycle className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>

          {/* Demo area label */}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-sage" aria-hidden="true" />
            {areaLabel ?? nav.areaLabel}
          </span>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <TopBarSearch />

            {/* Role preview — compact, in the top bar for quick demo switching */}
            <RolePreviewSwitcher role={role} onChange={handleRoleChange} variant="compact" />

            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-sage" aria-hidden="true" />
            </button>

            {/* Profile avatar (also acts as sign-out on mobile) */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={`${firstName}'s account — sign out`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-forest transition-colors duration-150 hover:bg-brand-soft/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      {/* ---------- Mobile bottom nav (role-specific) ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden"
        aria-label="Primary mobile"
      >
        {nav.mobile.map((item) => (
          <MobileNavButton
            key={item.id}
            item={item}
            active={item.id === active}
            /* Center-emphasise the primary create-ish action when present. */
            emphasize={role === "citizen" && item.id === "scan"}
            onSelect={() => handleNav(item)}
          />
        ))}
      </nav>
    </div>
  );
};

const SidebarLink: React.FC<{
  item: NavItem;
  active: boolean;
  onSelect: () => void;
}> = ({ item, active, onSelect }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "justify-center lg:justify-start",
        active
          ? "bg-brand-soft text-brand-forest font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          active ? "text-brand-sage" : "text-muted-foreground group-hover:text-foreground"
        )}
        strokeWidth={active ? 2.2 : 2}
      />
      <span className="hidden lg:inline truncate">{item.label}</span>
    </button>
  );
};

const MobileNavButton: React.FC<{
  item: NavItem;
  active: boolean;
  emphasize: boolean;
  onSelect: () => void;
}> = ({ item, active, emphasize, onSelect }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
        active ? "text-brand-forest" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full transition-colors duration-150",
          emphasize
            ? "h-11 w-11 -mt-5 bg-brand-forest text-brand-white shadow-sm"
            : cn("h-7 w-7", active && "bg-brand-soft text-brand-sage")
        )}
      >
        <Icon className={emphasize ? "h-5 w-5" : "h-[18px] w-[18px]"} strokeWidth={2} />
      </span>
      {item.label}
    </button>
  );
};

const TopBarSearch: React.FC = () => (
  <div className="relative hidden sm:block">
    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      placeholder="Search materials"
      aria-label="Search materials"
      className="h-9 w-36 rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-[width,box-shadow] duration-200 focus:w-48 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  </div>
);

function getInitials(fullName?: string): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
