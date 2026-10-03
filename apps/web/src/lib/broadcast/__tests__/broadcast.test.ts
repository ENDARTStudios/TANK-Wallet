import { describe, it, expect } from "bun:test";
import { broadcastTx } from "../index";

describe("broadcast", () => {
  it("sucesso no primeiro RPC", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ result: "0xabc123" }), { headers: { "Content-Type": "application/json" } });
    const res = await broadcastTx({ chain: "ethereum", signedTx: "0xdeadbeef" }, { fetchFn: mockFetch as never });
    expect(res.success).toBe(true);
    expect(res.hash).toBe("0xabc123");
  });

  it("failover para segundo RPC quando primeiro falha", async () => {
    let calls = 0;
    const mockFetch = async () => {
      calls++;
      if (calls === 1) throw new Error("timeout");
      return new Response(JSON.stringify({ result: "0xhash2" }), { headers: { "Content-Type": "application/json" } });
    };
    const res = await broadcastTx({ chain: "ethereum", signedTx: "0xdeadbeef" }, { fetchFn: mockFetch as never });
    expect(res.success).toBe(true);
    expect(res.hash).toBe("0xhash2");
    expect(calls).toBe(2);
  });

  it("falha quando todos RPCs falham", async () => {
    const mockFetch = async () => {
      throw new Error("network");
    };
    const res = await broadcastTx({ chain: "ethereum", signedTx: "0xdeadbeef" }, { fetchFn: mockFetch as never });
    expect(res.success).toBe(false);
    expect(res.error).toBeTruthy();
  });
});
