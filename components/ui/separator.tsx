'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    const { theme } = useTheme();
    const color = theme === "dark" ? "bg-slate-800" : "bg-slate-300";

    return (
      <div
        ref={ref}
        className={cn(
          color,
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
