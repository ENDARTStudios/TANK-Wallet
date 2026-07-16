/** HMAC chain for tamper-evident audit log. @stable */
import { createHmac, randomBytes } from "node:crypto";
import { InternalError } from "@/lib/wallet-core/errors";
export interface ChainedAuditEntry { sequence: number; timestamp: string; eventType: string; walletAddress: string; payload: Record<string, unknown>; hmac: string; prevHmac: string | null; }
let chainSecret: string | null = null; let lastHmac: string | null = null; let seq = 0;
export function initAuditChain(secret: string): void { chainSecret = secret; }
export function generateChainSecret(): string { return randomBytes(32).toString("hex"); }
export function computeEntryHmac(entry: Omit<ChainedAuditEntry,"hmac">, secret: string): string {
  const c = JSON.stringify({ sequence: entry.sequence, timestamp: entry.timestamp, eventType: entry.eventType, walletAddress: entry.walletAddress, payload: entry.payload, prevHmac: entry.prevHmac });
  return createHmac("sha256", secret).update((entry.prevHmac ?? "") + c, "utf8").digest("hex");
}
export function appendAuditEntry(eventType: string, walletAddress: string, payload: Record<string, unknown>): ChainedAuditEntry {
  if (!chainSecret) throw new InternalError("TANK-8002", "Audit chain not initialized");
  seq += 1;
  const entry: Omit<ChainedAuditEntry,"hmac"> = { sequence: seq, timestamp: new Date().toISOString(), eventType, walletAddress, payload, prevHmac: lastHmac };
  const hmac = computeEntryHmac(entry, chainSecret);
  lastHmac = hmac;
  return { ...entry, hmac };
}
export function verifyAuditChain(entries: ChainedAuditEntry[], secret: string): { valid: boolean; brokenAt?: number; reason?: string } {
  let prev: string | null = null;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.prevHmac !== prev) return { valid: false, brokenAt: i+1, reason: `prevHmac mismatch at ${e.sequence}` };
    const { hmac, ...rest } = e; const exp = computeEntryHmac(rest, secret);
    if (hmac !== exp) return { valid: false, brokenAt: i+1, reason: `HMAC mismatch at ${e.sequence}` };
    prev = hmac;
  }
  return { valid: true };
}
export function _resetChainForTesting(): void { chainSecret = null; lastHmac = null; seq = 0; }
