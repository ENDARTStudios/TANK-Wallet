import { describe, it, expect } from "bun:test";
import { classifyIntent } from "../classifier";

function mockClient(choice: string, choiceConfidence: number, clearProb: number) {
  return {
    async systemOne() {
      return {
        answers: {
          intent: { choice, confidence: choiceConfidence, probabilities: { [choice]: choiceConfidence } },
          clear: { noul: clearProb },
        },
      };
    },
  };
}

describe("intent classifier", () => {
  it("flag off retorna unavailable sem chamar TypeSafe", async () => {
    let calls = 0;
    const client = { async systemOne(): Promise<never> { calls += 1; throw new Error("must not be called"); } };
    const res = await classifyIntent({ chain: "ethereum", selector: "0x12345678" }, { enabled: false, assess: client });
    expect(res).toEqual({ intent: "unclassified", confidence: 0, source: "unavailable" });
    expect(calls).toBe(0);
  });

  it("seletor conhecido usa heuristica local sem rede", async () => {
    let calls = 0;
    const client = { async systemOne(): Promise<never> { calls += 1; throw new Error("must not be called"); } };
    const res = await classifyIntent({ chain: "ethereum", selector: "0x095ea7b3" }, { enabled: true, assess: client });
    expect(res).toEqual({ intent: "approve", confidence: 1, source: "local-heuristic" });
    expect(calls).toBe(0);
  });

  it("seletor desconhecido usa TypeSafe quando claro", async () => {
    const res = await classifyIntent(
      { chain: "ethereum", selector: "0xdeadbeef", dappOrigin: "example.com" },
      { enabled: true, assess: mockClient("swap", 0.9, 0.9) },
    );
    expect(res).toEqual({ intent: "swap", confidence: 0.9, source: "typesafe" });
  });

  it("Noul incerto força unclassified", async () => {
    const res = await classifyIntent(
      { chain: "ethereum", selector: "0xdeadbeef" },
      { enabled: true, assess: mockClient("swap", 0.9, 0.3) },
    );
    expect(res.intent).toBe("unclassified");
    expect(res.source).toBe("typesafe");
  });

  it("timeout vira unavailable sem excecao", async () => {
    const hanging = { async systemOne(): Promise<never> { await new Promise(() => {}); throw new Error("unreachable"); } };
    const res = await classifyIntent({ chain: "ethereum", selector: "0xdeadbeef" }, { enabled: true, assess: hanging, timeoutMs: 50 });
    expect(res).toEqual({ intent: "unclassified", confidence: 0, source: "unavailable" });
  });

  it("rejeita input vazio", async () => {
    const res = await classifyIntent({}, { enabled: true, assess: mockClient("send", 1, 1) });
    expect(res.source).toBe("unavailable");
  });
});
