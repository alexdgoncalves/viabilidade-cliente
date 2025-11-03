'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const { theme } = useTheme();
    const clamped = Math.min(100, Math.max(0, value));
    const trackClass =
      theme === "dark" ? "bg-slate-800" : "bg-slate-200";
    const barColor =
      theme === "dark" ? "#22c55e" : "#2563eb";

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full transition-colors",
          trackClass,
          className,
        )}
        {...props}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: barColor }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
