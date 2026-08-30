import { describe, it, expect } from "bun:test";
import { applyRls, countRlsStatements } from "../apply-rls";

describe("rls-apply", () => {
  it("skip quando não postgres", async () => {
    const r = await applyRls("file:./test.db");
    expect(r.skipped).toBe(true);
    expect(r.reason).toBe("Not Postgres");
  });

  it("apply quando postgres", async () => {
    const r = await applyRls("postgresql://user:pass@localhost:5432/db");
    expect(r.applied).toBe(true);
    expect(r.statements).toBeGreaterThan(0);
  });

  it("countRlsStatements > 0", () => {
    expect(countRlsStatements()).toBeGreaterThan(0);
  });
});
