# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 12 — Social Recovery + Behavioral AI + Final Hardening

**Objetivo:** fechar soberania do usuário (recuperação social) e proteção comportamental, com hardening final docs/testes.

**Issues mãe:** novas #31, #32

### Tarefas

#### T1 — Social Recovery k-of-n (MÉDIO)
- **Arquivos:** `src/lib/social-recovery/index.ts` (novo), `src/lib/social-recovery/__tests__/social.test.ts` (novo), `prisma/schema.prisma` (RecoveryContact já existe)
- **Ações:**
  - `social-recovery/index.ts`: `createRecoverySet({ threshold, contacts })`, `recoverWallet({ shares })`, `verifyRecoveryContact`
  - Usar `RecoveryContact` + `shamir` stub (2-of-3)
- **Critério:** `bun test social` 3 pass
- **Ref:** `Closes #31`

#### T2 — Behavioral AI (MÉDIO)
- **Arquivos:** `src/lib/behavior-ai/index.ts` (novo), `src/lib/behavior-ai/__tests__/behavior.test.ts` (novo)
- **Ações:**
  - `behavior-ai/index.ts`: `learnProfile(walletAddress, action)`, `detectAnomaly(action)` com heurística (horário, chain, valor, device) — usa `BehaviorProfile`/`Anomaly` models
  - Auto-ativar `paranoid`/`lockdown` quando `score > 80`
- **Critério:** `bun test behavior` 3 pass
- **Ref:** `Closes #32` (parte 1)

#### T3 — Final Hardening (MÉDIO)
- **Arquivos:** `docs/ARCHITECTURE-MODULES.md`, `SPRINT.md` (marcar concluído), `README.md` (atualizar status)
- **Ações:**
  - Atualizar `ARCHITECTURE-MODULES.md` com todos módulos `Ativo`
  - `README.md`: status `AUDIT_READY` + sprints 1-12 concluídos
  - `bunx tsc --noEmit:0` final
- **Critério:** docs vivos atualizados, `tsc` verde
- **Ref:** `Closes #32` (parte 2)

### Fora de escopo neste sprint

- Auditoria externa Trail of Bits — já em `docs/security/trail-of-bits-integration.md`

### Definição de pronto (DoD)

- [ ] `src/lib/social-recovery` + `src/lib/behavior-ai` com testes verdes (6 pass total)
- [ ] `bunx tsc --noEmit:0` `eslint:0`
- [ ] Deploy gate verde
- [ ] `main` pronto para `release.yml` (cosign + SBOM)
