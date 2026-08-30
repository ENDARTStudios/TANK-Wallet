# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 14 — Helius Prod + Web Push VAPID + Final Release Prep

**Objetivo:** fechar integrações prod restantes com env real e preparar release.

**Issues mãe:** novas #35, #36

### Tarefas

#### T1 — Helius Prod (MÉDIO)
- **Arquivos:** `src/lib/indexer/providers/helius.ts`, `.env.example`, `src/lib/indexer/__tests__/indexer.test.ts`
- **Ações:**
  - `helius.ts`: `fetchHeliusSpl` com `HELIUS_API_KEY` `https://api.helius.xyz/v0/addresses/{address}/balances?api-key={key}` + fallback mock
- **Critério:** `helius.ts` usa `HELIUS_API_KEY` quando presente; teste ainda passa com mock

#### T2 — Web Push VAPID (MÉDIO)
- **Arquivos:** `src/lib/notifications/vapid.ts` (novo), `src/lib/notifications/__tests__/vapid.test.ts` (novo), `.env.example`
- **Ações:**
  - `vapid.ts`: `generateVapidKeys`, `getVapidPublicKey` stub, `sendPushVapid` com `web-push` stub
  - `.env.example`: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `HELIUS_API_KEY`
- **Critério:** `bun test vapid` 2 pass

#### T3 — Release Prep (BAIXO)
- **Arquivos:** `CHANGELOG.md`, `package.json` (version bump), `docs/reproducible-build.md`
- **Ações:**
  - `CHANGELOG.md`: `v1.1.0` com Sprints 1-14
  - `package.json: version 1.1.0`
  - `git tag v1.1.0-rc1` (não pushado, preparado)
- **Critério:** `CHANGELOG.md` + `package.json` atualizados; `bunx tsc --noEmit:0`

### Fora de escopo neste sprint

- LND channel real — próximo ciclo
- Bundler paymaster real — próximo ciclo

### Definição de pronto (DoD)

- [ ] `helius.ts` + `vapid.ts` com testes verdes (7 pass total)
- [ ] `.env.example` com `HELIUS_API_KEY` + `VAPID_*`
- [ ] `CHANGELOG.md` `v1.1.0` + `package.json:1.1.0`
- [ ] `bunx tsc --noEmit:0` `eslint:0` `verify:✅ APPROVED`
