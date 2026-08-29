# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 10 — Signing Completo + Vault Evolution

**Objetivo:** fechar assinatura multi-chain (Bitcoin PSBT, Solana Versioned, EIP-712) e evolução do cofre (multisig, timelock, spending limits, passphrase).

**Issues mãe:** novas #27, #28

### Tarefas

#### T1 — Signing Completo (ALTO)
- **Arquivos:** `src/lib/signing/psbt.ts` (novo), `src/lib/signing/solana.ts` (novo), `src/lib/signing/eip712.ts` (novo), `src/lib/signing/__tests__/*.test.ts` (novo)
- **Ações:**
  - `psbt.ts`: `createPsbt` (BIP-174) com `bitcoinjs-lib` `Psbt` + Taproot `p2tr` + Native SegWit `p2wpkh`, `signPsbt`, `finalizePsbt`
  - `solana.ts`: `createVersionedTx` via `@solana/web3.js` stub (`VersionedTransaction`, `TransactionMessage`), `signVersionedTx`
  - `eip712.ts`: `signTypedData` (EIP-712) + `signMessage` (EIP-191) via `viem` `privateKeyToAccount`
- **Critério:** `bun test signing` 6 pass (PSBT, Solana, EIP-712)
- **Testes:** `src/lib/signing/__tests__/{psbt,solana,eip712}.test.ts`
- **Ref:** `Closes #27`

#### T2 — Vault Evolution (MÉDIO)
- **Arquivos:** `src/lib/vault/evolution.ts` (novo), `src/lib/vault/__tests__/evolution.test.ts` (novo), `docs/ARCHITECTURE-MODULES.md`
- **Ações:**
  - `evolution.ts`: `MultisigConfig` (k-of-n), `TimelockConfig` (delay), `SpendingLimit` (diário/semanal), `BIP39Passphrase` (25ª palavra), `SocialRecovery` stub
  - Integrar com `src/lib/wallet-core/storage.ts` (AES-GCM vault)
  - `ARCHITECTURE-MODULES.md`: marcar `Vault Evolution` como `Ativo`
- **Critério:** `bun test vault` 4 pass (multisig, timelock, spending, passphrase)
- **Testes:** `src/lib/vault/__tests__/evolution.test.ts`
- **Ref:** `Closes #28`

### Fora de escopo neste sprint

- LND/Lightning BOLT-11 — próximo ciclo
- ERC-4337 Account Abstraction — próximo ciclo
- Social recovery k-of-n completo — stub apenas

### Definição de pronto (DoD)

- [ ] `src/lib/signing` + `src/lib/vault` com testes verdes (10 pass total)
- [ ] `bunx tsc --noEmit:0` `eslint:0`
- [ ] Deploy gate verde
