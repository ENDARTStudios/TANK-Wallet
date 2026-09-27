import { describe, it, expect } from "bun:test";
import enUS from "@/i18n/messages/en-US.json";
import esES from "@/i18n/messages/es-ES.json";
import ptBR from "@/i18n/messages/pt-BR.json";

const KEYS = ["intent.send", "intent.swap", "intent.approve", "intent.stake", "intent.bridge", "intent.unclassified", "intent.unavailable"] as const;

describe("intent i18n", () => {
  it("present in all locales", () => {
    for (const messages of [enUS, esES, ptBR] as Record<string, string>[]) {
      for (const key of KEYS) {
        expect(typeof messages[key]).toBe("string");
        expect(messages[key].length).toBeGreaterThan(0);
      }
    }
  });
});
