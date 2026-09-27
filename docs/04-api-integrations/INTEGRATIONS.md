# INTEGRATIONS — Integrações Externas

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Segredos: `.env.example` + [SECRETS.md](SECRETS.md)
> **Regra padrão (aprendizado A5):** toda API externa chamada pelo browser entra **via proxy Next.js** (`/api/*`) para CORS, cache e rate limit.

## 1. Mapa de integrações

| Integração | Uso | Env | Onde no código | Falha |
| --- | --- | --- | --- | --- |
| **GoPlus Security API** | Token/address security (honeypot, LP, taxas) | `GOPLUS_PROXY_KEY` | `/api/goplus/*`, `src/lib/wallet-security-real/` | Degrada p/ heurística local |
| **RDAP (rdap.org)** | Idade de domínio p/ DApp Shield | — | `/api/whois`, cache 1h | Estado "desconhecido" |
| **RPCs públicos EVM** (publicnode → 1rpc → llamarpc) | Leituras/estimativas multi-chain | — | `src/lib/wallet-evm/` | Failover automático (A6) |
| **Alchemy / Infura** | Broadcast + indexer (rate alto) | `ALCHEMY_API_KEY`, `INFURA_API_KEY` | `src/lib/broadcast/`, `src/lib/indexer/` | Failover Alchemy→Infura |
| **Helius** | Indexer Solana | `HELIUS_API_KEY` | `src/lib/indexer/` | Degrada |
| **Blowfish / Tenderly / ChainPatrol** | Risk service multi-fonte + simulação | `BLOWFISH_API_KEY`, `TENDERLY_ACCESS_KEY`, `CHAINPATROL_API_KEY` | `src/lib/risk-service/aggregator.ts` | Fonte cai fora do agregado |
| **WalletConnect** | Sessões DApp | `WALLETCONNECT_PROJECT_ID` | `src/lib/wallet-connect/` | Sem sessão nova |
| **Stripe** | Billing PRO (checkout + webhook) | `STRIPE_*` | `src/lib/billing/stripe.ts`, `/api/billing/webhook` | 400 + log; assinatura verificada |
| **Sentry** | Erros + perf | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | `src/instrumentation.ts` | Log local segue |
| **OpenTelemetry (OTLP)** | Tracing | `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME` | `src/lib/observability/tracing.ts` | Vazio = desligado |
| **Google/Apple OAuth** | Login social | `GOOGLE_*`, `APPLE_*` | `src/lib/auth/oauth.ts` | Provider desabilitado na UI |
| **Web Push (VAPID)** | Notificações | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `src/lib/notifications/` | Fila silenciosa |
| **Postgres 16** (prod) | Banco multi-tenant | `DATABASE_URL` | `docker-compose.yml`, `prisma/` | — |

## 2. Regras de integração (checklist para adicionar nova)

1. **Proxy própria** em `/api/*` — nunca chamada direta do browser ao upstream.
2. **Timeout + retry limitado** — integração lenta não pode travar request de usuário.
3. **Failover/degradação definida** — o que o usuário vê se cair? (Ver [ERROR_HANDLING.md](ERROR_HANDLING.md) §5.)
4. **Cache quando fizer sentido** (ex.: WHOIS 1h) com invalidação clara.
5. **Segredo só em `.env`** — nome documentado no `.env.example` e na tabela §1.
6. **Rate limit próprio** na rota proxy para não repassar abuso ao upstream.
7. **Teste de contrato** com resposta real gravada (fixture) + caso de falha simulada.
8. **Sem third-party JS no client** (budget 0) — integrações são server-side.

## 3. Saúde e monitoramento

- Cada integração deve logar latência e taxa de erro por `svc` no logger estruturado (visível no Grafana).
- Falha de integração de **segurança** (GoPlus/RDAP/risk) é alerta, não silêncio — o produto é prevenção.
- Revisar quotas mensalmente (`bun run metrics` + dashboards); chave vencida vira issue `sev:high`.

## 4. Instruções de atualização

1. Nova integração: linha na tabela §1 + checklist §2 cumprido + env no `.env.example` — mesmo PR.
2. Integração removida: remova a linha, o env e o código no mesmo PR (evitar código morto — [CLEANUP-PLAN.md](CLEANUP-PLAN.md)).
3. Mudança de plano/quota do provedor: atualize §3 e, se mudar comportamento, registre aprendizado em [MEMORY.md](MEMORY.md).
