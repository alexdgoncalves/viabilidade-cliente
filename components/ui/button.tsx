'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();

    const variantClass = (() => {
      switch (variant) {
        case "secondary":
          return theme === "dark"
            ? "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500"
            : "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400";
        case "outline":
          return theme === "dark"
            ? "border border-slate-700 text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-600"
            : "border border-slate-300 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400";
        case "ghost":
          return theme === "dark"
            ? "text-slate-200 hover:bg-slate-800/50 focus-visible:ring-slate-600"
            : "text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400";
        default:
          return theme === "dark"
            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 focus-visible:ring-emerald-300"
            : "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-300";
      }
    })();

    const ringOffset =
      theme === "dark"
        ? "focus-visible:ring-offset-slate-950"
        : "focus-visible:ring-offset-white";

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          ringOffset,
          variantClass,
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
