# STATUS-T101 — k6-authenticated (F08, quita dívida D100)

Data: 2026-09-27. Tarefa: T101-k6-authenticated. Branch: chore/sprint-62-k6-auth.
Resultado: **DONE** — caminho autenticado (JWT + bucket uid:) validado sob carga.

## 1. Harness

- `scripts/k6/gen-dev-tokens.ts`: forja JWT via `encode` (next-auth/jwt) c/ segredo DEV
  (`NEXTAUTH_SECRET ?? "dev-secret-change-me"`, mesma expressão do servidor local).
  Payload `{sub, role: member, workspaceId}` — satisfaz `getToken` (proxy) e
  `getServerSession`+callbacks (rotas). Tokens via `K6_TOKENS` (env, nunca commitados).
- `scripts/k6/authenticated.js`: cenários `steady` (4 VU, users 1–4, sleep 0.5) + `flood`
  (user-0 sem pacing). Thresholds: checks>95%, p95<300ms, `limited_total`>0.

## 2. Evidência (crua, dev local)

```
K6_TOKENS: 5 gerados
k6: 2544/2544 checks, p95 34.42ms, limited_rate 0.9499
```

Leitura: flooder (user-0) tomou 429 em ~95% das iterações (budget uid: próprio, com
Retry-After); steady (users 1–4) **zero 429 cruzado** — isolamento uid: provado sob carga.
Prova de autenticação real (não fallback IP): com bucket IP compartilhado, o steady teria
429 junto (budget 120 estourado pelo flooder); ficou 200 → JWT válido nas duas camadas
(proxy getToken + sessão nas rotas, member).

## 3. Segurança

- Segredo DEV-ONLY explícito; produção usa `NEXTAUTH_SECRET` real (Vercel env) — tokens
  de dev são inúteis fora do localhost. Fallback público no repo nunca é aceito em prod.
- Alvo sempre local; nenhuma credencial real no teste.

## 4. Verificação T101

- [x] Tokens dev gerados; cenário verde com isolamento provado.
- [x] LOAD-TESTING.md atualizado (seção autenticado). PR dedicado; merge após REVIEW.

Arquivos: `scripts/k6/gen-dev-tokens.ts`, `scripts/k6/authenticated.js`,
`docs/06-devops-deployment/LOAD-TESTING.md`, `STATUS-T101.md`. Dívida D100 quitada.
