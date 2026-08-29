import { describe, it, expect, beforeEach } from "bun:test";
import { discoverAssets, clearIndexerCacheForTest } from "../index";

describe("indexer", () => {
  beforeEach(() => clearIndexerCacheForTest());

  it("descobre ERC20 em EVM", async () => {
    const res = await discoverAssets({ chain: "ethereum", address: "0xabc" });
    expect(res.erc20.length).toBeGreaterThan(0);
    expect(res.cached).toBe(false);
  });

  it("cache retorna cached=true na segunda chamada", async () => {
    const input = { chain: "polygon", address: "0xdef" };
    const first = await discoverAssets(input, { now: 1000 });
    expect(first.cached).toBe(false);
    const second = await discoverAssets(input, { now: 2000 });
    expect(second.cached).toBe(true);
    expect(second.erc20).toEqual(first.erc20);
  });

  it("descobre SPL em Solana", async () => {
    const res = await discoverAssets({ chain: "solana", address: "So11111111111111111111111111111111111111112" });
    expect(res.spl.length).toBeGreaterThan(0);
  });

  it("descobre BTC via Blockstream", async () => {
    const res = await discoverAssets({ chain: "bitcoin", address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" });
    expect(res.btc.length).toBeGreaterThan(0);
  });
});
