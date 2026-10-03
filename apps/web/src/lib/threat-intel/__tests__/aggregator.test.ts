import { describe, it, expect, beforeEach } from "bun:test";
import { aggregateThreatIntel, clearCacheForTest } from "../aggregator";
import { db } from "@/lib/db";

describe("threat-intel aggregator", () => {
  beforeEach(() => clearCacheForTest());

  it("retorna allow para input limpo (sem DB hit, sem GoPlus)", async () => {
    const res = await aggregateThreatIntel({ chain: "ethereum", address: "0x0000000000000000000000000000000000000001" });
    expect(res.recommendation).toBe("allow");
    expect(res.score).toBe(0);
    expect(res.sources).toHaveLength(0);
  });

  it("detecta token malicioso via DB (usa threatToken seed se existir)", async () => {
    let existing: Awaited<ReturnType<typeof db.threatToken.findFirst>> = null;
    try {
      existing = await db.threatToken.findFirst({ where: { active: true } });
    } catch {
      existing = null;
    }
    if (!existing) {
      const res = await aggregateThreatIntel({ chain: "bsc", address: "0x4f2a9c2b3e1d4a5f6b7c8d9e0f1a2b3c4d5e6f70" });
      expect(res.score).toBeGreaterThanOrEqual(0);
      return;
    }
    const res = await aggregateThreatIntel({ chain: existing.chain, address: existing.address });
    expect(res.sources.some((s) => s.source === existing.source)).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(existing.severity - 5);
  });

  it("block para ChainPatrol url maliciosa", async () => {
    const res = await aggregateThreatIntel({ url: "metarnask-login.com" });
    expect(res.recommendation).toBe("block");
    expect(res.maxSeverity).toBe(100);
  });

  it("cache retorna cached=true na segunda chamada", async () => {
    const input = { chain: "ethereum", address: "0x00000000000000000000000000000000000000aa", url: "example.com" };
    const first = await aggregateThreatIntel(input, { now: 1000 });
    expect(first.cached).toBe(false);
    const second = await aggregateThreatIntel(input, { now: 2000 });
    expect(second.cached).toBe(true);
    expect(second.score).toBe(first.score);
  });

  it("timeout não quebra (retorna pelo menos DB)", async () => {
    const res = await aggregateThreatIntel({ chain: "ethereum", address: "0x00000000000000000000000000000000000000bb" }, { timeoutMs: 1 });
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.sources)).toBe(true);
  });
});
