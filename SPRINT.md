# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 31 — WalletConnect relay real

**Objetivo:** provider WalletConnect v2 com project ID e namespace.

**Issues mãe:** novas #69, #70

### Tarefas

#### T1 — WCProvider real (ALTO)
- **Arquivos:** `src/lib/wallet-connect/provider.ts` (novo), `src/lib/wallet-connect/__tests__/provider.test.ts` (novo)
- **Ações:**
  - `WCProvider`: init, connect, signClient stub, namespace
- **Critério:** `bun test provider` 4 pass

#### T2 — Session persistence (MÉDIO)
- **Arquivos:** `src/lib/wallet-connect/session-store.ts` (novo), `src/lib/wallet-connect/__tests__/session-store.test.ts` (novo)
- **Ações:**
  - `session-store.ts`: save/load/clear session em memória cifrada
- **Critério:** `bun test session-store` 3 pass

### Definição de pronto (DoD)
- [ ] 4 arquivos + 7 pass
- [ ] `tsc:0`
