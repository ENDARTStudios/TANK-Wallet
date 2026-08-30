# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 20 — Audit externa + Lighthouse CI + Code Owners + Reviewers

**Objetivo:** endurecer auditoria e gate com checks automatizados e CODEOWNERS.

**Issues mãe:** novas #47, #48

### Tarefas

#### T1 — Audit externa config (MÉDIO)
- **Arquivos:** `audit-config/audit-external.json` (novo)
- **Ações:**
  - Configurar `audit-config/` com escopo, listas de verificação e contatos
- **Critério:** arquivo versionado, pronto para auditor externo

#### T2 — Lighthouse CI (MÉDIO)
- **Arquivos:** `.lighthouserc.json` (novo)
- **Ações:**
  - Configurar budgets: LCP <2.5s, CLS <0.1, TBT <200ms
- **Critério:** arquivo existe

#### T3 — CODEOWNERS + Reviewers (BAIXO)
- **Arquivos:** `.github/CODEOWNERS` (atualizar)
- **Ações:**
  - CODEOWNERS: paths de risco (security, prisma, workflows, src/lib/*) → @ENDARTStudios
- **Critério:** CODEOWNERS com paths críticos

### Definição de pronto (DoD)
- [ ] 3 arquivos versionados
- [ ] `tsc:0`
