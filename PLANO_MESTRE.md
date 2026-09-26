# PLANO_MESTRE.md — TANK Wallet

> Produto real deste repositório: **TANK Wallet — Zero Trust Security Platform** (hot wallet autocustodial multi-chain com pipeline de decisão preventiva antes de qualquer assinatura).
> Histórico: a versão anterior deste arquivo descrevia outro produto ("Almanaque dos Clubes", plataforma de futebol com Fastify/pnpm) e foi preservada em `docs/historical/PLANO_MESTRE_ALMANAQUE.md` (T081). Conflito entre este arquivo e o Protocolo: o Protocolo vence.

---

## Produto (Discovery DECISOES.md, 2026-07-16)

- **O quê:** hot wallet autocustodial multi-chain; kernel de segurança com 16 engines em pipeline de 12 estágios; evidence chain verificável antes de assinar.
- **Chaves:** BIP-39/BIP-32/BIP-44/SLIP-0010 locais (AES-256-GCM, PBKDF2 250k); MPC v2 threshold (Shamir + Feldman VSS); HSM enterprise (AWS KMS, GCP KMS, Azure Key Vault).
- **Planos:** Free / PRO US$ 19,99/mês / Enterprise US$ 499–1.499+.
- **Stack:** Next.js 16 App Router + TypeScript + Bun + Prisma (SQLite dev, PostgreSQL multi-tenant com RLS) + Vercel + `tankwallet.dev`.
- **IA:** TypeSafe Jev como camada de decisão de produto (advisory, kill-switch), nunca de segurança.

## Entregue (evidência em PRs mergeados)

- **Sprint 58 — MPC v2 + HSM:** PR #50 (`57c4079`): `src/lib/mpc/v2/` + `src/lib/mpc/hsm.ts`, 8 testes.
- **Sprint 59 — CI/E2E:** PR #51 (main CI), #52 (remove workflows mortos), #53 (E2E 60 passed, fecha #49), #54 (keyboard fixme), #55 (`resolveBaseUrl`, Vercel preview verde), #56 (piloto Jev), #57 (flag-wiring Jev, default off).
- **Gates:** `bun test`, `tsc --noEmit`, ESLint, Semgrep, CodeQL, Gitleaks, Trivy, SBOM, Playwright, Lighthouse no CI.

## Fases futuras

- **F07 — Hardening:** rate limit avançado, CSP/HSTS, auditorias externas (bloqueio de GA é externo, não código).
- **F08 — Testes/segurança:** property-based, chaos, DAST (ZAP), k6; reabilitar 9 E2E skips (#49, T062).
- **F09 — IA completa:** TypeSafe Choice/Noul/Score além do piloto (roteamento de intent pós-Discovery do Operador).
- **F10 — Produção:** multi-region, compliance (SOC2/ISO), bug bounty público ≥90 dias, `MANUAL_DO_OPERADOR.md`.

## Convenções

Ver `AGENTS.md` (GRAFT-FIRST, Issue→PR→Deploy Gate, SPRINT.md). Commits: `feat:`/`fix:`/`docs:`/`chore:` atômicos.
