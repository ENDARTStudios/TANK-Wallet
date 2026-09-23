# ROADMAP — Roadmap Consolidado

> **Tipo:** Gestão · **Atualizado:** 2026-09-23 · **Fontes:** `../ARCHITECTURE.md` (fases técnicas) · `../PRD.md` (escopo de produto) · `../SPRINT.md` (execução)
> **Release Decision atual: BLOCKED** — 15 hard gates externos (auditorias/pentest) pendentes.

## Entregue (marcos)

| Versão | Data | Marco |
| --- | --- | --- |
| Phase 1-2 | 2026-07 | Fundação criptográfica + Soberania (approvals, lockdown, scanners) |
| Phase 3 | 2026-07 | Brand identity + UX overhaul (dashboard, health, timeline, AI assistant) |
| 1.1.0 | 2026-08-30 | Sprints 1-22: hygiene, WAF/RBAC/RLS, Postgres, AA, MPC, social recovery, DR |
| 1.1.1 | 2026-08-30 | Hotfix: redact, smoke E2E, DAST ZAP, crypto PII/Shamir/threshold |
| 1.2.0 | 2026-08-30 | Sprints 28-40: RLS apply, Lighthouse, Sentry real, WC, WebAuthn, backup, cosign, i18n, PWA, Stripe, métricas |
| 1.2.1 | 2026-08-30 | Hotfix: verify 11/11, initObservability real, render.yaml, lint 0/0 |

## Em execução

- **Sprint 58/59:** MPC v2 + HSM real (✅ T058) · E2E env setup (T061 ✅ documentado, T062 diferida).
- **Threat Intelligence Backend (fase 4 do PRD):** modelos Prisma prontos (ThreatToken/Site/Address/Exploit), rotas `/api/threats` em curso.

## v1.3.0 (próxima)

1. Fechamento dos findings Trail of Bits (`audit-config/findings-tracker.md`).
2. Mobile PWA polish (manifest + sw.js já em produção).
3. T062: reabilitar 9 testes E2E.

## Hard gates externos (desbloqueio de release)

| Gate | Estado |
| --- | --- |
| Audit #1 — crypto + key management + recovery | Pacote pronto (`docs/audit-package/`), aguardando commissionamento |
| Audit #2 — engines + decision pipeline + event bus | Após Audit #1 |
| Pentest externo | Não executado |
| Bug bounty público (Immunefi) | Draft pronto, launch pós-Audit #1 |
| HSTS preload submission | Janela 2027-02 |

## Fases futuras (ordem atual)

| Fase | Escopo |
| --- | --- |
| Universal Asset Engine | ERC-20/721/1155, SPL, BRC-20, Runes, Ordinals, ARC20, Jettons, CW20 com descoberta via indexers |
| Broadcast Engine | `eth_sendRawTransaction` com Alchemy/Infura em produção |
| Bitcoin + Lightning | PSBT BIP-174 + Taproot + SegWit, BOLT-11, LND, submarine swaps |
| Solana | Versioned Transactions (`@solana/web3.js`) |
| Account Abstraction | ERC-4337 smart contract wallet em produção |
| WalletConnect v2 / DApp browser | EIP-6963 + injected provider + iframe sandbox + per-DApp scoping |
| Threat Intel própria | ChainPatrol + ScamSniffer + HashDit + PhishFort + IA própria |
| MPC + Passkeys | Substituir seed por MPC (base v2 pronta) |
| Recuperação social | k-of-n friends/family (lib pronta) |
| IA comportamental | Perfil de uso (horário, rede, valor, device) + Lockdown automático fora do padrão (lib pronta, sensibilidade a calibrar) |

## Instruções de atualização

1. Ao fechar sprint: mova itens de "Em execução" para a tabela de marcos com versão/data.
2. Nova versão planejada: liste escopo verificável (não desejo).
3. Hard gate externo concluído: atualize tabela + Release Decision em `../README.md`.
4. Mudança de ordem de fases exige justificativa em `../DECISOES.md`.
