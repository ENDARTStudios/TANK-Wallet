export const LOCALES = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

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

export function isSupportedLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}
