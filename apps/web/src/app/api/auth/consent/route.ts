import { NextResponse } from "next/server";
import { getAuthContextFromRequest } from "@/lib/auth/rbac";
import { consentSchema, recordConsent } from "@/lib/auth/consent";
import { db } from "@/lib/db";

// §7/§9 (LEGAL-AUDIT): evidência server-side do aceite de Termos/Privacidade.
export async function POST(req: Request) {
  const ctx = await getAuthContextFromRequest(req);
  if (!ctx?.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = consentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  try {
    // Cast localizado na fronteira do Prisma: o union gerado (UserUpdateArgs)
    // varia entre installs (bun.lock local vs npm na Vercel) e não é expressável
    // como tipo estável na fachada — ver D103. Lib e testes permanecem limpos.
    const stored = await recordConsent(
      (args) => db.user.update(args as unknown as Parameters<typeof db.user.update>[0]),
      ctx.userId,
      parsed.data,
    );
    return NextResponse.json({ success: true, ...stored });
  } catch {
    // Usuário inexistente no banco (ex.: sessão JWT sem registro) — não vaza detalhe.
    return NextResponse.json({ error: "Failed to record consent" }, { status: 500 });
  }
}
