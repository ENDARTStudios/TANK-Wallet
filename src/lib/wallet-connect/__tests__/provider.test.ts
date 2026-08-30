import { describe, it, expect } from "bun:test";
import { createWCProvider, buildConnectionUri, defaultEip155Namespace } from "../provider";

describe("WCProvider", () => {
  it("createWCProvider exige projectId", () => {
    expect(() => createWCProvider({ projectId: "", metadata: { name: "TANK", url: "https://tankwallet.dev", icons: [] }, namespaces: defaultEip155Namespace() })).toThrow();
  });

  it("createWCProvider com config válida", () => {
    const p = createWCProvider({ projectId: "pid123", metadata: { name: "TANK", url: "https://tankwallet.dev", icons: [] }, namespaces: defaultEip155Namespace() });
    expect(p.projectId).toBe("pid123");
  });

  it("defaultEip155Namespace com chains custom", () => {
    const ns = defaultEip155Namespace(["eip155:137", "eip155:1"]);
    expect(ns.eip155.chains).toEqual(["eip155:137", "eip155:1"]);
  });

  it("buildConnectionUri", () => {
    const p = createWCProvider({ projectId: "pid", metadata: { name: "TANK", url: "https://tankwallet.dev", icons: [] }, namespaces: defaultEip155Namespace() });
    const uri = buildConnectionUri(p, "topic_abc");
    expect(uri).toContain("wc:topic_abc@2");
    expect(uri).toContain("projectId=pid");
  });
});
