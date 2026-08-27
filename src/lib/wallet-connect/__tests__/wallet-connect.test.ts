import { describe, it, expect, beforeEach } from "bun:test";
import { createWalletConnectClient, getWCClient, resetWCForTest } from "../index";

describe("wallet-connect", () => {
  beforeEach(() => resetWCForTest());

  it("cria client com projectId", () => {
    const c = createWalletConnectClient("test_pid_123");
    expect(c.projectId).toBe("test_pid_123");
    expect(c.sessions.size).toBe(0);
  });

  it("pair cria sessão e dispara onSessionProposal", async () => {
    const c = createWalletConnectClient("pid");
    let proposed: unknown = null;
    c.onSessionProposal((s) => (proposed = s));
    const { topic } = await c.pair("wc:abc123@2?relay-protocol=irn");
    expect(topic).toBeTruthy();
    expect(c.sessions.has(topic)).toBe(true);
    expect(proposed).toBeTruthy();
  });

  it("disconnect remove sessão", async () => {
    const c = createWalletConnectClient("pid");
    const { topic } = await c.pair("wc:xyz@2?relay-protocol=irn");
    expect(c.sessions.has(topic)).toBe(true);
    await c.disconnect(topic);
    expect(c.sessions.has(topic)).toBe(false);
    expect(getWCClient()?.sessions.size).toBe(0);
  });
});
