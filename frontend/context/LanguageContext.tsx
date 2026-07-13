"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_LOCALE, Locale, LOCALE_COOKIE, isLocale } from "@/i18n/config";
import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";
import es from "@/i18n/locales/es.json";
import de from "@/i18n/locales/de.json";
import zh from "@/i18n/locales/zh.json";
import hu from "@/i18n/locales/hu.json";

const MESSAGES: Record<Locale, Record<string, unknown>> = { en, fr, es, de, zh, hu };

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=34560000; samesite=lax${secure}`;
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getPath(MESSAGES[locale], key) ?? getPath(MESSAGES[DEFAULT_LOCALE], key);
      if (typeof value !== "string") return key;
      if (!vars) return value;
      return Object.entries(vars).reduce(
        (str, [varKey, varValue]) => str.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue)),
        value
      );
    },
    [locale]
  );

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
