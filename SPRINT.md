# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 45 — v1.2.1 patch + final verify + tag

**Objetivo:** patch release v1.2.1 com `verify` 11/11 + tag.

**Issues mãe:** novas #97, #98

### Tarefas

#### T1 — v1.2.1 bump (ALTO)
- **Arquivos:** `package.json`, `CHANGELOG.md`
- **Ações:**
  - `1.2.0 → 1.2.1`; CHANGELOG com Sprints 41-44
- **Critério:** versão 1.2.1

#### T2 — Tag v1.2.1 (MÉDIO)
- **Arquivos:** `git tag v1.2.1`
- **Ações:**
  - `git tag -a v1.2.1` + `git push origin v1.2.1`
- **Critério:** tag existe em origin

### Definição de pronto (DoD)
- [ ] 2 arquivos + tag v1.2.1
- [ ] `verify` 11/11 ✅
