import { describe, it, expect, beforeEach } from "bun:test";
import { announceProvider, requestProviders, onAnnounceProvider, getProviders, getInjectedProvider, resetEIP6963ForTest } from "../index";

describe("eip6963", () => {
  beforeEach(() => resetEIP6963ForTest());

  it("announceProvider registra provider", () => {
    announceProvider({ info: { uuid: "u1", name: "TANK", icon: "", rdns: "dev.tank" }, provider: {} });
    expect(getProviders()).toHaveLength(1);
    expect(getProviders()[0].info.name).toBe("TANK");
  });

  it("onAnnounceProvider captura evento", () => {
    let captured: unknown = null;
    const off = onAnnounceProvider((d) => (captured = d));
    announceProvider({ info: { uuid: "u2", name: "MetaMask", icon: "", rdns: "io.metamask" }, provider: {} });
    expect(captured).toBeTruthy();
    off();
  });

  it("requestProviders dispara evento sem erro", () => {
    expect(() => requestProviders()).not.toThrow();
  });

  it("getInjectedProvider retorna null quando sem window.ethereum", () => {
    expect(getInjectedProvider()).toBeNull();
  });
});
