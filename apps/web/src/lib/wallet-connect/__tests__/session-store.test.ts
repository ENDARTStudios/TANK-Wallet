import { describe, it, expect, beforeEach } from "bun:test";
import { saveSession, loadSession, clearSession, listSessions, clearAllSessionsForTest } from "../session-store";

describe("session-store", () => {
  beforeEach(() => clearAllSessionsForTest());

  it("save/load roundtrip", () => {
    const s = { topic: "t1", namespaces: {}, expiry: Date.now() + 60000, createdAt: Date.now() };
    saveSession("ws1", s);
    expect(loadSession("ws1")?.topic).toBe("t1");
  });

  it("load retorna undefined se não existe", () => {
    expect(loadSession("wsX")).toBeUndefined();
  });

  it("clearSession remove", () => {
    saveSession("ws1", { topic: "t", namespaces: {}, expiry: 0, createdAt: 0 });
    expect(clearSession("ws1")).toBe(true);
    expect(loadSession("ws1")).toBeUndefined();
  });

  it("listSessions retorna workspaces", () => {
    saveSession("a", { topic: "x", namespaces: {}, expiry: 0, createdAt: 0 });
    saveSession("b", { topic: "y", namespaces: {}, expiry: 0, createdAt: 0 });
    expect(listSessions().sort()).toEqual(["a", "b"]);
  });
});
