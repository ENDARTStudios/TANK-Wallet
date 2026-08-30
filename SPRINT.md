# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 16 — Shamir Backup real (split/join) + Threshold SSA

**Objetivo:** Shamir's Secret Sharing real (k-of-n) e threshold signatures para vault.

**Issues mãe:** novas #39, #40

### Tarefas

#### T1 — Shamir Backup (ALTO)
- **Arquivos:** `src/lib/crypto/shamir.ts` (novo), `src/lib/crypto/__tests__/shamir.test.ts` (novo)
- **Ações:**
  - `shamir.ts`: `splitSecret({ secret, threshold, shares })`, `combineShares({ shares, threshold })` com GF(256) math
- **Critério:** `bun test shamir` 5 pass (split k-of-n, combine correto, recover com shares insuficientes falha, hex)

#### T2 — Threshold SSA (MÉDIO)
- **Arquivos:** `src/lib/crypto/threshold-ssa.ts` (novo), `src/lib/crypto/__tests__/threshold-ssa.test.ts` (novo)
- **Ações:**
  - `threshold-ssa.ts`: `signThreshold({ message, shares })`, `verifyThreshold({ message, signature, publicKey })` stubs
- **Critério:** `bun test threshold-ssa` 3 pass

### Definição de pronto (DoD)
- [ ] `shamir` + `threshold-ssa` com 8 pass
- [ ] `tsc:0`
