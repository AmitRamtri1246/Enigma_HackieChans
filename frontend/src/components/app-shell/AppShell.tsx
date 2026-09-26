import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCircularity } from "@/contexts/CircularityContext";
import { useToast } from "@/components/common/ToastProvider";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePreviewRole } from "@/lib/use-preview-role";
import { useAsync } from "@/lib/use-async";
import { circularityService } from "@/lib/circularity-service";
import { ROLE_NAV, navLabel, type NavItem } from "./nav-config";
import { RolePreviewSwitcher } from "./RolePreviewSwitcher";
import { Bell, LogOut, PanelLeft, Recycle, RotateCcw, Search } from "lucide-react";

const COLLAPSE_KEY = "traceiq.sidebarCollapsed";

interface AppShellProps {
  /** Id of the active nav item (matches NavItem ids in nav-config). */
  active: string;
  /** Top-bar page title. Defaults to the active nav item's label. */
  title?: string;
  children: React.ReactNode;
}

/**
 * Authenticated application shell.
 * - lg+: 232px sidebar, collapsible to an icon rail
 * - md:  icon rail with tooltips
 * - <md: top bar + role-specific bottom navigation
 */
export const AppShell: React.FC<AppShellProps> = ({ active, title, children }) => {
  const { user, logout } = useAuth();
  const { reset } = useCircularity();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role, setRole } = usePreviewRole();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const nav = ROLE_NAV[role];
  const pageTitle = title ?? navLabel(role, active) ?? nav.areaLabel;
  const initials = getInitials(user?.full_name);

  useEffect(() => {
    document.title = `${pageTitle} · TraceIQ`;
  }, [pageTitle]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      } catch {
        // non-critical
      }
      return !v;
    });
  };

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    navigate(ROLE_NAV[next].home);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleReset = () => {
    reset();
    setConfirmReset(false);
    toast("Demo data reset to its starting state.");
    navigate(nav.home);
  };

  /** Label classes: visible only on lg when expanded; always available to AT. */
  const labelCls = collapsed ? "sr-only" : "sr-only lg:not-sr-only lg:truncate";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* ------------------------------ Sidebar ------------------------------ */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-[#F2F4F0] transition-[width] duration-200 md:flex",
          collapsed ? "md:w-16" : "md:w-16 lg:w-[232px]"
        )}
      >
        <div className={cn("flex h-14 items-center gap-2.5 px-4", !collapsed && "lg:px-5")}>
          <Link
            to={nav.home}
            aria-label="TraceIQ home"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-forest text-brand-white">
              <Recycle className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className={cn("text-[15px] font-semibold tracking-tight", labelCls)}>TraceIQ</span>
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className={cn(
              "ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              collapsed ? "lg:hidden" : "lg:inline-flex"
            )}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* No overflow clipping here: rail tooltips extend past the sidebar edge. */}
        <nav className="flex-1 px-3 pb-4 pt-2" aria-label="Primary">
          {nav.groups.map((group, gi) => (
            <div key={group.heading ?? gi} className={cn(gi > 0 && "mt-6")}>
              {group.heading && (
                <p className={cn("mb-1 px-2.5 text-xs font-medium text-muted-foreground/80", collapsed ? "sr-only" : "sr-only lg:not-sr-only lg:block")}>
                  {group.heading}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Tooltip content={item.label} bubbleClassName={collapsed ? undefined : "lg:hidden"}>
                      <SidebarLink item={item} active={item.id === active} labelCls={labelCls} collapsed={collapsed} />
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          {collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              className="mb-1 hidden h-9 w-full items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:flex"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          <Tooltip content="Reset demo data" bubbleClassName={collapsed ? undefined : "lg:hidden"}>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                !collapsed && "lg:justify-start"
              )}
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span className={labelCls}>Reset demo data</span>
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* ---------------------------- Main column ---------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
          <Link
            to={nav.home}
            aria-label="TraceIQ home"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-forest text-brand-white md:hidden"
          >
            <Recycle className="h-4 w-4" strokeWidth={2} />
          </Link>

          <p className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{nav.areaLabel}</span>
            <span className="hidden text-border sm:inline" aria-hidden="true">/</span>
            <span className="truncate font-medium text-foreground">{pageTitle}</span>
          </p>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <TopBarSearch />
            <RolePreviewSwitcher role={role} onChange={handleRoleChange} />
            <Notifications />
            <DropdownMenu
              label="Account"
              trigger={({ ref, ...props }) => (
                <button
                  ref={ref}
                  type="button"
                  {...props}
                  aria-label="Account menu"
                  className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-forest transition-shadow duration-150 hover:ring-2 hover:ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {initials}
                </button>
              )}
            >
              <DropdownMenuLabel>
                <span className="block truncate text-sm font-medium text-foreground">{user?.full_name ?? "Guest"}</span>
                <span className="block truncate">{user?.email ?? ""}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={RotateCcw} onSelect={() => setConfirmReset(true)}>
                Reset demo data
              </DropdownMenuItem>
              <DropdownMenuItem icon={LogOut} onSelect={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </header>

        <main id="main" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* --------------------------- Mobile bottom nav --------------------------- */}
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {nav.mobile.map((item) => (
          <MobileNavButton
            key={item.id}
            item={item}
            active={item.id === active}
            emphasize={role === "citizen" && item.id === "scan"}
          />
        ))}
      </nav>

      <ConfirmationDialog
        open={confirmReset}
        title="Reset demo data?"
        description="Listings, matches, tasks and passports return to their seeded state. Your account is not affected."
        confirmLabel="Reset data"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

/* ================================ Pieces ================================ */

const SidebarLink: React.FC<{ item: NavItem; active: boolean; labelCls: string; collapsed: boolean }> = ({
  item,
  active,
  labelCls,
  collapsed,
}) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 w-full items-center justify-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        !collapsed && "lg:justify-start",
        active
          ? "bg-card font-medium text-foreground shadow-[0_1px_2px_rgba(14,21,19,0.06)] ring-1 ring-border"
          : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-sage" : "")} strokeWidth={2} />
      <span className={labelCls}>{item.label}</span>
    </Link>
  );
};

const MobileNavButton: React.FC<{ item: NavItem; active: boolean; emphasize: boolean }> = ({ item, active, emphasize }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
        active ? "text-brand-forest" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full transition-colors duration-150",
          emphasize ? "h-9 w-9 bg-brand-forest text-brand-white" : "h-6 w-6"
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

/** Top-bar search: submits to the Exchange with a query. "/" focuses it. */
const TopBarSearch: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      ref.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      className="relative hidden lg:block"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(q.trim() ? `/exchange?q=${encodeURIComponent(q.trim())}` : "/exchange");
      }}
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search materials"
        aria-label="Search materials"
        className="h-9 w-56 rounded-md border border-input bg-card pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground" aria-hidden="true">
        /
      </kbd>
    </form>
  );
};

