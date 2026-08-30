# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 36 — i18n pt-BR/en-US/es

**Objetivo:** internacionalização com 3 locales via `next-intl`.

**Issues mãe:** novas #79, #80

### Tarefas

#### T1 — i18n config (ALTO)
- **Arquivos:** `src/i18n/config.ts` (novo), `src/i18n/__tests__/config.test.ts` (novo)
- **Ações:**
  - `config.ts`: locales list, default, getMessage
- **Critério:** `bun test config` 3 pass

#### T2 — Traduções (MÉDIO)
- **Arquivos:** `src/i18n/messages/pt-BR.json` (novo), `src/i18n/messages/en-US.json` (novo), `src/i18n/messages/es-ES.json` (novo)
- **Ações:**
  - JSON com chaves: nav.dashboard, nav.settings, common.app_name, common.loading
- **Critério:** 3 arquivos válidos

### Definição de pronto (DoD)
- [ ] 5 arquivos + 3 pass
- [ ] `tsc:0`
