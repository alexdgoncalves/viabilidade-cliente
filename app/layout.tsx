import type { Metadata } from "next";
import "./globals.css";
import { EligibilityProvider } from "@/context/eligibility-context";
import { ThemeProvider } from "@/context/theme-context";
import { ValidationProvider } from "@/context/validation-context";
import { ProcessProvider } from "@/context/process-context";

export const metadata: Metadata = {
  title: "Pre-analise de Credito",
  description: "Sistema de avaliacao de emprestimo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <EligibilityProvider>
            <ValidationProvider>
              <ProcessProvider>{children}</ProcessProvider>
            </ValidationProvider>
          </EligibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
