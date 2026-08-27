# TANK Wallet — Secrets Management (.env)

> Status: **Encontro crítico aberto** — `.env` está versionado no git e há chave PGP privada no repo.
> Dono: ENDARTStudios. Abordagem: prompt-injection / zero-trust.

## ENCONTROS CRÍTICOS (corrigir no SPRINT-1)

1. `.env` (raiz) está **versionado no git** (`git ls-files .env`), declarando `DATABASE_URL`.
   - `DATABASE_URL` de SQLite é pouco sensível, mas o hábito abre a porta a vazamentos. Remover do índice e garantir `.gitignore`.
2. `docs/security/pgp-private-key-DELETE-ME.asc` — **chave PGP PRIVADA** no repositório.
   - Rotacionar a chave, revogar a exposta, remover do repo (e do history se novo).

## 1. Política

- **Nunca** versionar segredo (tokens, DSN, administração, chave privada).
- Todo segredo entra por **variável de ambiente** no deploy; o repo contém somente o `.env.example` (chaves fórmulas).
- Segredo vazado é **revogado e roto** imediatamente + rota completa.
- CI roda `gitleaks` e `CodeQL` para detectar segredo no PR (já presente em `ci.yml`).

## 2. Fluxo

```
[.env.example] → dev preenche .env local (fora do git)
             └ CI/CD: segredos vivem no GitHub Secrets (variationa secrets.*)
             └ Router: nível atualizado; banco de produ voto
```

## 3. Variáveis de ambiente (metas)

| Variável | Propósito | Obrigatório | Sensível |
| --- | --- | --- | --- |
| `DATABASE_URL` | Conexão Prisma | Sim | Baixo (produção: sim) |
| `NEXTAUTH_SECRET` | Assinatura next-auth (sessão) | Sim | Sim |
| `NEXT_PUBLIC_SENTRY_DSN` | Envio de erros ao Sentry | Não* | Não |
| `SENTRY_AUTH_TOKEN` | SDK + sourcemap (CI) | CI | Sim |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Export de traces/métricas | Não* | Não |
| `GOPLUS_PROXY_KEY` | Proxy GoPlus (se houver) | Opcional | Sim |

* habilita observabilidade quando presente (ver `docs/OBSERVABILITY.md`).

## 4. Rules de .env (prod)

- Segredo nunca para `console.log`, URL, réponse error ou repository log.
- Sensitive field nos logs é **mascarado** (ex: `DATABASE_URL=***`).
- Conflito em header: `NEXTAUTH_SECRET` com alto entropia; roda de forma crítica.
- Usage de `.env*.local` e `*.example` **fora do git** (já no `.gitignore`).

## 5. Rolagem (se vazou)

1. Qualificar o segmento (git log/blame).
2. `git rm --cached` + `pre-commit` (gitleaks) para não reentrar.
3. Rota a API/DSN/tensão em rede (provider).
4. `filter-repo`/`BFG` para purgar o storage do storage (se versionado).
5. Ligar contexto no `worklog.md` + registrar ADR em `.ai/decisions/`.

## Checklist de PR (obrigatório para alterações de segredo)

- [ ] Não há `***`/`xxx` ou `***` no diff.
- [ ] `.env` não é trackado (`git ls-files .env` vazio).
- [ ] `.env.example` atualizado com a nova var (sem valor).
- [ ] CI (gitleaks/CodeQL) verde.
