"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/layout/top-nav";
import ThemeToggle from "@/components/theme-toggle";
import { useEligibility } from "@/context/eligibility-context";
import { useValidation } from "@/context/validation-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/theme-context";
import { ValidationNote } from "@/lib/types";
import { VALIDATION_TOLERANCE_PERCENT } from "@/lib/config";

const statusBadge: Record<
  ValidationNote["status"],
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  validada: { label: "Validada", variant: "success" },
  pendente: { label: "Em analise", variant: "warning" },
  recusada: { label: "Invalidada", variant: "destructive" },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type SampleFile = {
  url: string;
  nome: string;
};

const SAMPLE_FILES: SampleFile[] = [
  { url: "/samples/nota-exemplo.xml", nome: "nota-exemplo.xml" },
  { url: "/samples/lote-exemplo.rem", nome: "lote-exemplo.rem" },
];

function sanitizeChave(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.replace(/\s+/g, "");
}

function parseXmlNotas(conteudo: string): ValidationNote[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(conteudo, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("XML invalido ou mal formatado.");
  }

  const notas: ValidationNote[] = [];
  Array.from(doc.getElementsByTagName("Nota")).forEach((nota) => {
    const chave = sanitizeChave(
      nota.getElementsByTagName("chave")[0]?.textContent?.trim(),
    );
    const valorTexto =
      nota.getElementsByTagName("valor")[0]?.textContent?.trim() ?? "";
    const valorNumero = Number.parseFloat(valorTexto.replace(",", "."));

    if (!chave || Number.isNaN(valorNumero)) {
      return;
    }

    notas.push({
      chave,
      origem: "XML",
      valor: Math.round(valorNumero),
      status: "validada",
      tag: "OK",
    });
  });

  return notas;
}

function parseRemNotas(conteudo: string): ValidationNote[] {
  const notas: ValidationNote[] = [];

  conteudo
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0)
    .forEach((linha) => {
      const grupos = linha.match(/\d+/g) ?? [];
      const chave = sanitizeChave(grupos[0]) ?? null;
      const valorSegmento =
        linha.length >= 44 ? linha.slice(34, 44).trim() : "";
      const fallbackValor = grupos[1] ?? "";
      const bruto = (valorSegmento || fallbackValor || "").replace(/\D/g, "");
      const significativo = bruto.slice(0, 13);
      const valorInteiro = significativo
        ? Number.parseInt(significativo, 10)
        : Number.NaN;

      if (!chave || Number.isNaN(valorInteiro)) {
        return;
      }

      notas.push({
        chave,
        origem: "CNAB",
        valor:
          significativo.length > 2
            ? Math.round(valorInteiro / 100)
            : valorInteiro,
        status: "validada",
        tag: "OK",
      });
    });

  return notas;
}

async function extrairNotasDosArquivos(files: File[]): Promise<ValidationNote[]> {
  const notas = await Promise.all(
    files.map(async (file) => {
      const conteudo = await file.text();
      const nome = file.name.toLowerCase();

      if (nome.endsWith(".xml")) {
        return parseXmlNotas(conteudo);
      }

      if (nome.endsWith(".rem")) {
        return parseRemNotas(conteudo);
      }

      throw new Error(`Formato de arquivo nao suportado: ${file.name}`);
    }),
  );

  const deduplicadas = new Map<string, ValidationNote>();
  notas.flat().forEach((nota) => {
    if (!deduplicadas.has(nota.chave)) {
      deduplicadas.set(nota.chave, nota);
    }
  });

  return Array.from(deduplicadas.values());
}

