// src/context/eligibility-context.tsx
"use client";

const ELIGIBILITY_STORAGE_KEY = "eligibility:atual";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { EligibilityResult } from "@/lib/types";

type EligibilityContextValue = {
  eligibility: EligibilityResult | null;
  loading: boolean;
  error: string | null;
  fetchEligibility: (documento: string) => Promise<void>;
  clear: () => void;
};

const EligibilityContext = createContext<EligibilityContextValue | undefined>(
  undefined
);

type EligibilityProviderProps = {
  children: React.ReactNode;
};

export function EligibilityProvider({ children }: EligibilityProviderProps) {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(ELIGIBILITY_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as EligibilityResult | null;
      if (parsed && typeof parsed === "object" && parsed.clienteId) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (eligibility) {
      window.localStorage.setItem(
        ELIGIBILITY_STORAGE_KEY,
        JSON.stringify(eligibility),
      );
    } else {
      window.localStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
    }
  }, [eligibility]);

  const fetchEligibility = useCallback(async (documento: string) => {
    const documentoLimpo = documento.replace(/\D/g, "");
    if (!documentoLimpo) {
      setError("Informe um CPF ou CNPJ valido.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/clientes/${documentoLimpo}/eligibility`, {
        method: "GET",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao consultar elegibilidade.");
      }

      const data: EligibilityResult = await res.json();
      setEligibility(data);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao consultar.",
      );
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setEligibility(null);
    setError(null);
  }, []);

  return (
    <EligibilityContext.Provider
      value={{ eligibility, loading, error, fetchEligibility, clear }}
    >
      {children}
    </EligibilityContext.Provider>
  );
}

export function useEligibility() {
  const ctx = useContext(EligibilityContext);
  if (!ctx) {
    throw new Error(
      "useEligibility deve ser usado dentro de <EligibilityProvider />"
    );
  }
  return ctx;
}
