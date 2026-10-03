import { describe, it, expect } from "bun:test";
import { withWorkspaceFilter, assertSameWorkspace, filterByWorkspace } from "../rls";

describe("rls", () => {
  it("withWorkspaceFilter injeta workspaceId", () => {
    expect(withWorkspaceFilter("ws_1", { chain: "ethereum" })).toEqual({ chain: "ethereum", workspaceId: "ws_1" });
    expect(withWorkspaceFilter("ws_1", undefined)).toEqual({ workspaceId: "ws_1" });
  });

  it("assertSameWorkspace permite mesmo workspace", () => {
    expect(assertSameWorkspace("ws_1", "ws_1").ok).toBe(true);
    expect(assertSameWorkspace(null, "ws_1").ok).toBe(true);
    expect(assertSameWorkspace(undefined, "ws_1").ok).toBe(true);
  });

  it("assertSameWorkspace bloqueia cross-tenant", () => {
    const res = assertSameWorkspace("ws_1", "ws_2");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
  });

  it("assertSameWorkspace exige contexto", () => {
    expect(assertSameWorkspace("ws_1", null).ok).toBe(false);
    expect(assertSameWorkspace("ws_1", undefined).ok).toBe(false);
  });

  it("filterByWorkspace remove itens de outro workspace", () => {
    const items = [
      { id: "1", workspaceId: "ws_1" },
      { id: "2", workspaceId: "ws_2" },
      { id: "3", workspaceId: null },
      { id: "4" },
    ];
    const filtered = filterByWorkspace(items as never, "ws_1");
    expect(filtered.map((i) => i.id)).toEqual(["1", "3", "4"]);
    expect(filtered.find((i) => i.id === "2")).toBeUndefined();
  });

  it("tentativa cross-workspace retorna 0 rows", () => {
    const all = [{ id: "a", workspaceId: "ws_A" }];
    expect(filterByWorkspace(all as never, "ws_B")).toHaveLength(0);
  });
});
