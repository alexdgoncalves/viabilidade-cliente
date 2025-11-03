'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BureauData } from "@/lib/types";
import { useTheme } from "@/context/theme-context";

type Props = {
  bureau: BureauData;
};

export default function BureauCard({ bureau }: Props) {
  const { theme } = useTheme();
  const statusClass =
    bureau.score >= 600
      ? theme === "dark"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-green-100 text-green-700"
      : theme === "dark"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-amber-100 text-amber-700";

  const scoreColor = theme === "dark" ? "text-slate-50" : "text-slate-900";
  const mutedColor = theme === "dark" ? "text-slate-500" : "text-slate-500";

  return (
    <Card>
      <CardHeader
        title="Bureau de credito"
        subtitle="Score atual do cliente"
        action={
          <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass}`}>
            {bureau.score >= 600 ? "bom" : "regular"}
          </span>
        }
      />
      <CardContent>
        <p className={`text-3xl font-bold tracking-tight ${scoreColor}`}>
          {bureau.score}
        </p>
        <p className={`mt-2 text-xs ${mutedColor}`}>
          ultima consulta: {bureau.lastUpdate}
        </p>
      </CardContent>
    </Card>
  );
}
