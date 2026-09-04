"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, type Locale, isSupportedLocale } from "./config";
import ptBR from "./messages/pt-BR.json";
import enUS from "./messages/en-US.json";
import esES from "./messages/es-ES.json";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
  locales: typeof LOCALES;
  labels: typeof LOCALE_LABELS;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "tank:locale";

const MESSAGES: Record<Locale, Record<string, string>> = {
  "pt-BR": ptBR as Record<string, string>,
  "en-US": enUS as Record<string, string>,
  "es-ES": esES as Record<string, string>,
};

function loadInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) return stored;
    const nav = typeof navigator !== "undefined" ? navigator.language : null;
    if (nav) {
      if (nav.toLowerCase().startsWith("pt")) return "pt-BR";
      if (nav.toLowerCase().startsWith("es")) return "es-ES";
      if (nav.toLowerCase().startsWith("en")) return "en-US";
    }
  } catch {}
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => loadInitialLocale());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback((key: string, fallback?: string) => {
    const m = MESSAGES[locale];
    return m[key] ?? fallback ?? key;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t, locales: LOCALES, labels: LOCALE_LABELS }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
