# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 18 — Push prod + Sync crypted + Watchtower

**Objetivo:** notificações reais (web-push), sync criptografado E2E, watchtower on-chain.

**Issues mãe:** novas #43, #44

### Tarefas

#### T1 — Push prod (ALTO)
- **Arquivos:** `src/lib/notifications/prod.ts` (novo), `src/lib/notifications/__tests__/prod.test.ts` (novo)
- **Ações:**
  - `prod.ts`: `sendWebPush` com payload + ttl, `VAPID` headers, retry on 410 remove
- **Critério:** `bun test prod` 3 pass

#### T2 — Sync crypted (MÉDIO)
- **Arquivos:** `src/lib/sync/crypted.ts` (novo), `src/lib/sync/__tests__/crypted.test.ts` (novo)
- **Ações:**
  - `crypted.ts`: `encryptSync`, `decryptSync` com AES-256-GCM via Web Crypto stub
- **Critério:** `bun test crypted` 3 pass

#### T3 — Watchtower (MÉDIO)
- **Arquivos:** `src/lib/watchtower/index.ts` (novo), `src/lib/watchtower/__tests__/watchtower.test.ts` (novo)
- **Ações:**
  - `watchtower/index.ts`: `watchTransaction` monitora reorgs/confirmações
- **Critério:** `bun test watchtower` 2 pass

### Definição de pronto (DoD)
- [ ] `prod` + `crypted` + `watchtower` com 8 pass
- [ ] `tsc:0`
