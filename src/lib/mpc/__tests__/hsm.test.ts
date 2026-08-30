import { describe, it, expect } from "bun:test";
import { createLocalHsm, createRemoteHsm } from "../hsm";

describe("hsm", () => {
  it("localHsm sign determinístico", async () => {
    const hsm = createLocalHsm();
    const sig1 = await hsm.sign(new Uint8Array([1, 2, 3]), "key1");
    const sig2 = await hsm.sign(new Uint8Array([1, 2, 3]), "key1");
    expect(sig1).toBe(sig2);
    expect(sig1.startsWith("key1:")).toBe(true);
  });

  it("localHsm getPublicKey", async () => {
    const hsm = createLocalHsm();
    const pk = await hsm.getPublicKey("mykey");
    expect(pk).toContain("pub_mykey");
  });

  it("remoteHsm usa endpoint", async () => {
    const hsm = createRemoteHsm("https://hsm.example.com");
    const sig = await hsm.sign(new Uint8Array([5, 5]), "k");
    expect(sig).toContain("remote:https://hsm.example.com");
  });
});
