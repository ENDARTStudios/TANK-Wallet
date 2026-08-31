# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 49 — PWA polish + HSM real

**Objetivo:** polimento PWA mobile e HSM KMS real.

**Issues mãe:** novas #105, #106

### Tarefas

#### T1 — PWA polish (MÉDIO)
- **Arquivos:** `public/manifest.json` (atualizar), `public/sw.js` (atualizar), `public/icons/` (novo)
- **Ações:**
  - Manifest com `icons` 192/512, `screenshots`, `shortcuts` completos
  - `sw.js` com `precache` + `runtime` strategies
- **Critério:** `public/manifest.json` válido, `sw.js` com `CACHE v2`

#### T2 — HSM KMS real (MÉDIO)
- **Arquivos:** `src/lib/mpc/hsm-aws.ts` (novo), `src/lib/mpc/__tests__/hsm-aws.test.ts` (novo)
- **Ações:**
  - `hsm-aws.ts`: `AwsKmsHsm` com `KMS:Sign` stub + `gcp-kms` stub
- **Critério:** `bun test hsm-aws` 2 pass

### Definição de pronto (DoD)
- [ ] 4 arquivos + 2 pass
- [ ] `tsc:0`
