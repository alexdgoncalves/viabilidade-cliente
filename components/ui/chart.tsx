"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip as RechartsTooltip,
  type TooltipProps as RechartsTooltipProps,
} from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

const ChartConfigContext = createContext<ChartConfig>({});

export type ChartContainerProps = {
  config: ChartConfig;
  className?: string;
  children: ReactNode;
};

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  const style = useMemo(() => {
    const entries = Object.entries(config ?? {});
    const customVars: Record<string, string> = {};
    entries.forEach(([key, value]) => {
      if (value?.color) {
        customVars[`--color-${key}`] = value.color;
      }
    });
    return customVars as CSSProperties;
  }, [config]);

  return (
    <ChartConfigContext.Provider value={config}>
      <div
        className={cn(
          "relative flex w-full flex-col rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4",
          className,
        )}
        style={style}
      >
        {children}
      </div>
    </ChartConfigContext.Provider>
  );
}

type ChartTooltipProps = RechartsTooltipProps<number, string> & {
  indicator?: "dot" | "line";
};

export function ChartTooltip({
  indicator = "dot",
  content,
  cursor,
  ...props
}: ChartTooltipProps) {
  return (
    <RechartsTooltip
      isAnimationActive
      cursor={
        cursor === undefined
          ? { strokeDasharray: "4 4", strokeOpacity: 0.3 }
          : cursor
      }
      content={
        content ?? <ChartTooltipContent indicator={indicator} />
      }
      {...props}
    />
  );
}

type ChartTooltipPayloadItem = {
  dataKey?: string | number;
  color?: string;
  value?: number | string;
};

type ChartTooltipContentProps = {
  indicator?: "dot" | "line";
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipPayloadItem[];
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const config = useContext(ChartConfigContext);

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="grid gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-xs shadow-lg">
      {label ? (
        <span className="font-semibold text-primary">{label}</span>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item) => {
          const dataKey = String(item.dataKey ?? "");
          const entry = config?.[dataKey];
          const color =
            item.color ??
            entry?.color ??
            "var(--text-primary)";
          return (
            <div
              key={dataKey}
              className="flex items-center gap-2 text-muted"
            >
              <span
                className={cn(
                  "block",
                  indicator === "line"
                    ? "h-px w-3"
                    : "h-2 w-2 rounded-full",
                )}
                style={{
                  backgroundColor:
                    indicator === "line" ? undefined : color,
                  borderColor: color,
                  borderWidth: indicator === "line" ? 1 : 0,
                }}
              />
              <span className="flex-1">
                {entry?.label ?? dataKey}
              </span>
              <span className="font-medium text-primary">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    })
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
