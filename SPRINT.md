# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 11 — Lightning + Account Abstraction + MPC (Etapa 1/2)

**Objetivo:** fundar Lightning Network e ERC-4337, preparando MPC/Passkeys para substituir seed.

**Issues mãe:** novas #29, #30

### Tarefas

#### T1 — Lightning (MÉDIO)
- **Arquivos:** `src/lib/lightning/index.ts` (novo), `src/lib/lightning/__tests__/lightning.test.ts` (novo)
- **Ações:**
  - `lightning/index.ts`: `createInvoice({ amount, memo }) → { bolt11, paymentHash }` (BOLT-11 stub), `payInvoice(bolt11)`, `submarineSwap({ from, to, amount })` (on-chain ↔ Lightning)
  - LND stub (sem node real, preparado para `lnd-grpc`)
- **Critério:** `bun test lightning` 3 pass
- **Ref:** `Closes #29`

#### T2 — ERC-4337 Account Abstraction (MÉDIO)
- **Arquivos:** `src/lib/account-abstraction/index.ts` (novo), `src/lib/account-abstraction/__tests__/aa.test.ts` (novo)
- **Ações:**
  - `aa/index.ts`: `createSmartAccount({ owner, salt }) → { address, factory }`, `createUserOperation({ sender, callData }) → UserOperation`, `sponsorUserOp` stub (paymaster)
- **Critério:** `bun test aa` 3 pass
- **Ref:** `Closes #30` (parte 1)

#### T3 — MPC/Passkeys (MÉDIO)
- **Arquivos:** `src/lib/mpc/index.ts` (novo), `src/lib/mpc/__tests__/mpc.test.ts` (novo)
- **Ações:**
  - `mpc/index.ts`: `generateMpcShare` (2-of-2 stub), `combineShares`, `createPasskey` (WebAuthn stub)
- **Critério:** `bun test mpc` 2 pass
- **Ref:** `Closes #30` (parte 2)

### Fora de escopo neste sprint

- LND node real + channel management — próximo ciclo
- Bundler/paymaster real — próximo ciclo
- Social Recovery — Sprint 12

### Definição de pronto (DoD)

- [ ] `src/lib/lightning` + `account-abstraction` + `mpc` com testes verdes (8 pass total)
- [ ] `bunx tsc --noEmit:0`
- [ ] Deploy gate verde
