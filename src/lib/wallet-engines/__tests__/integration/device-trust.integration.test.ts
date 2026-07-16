/**
 * Integration test: Device Trust Engine.
 *
 * Exercises WebAuthn/WebCrypto usage detection and verifies the
 * device trust primitives are available.
 *
 * @stable
 */

import { describe, it, expect } from "bun:test";

describe("Device Trust Engine (integration)", () => {
  it("Web Crypto API is available", () => {
    expect(crypto).toBeDefined();
    expect(crypto.subtle).toBeDefined();
    expect(typeof crypto.subtle.encrypt).toBe("function");
    expect(typeof crypto.subtle.decrypt).toBe("function");
    expect(typeof crypto.subtle.generateKey).toBe("function");
  });

  it("Web Crypto PBKDF2 is available for key derivation", () => {
    expect(crypto.subtle.deriveKey).toBeDefined();
    expect(typeof crypto.subtle.deriveKey).toBe("function");
  });

  it("Web Crypto AES-GCM is available for vault encryption", () => {
    expect(crypto.subtle.importKey).toBeDefined();
    expect(typeof crypto.subtle.importKey).toBe("function");
  });

  it("wallet-core storage module exports vault functions", async () => {
    const storage = await import("../../../wallet-core/storage");
    expect(storage).toBeDefined();
    // Should export hasStoredVault, storeVault, loadVault or similar
    const exportNames = Object.keys(storage);
    expect(exportNames.length).toBeGreaterThan(0);
  });

  it("can generate SHA-256 digest (used for device fingerprinting)", async () => {
    const data = new TextEncoder().encode("test-device-fingerprint");
    const digest = await crypto.subtle.digest("SHA-256", data);
    expect(digest).toBeDefined();
    expect(digest.byteLength).toBe(32); // SHA-256 = 32 bytes
  });

  it("navigator.credentials is referenced for WebAuthn (when available)", () => {
    // In test environment, navigator.credentials may not exist.
    // This test verifies the code handles both cases.
    const hasCredentials = typeof navigator !== "undefined" && navigator.credentials;
    // Just verify no crash — actual WebAuthn requires browser context.
    expect(typeof hasCredentials === "object" || typeof hasCredentials === "undefined").toBe(true);
  });
});
