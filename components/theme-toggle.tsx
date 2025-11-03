"use client";

import { useTheme } from "@/context/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--ghost-hover)]"
      aria-label="Alternar tema"
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: theme === "dark" ? "#38bdf8" : "#0f172a",
        }}
      />
      {theme === "dark" ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