/** Notifications: the latest community events, not a fake unread counter. */
const Notifications: React.FC = () => {
  const activity = useAsync(() => circularityService.getCommunityActivity());
  const navigate = useNavigate();
  const items = (activity.data ?? []).slice(0, 4);

  return (
    <DropdownMenu
      label="Notifications"
      className="w-80"
      trigger={({ ref, ...props }) => (
        <button
          ref={ref}
          type="button"
          {...props}
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
      )}
    >
      <DropdownMenuLabel className="text-sm font-medium text-foreground">Recent activity</DropdownMenuLabel>
      {items.length === 0 ? (
        <p className="px-2.5 pb-3 text-sm text-muted-foreground">You're all caught up.</p>
      ) : (
        items.map((a) => (
          <DropdownMenuItem key={a.id} onSelect={() => navigate("/community")}>
            <span className="min-w-0 flex-1">
              <span className="block truncate">
                <span className="font-medium">{a.actor}</span>{" "}
                <span className="text-muted-foreground">{a.kind === "request" ? "is looking for" : a.kind === "offer" ? "offered" : a.kind === "reused" ? "reused" : "joined"}</span>{" "}
                {a.material}
              </span>
              <span className="block text-xs text-muted-foreground">{a.when}</span>
            </span>
          </DropdownMenuItem>
        ))
      )}
    </DropdownMenu>
  );
};

function getInitials(fullName?: string): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
