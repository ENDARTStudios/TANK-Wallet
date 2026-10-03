import { describe, it, expect } from "bun:test";
import { redactSecrets, redactObject } from "../redact";

describe("redact", () => {
  it("redacta github_pat", () => {
    const out = redactSecrets("token: github_pat_abc123_xyz");
    expect(out).toContain("[REDACTED:github_pat]");
    expect(out).not.toContain("abc123");
  });

  it("redacta bearer", () => {
    const out = redactSecrets("Authorization: Bearer abc.def.ghi");
    expect(out).toContain("[REDACTED:bearer]");
  });

  it("redacta email", () => {
    const out = redactSecrets("contact: alice@example.com");
    expect(out).toContain("[REDACTED:email]");
  });

  it("redactObject recursivo", () => {
    const obj = { token: "ghp_abcdefghijklmnopqrstuvwxyz0123456789", user: { email: "x@y.com" }, count: 42 };
    const r = redactObject(obj);
    expect((r as Record<string, unknown>).token).toContain("[REDACTED:github_token]");
    expect(((r as Record<string, unknown>).user as Record<string, unknown>).email).toContain("[REDACTED:email]");
    expect((r as Record<string, unknown>).count).toBe(42);
  });
});
