# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 24 — Knip cleanup + og.png + PII AES + HSTS preload prep

**Objetivo:** fechar os 4 achados abertos da audit closure (Sprint 5 → Sprint 23).

**Issues mãe:** novas #55, #56

### Tarefas

#### T1 — Knip cleanup config (MÉDIO)
- **Arquivos:** `knip.json` (novo)
- **Ações:**
  - Configurar knip para detectar dead code/files
- **Critério:** arquivo versionado

#### T2 — og.png placeholder (BAIXO)
- **Arquivos:** `public/og.png` (novo, 1x1 PNG mínimo)
- **Ações:**
  - Criar placeholder mínimo 1200x630 (1x1 funcional)
- **Critério:** `public/og.png` existe

#### T3 — PII AES helper (MÉDIO)
- **Arquivos:** `src/lib/crypto/pii.ts` (novo), `src/lib/crypto/__tests__/pii.test.ts` (novo)
- **Ações:**
  - `pii.ts`: `encryptPII`, `decryptPII` com AES-256-GCM keystream (reuso crypted.ts)
- **Critério:** `bun test pii` 3 pass

#### T4 — HSTS preload prep (BAIXO)
- **Arquivos:** `docs/HSTS-PRELOAD.md` (novo)
- **Ações:**
  - Checklist para submissão ao HSTS preload list (após 6 meses)
- **Critério:** doc versionado

### Definição de pronto (DoD)
- [ ] 4 arquivos + 3 pass pii
- [ ] `tsc:0`
