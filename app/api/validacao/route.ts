import { NextRequest, NextResponse } from "next/server";
import {
  ValidationNote,
  ValidationPayload,
  ValidationResult,
} from "@/lib/types";
import { VALIDATION_TOLERANCE_PERCENT } from "@/lib/config";

function normalizarNotas(notas: ValidationNote[]): ValidationNote[] {
  const porChave = new Map<string, ValidationNote>();

  notas.forEach((nota) => {
    if (!nota?.chave) {
      return;
    }

    const chave = nota.chave.replace(/\s+/g, "");
    if (!chave) {
      return;
    }

    const valorNumerico = Number(nota.valor);
    const valorNormalizado = Number.isFinite(valorNumerico)
      ? Math.max(0, Math.round(valorNumerico))
      : 0;

    const origem = nota.origem === "CNAB" ? "CNAB" : "XML";
    const status: ValidationNote["status"] =
      nota.status === "recusada" || nota.status === "pendente"
        ? nota.status
        : "validada";
    const tag = nota.tag?.trim() || (status === "validada" ? "OK" : "REVISAO");
    const motivo = nota.motivo?.trim() || undefined;

    porChave.set(chave, {
      chave,
      origem,
      valor: valorNormalizado,
      status,
      tag,
      motivo,
    });
  });

  return Array.from(porChave.values());
}

function calcularResumo(
  notas: ValidationNote[],
  tolerancia: number,
  valorSolicitado: number,
): ValidationResult["summary"] {
  const validas = notas.filter((nota) => nota.status === "validada");
  const invalidas = notas.filter((nota) => nota.status === "recusada");
  const valorTotalValidas = validas.reduce((total, nota) => total + nota.valor, 0);
  const percentualValido = Math.round(
    (valorTotalValidas / Math.max(valorSolicitado, 1)) * 100,
  );
  const diferencaPercentual = Math.abs(valorSolicitado - valorTotalValidas) /
    Math.max(valorSolicitado, 1) *
    100;
  const status =
    diferencaPercentual <= tolerancia
      ? "Dentro da tolerancia"
      : "Fora da tolerancia";

  return {
    totalNotas: notas.length,
    validas: validas.length,
    invalidas: invalidas.length,
    tolerancia,
    percentualValido,
    valorTotalValidas,
    valorSolicitado,
    status: status as ValidationResult["summary"]["status"],
  };
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as ValidationPayload | null;

  if (!payload?.clienteId) {
    return NextResponse.json(
      { message: "clienteId obrigatorio para validar o lote." },
      { status: 400 },
    );
  }

  const clienteId = payload.clienteId.replace(/\D/g, "");
  const tipoArquivo = payload.tipoArquivo ?? "MISTO";
  const nomeLote = payload.nomeLote ?? "Lote sem nome";
  const valorSolicitado = payload.valorSolicitado ?? 150_000;
  const tolerancia = VALIDATION_TOLERANCE_PERCENT;

  const notasRecebidas = Array.isArray(payload.notas)
    ? payload.notas
    : [];
  const notasNormalizadas = normalizarNotas(notasRecebidas);

  if (!notasNormalizadas.length) {
    return NextResponse.json(
      {
        message:
          "Nenhuma nota valida recebida. Envie ao menos uma nota para processar o lote.",
      },
      { status: 400 },
    );
  }

  const summary = calcularResumo(
    notasNormalizadas,
    tolerancia,
    valorSolicitado,
  );

  const result: ValidationResult = {
    clienteId,
    clienteNome: payload.clienteNome ?? undefined,
    nomeLote,
    tipoArquivo,
    notas: notasNormalizadas,
    summary,
    arquivos:
      payload.arquivos ??
      notasNormalizadas.map(
        (nota) => `${nota.chave}.${tipoArquivo.toLowerCase()}`,
      ),
    eligibility: payload.eligibility
      ? {
          ...payload.eligibility,
          clienteId,
        }
      : undefined,
  };

  return NextResponse.json(result, { status: 200 });
}


