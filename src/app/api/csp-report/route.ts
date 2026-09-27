import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContextFromRequest, requirePermission } from "@/lib/auth/rbac";
import { consumeRateLimitAdvanced, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { validateCspReport, recordCspViolation, CSP_REPORT_MAX_BYTES } from "@/lib/security/csp";

const Body = z.object({}).passthrough();

export async function POST(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "get_threats");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  const limit = consumeRateLimitAdvanced(req, { userId: ctx?.userId });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too Many Requests", retryAfter: limit.retryAfter }, { status: 429, headers: limit.headers });
  }
  const raw = await req.text().catch(() => "");
  const byteLength = new TextEncoder().encode(raw).length;
  if (byteLength > CSP_REPORT_MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: limit.headers });
  }
  let body: unknown = null;
  try {
    body = raw.length > 0 ? JSON.parse(raw) : null;
  } catch {
    body = null;
  }
  const parsed = Body.safeParse(body);
  const checked = validateCspReport(parsed.success ? parsed.data : null, byteLength);
  if (!checked.ok) return NextResponse.json({ error: "Invalid report" }, { status: checked.status, headers: limit.headers });
  recordCspViolation("");
  return new NextResponse(null, { status: 204, headers: limit.headers });
}
