export const LOCALES = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  "pt-BR": { native: "Português (BR)", english: "Portuguese (Brazil)", flag: "🇧🇷" },
  "en-US": { native: "English (US)", english: "English (US)", flag: "🇺🇸" },
  "es-ES": { native: "Español (ES)", english: "Spanish (Spain)", flag: "🇪🇸" },
};

export function localeFromString(s: string | null | undefined): Locale {
  if (s && (LOCALES as readonly string[]).includes(s)) return s as Locale;
  return DEFAULT_LOCALE;
}

export function isSupportedLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}

const messages: Record<Locale, Record<string, string>> = {
  "pt-BR": {},
  "en-US": {},
  "es-ES": {},
};

export function loadMessages(locale: Locale): Record<string, string> {
  return messages[locale] ?? {};
}

export function getMessage(locale: Locale, key: string, fallback?: string): string {
  const m = messages[locale];
  return m[key] ?? fallback ?? key;
}
