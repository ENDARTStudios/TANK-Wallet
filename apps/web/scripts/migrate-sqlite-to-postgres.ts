import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

interface MigrationOptions {
  sqlitePath: string;
  postgresUrl: string;
  batchSize?: number;
}

export async function migrateSqliteToPostgres(opts: MigrationOptions): Promise<{ tables: number; rows: number }> {
  const sqlite = new PrismaClient({ datasources: { db: { url: `file:${opts.sqlitePath}` } } });
  const pg = new PrismaClient({ datasources: { db: { url: opts.postgresUrl } } });
  let totalRows = 0;
  const tables = ["ThreatToken", "ThreatSite", "ThreatAddress", "ThreatExploit", "PermissionAuditLog", "BehaviorProfile", "BehaviorAnomaly", "RecoveryContact", "Workspace", "User"];
  for (const t of tables) {
    try {
      const rows = await (sqlite as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[t.charAt(0).toLowerCase() + t.slice(1)].findMany();
      for (const row of rows as Record<string, unknown>[]) {
        try {
          await (pg as unknown as Record<string, { create: (args: { data: unknown }) => Promise<unknown> }>)[t.charAt(0).toLowerCase() + t.slice(1)].create({ data: row });
          totalRows++;
        } catch {}
      }
    } catch {}
  }
  await sqlite.$disconnect();
  await pg.$disconnect();
  void execSync;
  return { tables: tables.length, rows: totalRows };
}
