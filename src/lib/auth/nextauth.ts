import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
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
        if (user.password && credentials.password !== user.password) return null;
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
