'use client';

import { useRouter } from "next/navigation";
import SearchClient from "@/components/pre-analise/search-client";
import BureauCard from "@/components/pre-analise/bureau-card";
import FaturamentoCard from "@/components/pre-analise/faturamento-card";
import BomPagadorCard from "@/components/pre-analise/bom-pagador-card";
import LoanSuggestion from "@/components/pre-analise/loan-suggestion";
import TopNav from "@/components/layout/top-nav";
import ThemeToggle from "@/components/theme-toggle";
import { useEligibility } from "@/context/eligibility-context";
import { useTheme } from "@/context/theme-context";
import { useProcess } from "@/context/process-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useValidation } from "@/context/validation-context";

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const { eligibility, clear: clearEligibility } = useEligibility();
  const { clear: clearValidation } = useValidation();
  const { finalizado, decisao, observacoes, resetar } = useProcess();

  const mainClass =
    theme === "dark"
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-900";

  return (
    <main className={`min-h-screen transition-colors ${mainClass}`}>
      <TopNav
        title="Pre-analise de Credito"
        description="Consulte Bureau, Faturamento e Bom Pagador para validar a elegibilidade."
        stage="etapa 1 - pre-analise"
        rightSlot={
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {finalizado ? (
          <Alert variant="success" className="flex flex-col gap-2">
            <div>
              <AlertTitle>Processo finalizado</AlertTitle>
              <AlertDescription>
                Decisao registrada: {decisao ?? "indefinida"}.
                {observacoes ? ` Observacoes: ${observacoes}` : ""}
              </AlertDescription>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetar();
                  clearValidation();
                  clearEligibility();
                }}
              >
                Reabrir processo
              </Button>
            </div>
          </Alert>
        ) : null}
        <SearchClient />

        {eligibility ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <BureauCard bureau={eligibility.bureau} />
              <FaturamentoCard faturamento={eligibility.faturamento} />
              <BomPagadorCard bomPagador={eligibility.bomPagador} />
            </div>
            <LoanSuggestion
              bureau={eligibility.bureau}
              faturamento={eligibility.faturamento}
              bomPagador={eligibility.bomPagador}
            />
            {eligibility.aprovado ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4">
                <div>
                  <h2 className="text-sm font-semibold text-primary">
                    Cliente elegivel
                  </h2>
                  <p className="text-xs text-muted">
                    Avance para a etapa de validacao de notas fiscais para continuar o fluxo.
                  </p>
                </div>
                <Button onClick={() => router.push("/validacao")}>
                  Ir para validacao
                </Button>
              </div>
            ) : (
              <Alert variant="warning">
                <AlertTitle>Cliente nao elegivel</AlertTitle>
                <AlertDescription>
                  Ajuste os dados na pre-analise para que o cliente atinja os criterios antes de prosseguir para a validacao de notas.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            Realize uma consulta para visualizar os dados consolidados do cliente.
          </p>
        )}
      </div>
    </main>
  );
}






