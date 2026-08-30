import { describe, it, expect } from "bun:test";
import { googleProvider, appleProvider, getAuthorizeUrl } from "../oauth";

describe("oauth", () => {
  it("googleProvider ok", () => {
    const p = googleProvider("cid", "secret");
    expect(p.id).toBe("google");
    expect(p.authorizeUrl).toContain("google");
  });

  it("appleProvider ok", () => {
    const p = appleProvider("cid", "secret");
    expect(p.id).toBe("apple");
    expect(p.tokenUrl).toContain("apple");
  });

  it("getAuthorizeUrl", () => {
    const p = googleProvider("cid", "secret");
    const u = getAuthorizeUrl(p, "state1", "https://app/cb");
    expect(u).toContain("client_id=cid");
    expect(u).toContain("state=state1");
    expect(u).toContain("redirect_uri=");
  });
});
