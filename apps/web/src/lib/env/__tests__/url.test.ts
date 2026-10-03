import { describe, it, expect } from "bun:test";
import { resolveBaseUrl } from "../url";

describe("resolveBaseUrl", () => {
  it("prefers valid NEXTAUTH_URL", () => {
    expect(resolveBaseUrl({ NEXTAUTH_URL: "https://app.example.com" })).toBe("https://app.example.com");
  });

  it("falls back on undefined", () => {
    expect(resolveBaseUrl({})).toBe("https://tankwallet.dev");
  });

  it("falls back on empty string", () => {
    expect(resolveBaseUrl({ NEXTAUTH_URL: "" })).toBe("https://tankwallet.dev");
  });

  it("falls back on whitespace only", () => {
    expect(resolveBaseUrl({ NEXTAUTH_URL: "   " })).toBe("https://tankwallet.dev");
  });

  it("falls back on invalid URL", () => {
    expect(resolveBaseUrl({ NEXTAUTH_URL: "not-a-url" })).toBe("https://tankwallet.dev");
  });

  it("prefers VERCEL_URL when NEXTAUTH_URL missing", () => {
    expect(resolveBaseUrl({ VERCEL_URL: "tank-wallet.vercel.app" })).toBe("https://tank-wallet.vercel.app");
  });
});
