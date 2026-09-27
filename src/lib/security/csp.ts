export const CSP_REPORT_MAX_BYTES = 65536;
export const CSP_REPORT_PATH = "/api/csp-report";

const cspViolationCounters = new Map<string, number>();

export function recordCspViolation(documentHost: string): void {
  const key = documentHost.length > 0 ? "report" : "report:unknown-host";
  cspViolationCounters.set(key, (cspViolationCounters.get(key) ?? 0) + 1);
}

export function snapshotCspCounters(): Record<string, number> {
  return Object.fromEntries(cspViolationCounters);
}

export function resetCspForTest(): void {
  cspViolationCounters.clear();
}

export function validateCspReport(body: unknown, byteLength: number): { ok: boolean; status: number } {
  if (byteLength > CSP_REPORT_MAX_BYTES) return { ok: false, status: 413 };
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, status: 400 };
  return { ok: true, status: 204 };
}

export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function buildReportOnlyPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    `report-uri ${CSP_REPORT_PATH}`,
  ].join("; ");
}
