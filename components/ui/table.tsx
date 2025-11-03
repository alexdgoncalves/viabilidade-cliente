'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();

  const headerClass =
    theme === "dark"
      ? "bg-[var(--table-header-bg)] text-slate-300"
      : "bg-[var(--table-header-bg)] text-slate-600";

  return (
    <thead
      ref={ref}
      className={cn(
        "text-xs uppercase tracking-wide",
        headerClass,
        className,
      )}
      {...props}
    />
  );
});
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const rowClass =
    theme === "dark"
      ? "border-b border-slate-800/70 hover:bg-slate-900/50"
      : "border-b border-slate-200 hover:bg-[var(--table-hover-bg)]";

  return (
    <tr
      ref={ref}
      className={cn("transition-colors", rowClass, className)}
      {...props}
    />
  );
});
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("px-4 py-3 text-left font-medium", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-middle", className)} {...props} />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
