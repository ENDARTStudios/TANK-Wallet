# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 37 — PWA + offline

**Objetivo:** manifest PWA + service worker com offline fallback.

**Issues mãe:** novas #81, #82

### Tarefas

#### T1 — Manifest PWA (ALTO)
- **Arquivos:** `public/manifest.json` (novo)
- **Ações:**
  - Web App Manifest com name, icons, theme, start_url
- **Critério:** manifest válido

#### T2 — Service worker (MÉDIO)
- **Arquivos:** `public/sw.js` (novo), `e2e/pwa.spec.ts` (novo)
- **Ações:**
  - `sw.js`: cache-first + network fallback
- **Critério:** 1 test smoke

### Definição de pronto (DoD)
- [ ] 3 arquivos
- [ ] `tsc:0`
