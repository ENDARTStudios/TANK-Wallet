# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 55 — Auditoria + Bug Bounty

**Objetivo:** validação externa independente com auditoria e bug bounty.

**Issues mãe:** novas #116, #117

### Tarefas

#### T1 — Auditoria Externa (ALTO)
- **Arquivos:** `audit-config/audit-external.json`, `docs/SECURITY-GATE.md`
- **Ações:**
  - Validar `audit-config/trail-of-bits-engagement.md` + `findings-tracker.md`
- **Critério:** `audit-config` validado

#### T2 — Bug Bounty (MÉDIO)
- **Arquivos:** `docs/bug-bounty.md`, `BUG-BOUNTY.md`
- **Ações:**
  - Validar `BUG-BOUNTY.md` programa Immunefi
- **Critério:** `BUG-BOUNTY.md` validado

### Definição de pronto (DoD)

- [ ] `audit-config` + `BUG-BOUNTY.md` validados
- [ ] `tsc:0` `verify` 11/11
