import {
  BomPagadorData,
  BureauData,
  FaturamentoData,
  EligibilityResult,
} from "./types";
import {
  ELIGIBILITY_PERCENTUAL_MIN,
  ELIGIBILITY_THRESHOLDS,
  ELIGIBILITY_UPGRADE_HIGH,
  ELIGIBILITY_UPGRADE_MEDIUM,
} from "./config";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function calcularFaixaPMGeBomPagador(
  clienteId: string,
  bureau: BureauData,
  faturamento: FaturamentoData,
  bomPagador: BomPagadorData,
): EligibilityResult {
  const motivos: string[] = [];
  const percentualPago = bomPagador.percentualPago * 100;

  if (percentualPago < ELIGIBILITY_PERCENTUAL_MIN) {
    motivos.push(
      `Percentual de dividas pagas inferior a ${ELIGIBILITY_PERCENTUAL_MIN}% -> cliente recusado em qualquer operacao.`,
    );
    return {
      clienteId,
      aprovado: false,
      faixaSugerida: "RECUSADO",
      motivos,
      bureau,
      faturamento,
      bomPagador,
    };
  }

  let faixa: "P" | "M" | "G" | null = null;

  if (
    bureau.score >= ELIGIBILITY_THRESHOLDS.faixaG.score &&
    faturamento.totalAtual >= ELIGIBILITY_THRESHOLDS.faixaG.faturamento
  ) {
    faixa = "G";
    motivos.push(
      `Score >= ${ELIGIBILITY_THRESHOLDS.faixaG.score} e faturamento mensal >= ${currency.format(ELIGIBILITY_THRESHOLDS.faixaG.faturamento)} -> faixa G.`,
    );
  } else if (
    bureau.score >= ELIGIBILITY_THRESHOLDS.faixaM.score &&
    faturamento.totalAtual >= ELIGIBILITY_THRESHOLDS.faixaM.faturamento
  ) {
    faixa = "M";
    motivos.push(
      `Score >= ${ELIGIBILITY_THRESHOLDS.faixaM.score} e faturamento mensal >= ${currency.format(ELIGIBILITY_THRESHOLDS.faixaM.faturamento)} -> faixa M.`,
    );
  } else if (
    bureau.score >= ELIGIBILITY_THRESHOLDS.faixaP.score &&
    faturamento.totalAtual >= ELIGIBILITY_THRESHOLDS.faixaP.faturamento
  ) {
    faixa = "P";
    motivos.push(
      `Score >= ${ELIGIBILITY_THRESHOLDS.faixaP.score} e faturamento mensal >= ${currency.format(ELIGIBILITY_THRESHOLDS.faixaP.faturamento)} -> faixa P.`,
    );
  } else {
    motivos.push("Cliente nao atingiu os criterios minimos para faixa P.");
    return {
      clienteId,
      aprovado: false,
      faixaSugerida: "RECUSADO",
      motivos,
      bureau,
      faturamento,
      bomPagador,
    };
  }

  if (percentualPago >= ELIGIBILITY_UPGRADE_HIGH && faixa !== "G") {
    motivos.push(
      `Percentual de dividas pagas >= ${ELIGIBILITY_UPGRADE_HIGH}% -> cliente elegivel para emprestimo de nivel superior.`,
    );
    faixa = faixa === "P" ? "M" : "G";
  } else if (percentualPago >= ELIGIBILITY_UPGRADE_MEDIUM) {
    motivos.push(
      `Percentual de dividas pagas >= ${ELIGIBILITY_UPGRADE_MEDIUM}% -> cliente aprovado na politica de credito.`,
    );
  }

  return {
    clienteId,
    aprovado: true,
    faixaSugerida: faixa ?? "P",
    motivos,
    bureau,
    faturamento,
    bomPagador,
  };
}
