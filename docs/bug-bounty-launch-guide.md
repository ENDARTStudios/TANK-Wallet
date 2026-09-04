# Bug Bounty Launch Guide — TANK Wallet

> **Programa:** Immunefi
> **Escopo:** `src/lib/security/*`, `src/lib/auth/*`, `src/proxy.ts`, `prisma/*`
> **Rewards:** CRITICAL $10k, HIGH $5k, MEDIUM $1k, LOW $100
> **SLA:** CRITICAL 24h, HIGH 7d, MEDIUM 30d, LOW 90d

## Lançamento

1. Submeter programa Immunefi com scope e rewards
2. Anunciar em `https://t.me/TANKWallet2026` + Twitter
3. Ativar `docs/security/pgp-key.asc` para reports
4. Monitorar `security@endart.studios` 24h

## Triagem

- Verificar `PoC` + `impact` + `reprodução`
- Atribuir severidade via `docs/RBAC.md` + `SECURITY-GATE.md`
- Criar issue `bug` com `Closes #` + `PR` com fix
