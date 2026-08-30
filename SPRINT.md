# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 19 — Risk Service real (Blowfish/Tenderly/ChainPatrol) + AI Risk Engine

**Objetivo:** agregar múltiplas fontes reais e scoring IA para risco avançado.

**Issues mãe:** novas #45, #46

### Tarefas

#### T1 — Risk Service real (ALTO)
- **Arquivos:** `src/lib/risk-service/aggregator.ts` (novo), `src/lib/risk-service/sources/blowfish.ts` (novo), `src/lib/risk-service/sources/tenderly.ts` (novo), `src/lib/risk-service/sources/chainpatrol.ts` (novo)
- **Ações:**
  - `blowfish.ts`: `scanTransaction` via `BLOWFISH_API_KEY`
  - `tenderly.ts`: `simulateTransaction` via `TENDERLY_ACCESS_KEY`
  - `chainpatrol.ts`: `checkAsset` via `CHAINPATROL_API_KEY`
  - `aggregator.ts`: combina com timeout/cache
- **Critério:** `bun test risk-service` 4 pass (cada source + aggregator)

#### T2 — AI Risk Engine (MÉDIO)
- **Arquivos:** `src/lib/ai-risk/index.ts` (novo), `src/lib/ai-risk/__tests__/ai-risk.test.ts` (novo)
- **Ações:**
  - `ai-risk/index.ts`: `scoreRisk(features) → number` heurístico (0-100)
- **Critério:** `bun test ai-risk` 3 pass

### Definição de pronto (DoD)
- [ ] `risk-service` + `ai-risk` com 7 pass
- [ ] `tsc:0`
