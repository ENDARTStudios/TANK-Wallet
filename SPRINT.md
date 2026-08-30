# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 23 — Release v1.1.0 + Audit Closure

**Objetivo:** congelar v1.1.0 com tag, CHANGELOG final, audit closure report.

**Issues mãe:** novas #53, #54

### Tarefas

#### T1 — Release v1.1.0 tag (ALTO)
- **Arquivos:** `package.json` (confirmar 1.1.0), `CHANGELOG.md` (atualizar), `git tag v1.1.0`
- **Ações:**
  - Confirmar `package.json:1.1.0`
  - CHANGELOG 1.1.0 com Sprints 1-22
  - Criar tag `v1.1.0` lightweight
- **Critério:** tag existe localmente

#### T2 — Audit closure report (ALTO)
- **Arquivos:** `docs/audit/AUDIT-CLOSURE.md` (novo)
- **Ações:**
  - Relatório de fechamento: findings abertos (Sprint 5) + status atual
  - Assinatura PGP + data
- **Critério:** arquivo versionado

### Definição de pronto (DoD)
- [ ] tag `v1.1.0` + CHANGELOG + audit-closure
- [ ] `tsc:0`
