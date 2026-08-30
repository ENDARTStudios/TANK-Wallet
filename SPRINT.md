# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 21 — OAuth (Google/Apple) + 2FA TOTP

**Objetivo:** autenticação social e segundo fator (TOTP RFC 6238).

**Issues mãe:** novas #49, #50

### Tarefas

#### T1 — OAuth providers (MÉDIO)
- **Arquivos:** `src/lib/auth/oauth.ts` (novo), `src/lib/auth/__tests__/oauth.test.ts` (novo), `.env.example`
- **Ações:**
  - `oauth.ts`: `GoogleProvider`, `AppleProvider` stubs (sem SDK real)
- **Critério:** `bun test oauth` 3 pass

#### T2 — 2FA TOTP (ALTO)
- **Arquivos:** `src/lib/auth/totp.ts` (novo), `src/lib/auth/__tests__/totp.test.ts` (novo)
- **Ações:**
  - `totp.ts`: `generateSecret`, `getTOTP(secret, time)`, `verifyTOTP(secret, code)` RFC 6238
- **Critério:** `bun test totp` 4 pass (generate, getTOTP, verify, expiry)

### Definição de pronto (DoD)
- [ ] `oauth` + `totp` com 7 pass
- [ ] `tsc:0`
