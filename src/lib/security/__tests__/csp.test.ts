import { describe, it, expect } from "bun:test";
import { generateNonce, buildReportOnlyPolicy, CSP_REPORT_MAX_BYTES } from "../csp";

describe("csp nonce", () => {
  it("gera nonce unico base64 por chamada", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(b).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it("politica report-only preserva diretivas e injeta nonce", () => {
    const policy = buildReportOnlyPolicy("abc123");
    expect(policy).toContain("script-src 'self' 'nonce-abc123'");
    expect(policy).toContain("style-src 'self' 'nonce-abc123'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain("Content-Security-Policy:");
  });

  it("limite de payload do report e valido", () => {
    expect(CSP_REPORT_MAX_BYTES).toBe(65536);
    expect(Number.isInteger(CSP_REPORT_MAX_BYTES)).toBe(true);
  });

  it("valida report: ok, grande e malformado", async () => {
    const { validateCspReport, recordCspViolation, snapshotCspCounters, resetCspForTest } = await import("../csp");
    expect(validateCspReport({ "csp-report": {} }, 100)).toEqual({ ok: true, status: 204 });
    expect(validateCspReport({ "csp-report": {} }, CSP_REPORT_MAX_BYTES + 1)).toEqual({ ok: false, status: 413 });
    expect(validateCspReport("nope", 10)).toEqual({ ok: false, status: 400 });
    expect(validateCspReport(null, 10)).toEqual({ ok: false, status: 400 });
    resetCspForTest();
    recordCspViolation("example.com");
    recordCspViolation("example.com");
    expect(snapshotCspCounters()).toEqual({ report: 2 });
  });
});
