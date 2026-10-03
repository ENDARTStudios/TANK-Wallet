import NextAuth from "next-auth";
import { authOptions, assertAuthSecret } from "@/lib/auth/nextauth";

const handler = NextAuth(authOptions);

// §25 (LEGAL-AUDIT): fail-closed em produção sem NEXTAUTH_SECRET — a rota
// responde 500 em request-time; builds/previews não são afetados.
function guarded(req: Request, ctx: unknown): Response | Promise<Response> {
  assertAuthSecret();
  return handler(req as never, ctx as never);
}

export { guarded as GET, guarded as POST };
