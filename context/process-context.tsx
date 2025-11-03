"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

type FinalDecision = "aprovado" | "ajustes" | "reprovado" | null;

type ProcessState = {
  finalizado: boolean;
  decisao: FinalDecision;
  observacoes: string;
};

const PROCESS_STORAGE_KEY = "processo:estado";

const defaultProcessState: ProcessState = {
  finalizado: false,
  decisao: null,
  observacoes: "",
};

type ProcessContextValue = {
  finalizado: boolean;
  decisao: FinalDecision;
  observacoes: string;
  finalizar: (decisao: Exclude<FinalDecision, null>, observacoes?: string) => void;
  resetar: () => void;
};

const ProcessContext = createContext<ProcessContextValue | undefined>(undefined);

type ProcessProviderProps = {
  children: React.ReactNode;
};

export function ProcessProvider({ children }: ProcessProviderProps) {
  const [state, setState] = useState<ProcessState>(() => {
    if (typeof window === "undefined") {
      return defaultProcessState;
    }
    try {
      const raw = window.localStorage.getItem(PROCESS_STORAGE_KEY);
      if (!raw) {
        return defaultProcessState;
      }
      const parsed = JSON.parse(raw) as ProcessState | null;
      if (!parsed || typeof parsed !== "object") {
        return defaultProcessState;
      }
      return {
        finalizado: Boolean(parsed.finalizado),
        decisao:
          parsed.decisao === "aprovado" ||
          parsed.decisao === "ajustes" ||
          parsed.decisao === "reprovado"
            ? parsed.decisao
            : null,
        observacoes: typeof parsed.observacoes === "string" ? parsed.observacoes : "",
      };
    } catch {
      return defaultProcessState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (state.finalizado) {
      window.localStorage.setItem(PROCESS_STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(PROCESS_STORAGE_KEY);
    }
  }, [state]);

  const finalizado = state.finalizado;
  const decisao = state.decisao;
  const observacoes = state.observacoes;

  const finalizar = useCallback(
    (novaDecisao: Exclude<FinalDecision, null>, obs?: string) => {
      setState({
        finalizado: true,
        decisao: novaDecisao,
        observacoes: obs?.trim() ?? "",
      });
    },
    [],
  );

  const resetar = useCallback(() => {
    setState(defaultProcessState);
  }, []);

  const value = useMemo(
    () => ({
      finalizado,
      decisao,
      observacoes,
      finalizar,
      resetar,
    }),
    [finalizado, decisao, observacoes, finalizar, resetar],
  );

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcess() {
  const ctx = useContext(ProcessContext);
  if (!ctx) {
    throw new Error("useProcess must be used within ProcessProvider");
  }
  return ctx;
}
