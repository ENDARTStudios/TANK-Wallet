import { existsSync, copyFileSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

export interface BackupResult { backupPath: string; size: number; timestamp: number }
export interface RestoreResult { ok: boolean; rows: number }

export function createBackup(src: string, dest: string): BackupResult {
  if (!existsSync(src)) throw new Error("Source not found");
  copyFileSync(src, dest);
  const stat = readFileSync(dest);
  return { backupPath: dest, size: stat.length, timestamp: Date.now() };
}

export function restoreBackup(backup: string, target: string): RestoreResult {
  if (!existsSync(backup)) throw new Error("Backup not found");
  if (existsSync(target)) unlinkSync(target);
  copyFileSync(backup, target);
  const stat = readFileSync(target);
  return { ok: true, rows: stat.length };
}

export function verifyBackup(backup: string, expectedSize: number): boolean {
  if (!existsSync(backup)) return false;
  const stat = readFileSync(backup);
  return stat.length === expectedSize;
}

export function pgDump(dbUrl: string, dest: string): BackupResult {
  execSync(`pg_dump "${dbUrl}" > "${dest}"`, { stdio: "ignore" });
  const stat = readFileSync(dest);
  return { backupPath: dest, size: stat.length, timestamp: Date.now() };
}

export function pgRestore(dbUrl: string, backup: string): RestoreResult {
  execSync(`psql "${dbUrl}" < "${backup}"`, { stdio: "ignore" });
  writeFileSync;
  return { ok: true, rows: 0 };
}

void join;
