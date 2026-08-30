# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 13 — Indexer Prod + Push Notifications + Sync

**Objetivo:** tornar a descoberta de ativos e notificações em tempo real, com sync entre dispositivos.

**Issues mãe:** novas #33, #34

### Tarefas

#### T1 — Indexer Prod (MÉDIO)
- **Arquivos:** `src/lib/indexer/providers/alchemy.ts` (atualizar), `src/lib/indexer/providers/helius.ts` (atualizar), `src/lib/indexer/providers/blockstream.ts` (atualizar)
- **Ações:**
  - Alchemy: `eth_getLogs` real com `ALCHEMY_API_KEY`
  - Helius: `getBalances` real com `HELIUS_API_KEY`
  - Blockstream: `address/txs` com paginação
- **Critério:** `bun test indexer` com mock ainda passa; `e2e` verifica `discoverAssets` com cache

#### T2 — Push Notifications (MÉDIO)
- **Arquivos:** `src/lib/notifications/index.ts` (novo), `src/lib/notifications/__tests__/notifications.test.ts` (novo), `src/app/api/notifications/route.ts` (novo)
- **Ações:**
  - `notifications/index.ts`: `subscribePush`, `sendPush` (web-push stub), `onThreat` → push
  - `route.ts`: `POST /api/notifications/subscribe` + `GET /api/notifications`
- **Critério:** `bun test notifications` 3 pass

#### T3 — Sync (MÉDIO)
- **Arquivos:** `src/lib/sync/index.ts` (novo), `src/lib/sync/__tests__/sync.test.ts` (novo)
- **Ações:**
  - `sync/index.ts`: `syncPortfolio` (encrypted sync via `workspaceId`), `getSyncStatus`
- **Critério:** `bun test sync` 2 pass

### Fora de escopo neste sprint

- Helius API key real — stub com `HELIUS_API_KEY` env
- Web Push VAPID real — stub

### Definição de pronto (DoD)

- [ ] `src/lib/indexer` atualizado + `notifications` + `sync` com testes verdes (8 pass total)
- [ ] `bunx tsc --noEmit:0`
- [ ] Deploy gate verde
