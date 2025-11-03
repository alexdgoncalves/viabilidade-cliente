'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BomPagadorData } from "@/lib/types";
import { useTheme } from "@/context/theme-context";

type Props = {
  bomPagador: BomPagadorData;
};

export default function BomPagadorCard({ bomPagador }: Props) {
  const percentual = Math.round(bomPagador.percentualPago * 100);
  const status =
    percentual < 50
      ? "Recusado"
      : percentual >= 90
        ? "Elegivel para upgrade"
        : "Aprovado";

  const { theme } = useTheme();

  const badgeClass =
    percentual < 50
      ? theme === "dark"
        ? "bg-rose-500/15 text-rose-200"
        : "bg-rose-100 text-rose-700"
      : theme === "dark"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-green-100 text-green-700";

  const valueColor = theme === "dark" ? "text-slate-50" : "text-slate-900";
  const mutedColor = theme === "dark" ? "text-slate-500" : "text-slate-600";

  return (
    <Card>
      <CardHeader
        title="Bom pagador"
        subtitle="Dividas x pagamento do mes"
        action={
          <span className={`rounded-full px-2 py-0.5 text-xs ${badgeClass}`}>
            {status}
          </span>
        }
      />
      <CardContent>
        <p className={`text-2xl font-semibold ${valueColor}`}>{percentual}%</p>
        <p className={`mt-1 text-xs ${mutedColor}`}>
          Pago no mes: R$ {bomPagador.valorPago.toLocaleString("pt-BR")}
        </p>
        <p className={`text-xs ${mutedColor}`}>
          Divida total: R$ {bomPagador.dividaTotal.toLocaleString("pt-BR")}
        </p>
      </CardContent>
    </Card>
  );
}
