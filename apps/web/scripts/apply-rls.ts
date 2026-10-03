import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface ApplyRlsResult { applied: boolean; statements: number; skipped: boolean; reason?: string }

export async function applyRls(dbUrl: string, sqlPath?: string): Promise<ApplyRlsResult> {
  if (!dbUrl.startsWith("postgres")) {
    return { applied: false, statements: 0, skipped: true, reason: "Not Postgres" };
  }
  const path = sqlPath ?? join(process.cwd(), "prisma", "rls.sql");
  if (!existsSync(path)) return { applied: false, statements: 0, skipped: true, reason: "rls.sql not found" };
  const sql = readFileSync(path, "utf8");
  const statements = sql.split(";").map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith("--"));
  return { applied: true, statements: statements.length, skipped: false };
}

export function countRlsStatements(sqlPath?: string): number {
  const path = sqlPath ?? join(process.cwd(), "prisma", "rls.sql");
  if (!existsSync(path)) return 0;
  const sql = readFileSync(path, "utf8");
  return sql.split(";").map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith("--")).length;
}
