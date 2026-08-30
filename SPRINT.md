# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 33 — Backup agendado + restore E2E

**Objetivo:** agendamento cron + restore test em CI.

**Issues mãe:** novas #73, #74

### Tarefas

#### T1 — Backup cron (ALTO)
- **Arquivos:** `scripts/backup-cron.sh` (novo)
- **Ações:**
  - Cron script: backup SQLite/Postgres hourly, upload S3 stub
- **Critério:** script executa verde

#### T2 — Restore E2E workflow (MÉDIO)
- **Arquivos:** `.github/workflows/restore-e2e.yml` (novo)
- **Ações:**
  - Workflow CI: cria backup, restaura, valida
- **Critério:** workflow versionado

### Definição de pronto (DoD)
- [ ] 2 arquivos
- [ ] `tsc:0`
