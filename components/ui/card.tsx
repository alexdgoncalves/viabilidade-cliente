'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  const { theme } = useTheme();
  const base =
    theme === "dark"
      ? "border-slate-800/60 bg-slate-900/30 text-slate-100"
      : "border-slate-200 bg-white text-slate-900";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-colors",
        base,
        className,
      )}
      {...props}
    />
  );
}

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: CardHeaderProps) {
  const { theme } = useTheme();
  const titleColor = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const subtitleColor = theme === "dark" ? "text-slate-500" : "text-slate-500";

  return (
    <div className={cn("mb-3 flex items-start justify-between gap-2", className)}>
      <div>
        <h3 className={cn("text-sm font-semibold", titleColor)}>{title}</h3>
        {subtitle ? (
          <p className={cn("text-xs", subtitleColor)}>{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("", className)} {...props} />;
}
