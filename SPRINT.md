# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 58 — MPC v2 + HSM Real

**Objetivo:** MPC threshold signatures (k-of-n) + HSM real (AWS KMS / GCP KMS / Azure Key Vault).

**Issues mãe:** novas #118, #119

### Tarefas

#### T1 — MPC v2 (ALTO)
- **Arquivos:** `src/lib/mpc/v2/index.ts` (novo), `src/lib/mpc/v2/__tests__/mcpv2.test.ts` (novo)
- **Ações:**
  - `src/lib/mpc/v2/index.ts`: threshold signatures (k-of-n) via Shamir + Feldman VSS
  - `src/lib/mpc/v2/__tests__/mcpv2.test.ts`: 4 testes (DKG, signing, resharing, refresh)
- **Critério:** `bun test mpc/v2` 4 pass

#### T2 — HSM Real (MÉDIO)
- **Arquivos:** `src/lib/mpc/hsm-aws.ts`, `src/lib/mpc/hsm-gcp.ts`, `src/lib/mpc/hsm-azure.ts` (novos)
- **Ações:**
  - `hsm-aws.ts`: `AwsKmsHsm` com `KMS:Sign` + `GetPublicKey`
  - `hsm-gcp.ts`: `GcpKmsHsm` com `CloudKMS` stub
  - `hsm-azure.ts`: `AzureKeyVaultHsm` com `KeyVault` stub
- **Critério:** `bun test hsm` 3 pass

### Definição de pronto (DoD)

- [x] `mpc/v2` + `hsm-*` com testes verdes (6 pass) — T058 APROVADO

## T062 — E2E Env Setup Playwright (Sprint 59 — diferida)
- **Objetivo:** Corrigir root cause env/test setup do Playwright no CI que causou falhas pré-existentes de E2E (security.spec.ts:20 e outros 8)
- **Dono:** Doer
- **Depende:** T061
- **Critério:** Testes 9 pulados em T061 reabilitados (test.skip removido); `next build` sem erro; `gh pr checks 48` 10/10 verde
- **Documentação:** `STATUS-T061.md` + `DECISOES.md` (skip documentado); issue GitHub a criar com referência a T062
- [ ] `tsc:0`
- [ ] `verify` 11/11 ✅
## Sprint 58 — Fechamento
- Merge: 57c4079880755bea03c632562785511a1466efe4 (PR #50, 2026-09-24T20:17:35Z)
- Branch: chore/sprint-58-mpc-v2-hsm-real (deletado)
- CI: 10/10 required verdes (run 36014311459)
- Vercel: PENDENCIA_OPERADOR (projeto nao vinculado)

