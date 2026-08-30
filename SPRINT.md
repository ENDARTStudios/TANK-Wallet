# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 15 — Helius Prod Real + LND Channel + Bundler Paymaster

**Objetivo:** tornar as integrações de Sprint 11-14 prod-ready com env real e testes de integração.

**Issues mãe:** novas #37, #38

### Tarefas

#### T1 — Helius Prod Real (MÉDIO)
- **Arquivos:** `src/lib/indexer/providers/helius.ts` (atualizar para prod), `src/lib/indexer/__tests__/helius-prod.test.ts` (novo)
- **Ações:**
  - `helius.ts`: já tem `HELIUS_API_KEY` fetch, adicionar `heliusProd` com `getBalances` + `searchAssets` + rate limit 10 rps
- **Critério:** `helius.ts` usa `HELIUS_API_KEY` quando presente; teste mock passa

#### T2 — LND Channel (MÉDIO)
- **Arquivos:** `src/lib/lightning/lnd.ts` (novo), `src/lib/lightning/__tests__/lnd.test.ts` (novo)
- **Ações:**
  - `lnd.ts`: `openChannel`, `closeChannel`, `listChannels` stubs com `lnd-grpc` preparo
- **Critério:** `bun test lnd` 2 pass

#### T3 — Bundler Paymaster (MÉDIO)
- **Arquivos:** `src/lib/account-abstraction/bundler.ts` (novo), `src/lib/account-abstraction/__tests__/bundler.test.ts` (novo)
- **Ações:**
  - `bundler.ts`: `sendUserOperation`, `estimateUserOpGas`, `sponsorWithPaymaster` stubs
- **Critério:** `bun test bundler` 2 pass

### Fora de escopo neste sprint

- Shamir real — Sprint 16
- HSM — Sprint 16

### Definição de pronto (DoD)

- [ ] `helius` + `lnd` + `bundler` com testes verdes (6 pass total)
- [ ] `bunx tsc --noEmit:0`
