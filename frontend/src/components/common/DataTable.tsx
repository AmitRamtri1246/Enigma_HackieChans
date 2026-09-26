import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Extra classes for both th and td (e.g. widths). */
  className?: string;
  align?: "left" | "right";
  /**
   * How the column appears in the stacked mobile layout:
   * primary  → the row title (only one)
   * meta     → joined into the secondary line
   * trailing → right side (status or action)
   * hidden   → omitted on mobile
   */
  mobile?: "primary" | "meta" | "trailing" | "hidden";
  /** Visually hide the header text (e.g. an actions column). */
  hideHeader?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** When provided, rows navigate to this path. The primary cell becomes a link. */
  rowHref?: (row: T) => string | undefined;
  /** Accessible table caption. */
  label: string;
}

const INTERACTIVE = "a, button, input, select, textarea, [role='menu'], [role='menuitem']";

/**
 * Compare-records table. Compact rows, hairline borders, hover state.
 * Below `md` it becomes stacked rows so nothing scrolls horizontally.
 */
export function DataTable<T>({ columns, rows, rowKey, rowHref, label }: DataTableProps<T>) {
  const navigate = useNavigate();
  const primary = columns.find((c) => c.mobile === "primary") ?? columns[0];
  const meta = columns.filter((c) => c !== primary && (c.mobile ?? "meta") === "meta");
  const trailing = columns.filter((c) => c.mobile === "trailing");

  const renderPrimary = (row: T, stretch: boolean) => {
    const href = rowHref?.(row);
    const content = primary.cell(row);
    if (!href) return content;
    return (
      <Link
        to={href}
        className={cn(
          "rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          stretch && "after:absolute after:inset-0 after:content-['']"
        )}
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">{label}</caption>
          <TableHeader>
            <tr>
              {columns.map((c) => (
                <TableHead key={c.id} className={cn(c.align === "right" && "text-right", c.className)}>
                  <span className={cn(c.hideHeader && "sr-only")}>{c.header}</span>
                </TableHead>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <TableRow
                  key={rowKey(row)}
                  className={cn(href && "cursor-pointer")}
                  onClick={(e) => {
                    if (!href) return;
                    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
                    navigate(href);
                  }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.id} className={cn(c.align === "right" && "text-right", c.className)}>
                      {c === primary ? renderPrimary(row, false) : c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked rows */}
      <ul aria-label={label} className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border bg-card md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="relative flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 active:bg-secondary/50">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{renderPrimary(row, true)}</div>
              {meta.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
                  {meta.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && <span aria-hidden="true">·</span>}
                      <span>{c.cell(row)}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            {trailing.length > 0 && (
              <div className="relative z-10 flex shrink-0 items-center gap-2">
                {trailing.map((c) => (
                  <React.Fragment key={c.id}>{c.cell(row)}</React.Fragment>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