export default function ValidacaoPage() {
  const { theme } = useTheme();
  const { eligibility } = useEligibility();
  const {
    result,
    loading,
    error: validationError,
    processLote,
    clear: clearValidation,
  } = useValidation();

  const [nomeLote, setNomeLote] = useState("");
  const [tipoArquivo, setTipoArquivo] =
    useState<"XML" | "CNAB" | "MISTO">("MISTO");
  const [valorSolicitado, setValorSolicitado] = useState("150000");
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  const mainClass =
    theme === "dark"
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-900";

  const valorSolicitadoNumero = useMemo(() => {
    const sanitized = valorSolicitado.replace(/\D/g, "");
    return sanitized ? Number(sanitized) : 0;
  }, [valorSolicitado]);

  const podeOperar = Boolean(eligibility && eligibility.aprovado);
  const toleranciaPercentualLabel = Number.isInteger(
    VALIDATION_TOLERANCE_PERCENT,
  )
    ? `${VALIDATION_TOLERANCE_PERCENT}`
    : VALIDATION_TOLERANCE_PERCENT.toFixed(1);

  const inferirTipoUpload = (files: File[]): "XML" | "CNAB" | "MISTO" => {
    if (!files.length) {
      return "MISTO";
    }

    let temXml = false;
    let temCnab = false;
    let outro = false;

    files.forEach((file) => {
      const nome = file.name.toLowerCase();
      if (nome.endsWith(".xml")) {
        temXml = true;
      } else if (nome.endsWith(".rem") || nome.endsWith(".cnab")) {
        temCnab = true;
      } else {
        outro = true;
      }
    });

    if (outro || (temXml && temCnab)) {
      return "MISTO";
    }
    if (temXml) {
      return "XML";
    }
    if (temCnab) {
      return "CNAB";
    }
    return "MISTO";
  };

  useEffect(() => {
    if (result) {
      setSuccessMessage(
        "Lote processado com sucesso. Confira os resultados abaixo.",
      );
      setLocalError(null);
    }
  }, [result]);

  useEffect(() => {
    if (validationError) {
      setSuccessMessage(null);
    }
  }, [validationError]);

  const handleFilesSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const next = [...arquivosSelecionados];
    Array.from(files).forEach((file) => {
      if (!next.some((existing) => existing.name === file.name)) {
        next.push(file);
      }
    });

    setArquivosSelecionados(next);
    setTipoArquivo(inferirTipoUpload(next));
    setLocalError(null);
  };

  const handleRemoveArquivo = (index: number) => {
    setArquivosSelecionados((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setTipoArquivo(inferirTipoUpload(next));
      return next;
    });
  };

  const handleClearArquivos = () => {
    setArquivosSelecionados([]);
    setTipoArquivo("MISTO");
  };

  const handleLoadSample = async (sample: SampleFile) => {
    try {
      setSampleLoading(true);
      const response = await fetch(sample.url);
      if (!response.ok) {
        throw new Error("Nao foi possivel carregar o arquivo de exemplo.");
      }
      const blob = await response.blob();
      const file = new File([blob], sample.nome, { type: blob.type });
      setArquivosSelecionados((prev) => {
        if (prev.some((existing) => existing.name === file.name)) {
          setTipoArquivo(inferirTipoUpload(prev));
          return prev;
        }
        const next = [...prev, file];
        setTipoArquivo(inferirTipoUpload(next));
        return next;
      });
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel carregar o arquivo de exemplo.",
      );
    } finally {
      setSampleLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!podeOperar) {
      setLocalError(
        "Cliente nao elegivel. Volte a pre-analise para revisar os criterios.",
      );
      return;
    }

    if (!arquivosSelecionados.length) {
      setLocalError("Selecione ao menos um arquivo para processar o lote.");
      return;
    }

    if (!valorSolicitadoNumero) {
      setLocalError("Informe o valor solicitado pelo cliente.");
      return;
    }

    let notasUpload: ValidationNote[] = [];
    try {
      notasUpload = await extrairNotasDosArquivos(arquivosSelecionados);
    } catch (err) {
      console.error(err);
      setLocalError(
        err instanceof Error
          ? err.message
          : "Falha ao processar os arquivos enviados.",
      );
      return;
    }

    if (!notasUpload.length) {
      setLocalError(
        "Nenhuma nota valida encontrada nos arquivos enviados.",
      );
      return;
    }

    setLocalError(null);
    setSuccessMessage(null);

    await processLote({
      clienteId: eligibility!.clienteId,
      clienteNome: eligibility?.clienteNome,
      nomeLote: nomeLote || undefined,
      tipoArquivo,
      valorSolicitado: valorSolicitadoNumero,
      arquivos: arquivosSelecionados.map((file) => file.name),
      notas: notasUpload,
      eligibility: eligibility ?? undefined,
    });
  };

  const handleClearResultado = () => {
    clearValidation();
    setArquivosSelecionados([]);
    setTipoArquivo("MISTO");
    setSuccessMessage(null);
    setLocalError(null);
  };

  const notas = result?.notas ?? [];
  const resumo = result?.summary ?? null;

  return (
    <main className={`min-h-screen transition-colors ${mainClass}`}>
      <TopNav
        title="Validacao de notas fiscais"
        description="Envie os arquivos XML ou CNAB, valide as tags retornadas e acompanhe a tolerancia do lote."
        stage="etapa 2 - durante o emprestimo"
        rightSlot={
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <section className="order-2 flex-1 space-y-6 lg:order-1">
          <Card className="border-dashed">
            <CardHeader
              title="Upload do lote"
              subtitle="Armazene os arquivos enviados pelo cliente e dispare a validacao automatica."
              action={<Badge variant="outline">Processamento em lote</Badge>}
            />
            <CardContent className="space-y-5">
              {!podeOperar ? (
                <Alert variant="destructive">
                  <AlertTitle>Cliente nao elegivel</AlertTitle>
                  <AlertDescription>
                    Volte para a etapa de pre-analise para revisar os criterios e
                    garantir que o cliente esteja aprovado antes de prosseguir.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6 text-sm text-muted">
                <p className="font-semibold text-primary">Opcoes de upload</p>
                <ul className="mt-3 space-y-2">
                  <li>- XML com tag &lt;chave&gt; contendo a chave da NF.</li>
                  <li>- Arquivo CNAB .REM com a chave entre as posicoes 20 e 64.</li>
                </ul>
                <div className="mt-4 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--surface-primary)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Arquivos de exemplo
                  </p>
                  <p className="mt-2 text-xs">
                    Use os arquivos abaixo para testar o fluxo de importacao:
                  </p>
                  <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap">
                    {SAMPLE_FILES.map((sample) => (
                      <Button
                        key={sample.nome}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sampleLoading}
                        className="w-full sm:w-auto"
                        onClick={() => handleLoadSample(sample)}
                      >
                        {sampleLoading ? "Carregando..." : `Adicionar ${sample.nome}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label htmlFor="lote-nome">Nome do lote (opcional)</Label>
                  <Input
                    id="lote-nome"
                    placeholder="Recebiveis novembro"
                    value={nomeLote}
                    disabled={!podeOperar}
                    onChange={(event) => setNomeLote(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="valor-solicitado">Valor solicitado</Label>
                  <Input
                    id="valor-solicitado"
                    type="number"
                    min="0"
                    value={valorSolicitado}
                    disabled={!podeOperar}
                    onChange={(event) => setValorSolicitado(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo-lote">Arquivos do cliente</Label>
                <input
                  id="arquivo-lote"
                  type="file"
                  multiple
                  accept=".xml,.rem,.txt"
                  onChange={handleFilesSelected}
                  disabled={!podeOperar}
                  className="w-full cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-primary file:mr-3 file:rounded-md file:border-0 file:bg-[var(--secondary-bg)] file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:border-[var(--accent-color)]"
                />
                {arquivosSelecionados.length ? (
                  <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-primary)] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Arquivos selecionados ({arquivosSelecionados.length})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearArquivos}
                      >
                        Limpar lista
                      </Button>
                    </div>
                    <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
                      {arquivosSelecionados.map((arquivo, index) => (
                        <li
                          key={arquivo.name}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-primary">{arquivo.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveArquivo(index)}
                          >
                            Remover
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleProcess}
                  disabled={!podeOperar || loading}
                >
                  {loading ? "Processando..." : "Processar lote"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={handleClearResultado}
                  disabled={loading && !result}
                >
                  Limpar resultado
                </Button>
                <span className="text-xs text-muted">
                  Upload maximo: 50 MB por arquivo. Formatos aceitos: .xml, .rem ou .txt.
                </span>
              </div>

              {localError ? (
                <Alert variant="destructive">
                  <AlertTitle>Acao necessaria</AlertTitle>
                  <AlertDescription>{localError}</AlertDescription>
                </Alert>
              ) : null}

              {validationError ? (
                <Alert variant="destructive">
                  <AlertTitle>Falha na validacao</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              ) : null}

              {successMessage ? (
                <Alert variant="success">
                  <AlertTitle>Lote processado</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Notas processadas"
              subtitle={
                notas.length
                  ? "Resumo rapido das chaves retornadas pela API."
                  : "Processar lote para visualizar as notas."
              }
            />
            <CardContent className="overflow-hidden rounded-lg border border-[var(--border-color)]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5">Chave NF</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-5 py-6 text-center text-sm text-muted"
                        >
                          Nenhuma nota processada ainda. Selecione os arquivos do cliente e clique em &quot;Processar lote&quot;.
                        </TableCell>
                      </TableRow>
                    ) : (
                      notas.map((nota) => (
                        <TableRow key={nota.chave}>
                          <TableCell className="px-5 font-mono text-xs text-muted">
                            {nota.chave}
                          </TableCell>
                          <TableCell className="text-sm text-muted">
                            {nota.origem}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-primary">
                            {currencyFormatter.format(nota.valor)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge[nota.status].variant}>
                              {statusBadge[nota.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs uppercase tracking-wide text-muted">
                            {nota.tag}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="order-1 w-full space-y-6 lg:order-2 lg:w-80">
          <Card>
            <CardHeader
              title="Resumo do lote"
              subtitle="Acoes automaticas aplicadas apos o upload."
            />
            <CardContent className="space-y-4 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span>Total de notas</span>
                <strong className="text-base text-primary">
                  {resumo?.totalNotas ?? 0}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Notas validadas</span>
                <strong className="text-base text-primary">
                  {resumo?.validas ?? 0}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Notas invalidas</span>
                <strong className="text-base text-primary">
                  {resumo?.invalidas ?? 0}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Valor solicitado</span>
                <strong className="text-base text-primary">
                  {currencyFormatter.format(resumo?.valorSolicitado ?? valorSolicitadoNumero)}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Valor validado</span>
                <strong className="text-base text-primary">
                  {currencyFormatter.format(resumo?.valorTotalValidas ?? 0)}
                </strong>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                  Percentual valido ({resumo?.percentualValido ?? 0}%)
                </p>
                <Progress value={resumo?.percentualValido ?? 0} />
              </div>
              <Alert
                variant={
                  resumo?.status === "Dentro da tolerancia" ? "success" : "warning"
                }
              >
                <AlertTitle>{resumo?.status ?? "Aguardando processamento"}</AlertTitle>
                <AlertDescription>
                  O total de notas validas deve ficar dentro da tolerancia de {toleranciaPercentualLabel}% em
                  relacao ao valor solicitado.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Informacoes do cliente"
              subtitle="Conferencia rapida com base na etapa 1."
            />
            <CardContent className="space-y-3 text-sm text-muted">
              {eligibility ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Cliente
                    </p>
                    <p className="font-semibold text-primary">
                      {eligibility.clienteNome ?? eligibility.clienteId}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Faixa sugerida</span>
                    <Badge
                      variant={
                        eligibility.aprovado ? "success" : "destructive"
                      }
                    >
                      {eligibility.faixaSugerida}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Percentual Bom Pagador</span>
                    <strong className="text-primary">
                      {(eligibility.bomPagador.percentualPago * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.history.back()}
                    >
                      Voltar para pre-analise
                    </Button>
                    <Button
                      className="w-full"
                      variant="default"
                      onClick={() => window.location.assign("/parecer")}
                      disabled={!result}
                    >
                      Avancar para parecer final
                    </Button>
                  </div>
                </>
              ) : (
                <p>
                  Nenhum cliente selecionado. Retorne a pre-analise para confirmar os
                  dados antes de liberar o upload.
                </p>
              )}
            </CardContent>
          </Card>

          <Alert variant="warning">
            <AlertTitle>Bloqueio automatico</AlertTitle>
            <AlertDescription>
              Abaixo de {toleranciaPercentualLabel}% de diferenca o sistema libera o lote automaticamente. Fora da tolerancia, abre-se uma tarefa manual antes do parecer final.
            </AlertDescription>
          </Alert>
        </aside>
      </div>
    </main>
  );
}
