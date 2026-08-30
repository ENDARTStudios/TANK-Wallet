# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 47 — Tag v1.2.1 push + knip 31→0 + cleanup de branches

**Objetivo:** garantir tag `v1.2.1` em origin, reduzir knip 31→0 (dynamic imports), limpar branches locais obsoletas.

**Issues mãe:** novas #101, #102

### Tarefas

#### T1 — Tag v1.2.1 push (ALTO)
- **Arquivos:** `git push origin v1.2.1`
- **Ações:**
  - Verificar se tag já existe em origin
- **Critério:** tag em origin

#### T2 — knip dynamic import detection (MÉDIO)
- **Arquivos:** `knip.json`
- **Ações:**
  - Adicionar entry para arquivos com dynamic imports de deps
- **Critério:** knip 31→0 (ou justificativa documentada)

#### T3 — Cleanup de branches (BAIXO)
- **Arquivos:** `scripts/cleanup-branches.sh`
- **Ações:**
  - Script bash para listar branches mergeadas em main
- **Critério:** script executa verde

### Definição de pronto (DoD)
- [ ] 1-2 arquivos
- [ ] tag v1.2.1 em origin
- [ ] `bunx knip` justificável
- [ ] `verify` 11/11 ✅
