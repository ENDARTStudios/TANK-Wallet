import { NextResponse } from "next/server";
import { z } from "zod";
import { aggregateThreatIntel } from "@/lib/threat-intel/aggregator";
import { getAuthContextFromRequest, requirePermission } from "@/lib/auth/rbac";
import { withWorkspaceFilter } from "@/lib/db/rls";

const Body = z.object({
  chain: z.string().optional(),
  address: z.string().optional(),
  url: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });

  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "get_threats");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });

  const { chain, address, url } = parsed.data;
  if (!chain && !address && !url) return NextResponse.json({ error: "Provide chain/address or url" }, { status: 400 });

  const where = withWorkspaceFilter(ctx?.workspaceId, {});
  const result = await aggregateThreatIntel({ chain, address, url, workspaceId: where.workspaceId });

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "get_threats");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  return NextResponse.json({ ok: true, service: "risk", version: "1.0.0" });
}
