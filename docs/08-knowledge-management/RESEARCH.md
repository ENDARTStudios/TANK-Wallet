# RESEARCH — Pesquisas Técnicas

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23
> Registro de investigações técnicas com **conclusão** e **onde landed no código**. Pesquisa sem conclusão vira spike com prazo; não fica aberta para sempre.

## Concluídas

| # | Tema | Conclusão | Landing |
| --- | --- | --- | --- |
| 1 | BIP-39/32/44 + SLIP-0010 | `@scure/*` + `@noble/*` + `ed25519-hd-key` + `bitcoinjs-lib` cobrem EVM/Solana/BTC com auditoria de biblioteca | `src/lib/wallet-core/` |
| 2 | Cripto em repouso | AES-256-GCM (Web Crypto) + PBKDF2 250k iterações em vault localStorage | `src/lib/wallet-core/` (storage) |
| 3 | Segurança de token/endereço | GoPlus Token/Address Security API cobre honeypot, mintable, proxy, LP lock etc.; CORS exige proxy | `src/lib/wallet-security-real/` + `/api/goplus/*` |
| 4 | Idade de domínio (phishing) | RDAP via rdap.org dá `registration` sem chave; extrair root domain de subdomínios; cache 1h | `/api/whois` |
| 5 | Detecção de bytecode perigoso | Padrões por opcode/seletor: delegatecall (0xf4), selfdestruct (0xff), upgradeTo (0x3659cfe6), transferOwnership (0xf2fde38b), mint (0x40c10f19), multicall (0xac9650d8) | `src/lib/wallet-scanner/` |
| 6 | Failover RPC público | 3 RPCs CORS-enabled por chain: publicnode (primário) → 1rpc → llamarpc | `src/lib/wallet-evm/` |
| 7 | Shamir Secret Sharing | SSS GF(256) com interpolação de Lagrange (`splitSecret`/`combineShares`) para backup PRO | `src/lib/crypto/shamir.ts` |
| 8 | Account Abstraction | EntryPoint **v0.7** com `packUserOp`/`getUserOpHash`; paymaster + bundler próprios | `src/lib/account-abstraction/` |
| 9 | 2FA | TOTP RFC 6238 (base32) sem dependência externa | `src/lib/auth/totp.ts` |
| 10 | Passkey/WebAuthn | WebAuthn register/login com challenge/attestation/assertion verificáveis | `src/lib/webauthn/` |
| 11 | Backup cifrado | SQLite/Postgres → dump → openssl AES-256 → S3, retenção 30d; restore provado por E2E semanal | `scripts/backup-cron.sh` + `.github/workflows/restore-e2e.yml` |
| 12 | RLS no SQLite | **Não suportado** → policies FORCE RLS só no Postgres (`prisma/rls.sql`, 6 policies); app usa `filterByWorkspace` como defesa equivalente no SQLite | `src/lib/db/rls.ts` |
| 13 | Simulação de transação | State-diff próprio como MVP; **Tenderly Simulation API** é o alvo para diff real | `src/lib/wallet-scanner/` (simulateTxDiff) |
| 14 | MPC/HSM | MPC 2-of-2 + passkey (v1) → v2 k-of-n com Shamir + Feldman VSS; HSM: AWS KMS real, GCP/Azure stub (Sprint 58) | `src/lib/mpc/` |

## Em aberto (spikes)

| Tema | Pergunta aberta | Dono/prazo |
| --- | --- | --- |
| Tenderly state diff real | Substituir `simulateTxDiff` MVP pela API oficial; custo/latência? | Sprint futuro |
| Blowfish API | Segunda fonte de risk scoring — disponibilidade/limites atuais? | `src/lib/risk-service/aggregator.ts` |
| WalletConnect v2 em produção | Sessões hoje mockadas (Uniswap/OpenSea/Aave) — migrar para WC v2 SDK real | Phase DApp browser |
| Push notification reliability | VAPID implementado; taxa de entrega em iOS PWA? | v1.3.0 |
| HSTS preload | Submissão na janela 2027-02 — requisitos cumpridos? | [HSTS-PRELOAD.md](HSTS-PRELOAD.md) |

## Instruções de atualização

1. Pesquisa concluída: mova para "Concluídas" com landing no código (pesquisa sem landing é desperdício).
2. Nova pesquisa: linha em "Em aberto" com pergunta específica + dono + prazo.
3. Resultado que muda arquitetura → crie ADR em [ADR.md](ADR.md) e aprendizado em [MEMORY.md](MEMORY.md).
4. Cite fontes (doc oficial, RFC, teste) na hora de concluir — "funciona" precisa de evidência.
