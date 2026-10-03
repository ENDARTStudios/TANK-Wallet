import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword, needsRehash, hashPassword } from "@/lib/auth/password";

const DEV_FALLBACK_SECRET = "dev-secret-change-me";

// §25 (LEGAL-AUDIT): segredo previsível nunca pode proteger produção.
// A validação acontece em REQUEST-TIME (assertAuthSecret nos handlers), não no
// import — throw em escopo de módulo quebra `next build`/previews sem a env
// (lição do CI do PR #99: "Failed to collect page data").
export function assertAuthSecret(env: NodeJS.ProcessEnv = process.env): void {
  const raw = env.NEXTAUTH_SECRET?.trim();
  if (raw && raw !== DEV_FALLBACK_SECRET) return;
  // Vercel preview (VERCEL_ENV=preview) é o único ambiente de produção-node
  // isento: deploys de PR não têm acesso aos envs de produção (precedente T079).
  if (env.NODE_ENV === "production" && env.VERCEL_ENV !== "preview") {
    throw new Error(
      "NEXTAUTH_SECRET must be set to a strong value in production (refusing predictable fallback)",
    );
  }
}

export const authOptions: NextAuthOptions = {
  // String de init apenas; produção sem NEXTAUTH_SECRET é bloqueada em
  // request-time por assertAuthSecret() (rotas de auth → 500, fail-closed).
  secret: process.env.NEXTAUTH_SECRET?.trim() || DEV_FALLBACK_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
        if (!user) return null;
        if (user.password && !(await verifyPassword(credentials.password ?? "", user.password))) return null;
        // SEC-001: upgrade transparente — legado em texto puro é rehasheado no login.
        if (user.password && needsRehash(user.password)) {
          try {
            const hashed = await hashPassword(credentials.password);
            await db.user.update({ where: { id: user.id }, data: { password: hashed } });
          } catch (err) {
            console.warn("[auth] rehash de upgrade falhou (login segue)", err);
          }
        }
        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role,
          workspaceId: user.workspaceId ?? undefined,
        } as unknown as { id: string; email: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role?: string; workspaceId?: string };
        if (u.role) (token as Record<string, unknown>).role = u.role;
        if (u.workspaceId) (token as Record<string, unknown>).workspaceId = u.workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as unknown as { role?: string; workspaceId?: string; sub?: string };
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).role = t.role;
        (session.user as unknown as Record<string, unknown>).workspaceId = t.workspaceId;
        (session.user as unknown as Record<string, unknown>).id = t.sub;
      }
      return session;
    },
  },
  pages: { signIn: "/" },
};
