'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { theme } = useTheme();

    const styleClass = (() => {
      switch (variant) {
        case "success":
          return theme === "dark"
            ? "border border-emerald-500/40 bg-[var(--success-bg)] text-[var(--success-text)]"
            : "border border-green-200 bg-green-50 text-green-700";
        case "warning":
          return theme === "dark"
            ? "border border-amber-500/40 bg-[var(--warning-bg)] text-[var(--warning-text)]"
            : "border border-amber-200 bg-amber-50 text-amber-700";
        case "destructive":
          return theme === "dark"
            ? "border border-rose-500/40 bg-[var(--danger-bg)] text-[var(--danger-text)]"
            : "border border-rose-200 bg-rose-50 text-rose-700";
        default:
          return theme === "dark"
            ? "border border-slate-800 bg-slate-900/40 text-slate-200"
            : "border border-slate-200 bg-white text-slate-800";
      }
    })();

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex w-full flex-col gap-1.5 rounded-lg px-4 py-3 text-sm transition-colors",
          styleClass,
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("text-sm font-semibold text-current", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed text-current/90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
