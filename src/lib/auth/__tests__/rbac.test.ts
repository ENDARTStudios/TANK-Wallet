import { describe, it, expect } from "bun:test";
import { hasPermission, requirePermission, getSessionContext } from "../rbac";

describe("rbac", () => {
  it("viewer pode ver portfolio mas não assinar", () => {
    expect(hasPermission("viewer", "view_portfolio")).toBe(true);
    expect(hasPermission("viewer", "sign_transaction")).toBe(false);
  });

  it("member pode assinar e revogar", () => {
    expect(hasPermission("member", "sign_transaction")).toBe(true);
    expect(hasPermission("member", "revoke_approval")).toBe(true);
    expect(hasPermission("member", "manage_members")).toBe(false);
  });

  it("admin pode gerenciar membros e billing", () => {
    expect(hasPermission("admin", "manage_members")).toBe(true);
    expect(hasPermission("admin", "manage_billing")).toBe(true);
    expect(hasPermission("admin", "delete_workspace")).toBe(false);
  });

  it("security pode lockdown global e exportar audit", () => {
    expect(hasPermission("security", "lockdown_global")).toBe(true);
    expect(hasPermission("security", "export_audit")).toBe(true);
  });

  it("owner tem todas inclusive delete", () => {
    expect(hasPermission("owner", "delete_workspace")).toBe(true);
    expect(hasPermission("owner", "sign_transaction")).toBe(true);
  });

  it("requirePermission 401 quando sem sessão", () => {
    expect(requirePermission(null, "view_portfolio")).toEqual({ ok: false, status: 401, message: "Unauthorized" });
    expect(requirePermission({ role: undefined }, "view_portfolio").ok).toBe(false);
  });

  it("requirePermission 403 quando sem permissão", () => {
    const res = requirePermission({ role: "viewer" }, "sign_transaction");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
  });

  it("requirePermission ok quando tem permissão", () => {
    expect(requirePermission({ role: "member" }, "sign_transaction")).toEqual({ ok: true });
  });

  it("deny-by-default para role desconhecido", () => {
    expect(hasPermission("unknown" as never, "view_portfolio")).toBe(false);
  });

  it("getSessionContext lê headers", () => {
    const h = new Headers({ "x-workspace-id": "ws_1", "x-user-role": "admin", "x-user-id": "u_1" });
    const ctx = getSessionContext(h);
    expect(ctx?.workspaceId).toBe("ws_1");
    expect(ctx?.role).toBe("admin");
  });

  it("POST /api/threats/seed exige admin|security|owner", () => {
    expect(requirePermission({ role: "viewer" }, "post_threats_seed").ok).toBe(false);
    expect(requirePermission({ role: "member" }, "post_threats_seed").ok).toBe(false);
    expect(requirePermission({ role: "admin" }, "post_threats_seed").ok).toBe(true);
    expect(requirePermission({ role: "security" }, "post_threats_seed").ok).toBe(true);
    expect(requirePermission({ role: "owner" }, "post_threats_seed").ok).toBe(true);
  });
});
