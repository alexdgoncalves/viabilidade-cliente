'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BomPagadorData, BureauData, FaturamentoData } from "@/lib/types";
import { useTheme } from "@/context/theme-context";

type Props = {
  bureau: BureauData;
  faturamento: FaturamentoData;
  bomPagador: BomPagadorData;
};

function calculateLoanRange(
  bureau: BureauData,
  faturamento: FaturamentoData,
  bomPagador: BomPagadorData,
): { faixa: "P" | "M" | "G" | "RECUSADO"; motivo: string[] } {
  const motivos: string[] = [];

  const percentual = bomPagador.percentualPago * 100;
  if (percentual < 50) {
    motivos.push("Percentual pago < 50% -> recusado pelo Bom Pagador");
    return { faixa: "RECUSADO", motivo: motivos };
  }

  let faixa: "P" | "M" | "G" | null = null;

  if (bureau.score > 800 && faturamento.totalAtual > 1_000_000) {
    faixa = "G";
    motivos.push("Score > 800 e faturamento > 1.000.000");
  } else if (bureau.score > 600 && faturamento.totalAtual > 100_000) {
    faixa = "M";
    motivos.push("Score > 600 e faturamento > 100.000");
  } else if (bureau.score > 400 && faturamento.totalAtual > 10_000) {
    faixa = "P";
    motivos.push("Score > 400 e faturamento > 10.000");
  } else {
    motivos.push("Nao atingiu criterios minimos de P");
    return { faixa: "RECUSADO", motivo: motivos };
  }

  if (percentual >= 90 && faixa !== "G") {
    motivos.push("Percentual pago >= 90% -> upgrade automatico");
    faixa = faixa === "P" ? "M" : "G";
  } else {
    motivos.push(`Percentual pago = ${percentual.toFixed(0)}%`);
  }

  return { faixa, motivo: motivos };
}

export default function LoanSuggestion({
  bureau,
  faturamento,
  bomPagador,
}: Props) {
  const { theme } = useTheme();
  const resultado = calculateLoanRange(bureau, faturamento, bomPagador);

  const cardClass =
    theme === "dark"
      ? "border-emerald-500/20 bg-slate-900/10"
      : "border-blue-200 bg-white";

  const badgeColor =
    resultado.faixa === "RECUSADO"
      ? theme === "dark"
        ? "text-rose-300"
        : "text-rose-600"
      : theme === "dark"
        ? "text-emerald-300"
        : "text-green-600";

  const bubbleClass =
    theme === "dark" ? "bg-slate-950/40" : "bg-blue-50 border border-blue-100";

  const listColor = theme === "dark" ? "text-slate-200" : "text-slate-700";
  const dotColor = theme === "dark" ? "bg-emerald-400" : "bg-blue-500";

  return (
    <Card className={cardClass}>
      <CardHeader
        title="Recomendacao de emprestimo"
        subtitle="Calculo feito com base nos 3 sistemas"
      />
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`rounded-lg px-3 py-2 ${bubbleClass}`}>
            <p className="text-xs text-muted">Faixa sugerida</p>
            <p className={`text-3xl font-bold tracking-tight ${badgeColor}`}>
              {resultado.faixa}
            </p>
          </div>
          <ul className={`flex-1 space-y-1 text-xs ${listColor}`}>
            {resultado.motivo.map((motivo) => (
              <li key={motivo} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                {motivo}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
