import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuContextValue {
  close: () => void;
}
const MenuContext = React.createContext<MenuContextValue | null>(null);

interface TriggerProps {
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  ref: React.Ref<HTMLButtonElement>;
}

interface DropdownMenuProps {
  /** Render the trigger button; spread the provided props onto it. */
  trigger: (props: TriggerProps) => React.ReactNode;
  align?: "start" | "end";
  side?: "bottom" | "top";
  /** Accessible name for the menu. */
  label: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Lightweight shadcn-style dropdown menu: click/Enter/ArrowDown opens, arrow
 * keys move between items, Escape closes and returns focus to the trigger.
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  align = "end",
  side = "bottom",
  label,
  className,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": menuId,
        onClick: () => setOpen((v) => !v),
        onKeyDown: (e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        },
        ref: triggerRef,
      })}
      {open && (
        <MenuContext.Provider value={{ close: () => close() }}>
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            className={cn(
              "absolute z-50 min-w-[14rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-[0_12px_32px_-12px_rgba(14,21,19,0.22)] motion-safe:animate-fadeIn",
              align === "end" ? "right-0" : "left-0",
              side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
              className
            )}
          >
            {children}
          </div>
        </MenuContext.Provider>
      )}
    </div>
  );
};

const itemClass =
  "flex w-full cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground outline-none transition-colors duration-150 hover:bg-secondary focus-visible:bg-secondary";

export const DropdownMenuItem: React.FC<{
  onSelect: () => void;
  destructive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ onSelect, destructive, icon: Icon, children }) => {
  const ctx = React.useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => {
        ctx?.close();
        onSelect();
      }}
      className={cn(itemClass, destructive && "text-[#A4463B]")}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      {children}
    </button>
  );
};

export const DropdownMenuRadioItem: React.FC<{
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ checked, onSelect, children }) => {
  const ctx = React.useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      onClick={() => {
        ctx?.close();
        onSelect();
      }}
      className={cn(itemClass, "justify-between", checked && "font-medium")}
    >
      {children}
      {checked && <Check className="h-4 w-4 text-brand-sage" />}
    </button>
  );
};

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("px-2.5 pb-1.5 pt-2 text-xs text-muted-foreground", className)}>{children}</div>
);

export const DropdownMenuSeparator: React.FC = () => <div role="separator" className="-mx-1 my-1 h-px bg-border" />;
