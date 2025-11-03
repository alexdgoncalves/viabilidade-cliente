'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FaturamentoData } from "@/lib/types";
import { useTheme } from "@/context/theme-context";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

type Props = {
  faturamento: FaturamentoData;
};

type HistoricoPonto = {
  mes: string;
  valor: number;
};

export default function FaturamentoCard({ faturamento }: Props) {
  const { theme } = useTheme();
  const primaryText = theme === "dark" ? "text-slate-50" : "text-slate-900";
  const mutedText = theme === "dark" ? "text-slate-500" : "text-slate-600";
  const chartColor =
    theme === "dark" ? "hsl(193 95% 68%)" : "hsl(199 89% 48%)";

  const dados = useMemo<HistoricoPonto[]>(() => {
    if (faturamento.historico?.length) {
      return faturamento.historico;
    }
    return [
      { mes: "Atual", valor: faturamento.totalAtual },
      { mes: "Meta", valor: Math.round(faturamento.totalAtual * 1.05) },
    ];
  }, [faturamento.historico, faturamento.totalAtual]);

  const tendencia = useMemo(() => {
    if (dados.length < 2) {
      return 0;
    }
    const penultimo = dados[dados.length - 2].valor || 0;
    if (penultimo === 0) {
      return 0;
    }
    const ultimo = dados[dados.length - 1].valor || 0;
    return ((ultimo - penultimo) / penultimo) * 100;
  }, [dados]);

  return (
    <Card>
      <CardHeader
        title="Faturamento mensal"
        subtitle="Historico recente e meta do periodo"
      />
      <CardContent className="space-y-4">
        <div>
          <p className={`text-2xl font-semibold ${primaryText}`}>
            R$ {faturamento.totalAtual.toLocaleString("pt-BR")}
          </p>
          <p className={`mt-1 text-xs ${mutedText}`}>
            media 6 meses: R$ {faturamento.media6m.toLocaleString("pt-BR")}
          </p>
        </div>

        <ChartContainer
          config={{
            valor: {
              label: "Faturamento",
              color: chartColor,
            },
          }}
          className="border-none bg-transparent p-0"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dados}>
              <defs>
                <linearGradient id="faturamentoArea" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-valor)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-valor)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="mes"
                stroke="var(--text-muted)"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="var(--color-valor)"
                strokeWidth={2}
                fill="url(#faturamentoArea)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="flex items-center justify-between text-xs">
          <div className="space-y-1">
            <p className={`font-medium ${primaryText}`}>Meta do periodo</p>
            <p className={`text-[11px] ${mutedText}`}>
              {faturamento.percentualMeta}% da meta mensal atingida
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-right">
            <p className={`text-xs font-semibold ${primaryText}`}>
              {tendencia >= 0 ? "+" : "-"}
              {Math.abs(tendencia).toFixed(1)}%
            </p>
            <p className={`text-[10px] uppercase tracking-wide ${mutedText}`}>
              vs mes anterior
            </p>
          </div>
        </div>

        <div>
          <Progress value={faturamento.percentualMeta} />
        </div>
      </CardContent>
    </Card>
  );
}
