'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme();
    const styleClass =
      theme === "dark"
        ? "text-slate-400"
        : "text-slate-600";

    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          styleClass,
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";

export { Label };
