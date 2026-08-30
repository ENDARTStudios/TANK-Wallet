import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { createBackup, restoreBackup, verifyBackup } from "../backup-restore";
import { writeFileSync, unlinkSync, existsSync } from "fs";

const src = "scripts/__tests__/_src.db";
const backup = "scripts/__tests__/_backup.db";
const target = "scripts/__tests__/_target.db";

describe("backup-restore", () => {
  beforeEach(() => {
    writeFileSync(src, "sample data " + "x".repeat(100));
  });
  afterEach(() => {
    [src, backup, target].forEach((f) => { if (existsSync(f)) unlinkSync(f); });
  });

  it("createBackup copia arquivo", () => {
    const r = createBackup(src, backup);
    expect(existsSync(backup)).toBe(true);
    expect(r.size).toBeGreaterThan(0);
  });

  it("restoreBackup restaura arquivo", () => {
    createBackup(src, backup);
    const r = restoreBackup(backup, target);
    expect(r.ok).toBe(true);
    expect(verifyBackup(target, r.rows)).toBe(true);
  });
});
