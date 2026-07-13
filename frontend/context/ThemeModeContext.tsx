"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_THEME_MODE,
  ThemeMode,
  THEME_MODE_COOKIE,
  isThemeMode,
} from "@/lib/theme-mode-config";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyMode(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeModeProvider({
  initialMode,
  children,
}: {
  initialMode: ThemeMode;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = useCallback((next: ThemeMode) => {
    if (!isThemeMode(next)) return;
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${THEME_MODE_COOKIE}=${next}; path=/; max-age=34560000; samesite=lax${secure}`;
    setModeState(next);
    applyMode(next);
  }, []);

  useEffect(() => {
    applyMode(mode);
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyMode("system");
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [mode]);

  const contextValue = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}

export { DEFAULT_THEME_MODE };
