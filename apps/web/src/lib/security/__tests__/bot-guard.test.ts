import { describe, it, expect } from "bun:test";
import { analyzeBotSignal, shouldBlockBot } from "../bot-guard";

function headers(obj: Record<string, string>): Headers {
  return new Headers(obj);
}

describe("bot-guard", () => {
  it("marca curl como bot", () => {
    const sig = analyzeBotSignal({ headers: headers({ "user-agent": "curl/8.0", "accept-language": "en" }) });
    expect(sig.isBot).toBe(true);
    expect(sig.score).toBeGreaterThanOrEqual(50);
    expect(sig.reasons.join(",")).toContain("suspicious_ua");
  });

  it("marca python como bot", () => {
    const sig = analyzeBotSignal({ headers: headers({ "user-agent": "python-requests/2.28" }) });
    expect(sig.isBot).toBe(true);
  });

  it("marca headless como bot", () => {
    const sig = analyzeBotSignal({ headers: headers({ "user-agent": "HeadlessChrome/120" }) });
    expect(sig.isBot).toBe(true);
  });

  it("não marca browser normal como bot", () => {
    const sig = analyzeBotSignal({
      headers: headers({
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "navigate",
      }),
    });
    expect(sig.isBot).toBe(false);
    expect(sig.score).toBeLessThan(50);
  });

  it("monitor não bloqueia, block bloqueia", () => {
    const sig = analyzeBotSignal({ headers: headers({ "user-agent": "curl/8.0" }) });
    expect(shouldBlockBot(sig, "monitor")).toBe(false);
    expect(shouldBlockBot(sig, "block")).toBe(true);
  });

  it("UA vazio é suspeito", () => {
    const sig = analyzeBotSignal({ headers: headers({}) });
    expect(sig.isBot).toBe(true);
    expect(sig.score).toBeGreaterThanOrEqual(50);
    expect(sig.reasons).toContain("missing_user_agent");
  });
});
