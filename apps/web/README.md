# apps/web — TANK Wallet (Next.js fullstack)

> A aplicação productizável do monorepo: frontend React 19 + rotas `/api` + libs de domínio (`src/lib/wallet-*`).

## Layout

```
src/app/            App Router (páginas + /api/* + error boundaries)
src/components/     UI (wallet views, onboarding, engines)
src/lib/            Domínio: wallet-core/engines/sovereignty/scanner, auth, observability...
src/proxy.ts        Rate limit + bot-guard + headers (edge da app)
prisma/             Schema SQLite (+ rls.sql p/ Postgres)
e2e/                Playwright (chromium / mobile-375 / tablet-768)
scripts/            Gates internos: verify (11 checks), metrics, audit:code, enforce, bench, golden
vendor/gsap-public  GSAP (licença GreenSock — terceiros, ver /NOTICE)
config/             kpi-weights.json
```

## Comandos (dentro de apps/web)

```bash
bun install --frozen-lockfile
bun run dev          # porta 3000 (dev.log)
bun run verify       # gate único local (11 checks)
bun test src         # unit + integração
bun run test:e2e     # Playwright
bun run build        # standalone (em linux; no Windows há bug conhecido de copyfile)
```

Atalhos equivalentes na RAIZ do monorepo (`bun run dev` etc. delegam aqui via `--cwd`).

## Deploy

- **Vercel** (tankwallet.dev): Root Directory = `apps/web`; config em `vercel.json` (neste diretório).
- Docker: `Dockerfile` (multi-stage, non-root, standalone) — build context = este diretório.
- `render.yaml` foi removido (deploy legado; histórico em docs/06-devops-deployment/legacy).

## Notas

- `.env` (gitignored) e `.env.example` vivem aqui; `NEXTAUTH_SECRET` é **fail-closed em produção** (`src/lib/auth/nextauth.ts`).
- Segurança de paths sensíveis: ver `.github/CODEOWNERS` (`/apps/web/src/lib/{security,auth,crypto,...}`).
- Detalhes de arquitetura: [`../../docs/02-architecture-design/ARCHITECTURE.md`](../../docs/02-architecture-design/ARCHITECTURE.md).
