const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveEnv = (key: string, fallback: number) =>
  toNumber(process.env[`NEXT_PUBLIC_${key}`] ?? process.env[key], fallback);

export const VALIDATION_TOLERANCE_PERCENT = resolveEnv(
  "VALIDATION_TOLERANCE_PERCENT",
  15,
);

export const ELIGIBILITY_PERCENTUAL_MIN = resolveEnv(
  "ELIGIBILITY_PERCENTUAL_MIN",
  50,
);

export const ELIGIBILITY_UPGRADE_HIGH = resolveEnv(
  "ELIGIBILITY_UPGRADE_HIGH",
  90,
);

export const ELIGIBILITY_UPGRADE_MEDIUM = resolveEnv(
  "ELIGIBILITY_UPGRADE_MEDIUM",
  70,
);

export const ELIGIBILITY_THRESHOLDS = {
  faixaP: {
    score: resolveEnv("ELIGIBILITY_FAIXA_P_SCORE_MIN", 400),
    faturamento: resolveEnv("ELIGIBILITY_FAIXA_P_FATURAMENTO_MIN", 10_000),
  },
  faixaM: {
    score: resolveEnv("ELIGIBILITY_FAIXA_M_SCORE_MIN", 600),
    faturamento: resolveEnv("ELIGIBILITY_FAIXA_M_FATURAMENTO_MIN", 100_000),
  },
  faixaG: {
    score: resolveEnv("ELIGIBILITY_FAIXA_G_SCORE_MIN", 800),
    faturamento: resolveEnv("ELIGIBILITY_FAIXA_G_FATURAMENTO_MIN", 1_000_000),
  },
} as const;
