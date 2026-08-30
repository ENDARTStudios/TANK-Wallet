# HSTS Preload — Checklist de Submissão

> Sprint 24: preparar submissão ao HSTS preload list (`hstspreload.org`).
> Requisito: header `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` servido de forma estável por ≥ 6 meses.

## Pré-condições

- [ ] HTTPS 100% em produção (sem mixed content, sem HTTP→HTTPS redirect chain)
- [ ] Header `Strict-Transport-Security` emitido com `max-age=31536000` (1 ano) + `includeSubDomains` + `preload`
- [ ] Todos subdomínios servidos em HTTPS (incluindo `www.`, `api.`, `cdn.`)
- [ ] `next.config.ts` e `Caddyfile` configurados (Sprint 1)
- [ ] `Permissions-Policy`, `CSP`, `X-Frame-Options` ativos
- [ ] `enforce-admins: false` no branch protection OK (atual)
- [ ] Backups DR drill verde (Sprint 22)
- [ ] Audit closure APPROVED (Sprint 23)

## Cronograma

| Marco | Data alvo |
| --- | --- |
| Sprint 24: config + checklist | 2026-08-30 ✅ |
| Estabilização 6 meses | 2027-02-30 |
| Submissão `hstspreload.org` | 2027-03-01 |
| Remoção de `enforce-admins: true` (HSTS pin) | após preload confirmado |

## Submissão (após 2027-02)

1. Acessar `https://hstspreload.org`
2. Inserir domínio `tankwallet.dev`
3. Confirmar checklist via formulário
4. Aguardar aprovação (≤ 2 semanas)
5. Adicionar domínio à lista oficial Chrome/Firefox/Safari

## Reversão (rollback)

Caso problema pós-preload:
1. Remover `preload` do header `Strict-Transport-Security`
2. Solicitar remoção em `https://hstspreload.org` (formulário "Remove a domain")
3. Aguardar 6-12 meses para propagação antes de remover HTTPS
4. **Nunca** remover `Strict-Transport-Security` sem antes remover do preload

## Responsáveis

- Engineering Lead: aprovação submissão
- Security: revisão checklist
- DevOps: configuração Caddy + cert

## Referências

- `docs/SECURITY-GATE.md`
- `next.config.ts:48`
- `Caddyfile:1`
- `docs/audit/AUDIT-CLOSURE.md`
