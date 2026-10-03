export const CSP_REPORT_MAX_BYTES = 65536;
export const CSP_REPORT_PATH = "/api/csp-report";
export const CSP_REPORT_ENDPOINT_NAME = "csp-endpoint";

export function reportingEndpointsHeader(): string {
  return `${CSP_REPORT_ENDPOINT_NAME}="${CSP_REPORT_PATH}"`;
}

export function isCspEnforceOn(env: Record<string, string | undefined> = process.env): boolean {
  const raw = env.CSP_ENFORCE;
  if (raw === undefined) return false;
  return raw === "1" || raw.toLowerCase() === "true";
}

const cspViolationCounters = new Map<string, number>();

export type CspMode = "enforcing" | "report-only";

export function recordCspViolation(documentHost: string, mode: CspMode = "report-only"): void {
  const scope = documentHost.length > 0 ? "report" : "report:unknown-host";
  const key = `${scope}:${mode}`;
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
  if (typeof body !== "object" || body === null) return { ok: false, status: 400 };
  if (Array.isArray(body)) {
    if (body.length === 0) return { ok: false, status: 400 };
    return { ok: true, status: 204 };
  }
  const report = (body as Record<string, unknown>)["csp-report"];
  if (typeof report !== "object" || report === null || Array.isArray(report)) return { ok: false, status: 400 };
  return { ok: true, status: 204 };
}

export function buildEnforcingPolicy(nonce: string): string {
  return `${buildReportOnlyPolicy(nonce)}; report-to ${CSP_REPORT_ENDPOINT_NAME}`;
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
