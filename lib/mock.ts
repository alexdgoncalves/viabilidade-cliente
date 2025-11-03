import {
  BomPagadorData,
  BureauData,
  FaturamentoData,
  ValidationNote,
  ValidationNoteStatus,
} from "./types";

function normalizeDocumento(documento: string): string {
  return documento.replace(/\D/g, "") || "00000000000000";
}

function createSeededRandom(seedValue: number) {
  let seed = seedValue % 2147483647;
  if (seed <= 0) {
    seed += 2147483646;
  }
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function hashDocumento(documento: string): number {
  let hash = 0;
  for (let i = 0; i < documento.length; i += 1) {
    hash = (hash * 31 + documento.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const RAZOES_SOCIAIS = [
  "Horizonte Logistica LTDA",
  "Aurora Comercio ME",
  "Vale Verde Servicos EIRELI",
  "Nimbus Tecnologia SA",
  "Litoral Industrial Ltda",
  "Delta Alimentos ME",
  "Serra Azul Engenharia LTDA",
  "Vita Farma Distribuidora",
  "Atlas Construcoes EIRELI",
  "Orion Educacional SA",
];

const SEGMENTOS = [
  "Logistica",
  "Comercio",
  "Servicos",
  "Tecnologia",
  "Industrial",
  "Alimentos",
  "Engenharia",
  "Saude",
  "Construcao",
  "Educacao",
];

function pickName(rand: () => number): string {
  const index = Math.floor(rand() * RAZOES_SOCIAIS.length);
  return RAZOES_SOCIAIS[index];
}

export async function getMockClienteNome(clienteId: string): Promise<string> {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(documento));
  const segmentoIndex = Math.floor(rand() * SEGMENTOS.length);
  const baseNome = pickName(rand);
  return `${baseNome} - ${SEGMENTOS[segmentoIndex]}`;
}

export async function getMockBureau(clienteId: string): Promise<BureauData> {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(`${documento}:bureau`));
  const score = Math.round(350 + rand() * 650);
  const lastUpdate = new Date(Date.now() - rand() * 1000 * 60 * 60 * 24 * 15);
  const formatted = lastUpdate.toISOString().slice(0, 10);
  return { score, lastUpdate: formatted };
}

export async function getMockBomPagador(
  clienteId: string,
): Promise<BomPagadorData> {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(`${documento}:pagador`));
  const dividaTotal = Math.round(10_000 + rand() * 190_000);
  const percentualPago = Math.round((0.25 + rand() * 0.7) * 100) / 100;
  const valorPago = Math.round(dividaTotal * percentualPago);
  return {
    dividaTotal,
    valorPago,
    percentualPago,
  };
}

export async function getMockFaturamento(
  clienteId: string,
): Promise<FaturamentoData> {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(`${documento}:faturamento`));
  const base = Math.round(80_000 + rand() * 1_200_000);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const atual = new Date().getMonth();
  const historico: Array<{ mes: string; valor: number }> = [];
  let soma = 0;

  for (let i = 5; i >= 0; i -= 1) {
    const indice = (atual - (5 - i) + 12) % 12;
    const fatorSazonal = 0.9 + rand() * 0.25;
    const variacao = 0.92 + rand() * 0.18;
    const valor = Math.round(base * fatorSazonal * variacao);
    historico.push({ mes: meses[indice], valor });
    soma += valor;
  }

  const totalAtual = historico[historico.length - 1]?.valor ?? base;
  const media = Math.round(soma / historico.length);
  const metaAlvo = base * 1.05;
  const percentualMeta = Math.max(
    35,
    Math.min(130, Math.round((totalAtual / metaAlvo) * 100)),
  );

  return {
    totalAtual,
    media6m: media,
    percentualMeta,
    historico,
  };
}

const TAGS_INVALIDAS: Array<{ tag: string; status: ValidationNoteStatus; motivo: string }> = [
  { tag: "RECUSADO", status: "recusada", motivo: "Tag RECUSADO retornada pela API" },
  { tag: "NAO RECONHECIDO", status: "recusada", motivo: "Chave nao encontrada na base do fisco" },
  { tag: "PENDENTE", status: "pendente", motivo: "Consulta em andamento no provedor" },
];

export function gerarQuantidadeNotas(clienteId: string): number {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(`${documento}:quantidade`));
  const quantidade = Math.round(8 + rand() * 8);
  return Math.max(8, Math.min(20, quantidade));
}

export function gerarNotasMock(
  clienteId: string,
  quantidade: number,
  tipoArquivo: "XML" | "CNAB" | "MISTO",
): ValidationNote[] {
  const documento = normalizeDocumento(clienteId);
  const rand = createSeededRandom(hashDocumento(`${documento}:notas`));
  const notas: ValidationNote[] = [];

  for (let i = 0; i < quantidade; i += 1) {
    const origem: ValidationNote["origem"] =
      tipoArquivo === "MISTO"
        ? rand() > 0.5
          ? "XML"
          : "CNAB"
        : tipoArquivo;
    const valor = Math.round(5_000 + rand() * 45_000);
    const chave = `${documento}${(100000 + Math.floor(rand() * 900000)).toString().padStart(6, "0")}${i.toString().padStart(2, "0")}`;

    let status: ValidationNoteStatus = "validada";
    let tag = "OK";
    let motivo: string | undefined;

    if (rand() < 0.15) {
      const possivel = TAGS_INVALIDAS[Math.floor(rand() * TAGS_INVALIDAS.length)];
      status = possivel.status;
      tag = possivel.tag;
      motivo = possivel.motivo;
    }

    notas.push({
      chave,
      origem,
      valor,
      status,
      tag,
      motivo,
    });
  }

  return notas;
}

