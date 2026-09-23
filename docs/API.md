# API — API Interna `/api/*`

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Base: Next.js 16 App Router (`src/app/api/`)

## 1. Convenções (obrigatórias em toda rota)

1. **Validação zod** no corpo/query/params — nada entra sem validar.
2. **Autenticação/autorização:** `401` sem sessão; `403` sem permissão (RBAC — [RBAC.md](RBAC.md)).
3. **Rate limit:** `src/proxy.ts` global (120 req/min default, `API_RATE_LIMIT_PER_MIN`); rotas de escrita com limite menor; `429` + `Retry-After`.
4. **Envelope de erro** padronizado com `traceId` (ver [ERROR_HANDLING.md](ERROR_HANDLING.md) §3) e header `X-Request-Id`.
5. **Tenant:** consultas sempre filtradas por workspace (`filterByWorkspace` — [RLS.md](RLS.md)).
6. **Sem segredo na resposta:** redact antes de serializar.

## 2. Rotas

| Rota | Métodos | Propósito |
| --- | --- | --- |
| `/api/health` | GET | Liveness/readiness (usado pelo Render e smoke E2E) |
| `/api/auth/*` | — | next-auth (Credentials + OAuth Google/Apple) + TOTP |
| `/api/dashboard` | GET | KPIs agregados (rps, errorRate, p95, activeUsers) |
| `/api/metrics/prometheus` | GET | Exposição Prometheus (scrape do Grafana) |
| `/api/goplus/token` · `/api/goplus/address` | GET | Proxy GoPlus token_security / address_security (CORS) |
| `/api/whois` | GET | Proxy RDAP — idade de domínio, cache 1h |
| `/api/threats` | — | Threat intel (tokens/sites/endereços/exploits) |
| `/api/risk` | — | Risk service agregado (GoPlus/Blowfish/Tenderly/ChainPatrol) |
| `/api/broadcast` | — | `eth_sendRawTransaction` com failover Alchemy→Infura |
| `/api/notifications` | — | Web Push (VAPID) subscribe/send |
| `/api/billing/webhook` | POST | Stripe — **verifica assinatura antes de processar** |

## 3. Exemplos

### Request com erro de rate limit

```http
GET /api/threats?domain=metarnask-login.com
→ 429 Too Many Requests
   Retry-After: 30
   X-Request-Id: 01J...
   { "error": { "code": "RATE_LIMITED", "message": "Too many requests. Slow down.", "traceId": "01J...", "retryAfter": 30 } }
```

### Health check

```http
GET /api/health
→ 200 { "status": "ok", "observability": true, "version": "1.2.1" }
```

## 4. Segurança específica

- `/api/whois` e `/api/goplus/*`: cache agressivo + rate limit próprio (evita abuso do upstream).
- `/api/billing/webhook`: assinatura Stripe obrigatória (`verifyWebhookSignature`); idempotência por event ID.
- `/api/metrics/*`: **protegida** — exposta apenas à rede interna de monitoramento, não pública.
- Teste "acessa o que não é seu" obrigatório em rota nova (conta alheia, rota admin, sem sessão).

## 5. Teste de contrato

- Cada rota tem teste de integração: `GET` (formato), `POST` (efeito) e `429` (rate limit) — ver [TESTING.md](TESTING.md) §3.
- E2E smoke cobre `/api/health` em todo deploy.

## 6. Instruções de atualização

1. Rota nova: linha na tabela §2 + testes de contrato + docs aqui **no mesmo PR**.
2. Mudança de contrato (payload/status): trate como breaking change — atualize consumers, E2E e este doc; registre no [CHANGELOG.md](CHANGELOG.md).
3. Rota destruída: remova da tabela §2 e garanta 404 coberto por teste.
