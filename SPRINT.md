# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 7 — WalletConnect v2 + EIP-6963 + src/features Migração (Etapa 2/3)

**Objetivo:** fundar DApp browser real com WalletConnect e descoberta de providers, e iniciar migração incremental para `src/features/` alvo.

**Issues mãe:** `docs/ISSUES-BACKLOG.md` #10 (parte 2), novas #21, #22

### Tarefas

#### T1 — WalletConnect v2 Stub (MÉDIO)
- **Arquivos:** `src/lib/wallet-connect/index.ts` (novo), `src/lib/wallet-connect/__tests__/wallet-connect.test.ts` (novo), `src/components/wallet/dapps-view.tsx` (atualizar), `.env.example`
- **Ações:**
  - `wallet-connect/index.ts`: `createWalletConnectClient`, `pair`, `disconnect`, `onSessionProposal` stubs com `WalletConnect v2` tipos (sem SDK real, preparado para `sign-client`)
  - Env `WALLETCONNECT_PROJECT_ID` em `.env.example`
  - `dapps-view.tsx`: botão "Connect via WalletConnect" com `pair(uri)` stub
- **Critério:** `bun test wallet-connect` 3 pass; `WALLETCONNECT_PROJECT_ID` em `.env.example`
- **Testes:** `src/lib/wallet-connect/__tests__/wallet-connect.test.ts`
- **Ref:** `Closes #21`

#### T2 — EIP-6963 Provider Discovery (MÉDIO)
- **Arquivos:** `src/lib/eip6963/index.ts` (novo), `src/lib/eip6963/__tests__/eip6963.test.ts` (novo), `src/components/wallet/wallet-context.tsx` (atualizar para `announceProvider`)
- **Ações:**
  - `eip6963/index.ts`: `announceProvider` + `requestProviders` (`EIP6963AnnounceProvider`, `EIP6963RequestProvider` events), `injectedProvider` com `window.ethereum` fallback
  - `wallet-context.tsx`: escuta `eip6963:announceProvider` e registra providers
- **Critério:** `bun test eip6963` 4 pass; `window.dispatchEvent` simula provider e é capturado
- **Testes:** `src/lib/eip6963/__tests__/eip6963.test.ts`
- **Ref:** `Closes #22`

#### T3 — src/features Migração Incremental (MÉDIO)
- **Arquivos:** `src/features/threat-intel/` (novo), `src/features/README.md` (atualizar), `docs/ARCHITECTURE-MODULES.md` (atualizar status)
- **Ações:**
  - Criar `src/features/threat-intel/index.ts` que re-exporta `src/lib/wallet-threat-intel` (ou `wallet-engines`) como primeiro exemplo migrado
  - Atualizar `features/README.md` com progresso 1/8
  - `ARCHITECTURE-MODULES.md`: marcar `threat-intel` como `Migrado (exemplo)` + `wallet-connect` e `eip6963` como `Novo`
- **Critério:** `src/features/threat-intel/index.ts` existe e é importável; `bunx tsc --noEmit:0`
- **Ref:** `Closes #10` (parte 2)

### Fora de escopo neste sprint

- WalletConnect `sign-client` real + relay — Sprint 8
- `iframe` sandbox CSP estrita + per-DApp permission scoping — Sprint 8
- Threat Intel backend real — Sprint 8

### Definição de pronto (DoD)

- [ ] `src/lib/wallet-connect` + `src/lib/eip6963` com testes verdes (7 pass total)
- [ ] `src/features/threat-intel` re-exporta lib existente
- [ ] `bunx tsc --noEmit:0` `eslint:0`
- [ ] Deploy gate verde
