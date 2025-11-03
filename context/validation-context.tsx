"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  ValidationPayload,
  ValidationResult,
} from "@/lib/types";

const VALIDATION_STORAGE_KEY = "validation:ultimo-resultado";

type ValidationContextValue = {
  result: ValidationResult | null;
  loading: boolean;
  error: string | null;
  processLote: (payload: ValidationPayload) => Promise<void>;
  clear: () => void;
};

const ValidationContext = createContext<ValidationContextValue | undefined>(
  undefined,
);

type ValidationProviderProps = {
  children: React.ReactNode;
};

export function ValidationProvider({ children }: ValidationProviderProps) {
  const [result, setResult] = useState<ValidationResult | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(VALIDATION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as ValidationResult | null;
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
    if (result) {
      window.localStorage.setItem(
        VALIDATION_STORAGE_KEY,
        JSON.stringify(result),
      );
    } else {
      window.localStorage.removeItem(VALIDATION_STORAGE_KEY);
    }
  }, [result]);

  const processLote = useCallback(async (payload: ValidationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/validacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Falha ao processar lote.");
      }

      const data: ValidationResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao validar o lote.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      result,
      loading,
      error,
      processLote,
      clear,
    }),
    [result, loading, error, processLote, clear],
  );

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const ctx = useContext(ValidationContext);
  if (!ctx) {
    throw new Error("useValidation must be used within ValidationProvider");
  }
  return ctx;
}
