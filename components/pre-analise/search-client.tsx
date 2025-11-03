'use client';

import { useState } from "react";
import { useEligibility } from "@/context/eligibility-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/context/theme-context";

function formatDocumento(digits: string) {
  if (digits.length <= 11) {
    return digits
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export default function SearchClient() {
  const [documento, setDocumento] = useState("");
  const { fetchEligibility, loading, error, clear } = useEligibility();
  const { theme } = useTheme();

  const containerClass =
    theme === "dark"
      ? "border-slate-800/60 bg-slate-900/30"
      : "border-slate-200 bg-white shadow-sm";

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const digits = documento.replace(/\D/g, "");
    if (!digits) return;
    await fetchEligibility(digits);
    setDocumento(formatDocumento(digits));
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors md:flex-row md:items-end ${containerClass}`}
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="documento">Cliente (CPF/CNPJ)</Label>
        <Input
          id="documento"
          name="documento"
          value={documento}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            setDocumento(formatDocumento(digits));
          }}
          maxLength={18}
          placeholder="Digite o CPF/CNPJ do cliente"
        />
      </div>
      <div className="flex gap-2 md:w-auto">
        <Button type="submit" disabled={loading} className="md:min-w-[140px]">
          {loading ? "Consultando..." : "Consultar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDocumento("");
            clear();
          }}
        >
          Limpar
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive" className="md:flex-1">
          <AlertTitle>Erro na consulta</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
