"use client";
import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { LOCALES, type Locale } from "@/i18n/config";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, labels } = useI18n();
  return (
    <div className={compact ? "inline-flex items-center" : "flex items-center gap-2"}>
      {!compact && <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      <label htmlFor="lang-select" className="sr-only">Language</label>
      <select
        id="lang-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={compact
          ? "rounded-md border border-border/60 bg-background/80 px-2 py-1 text-xs"
          : "rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-sm"}
        aria-label="Selecionar idioma"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {labels[l].flag} {labels[l].native}
          </option>
        ))}
      </select>
    </div>
  );
}
