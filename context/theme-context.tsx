"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

const STORAGE_KEY = "viabilidade:theme";

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
        : null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      setThemeState("light");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, theme);
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
