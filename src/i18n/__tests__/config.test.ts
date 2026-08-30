import { describe, it, expect } from "bun:test";
import { LOCALES, DEFAULT_LOCALE, isSupportedLocale, getMessage, loadMessages } from "../config";

describe("i18n config", () => {
  it("LOCALES contém 3 locales", () => {
    expect(LOCALES).toEqual(["pt-BR", "en-US", "es-ES"]);
  });

  it("DEFAULT_LOCALE é pt-BR", () => {
    expect(DEFAULT_LOCALE).toBe("pt-BR");
  });

  it("isSupportedLocale aceita válido", () => {
    expect(isSupportedLocale("pt-BR")).toBe(true);
    expect(isSupportedLocale("en-US")).toBe(true);
    expect(isSupportedLocale("xx-XX")).toBe(false);
  });

  it("getMessage retorna fallback se chave ausente", () => {
    expect(getMessage("pt-BR", "missing", "fallback")).toBe("fallback");
    expect(getMessage("pt-BR", "missing")).toBe("missing");
  });

  it("loadMessages retorna objeto", () => {
    expect(loadMessages("en-US")).toBeDefined();
  });
});
