# MANUAL_DO_OPERADOR — TANK Wallet (T100)

> Operação real do produto. Sem segredos aqui (só placeholders). Estado refletido: main pós-Sprint 61.
> Aponta (não duplica): `docs/05-security-compliance/audit-package/`, `docs/06-devops-deployment/DAST-RUNBOOK.md`, `docs/06-devops-deployment/LOAD-TESTING.md`, `DECISOES.md`.

## 1. Run local

```bash
bun install --frozen-lockfile
bun run dev            # http://127.0.0.1:3000
```

## 2. Verificações (antes de qualquer deploy)

```bash
bunx tsc --noEmit
bunx eslint .
bun test src
bun run verify         # Quality Gates locais
bunx playwright test   # E2E (workers:1 + retries:2 no CI)
```

## 3. Deploy (Vercel, projeto `end-art-studios/tank-wallet`)

```bash
vercel whoami           # sessão ativa? (esperado: endartstudios)
vercel ls               # deploys recentes (idade/ambiente/status)
git push origin main    # deploy de produção é AUTOMÁTICO no merge em main
```

## 4. Flags de segurança (env; `"1"`/`"true"` = on; default off; efeito só no próximo deploy)

| Flag | O que liga | Efeito observável |
|---|---|---|
| `CSP_ENFORCE` | CSP enforcing c/ nonce (`src/lib/security/csp.ts`) | `Content-Security-Policy` (nonce) em vez de `...-Report-Only` |
| `JEV_ENABLED` | Risco Jev TypeSafe advisory (`src/lib/ai-risk/typesafe-jev.ts`) | `GET /api/risk` retorna `jev.enabled: true` |
| `INTENT_ROUTING_ENABLED` | Roteamento de intent (`src/lib/intent/classifier.ts`) | badge de intent na UI |

Gerenciar:

```bash
"true" | vercel env add CSP_ENFORCE production   # armar (确认 com vercel env ls)
vercel env rm CSP_ENFORCE production --yes       # desarmar (rollback)
```

### 4.1 Ativação supervisionada (qualquer flag, REGRA D093)

Só altere flag de produção no mesmo ato em que começa o monitoramento:

1. Baseline: `curl -si <url>/ | grep -i content-security-policy` (anotar policy vigente).
   Contadores de violação são em memória (`snapshotCspCounters`, sem endpoint público por
   desenho anti-PII) — sinal de produção = erros CSP no console dos clientes + headers;
   contabilidade de volume de reports é gap conhecido (futuro endpoint de métricas).
2. Ativar (`vercel env add`) + aguardar deploy.
3. Verificar header/contador mudou como esperado.
4. Janela 24–48h: qualquer quebra → rollback imediato (comando acima + redeploy).
5. Rollback também consome quota de deploy — se 402, aguardar reset (~24h).

## 5. Ler os headers (operação diária)

```bash
curl -si https://<deploy>/ | grep -iE 'content-security-policy|x-csp-nonce|reporting-endpoints'
curl -s https://<deploy>/api/health | head -c 300        # status + X-RateLimit-Limit
# Violations CSP: sem endpoint público (anti-PII); sinal = console dos clientes + headers.
```

Rate limit vigente (T083+T098): anônimos por IP (reads 120/min, writes 30/min);
autenticados por userId (JWT); monitoria (`/api/health`) bucket próprio 600/min.
`429` com `Retry-After` = enforcement funcionando, não incidente.

## 6. Rodar as baterias

```bash
bun run test:load                 # k6 smoke (requer app local no ar; só localhost)
gh workflow run dast.yml          # ZAP baseline (CI; weekly automático; nunca contra produção sem janela)
bun test src/lib/mpc/             # property-tests MPC (P1–P4, 1000 runs)
```

Limites: k6 só localhost; ZAP só localhost (muro SSO invalida scan externo);
detalhes em `docs/06-devops-deployment/LOAD-TESTING.md` e `docs/06-devops-deployment/DAST-RUNBOOK.md`.

## 7. Incidentes (3 cenários)

**A. CSP quebrando clientes (páginas em branco/erros após ativar enforcing):**
`vercel env rm CSP_ENFORCE production --yes` + redeploy + confirmar header voltou a
report-only. Critério: app carrega sem erros de console CSP.

**B. Abuso em endpoint (rajada legítima tomando 429 em massa):** verificar se é agregado
(CGNAT) ou ataque (`X-RateLimit-Remaining: 0` + mesma origem). Ajuste de bucket = mudança
de código (`OPERATION_LIMITS`) + deploy — nunca "desligar o limiter".

**C. Deploy Vercel falhando:** `402 api-deployments-free-per-day` = quota Hobby (ver §8);
outros erros → `vercel ls` + build logs no dashboard + `bun run build` local p/ reproduzir.

## 8. Pendências atuais (ação esperada do Operador)

- **PEND-SSO-PROD**: Vercel Authentication ON em produção é intencional? + DNS `tankwallet.dev`
  (não resolve). Impacto: bloqueia T087/T092 e qualquer validação externa.
- **PEND-BYPASS-CURLS**: meio de diagnóstico atrás do SSO (token via canal seguro, NUNCA no
  chat) ou execução própria dos curls com devolução redigida. Desbloqueia T092.
- **PEND-VERCEL-QUOTA**: 402 recorrente (3×) = padrão do Hobby no nosso ritmo. Decisão de
  custo: upgrade Pro OU aceite de janelas espaçadas de deploy.
- **PEND-AUDIT**: escolher firma + aprovar orçamento + assinar engagement
  (pacote em `docs/05-security-compliance/audit-package/`, runbook `CONTACT-RUNBOOK.md`).

## 9. Ponteiros

- Auditoria externa: `docs/05-security-compliance/audit-package/README.md`
- Decisões técnicas: `DECISOES.md` (D001…D101)
- Fila de trabalho: `docs/03-development-process/ISSUES-BACKLOG.md` (+ issues GitHub #66 fechada, #70, #72 fechada, #74 fechada, #75 reorg docs)
- Segurança: `SECURITY.md`, `BUG-BOUNTY.md` (raiz, convenção)
