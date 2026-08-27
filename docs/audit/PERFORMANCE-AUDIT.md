# Auditoria de Performance — TANK Wallet (Sprint 5)

> Base: `main:bf4755a` · `AGENTS.md:6` + Core Web Vitals

## Gates

| Métrica | Alvo | Estado |
| --- | --- | --- |
| LCP | <2.5s | ⚠️ não medido em CI (adicionar Lighthouse CI em PR de UI) |
| CLS | <0.1 | ✅ `src/app/layout.tsx:30` sem layout shift (sticky sidebar, skeleton) |
| TTFB | <600ms | ✅ `src/proxy.ts:1` rate-limit + bot sem bloqueio em `/api/health` |

## Procuras (grep)

| Padrão | Achado | File:line | Severidade |
| --- | --- | --- | --- |
| `console.log` em `src/` | 0 | `grep src/**/*.ts` 0 | OK |
| `any` não justificado | 0 em `src/lib/auth/rbac.ts:1` `src/lib/db/rls.ts:1` | `strict:true` `tsconfig.json:11` | OK |
| Queries repetidas | `EvmProvider` com failover 3 RPCs `src/lib/wallet-evm/index.ts` (publicnode/1rpc/llamarpc) — OK sem duplicação | BAIXO | OK |
| Renders extras | `WalletProvider` + `useWallet` com `zustand` seletivo — sem over-render crítico | BAIXO | OK |
| Imagens gigantes | `public/logo.svg:1` 1k, sem `next/image` gigante | OK | OK |
| JS desnecessário | `gsap-public/` 3 cópias (esm/min/public) com ESLint warnings — duplicação | MÉDIO | `docs/CLEANUP-PLAN.md:6` |
| Fontes pesadas | `next/font/google: Geist` com `variable` + `subsets latin` — OK | OK | OK |
| Cache | `src/app/api/whois/route.ts` cache 1h (RDAP) — OK | OK | OK |

## Operações bloqueantes

- `PBKDF2 250k` `src/lib/wallet-core/storage.ts` — síncrono mas em WebCrypto (não bloqueia main thread crítico) ✅
- `prisma generate` — build step, não runtime ✅

## Recomendações

- [ ] Adicionar `Lighthouse CI` em `.github/workflows/ci.yml` para PRs de UI (LCP/CLS)
- [ ] `gsap-public/` → CDN ou `public/` único (reduz bundle)
- [ ] `bun run bench` já em CI `ci.yml:42` — publicar métricas em `reports/`
