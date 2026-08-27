# src/features — Catálogo Modular (target)

> Ver `docs/ARCHITECTURE-MODULES.md` e `src/lib/config/feature-flags.ts`.

Estrutura alvo (migração incremental de `src/lib/wallet-*` + `src/components/wallet/*`):

```
src/features/
  threat-intel/   # lib + api + ui + __tests__
  sovereignty/    # approvals, sessions, lockdown
  scanner/        # contract scanner, dApp Shield
  send/           # send + simulation
  onboarding/     # create/import/unlock
  admin/          # RBAC (future)
```

Regras:
- Cada feature expõe `index.ts` (contrato público) — nada importa de `feature/interna`.
- `feature-flags.ts` controla visibilidade por `tier × flag`.
- `scripts/verify/` valida fronteiras (sem import cruzado).

Estado: placeholder. Migração em `chore/issue-10` (ver `docs/ISSUES-BACKLOG.md` #10).
