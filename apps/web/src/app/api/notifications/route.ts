import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribePush, getSubscription } from "@/lib/notifications";
import { getAuthContextFromRequest, requirePermission } from "@/lib/auth/rbac";

const Body = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) });

export async function POST(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "view_portfolio");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const ws = ctx?.workspaceId ?? "default";
  subscribePush(ws, parsed.data);
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  const perm = requirePermission(ctx, "view_portfolio");
  if (!perm.ok) return NextResponse.json({ error: perm.message }, { status: perm.status });
  const ws = ctx?.workspaceId ?? "default";
  const sub = getSubscription(ws);
  return NextResponse.json({ subscription: sub ?? null });
}
