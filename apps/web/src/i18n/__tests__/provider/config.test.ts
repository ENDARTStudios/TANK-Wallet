import { describe, it, expect } from "bun:test";
import { LOCALES, LOCALE_LABELS, localeFromString, isSupportedLocale } from "@/i18n/config";

describe("i18n config", () => {
  it("LOCALES contém 3 locales", () => {
    expect(LOCALES).toEqual(["pt-BR", "en-US", "es-ES"]);
  });

  it("LOCALE_LABELS tem 3 entries com flag/native/english", () => {
    for (const l of LOCALES) {
      expect(LOCALE_LABELS[l].flag).toBeTruthy();
      expect(LOCALE_LABELS[l].native).toBeTruthy();
      expect(LOCALE_LABELS[l].english).toBeTruthy();
    }
  });

  it("localeFromString aceita válido e fallback", () => {
    expect(localeFromString("pt-BR")).toBe("pt-BR");
    expect(localeFromString("en-US")).toBe("en-US");
    expect(localeFromString("es-ES")).toBe("es-ES");
    expect(localeFromString("xx-XX")).toBe("pt-BR");
    expect(localeFromString(null)).toBe("pt-BR");
    expect(localeFromString(undefined)).toBe("pt-BR");
  });

  it("isSupportedLocale", () => {
    expect(isSupportedLocale("pt-BR")).toBe(true);
    expect(isSupportedLocale("xx")).toBe(false);
  });
});
