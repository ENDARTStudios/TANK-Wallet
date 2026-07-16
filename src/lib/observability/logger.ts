/**
 * Structured logger for Tank Wallet.
 * @stable
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "critical";
const SENSITIVE_KEYS = /^(mnemonic|seed|privateKey|secretKey|password|pwd|token|apiKey|secret)$/i;
function mask(v: unknown): unknown { return v === null || v === undefined ? v : typeof v === "string" ? (v.length <= 4 ? "***" : v.slice(0,2)+"…"+v.slice(-2)) : "***"; }
function sanitize(data: unknown): unknown {
  if (data === null || data === undefined || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEYS.test(k) ? mask(v) : v && typeof v === "object" ? sanitize(v) : v;
  }
  return out;
}
function emit(level: LogLevel, message: string, data?: Record<string, unknown>, opts?: { engine?: string; event?: string }): void {
  const entry = { ts: new Date().toISOString(), level, message, ...(opts?.engine && { engine: opts.engine }), ...(opts?.event && { event: opts.event }), ...(data && { data: sanitize(data) as Record<string, unknown> }), version: "1.0.0" };
  const line = JSON.stringify(entry);
  if (typeof process !== "undefined" && process.stdout) process.stdout.write(line + "\n");
  else if (typeof console !== "undefined") (level === "error" || level === "critical" ? console.error : level === "warn" ? console.warn : console.info)(line);
}
export const logger = {
  trace: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("trace", m, d, o),
  debug: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("debug", m, d, o),
  info: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("info", m, d, o),
  warn: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("warn", m, d, o),
  error: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("error", m, d, o),
  critical: (m: string, d?: Record<string, unknown>, o?: { engine?: string; event?: string }) => emit("critical", m, d, o),
};
export default logger;
