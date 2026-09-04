# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 53 — Security Validation + Chaos Testing

**Objetivo:** validar robustez sob adversidade com testes de caos e propriedades.

**Issues mãe:** novas #112, #113

### Tarefas

#### T1 — Chaos Testing (ALTO)
- **Arquivos:** `src/lib/chaos/index.ts` (novo), `src/lib/chaos/__tests__/chaos.test.ts` (novo)
- **Ações:**
  - `chaos/index.ts`: `injectChaos` (latência, falha RPC, reorg)
- **Critério:** `bun test chaos` 3 pass

#### T2 — Property-based Testing (MÉDIO)
- **Arquivos:** `src/lib/property/index.ts` (novo), `src/lib/property/__tests__/property.test.ts` (novo)
- **Ações:**
  - `property/index.ts`: `forAll` com fast-check stub
- **Critério:** `bun test property` 3 pass

### Definição de pronto (DoD)

- [ ] `chaos` + `property` 6 pass
- [ ] `tsc:0` `verify` 11/11
