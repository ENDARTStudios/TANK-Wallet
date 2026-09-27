# MEMORY — Memória Institucional do Projeto

> **Tipo:** Governança · **Atualizado:** 2026-09-23
> Complementa: `../DECISOES.md` (decisões nominais) · `../worklog.md` (log multi-agente) · `../PLANO_MESTRE.md` (plano mestre).
> **Propósito:** reter decisões e aprendizados que **não são óbvios** pelo código/git, para que nenhum agente ou dev repita erro antigo.

## Como registrar (instruções)

1. Um aprendizado = uma entrada com data, contexto e regra prática.
2. Erro cometido + correção → registre **a armadilha**, não só a correção (a correção vive no git).
3. Entrada obsoleta (regra deixou de valer) → marque `⚠️ obsoleto em AAAA-MM-DD` em vez de apagar.
4. Decisão estrutural nova → além daqui, crie ADR em [ADR.md](ADR.md).

## Decisões estruturais (resumo)

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-07 | Architecture Freeze 1.0.0 — bases congeladas | Estabilidade para auditoria externa |
| 2026-08 | SQLite (dev) → Postgres 16 (prod) com RLS | Multi-tenant seguro; SQLite não tem RLS nativo |
| 2026-08 | Bun como runtime/test runner | Velocidade + scripts nativos TS |
| 2026-08 | Observabilidade sempre ligada por `instrumentation.ts` | SDK instalado ≠ SDK ativo (ver aprendizado A2) |
| 2026-08 | Assinatura de release cosign keyless + Ed25519 + SBOM | Cadeia de suprimento verificável |
| 2026-09 | E2E: 9 testes pulados com `test.skip` documentado | Root cause de env/setup no CI; dívida T062 |

## Aprendizados (armadilhas conhecidas)

- **A1 — Segredo no repo (2026-08):** `.env` e chave PGP privada chegaram a ser versionados. Custo de remoção + rotação >> custo de prevenção. **Regra:** `gitleaks` no gate + jamais `git add -f` de arquivo de ambiente.
- **A2 — SDK no-op (2026-08):** Sentry/OTel instalados mas `initObservability()` nunca chamado → tudo silenciosamente no-op. **Regra:** feature de observabilidade só está "pronta" com prova de telemetria chegando (ver [MONITORING.md](MONITORING.md) playbook).
- **A3 — Compat viem + @noble/curves (2026-08):** conflito resolvido fixando `@noble/curves@2.4.0`. **Regra:** ao subir major de lib crypto, rodar `bun run golden` (9 vector sets) antes do merge.
- **A4 — E2E flaky por env (2026-09):** falhas de E2E no CI vinham do env/test setup, não dos fluxos. **Regra:** antes de "corrigir" teste E2E, verificar setup de env do runner (lição T061/T062).
- **A5 — Proxy para CORS (2026-07):** APIs externas (GoPlus, RDAP) exigem proxy Next.js para o browser. **Regra:** toda integração externa nova entra por rota `/api` própria (ver [INTEGRATIONS.md](INTEGRATIONS.md)).
- **A6 — Failover RPC (2026-07):** RPC público único derruba a UX. **Regra:** sempre 3 RPCs CORS-enabled por chain (publicnode → 1rpc → llamarpc).

## Contexto permanente

- Produto: hot wallet de **prevenção** — "never sign a dangerous transaction" (ver [PRD.md](PRD.md)).
- Release Decision atual: **BLOCKED** por 15 hard gates externos (auditorias/pentest pendentes) — confiança interna 65-71%.
- Domínio de produção: `tankwallet.dev` (Render + Caddy).
- Time usa múltiplos agentes IA; o contrato de trabalho está em `../AGENTS.md` (GRAFT-FIRST é obrigatório).
