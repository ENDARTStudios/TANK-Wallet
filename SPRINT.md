# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 25 — Release Validation + DAST + Final Hardening

**Objetivo:** validar v1.1.0 pré-produção, rodar DAST e endurecer últimos detalhes.

**Issues mãe:** novas #57, #58

### Tarefas

#### T1 — DAST config (MÉDIO)
- **Arquivos:** `dast-config/zap-baseline.yaml` (novo)
- **Ações:**
  - Configurar OWASP ZAP baseline scan
- **Critério:** arquivo versionado

#### T2 — Release checklist (MÉDIO)
- **Arquivos:** `docs/RELEASE-CHECKLIST.md` (novo)
- **Ações:**
  - Checklist final pré-produção (RTO, backups, observability, feature flags)
- **Critério:** doc versionado

#### T3 — Hardening (MÉDIO)
- **Arquivos:** `src/proxy.ts` (verificar), `src/lib/security/rate-limit.ts` (verificar)
- **Ações:**
  - Garantir coverage de path /health, /api/*, /_next/*, /favicon*
  - Adicionar comentário defensivo
- **Critério:** `tsc:0`

### Definição de pronto (DoD)
- [ ] 3 arquivos + proxy + rate-limit
- [ ] `tsc:0`
