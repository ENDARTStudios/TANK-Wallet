import { NextResponse } from "next/server";
import { z } from "zod";
import { broadcastTx } from "@/lib/broadcast";
import { getAuthContextFromRequest, requirePermission } from "@/lib/auth/rbac";

const Body = z.object({ chain: z.string(), signedTx: z.string().regex(/^0x[0-9a-fA-F]+$/) });

export async function POST(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "sign_transaction");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  const result = await broadcastTx(parsed.data as never);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json(result);
}
