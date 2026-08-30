# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 42 — Verify gate completo

**Objetivo:** todos os 11 checks do `bun run verify` retornarem ✅ pass (não `⚠ skip`).

**Issues mãe:** novas #91, #92

### Tarefas

#### T1 — Testes required (ALTO)
- **Arquivos:** `scripts/verify/index.ts` (atualizar)
- **Ações:**
  - `tests` e `conformance` viram `required:true`
- **Critério:** verifica todos ✅ pass

#### T2 — SBOM/secrets/deps required (MÉDIO)
- **Arquivos:** `scripts/verify/index.ts`
- **Ações:**
  - `sbom`, `secrets-scan`, `dependency-scan` required
  - Fallback: se ferramentas ausentes, mensagem clara
- **Critério:** verify com tudo ✅

### Definição de pronto (DoD)
- [ ] 1 arquivo
- [ ] `bun run verify` 11 ✅
