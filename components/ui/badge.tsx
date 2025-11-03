'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { theme } = useTheme();

    const styleClass = (() => {
      switch (variant) {
        case "success":
          return theme === "dark"
            ? "bg-emerald-500/20 text-emerald-200"
            : "bg-green-100 text-green-700";
        case "warning":
          return theme === "dark"
            ? "bg-amber-500/20 text-amber-200"
            : "bg-amber-100 text-amber-700";
        case "destructive":
          return theme === "dark"
            ? "bg-rose-500/20 text-rose-200"
            : "bg-rose-100 text-rose-700";
        case "outline":
          return theme === "dark"
            ? "border border-slate-700 text-slate-200"
            : "border border-slate-300 text-slate-700";
        default:
          return theme === "dark"
            ? "bg-slate-800 text-slate-100"
            : "bg-slate-200 text-slate-900";
      }
    })();

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide transition-colors",
          styleClass,
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge };
