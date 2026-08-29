# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 9 — Broadcast Engine + Indexer (Alchemy/Infura, Helius, Blockstream)

**Objetivo:** fechar o ciclo de transação real (broadcast) e descoberta automática de ativos via indexers, sem depender de RPC público com Rate limit.

**Issues mãe:** novas #25, #26

### Tarefas

#### T1 — Broadcast Engine (ALTO)
- **Arquivos:** `src/lib/broadcast/index.ts` (novo), `src/lib/broadcast/__tests__/broadcast.test.ts` (novo), `src/app/api/broadcast/route.ts` (novo), `.env.example`
- **Ações:**
  - `broadcast/index.ts`: `broadcastTx({ chain, signedTx }) → { hash, success }` com `eth_sendRawTransaction` via `viem` + failover (Alchemy → Infura → publicnode), `ALCHEMY_API_KEY`/`INFURA_API_KEY` em `.env.example`
  - `route.ts`: `POST /api/broadcast` `zod` + `requirePermission(sign_transaction)` + `withWorkspaceFilter`
- **Critério:** `bun test broadcast` 3 pass (failover, success, error); `POST /api/broadcast` com stub retorna `hash`
- **Testes:** `src/lib/broadcast/__tests__/broadcast.test.ts`
- **Ref:** `Closes #25`

#### T2 — Indexer (MÉDIO)
- **Arquivos:** `src/lib/indexer/index.ts` (novo), `src/lib/indexer/__tests__/indexer.test.ts` (novo), `src/lib/indexer/providers/{alchemy,helius,blockstream}.ts` (novo)
- **Ações:**
  - `indexer/index.ts`: `discoverAssets({ chain, address }) → { erc20[], erc721[], erc1155[] }` via `eth_getLogs` `Transfer` (EVM), `helius` (Solana SPL), `blockstream` (BTC `address/txs`)
  - Providers com `fetch` + cache 30s + fallback
  - Integrar com `src/features/threat-intel` para filtrar `honeypot` já no indexer
- **Critério:** `bun test indexer` 4 pass (EVM, Solana, BTC, cache)
- **Testes:** `src/lib/indexer/__tests__/indexer.test.ts`
- **Ref:** `Closes #26`

### Fora de escopo neste sprint

- PSBT/BIP-174 + Taproot — Sprint 10
- Solana Versioned Transactions — Sprint 10
- Multisig/Gnosis — Sprint 10

### Definição de pronto (DoD)

- [ ] `src/lib/broadcast` + `src/lib/indexer` com testes verdes (7 pass total)
- [ ] `src/app/api/broadcast/route.ts` com `401/403` + `429` (via `proxy`)
- [ ] `bunx tsc --noEmit:0` `eslint:0`
- [ ] Deploy gate verde
