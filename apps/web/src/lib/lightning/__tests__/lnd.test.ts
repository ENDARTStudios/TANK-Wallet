import { describe, it, expect } from "bun:test";
import { openChannel, closeChannel, listChannels } from "../lnd";

describe("lnd", () => {
  it("openChannel cria pending", () => {
    const ch = openChannel({ capacity: 500000, partnerPubkey: "03mockpubkeymockpubkeymockpubkeymo" });
    expect(ch.state).toBe("pending");
    expect(ch.capacity).toBe(500000);
    expect(ch.fundingTx).toBeTruthy();
  });

  it("closeChannel muda estado", () => {
    const ch = openChannel({ capacity: 100, partnerPubkey: "03a" });
    const res = closeChannel(ch);
    expect(res.state).toBe("closed");
    expect(res.closingTx).toContain("close_");
  });

  it("listChannels retorna pelo menos 1 mock", () => {
    const channels = listChannels();
    expect(channels.length).toBeGreaterThanOrEqual(1);
  });
});
