# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 8 — Threat Intel Backend Real (Etapa 3/3)

**Objetivo:** agregar múltiplas fontes (GoPlus + ChainPatrol + ScamSniffer + HashDit + PhishFort + DB local) em um Risk Service unificado, com cache e fallback, fechando o ciclo de proteção ativa.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` novas #23, #24

### Tarefas

#### T1 — Risk Service Aggregator (ALTO)
- **Arquivos:** `src/lib/threat-intel/aggregator.ts` (novo), `src/lib/threat-intel/__tests__/aggregator.test.ts` (novo), `src/lib/threat-intel/sources/` (novo)
- **Ações:**
  - `aggregator.ts`: `aggregateThreatIntel({ chain, address, url }) → { score, sources[], risks[], recommendation }` — consulta `db.threatToken/Site/Address` (local), `GoPlus` (via `src/lib/wallet-security-real`), `ChainPatrol` stub, `ScamSniffer` stub, com `Promise.allSettled` + timeout 2s + cache Map 5min
  - `sources/`: `goplus.ts`, `chainpatrol.ts`, `scamsniffer.ts`, `hashdit.ts`, `phishfort.ts` (stubs com `fetch` + fallback)
  - Score: `max(severity)` + `count` + `source weight` → 0-100; `recommendation: allow|limit|block` por threshold
- **Critério:** `bun test aggregator` 5 pass (local DB hit, GoPlus fallback, cache, timeout, block recommendation)
- **Testes:** `src/lib/threat-intel/__tests__/aggregator.test.ts`
- **Ref:** `Closes #23`

#### T2 — API Risk Service (MÉDIO)
- **Arquivos:** `src/app/api/risk/route.ts` (novo), `src/app/api/risk/__tests__/route.test.ts` (novo, opcional), `docs/ARCHITECTURE-MODULES.md`
- **Ações:**
  - `POST /api/risk` com `zod` (`chain`, `address`, `url`) → `aggregateThreatIntel` → `withWorkspaceFilter` + `requirePermission(ctx, get_threats)` (viewer+)
  - Rate-limit + bot já em `src/proxy.ts:1`
  - `ARCHITECTURE-MODULES.md`: marcar `Risk Service` como `Ativo`
- **Critério:** `POST /api/risk` com `chain:ethereum address:0x...` retorna `score` + `sources`; `viewer` passa, sem sessão → `401` (se protegido)
- **Testes:** `bun test` para `aggregator` + manual `curl`
- **Ref:** `Closes #24`

### Fora de escopo neste sprint

- Helius/Blockstream indexers — próximo ciclo
- Push notifications + sync — próximo ciclo
- `filter-repo` PGP history — sprint dedicado

### Definição de pronto (DoD)

- [ ] `src/lib/threat-intel/aggregator.ts` + `sources/` + testes verdes (5 pass)
- [ ] `src/app/api/risk/route.ts` com `zod` + `withWorkspaceFilter` + `requirePermission` (quando aplicável)
- [ ] `bunx tsc --noEmit:0` `eslint:0` `bun test: 5 pass`
- [ ] Deploy gate verde
- [ ] `docs/audit/SECURITY-AUDIT.md` atualizado com Risk Service (se necessário)
