"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/top-nav";
import ThemeToggle from "@/components/theme-toggle";
import { useEligibility } from "@/context/eligibility-context";
import { useValidation } from "@/context/validation-context";
import { useProcess } from "@/context/process-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/context/theme-context";
import { EligibilityResult, ValidationResult } from "@/lib/types";

const checklistItems = [
  { id: "contrato", label: "Contrato revisado e enviado ao cliente" },
  { id: "documentos", label: "Documentos societarios conferidos" },
  { id: "cadastro", label: "Cadastro atualizado no core bancario" },
  { id: "compliance", label: "Consulta de compliance concluida" },
  { id: "assinaturas", label: "Assinaturas digitais coletadas" },
];

const initialChecklistState: Record<string, boolean> = {
  contrato: true,
  documentos: true,
  cadastro: false,
  compliance: true,
  assinaturas: false,
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Decision = "aprovado" | "ajustes" | "reprovado";

export default function ParecerPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { eligibility, clear: clearEligibility } = useEligibility();
  const { result, clear: clearValidation } = useValidation();
  const { finalizado, decisao, observacoes, finalizar, resetar } = useProcess();
  const [selectedDecision, setSelectedDecision] = useState<Decision>("aprovado");
  const [observacaoInput, setObservacaoInput] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    () => ({ ...initialChecklistState }),
  );
  const [showSummary, setShowSummary] = useState(false);
  const [snapshotResult, setSnapshotResult] = useState<ValidationResult | null>(
    null,
  );
  const [snapshotEligibility, setSnapshotEligibility] =
    useState<EligibilityResult | null>(null);

  const allDone = useMemo(
    () => Object.values(checklist).every(Boolean),
    [checklist],
  );

  const activeResult = snapshotResult ?? result;

  const analise = useMemo(
    () =>
      snapshotEligibility ??
      eligibility ??
      activeResult?.eligibility ??
      null,
    [snapshotEligibility, eligibility, activeResult],
  );

  const nomeCliente =
    analise?.clienteNome ??
    activeResult?.clienteNome ??
    analise?.clienteId ??
    activeResult?.clienteId ??
    null;

  const podeFinalizar =
    Boolean(result) && (selectedDecision !== "aprovado" || allDone);

  useEffect(() => {
    if (!result && !snapshotResult && !finalizado) {
      resetar();
      setSelectedDecision("aprovado");
      setObservacaoInput("");
      setChecklist({ ...initialChecklistState });
    }
  }, [result, snapshotResult, finalizado, resetar]);

  useEffect(() => {
    if (finalizado) {
      setSelectedDecision((decisao ?? "aprovado") as Decision);
      setObservacaoInput(observacoes);
    }
  }, [finalizado, decisao, observacoes]);

  const mainClass =
    theme === "dark"
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-900";

  const resumoValidacao = activeResult?.summary ?? null;
  const decisionLabels: Record<Decision, string> = {
    aprovado: "Aprovar",
    ajustes: "Solicitar ajustes",
    reprovado: "Reprovar",
  };

  const handleFinalizar = () => {
    if (!podeFinalizar || !result) {
      return;
    }
    const analiseAtual =
      eligibility ?? result.eligibility ?? snapshotEligibility ?? null;
    setSnapshotEligibility(analiseAtual);
    setSnapshotResult(result);
    finalizar(selectedDecision, observacaoInput);
    clearValidation();
    clearEligibility();
    setChecklist({ ...initialChecklistState });
    setShowSummary(true);
  };

  const handleGoToInicio = () => {
    resetar();
    setShowSummary(false);
    clearValidation();
    clearEligibility();
    setSnapshotResult(null);
    setSnapshotEligibility(null);
    setChecklist({ ...initialChecklistState });
    setSelectedDecision("aprovado");
    setObservacaoInput("");
    router.push("/");
  };

  const handleFecharResumo = () => {
    setShowSummary(false);
  };

  const decisionOptions: Decision[] = ["aprovado", "ajustes", "reprovado"];

  return (
    <main className={`min-h-screen transition-colors ${mainClass}`}>
      <TopNav
        title="Parecer final"
        description="Consolide as informacoes das etapas anteriores e registre a decisao sobre o emprestimo."
        stage="etapa 3 - parecer final"
        rightSlot={
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <section className="order-2 flex-1 space-y-6 lg:order-1">
          <Card>
            <CardHeader
              title="Resumo da analise"
              subtitle="Principais fatores considerados para a decisao."
              action={
                analise ? (
                  <Badge variant="success">
                    Faixa {analise.faixaSugerida}
                  </Badge>
                ) : null
              }
            />
            <CardContent className="space-y-4 text-sm text-muted">
              {analise ? (
                <>
                  <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4">
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Cliente
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {nomeCliente}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Motivos da recomendacao
                    </p>
                    <ul className="mt-2 space-y-2">
                      {analise.motivos.map((motivo) => (
                        <li
                          key={motivo}
                          className="flex items-start gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3"
                        >
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                          <span>{motivo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <ResumoBox
                      titulo="Score bureau"
                      valor={String(analise.bureau.score)}
                    />
                    <ResumoBox
                      titulo="Faturamento mensal"
                      valor={`R$ ${analise.faturamento.totalAtual.toLocaleString("pt-BR")}`}
                    />
                    <ResumoBox
                      titulo="Percentual pago"
                      valor={`${(analise.bomPagador.percentualPago * 100).toFixed(0)}%`}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 w-full sm:w-fit"
                    onClick={() => router.push("/validacao")}
                  >
                    Revisar etapa 2 (validacao de notas)
                  </Button>
                </>
              ) : result ? (
                <div className="space-y-3">
                  <p>
                    Resumo indisponivel no momento, mas o lote processado para o cliente{" "}
                    <span className="font-semibold text-primary">
                      {nomeCliente ?? activeResult?.clienteId}
                    </span>{" "}
                    segue acessivel no painel abaixo.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/validacao")}
                  >
                    Reabrir validacao
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p>
                    Consulte um cliente na pre-analise, valide as notas e retorne para
                    registrar o parecer final com base nos dados consolidados.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => router.push("/")}>Ir para pre-analise</Button>
                    <Button variant="outline" onClick={() => router.push("/validacao")}>
                      Abrir validacao
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Checklist de liberacao"
              subtitle="Confirme se todos os itens obrigatorios foram atendidos."
            />
            <CardContent className="grid gap-3 text-sm text-muted sm:grid-cols-2">
              {checklistItems.map((item) => {
                const checked = checklist[item.id];
                return (
                  <label
                    key={item.id}
                    className="flex h-full cursor-pointer items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-4 py-3 transition hover:border-emerald-400/60"
                  >
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-400 text-emerald-500 focus:ring-emerald-400"
                    />
                  </label>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <aside className="order-1 w-full space-y-6 lg:order-2 lg:w-80">
          <Card>
            <CardHeader
              title="Validacao de notas"
              subtitle="Conferencia da etapa anterior."
            />
            <CardContent className="space-y-3 text-sm text-muted">
              {resumoValidacao ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Total de notas</span>
                    <strong className="text-primary">
                      {resumoValidacao.totalNotas}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Valor validado</span>
                    <strong className="text-primary">
                      {currencyFormatter.format(resumoValidacao.valorTotalValidas)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Valor solicitado</span>
                    <strong className="text-primary">
                      {currencyFormatter.format(resumoValidacao.valorSolicitado)}
                    </strong>
                  </div>
                  <Alert
                    variant={
                      resumoValidacao.status === "Dentro da tolerancia"
                        ? "success"
                        : "warning"
                    }
                  >
                    <AlertTitle>{resumoValidacao.status}</AlertTitle>
                    <AlertDescription>
                      Percentual valido: {resumoValidacao.percentualValido}%
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <p>
                  Processar o lote de notas na etapa 2 para habilitar o parecer final.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Proximo passo"
              subtitle="Defina a decisao oficial do credito."
            />
            <CardContent className="space-y-4 text-sm text-muted">
              <Alert
                variant={
                  finalizado
                    ? "success"
                    : selectedDecision === "aprovado"
                      ? allDone
                        ? "success"
                        : "warning"
                      : "default"
                }
              >
                <AlertTitle>
                  {finalizado
                    ? "Processo finalizado"
                    : selectedDecision === "aprovado"
                      ? allDone
                        ? "Checklist completo"
                        : "Existem itens pendentes"
                      : "Checklist nao bloqueia esta decisao"}
                </AlertTitle>
                <AlertDescription>
                  {finalizado
                    ? `Decisao registrada: ${decisao ?? "indefinida"}.`
                    : selectedDecision === "aprovado"
                      ? "Finalize os itens antes de liberar o emprestimo."
                      : "Itens pendentes nao impedem ajustes ou reprovacao, mas podem gerar follow-up operacional."}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Escolha a decisao
                </p>
                <div className="flex flex-wrap gap-2">
                  {decisionOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={selectedDecision === option ? "default" : "outline"}
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setSelectedDecision(option)}
                    >
                      {decisionLabels[option]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Observacoes (opcional)
                </p>
                <textarea
                  className="h-20 w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-primary outline-none transition focus:border-[var(--accent-color)]"
                  placeholder="Registre orientacoes adicionais para o time operacional..."
                  value={observacaoInput}
                  onChange={(event) => setObservacaoInput(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={!podeFinalizar}
                  onClick={handleFinalizar}
                >
                  Finalizar processo
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    resetar();
                    setSelectedDecision("aprovado");
                    setObservacaoInput("");
                  }}
                  disabled={!finalizado && !observacaoInput && selectedDecision === "aprovado"}
                >
                  Reiniciar decisao
                </Button>
              </div>

              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Observacoes internas
                </p>
                <p className="mt-2 text-xs text-muted">
                  O parecer gera um registro auditavel. Inclua justificativas claras e dados de suporte.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert variant="warning">
            <AlertTitle>Recomendacao</AlertTitle>
            <AlertDescription>
              Anexe o relatorio exportado da etapa de validacao para manter o dossie completo do cliente.
            </AlertDescription>
          </Alert>
        </aside>
      </div>

      {showSummary && resumoValidacao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6 text-sm text-muted shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Processo finalizado
                </h2>
                <p className="text-xs text-muted">
                  Confira as principais informacoes registradas antes de retornar ao inicio.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleFecharResumo}>
                Fechar
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-primary)] p-3">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Decisao registrada
                </p>
                <p className="text-sm font-semibold text-primary">
                  {decisionLabels[decisao as Decision] ?? "Indefinida"}
                </p>
              </div>

              {observacoes ? (
                <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-primary)] p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Observacoes
                  </p>
                  <p className="text-sm text-primary">{observacoes}</p>
                </div>
              ) : null}

              {analise ? (
                <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-primary)] p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Cliente
                  </p>
                  <div className="mt-1 space-y-1 text-sm">
                    <p className="font-semibold text-primary">
                      {nomeCliente}
                    </p>
                    <p>Faixa sugerida: {analise.faixaSugerida}</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-primary)] p-3">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Validacao de notas
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Total de notas: {resumoValidacao?.totalNotas ?? 0}</li>
                  <li>
                    Valor validado:{" "}
                    {currencyFormatter.format(
                      resumoValidacao?.valorTotalValidas ?? 0,
                    )}
                  </li>
                  <li>
                    Percentual valido: {resumoValidacao?.percentualValido ?? 0}%
                  </li>
                  <li>Status: {resumoValidacao?.status ?? "Indefinido"}</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={handleFecharResumo}>
                Permanecer aqui
              </Button>
              <Button onClick={handleGoToInicio}>Ir para inicio</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

type ResumoProps = {
  titulo: string;
  valor: string;
};

function ResumoBox({ titulo, valor }: ResumoProps) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{titulo}</p>
      <p className="text-lg font-semibold text-primary">{valor}</p>
    </div>
  );
}
