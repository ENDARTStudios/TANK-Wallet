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

- [ ] `mpc/v2` + `hsm-*` com testes verdes (6 pass)
- [ ] `tsc:0`
- [ ] `verify` 11/11 ✅