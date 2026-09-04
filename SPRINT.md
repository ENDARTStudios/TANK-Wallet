# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 52 — Chain Completion + Production Hardening

**Objetivo:** todas as chains executando pipeline completo + hardening final.

**Issues mãe:** novas #110, #111

### Tarefas

#### T1 — Chain Completion (ALTO)
- **Arquivos:** `src/lib/wallet-evm/*`, `src/lib/wallet-pro/plans.ts`
- **Ações:**
  - Validar `SPRINT_ROADMAP` sprint-2 `Chain Completion` (Ethereum, Bitcoin PSBT, Solana Versioned, Lightning)
- **Critério:** `bun test src/lib/wallet-kernel` verde

#### T2 — Production Hardening (MÉDIO)
- **Arquivos:** `src/proxy.ts`, `next.config.ts`, `Caddyfile`
- **Ações:**
  - Validar `proxy.ts` + `next.config.ts` + `Caddyfile` hardening
- **Critério:** `bun run verify` 11/11 ✅

### Definição de pronto (DoD)

- [ ] `bun test` 224 pass, `verify` 11/11, `tsc:0`
- [ ] `SPRINT_ROADMAP` sprint-2 validado
