import { describe, it, expect } from "bun:test";
import { assessDappRisk } from "../typesafe-jev";

function mockClient(phishing: number, severity: number, confidence = 0.9) {
  let calls = 0;
  let lastState: unknown = null;
  const client = {
    async systemOne(request: { state: Record<string, unknown>; questions: Record<string, unknown> }) {
      calls += 1;
      lastState = request.state;
      return {
        answers: {
          phishing: { noul: phishing },
          severity: { score: severity, confidence },
        },
      };
    },
  };
  return { client, calls: () => calls, lastState: () => lastState };
}

describe("typesafe-jev", () => {
  it("calls systemOne once with url in state", async () => {
    const m = mockClient(0.1, 0.2);
    const result = await assessDappRisk({ url: "https://example.com" }, { client: m.client });
    expect(result.skipped).toBe(false);
    expect(m.calls()).toBe(1);
    expect((m.lastState() as Record<string, unknown>).dapp_url).toBe("https://example.com");
  });

  it("high phishing maps to block", async () => {
    const m = mockClient(0.95, 2.8);
    const result = await assessDappRisk({ url: "https://evil.example" }, { client: m.client });
    expect(result.recommendation).toBe("block");
    expect(result.severityLabel).toBe("confirmed_pattern");
  });

  it("mid signals map to limit", async () => {
    const m = mockClient(0.6, 1.8);
    const result = await assessDappRisk({ url: "https://grey.example" }, { client: m.client });
    expect(result.recommendation).toBe("limit");
    expect(result.severityLabel).toBe("likely_malicious");
  });

  it("low signals map to allow", async () => {
    const m = mockClient(0.05, 0.1);
    const result = await assessDappRisk({ url: "https://safe.example" }, { client: m.client });
    expect(result.recommendation).toBe("allow");
    expect(result.severityLabel).toBe("benign");
  });

  it("skips without key and without injected client", async () => {
    const prev = process.env.TYPESAFE_API_KEY;
    delete process.env.TYPESAFE_API_KEY;
    try {
      const result = await assessDappRisk({ url: "https://example.com" });
      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe("TYPESAFE_API_KEY missing");
    } finally {
      if (prev !== undefined) process.env.TYPESAFE_API_KEY = prev;
    }
  });

  it("rejects empty input", async () => {
    const m = mockClient(0.1, 0.1);
    await expect(assessDappRisk({}, { client: m.client })).rejects.toThrow();
    expect(m.calls()).toBe(0);
  });
});
