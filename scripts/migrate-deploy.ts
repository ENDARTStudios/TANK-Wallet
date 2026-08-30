import { execSync } from "child_process";

export interface MigrateDeployResult { ok: boolean; steps: number; error?: string }

export function migrateDeploy(dbUrl: string): MigrateDeployResult {
  if (!dbUrl.startsWith("postgres")) {
    return { ok: false, steps: 0, error: "Not Postgres" };
  }
  try {
    const out = execSync(`npx prisma migrate deploy --schema prisma/schema.postgres.prisma`, {
      env: { ...process.env, DATABASE_URL: dbUrl },
      encoding: "utf8",
      stdio: "pipe",
    });
    const steps = (out.match(/Migration name/mg) ?? []).length;
    return { ok: true, steps };
  } catch (e) {
    return { ok: false, steps: 0, error: (e as Error).message };
  }
}
