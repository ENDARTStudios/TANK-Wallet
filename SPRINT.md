# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 32 — WebAuthn real (passkey challenge/verify)

**Objetivo:** passkey completo com challenge e verificação.

**Issues mãe:** novas #71, #72

### Tarefas

#### T1 — WebAuthn register (ALTO)
- **Arquivos:** `src/lib/webauthn/register.ts` (novo), `src/lib/webauthn/__tests__/register.test.ts` (novo)
- **Ações:**
  - `register.ts`: `generateChallenge`, `buildAttestationOptions`, `verifyAttestation`
- **Critério:** `bun test register` 4 pass

#### T2 — WebAuthn login (MÉDIO)
- **Arquivos:** `src/lib/webauthn/login.ts` (novo), `src/lib/webauthn/__tests__/login.test.ts` (novo)
- **Ações:**
  - `login.ts`: `buildAssertionOptions`, `verifyAssertion`
- **Critério:** `bun test login` 3 pass

### Definição de pronto (DoD)
- [ ] 4 arquivos + 7 pass
- [ ] `tsc:0`
