import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/metrics/dashboard";
import { getAuthContextFromRequest, requirePermission } from "@/lib/auth/rbac";

export async function GET(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "view_portfolio");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  return NextResponse.json(getDashboardMetrics());
}
