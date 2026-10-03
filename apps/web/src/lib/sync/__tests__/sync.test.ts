import { describe, it, expect, beforeEach } from "bun:test";
import { syncPortfolio, getSyncStatus, clearSyncForTest } from "../index";

describe("sync", () => {
  beforeEach(() => clearSyncForTest());

  it("syncPortfolio e getSyncStatus", () => {
    const res = syncPortfolio("ws1", { portfolio: 100 });
    expect(res.success).toBe(true);
    const status = getSyncStatus("ws1");
    expect(status.lastSyncAt).toBe(res.at);
    expect(status.pending).toBe(0);
  });

  it("getSyncStatus 0 quando nunca sync", () => {
    expect(getSyncStatus("ws2").lastSyncAt).toBe(0);
  });
});
