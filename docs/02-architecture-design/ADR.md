# ADR — Architecture Decision Records

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Log narrativo complementar: `../DECISOES.md` (pt-BR, decisões nominais)
> **Propósito:** registrar **por que** decisões arquiteturais foram tomadas, para não re-litigar o já decidido.

## Formato

```markdown
### ADR-NNN — Título (AAAA-MM-DD)
**Status:** Proposto | Aceito | Substituído por ADR-XXX | Deprecado
**Contexto:** força que motivou a decisão.
**Decisão:** o que foi decidido.
**Consequências:** ganhos, custos e riscos assumidos.
```

Regra: decisão estrutural nova = ADR **no PR que a implementa**, linkado abaixo.

## Índice de decisões

| ADR | Decisão | Status | Resumo do porquê |
| --- | --- | --- | --- |
| ADR-001 | Bun como runtime/test runner/PM | Aceito | Velocidade de install/test; scripts TS nativos sem build step |
| ADR-002 | Next.js 16 App Router + React 19 | Aceito | SSR/RSC para SEO + UX de SPA; metadata API para SEO/AEO |
| ADR-003 | SQLite em dev, Postgres 16 em prod | Aceito | Dev zero-friction; RLS multi-tenant exige Postgres (SQLite sem RLS — RESEARCH #12) |
| ADR-004 | Pipeline de decisão zero-trust (16 engines) | Aceito | Segurança como núcleo do produto, não feature (freeze 1.0.0) |
| ADR-005 | Audit log tamper-evident com HMAC chain | Aceito | Trilha de permissões precisa ser imutável verificável (FR-SEC-04) |
| ADR-006 | Integrações externas sempre via proxy `/api/*` | Aceito | CORS, cache, rate limit e segredo server-side (aprendizado A5) |
| ADR-007 | Failover de 3 RPCs públicos por chain | Aceito | RPC único derruba UX de leitura (aprendizado A6) |
| ADR-008 | Release assinada: cosign keyless + Ed25519 + SBOM CycloneDX | Aceito | Cadeia de suprimento verificável para auditores |
| ADR-009 | i18n pt-BR (default) / en-US / es-ES | Aceito | Público primário BR com expansão América |
| ADR-010 | PWA (manifest + sw.js cache-first) | Aceito | Mobile-first sem custo de app store na fase atual |
| ADR-011 | Observabilidade inicializada em `instrumentation.ts` (nunca no-op) | Aceito | Lição do SDK no-op (aprendizado A2); gate verifica scaffold |
| ADR-012 | Rate limit/bot-guard no `src/proxy.ts` (edge da app) | Aceito | Defesa em camadas antes das rotas; WAF `monitor`→`block` |
| ADR-013 | MPC v2 k-of-n (Shamir + Feldman VSS) + HSM (AWS KMS real) | Aceito | Enterprise exige sem seed única; Sprint 58 (T058) |
| ADR-014 | E2E flaky: `test.skip` documentado em vez de flaky verde | Aceito | 9 testes pulados com STATUS-T061 + DECISOES; dívida T062 |

## Substituições e revisões pendentes

- **Aberto:** substituir simulação MVP (`simulateTxDiff`) por Tenderly real — quando contratado, novo ADR.
- **Aberto:** HSM GCP/Azure são stubs — ADR de produção pendente por provedor.
- **Aberto:** Postgres em prod ainda não promovido (script pronto) — ADR de cutover quando multi-tenant ativar.

## Instruções de atualização

1. Novo ADR: numere sequencialmente, escreva no formato acima e adicione ao índice.
2. Decisão revogada: **não apague** — mude Status para `Substituído por ADR-XXX`.
3. ADR que afeta produto (tiers, UX de segurança) precisa também de entrada em `../DECISOES.md` e/ou [MEMORY.md](MEMORY.md).
