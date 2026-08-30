# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 17 — MPC HSM abstraction + Account Abstraction real

**Objetivo:** abstração de HSM/MPC e Account Abstraction real (ERC-4337 v0.7).

**Issues mãe:** novas #41, #42

### Tarefas

#### T1 — MPC HSM abstraction (ALTO)
- **Arquivos:** `src/lib/mpc/hsm.ts` (novo), `src/lib/mpc/__tests__/hsm.test.ts` (novo)
- **Ações:**
  - `hsm.ts`: `HsmProvider` interface, `LocalHsm`, `RemoteHsm` stubs com `sign({ payload, keyId }) → signature`
- **Critério:** `bun test hsm` 3 pass

#### T2 — Account Abstraction real (MÉDIO)
- **Arquivos:** `src/lib/account-abstraction/v0.7.ts` (novo), `src/lib/account-abstraction/__tests__/v0.7.test.ts` (novo)
- **Ações:**
  - `v0.7.ts`: `EntryPoint v0.7` `getUserOpHash`, `packUserOp`, `unpackUserOp` (sem viem dep)
- **Critério:** `bun test v0.7` 3 pass

### Definição de pronto (DoD)
- [ ] `hsm` + `v0.7` com 6 pass
- [ ] `tsc:0`
