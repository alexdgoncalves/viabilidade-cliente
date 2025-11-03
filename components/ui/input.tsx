'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    const { theme } = useTheme();
    const styleClass =
      theme === "dark"
        ? "border-slate-800 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus-visible:ring-emerald-400 focus-visible:ring-offset-slate-950"
        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-blue-200 focus-visible:ring-offset-white";

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          styleClass,
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
