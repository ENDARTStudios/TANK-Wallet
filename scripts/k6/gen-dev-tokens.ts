// DEV-ONLY forger de JWT para k6 autenticado (T101). NUNCA produção:
// produção usa NEXTAUTH_SECRET real (Vercel env, ≠ deste segredo);
// tokens daqui só validam contra servidor local com o MESMO segredo de dev.
// Uso: K6_TOKENS=$(bun scripts/k6/gen-dev-tokens.ts) k6 run scripts/k6/authenticated.js
// (tokens nunca commitados — viajam só por variável de ambiente do shell)
import { encode } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
const n = Number(process.env.K6_USERS ?? 5);
if (!Number.isFinite(n) || n < 2) throw new Error("K6_USERS >= 2");

const out: string[] = [];
for (let i = 0; i < n; i++) {
  const id = `k6-user-${i}`;
  out.push(
    await encode({
      token: { sub: id, role: "member", workspaceId: "k6-ws" },
      secret,
      maxAge: 600,
    }),
  );
}
console.log(out.join(","));
