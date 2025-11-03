export type BureauData = {
  score: number;
  lastUpdate: string;
};

export type FaturamentoData = {
  totalAtual: number;
  media6m: number;
  percentualMeta: number;
  historico: Array<{ mes: string; valor: number }>;
};

export type BomPagadorData = {
  dividaTotal: number;
  valorPago: number;
  percentualPago: number;
};

export type EligibilityResult = {
  clienteId: string;
  clienteNome?: string;
  aprovado: boolean;
  faixaSugerida: "P" | "M" | "G" | "RECUSADO";
  motivos: string[];
  bureau: BureauData;
  faturamento: FaturamentoData;
  bomPagador: BomPagadorData;
};

export type ValidationNoteStatus = "validada" | "recusada" | "pendente";

export type ValidationNote = {
  chave: string;
  origem: "XML" | "CNAB";
  valor: number;
  status: ValidationNoteStatus;
  tag: string;
  motivo?: string;
};

export type ValidationSummary = {
  totalNotas: number;
  validas: number;
  invalidas: number;
  tolerancia: number;
  percentualValido: number;
  valorTotalValidas: number;
  valorSolicitado: number;
  status: "Dentro da tolerancia" | "Fora da tolerancia";
};

export type ValidationResult = {
  clienteId: string;
  clienteNome?: string;
  nomeLote?: string;
  tipoArquivo: "XML" | "CNAB" | "MISTO";
  notas: ValidationNote[];
  summary: ValidationSummary;
  arquivos?: string[];
  eligibility?: EligibilityResult;
};

export type ValidationPayload = {
  clienteId: string;
  clienteNome?: string;
  nomeLote?: string;
  tipoArquivo: "XML" | "CNAB" | "MISTO";
  valorSolicitado?: number;
  arquivos?: string[];
  notas: ValidationNote[];
  eligibility?: EligibilityResult;
};
