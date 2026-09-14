import { LOCALES, type Locale, DEFAULT_LOCALE } from "../../i18n/config";
export type { Locale } from "../../i18n/config";
import ptBR from "../../i18n/messages/pt-BR.json";
import enUS from "../../i18n/messages/en-US.json";
import esES from "../../i18n/messages/es-ES.json";

const MESSAGES: Record<Locale, Record<string, string>> = {
  "pt-BR": ptBR as Record<string, string>,
  "en-US": enUS as Record<string, string>,
  "es-ES": esES as Record<string, string>,
} as Record<Locale, Record<string, string>>;

export function getServerTranslations(locale: Locale): Record<string, string> {
  const normalizedLocale = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  return MESSAGES[normalizedLocale] ?? MESSAGES[DEFAULT_LOCALE];
}

export function t(locale: Locale, key: string, fallback?: string): string {
  const messages = getServerTranslations(locale);
  return messages[key] ?? fallback ?? key;
}

export function getAvailableLocales(): Locale[] {
  return [...LOCALES] as Locale[];
}