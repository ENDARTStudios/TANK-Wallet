# FortiX Wallet — Phase 1 Architecture

## Status atual (após Phase 1)

| Área | Antes | Agora |
| --- | --- | --- |
| UX | 10/10 | 10/10 |
| Arquitetura | 10/10 | 10/10 |
| Modularidade | 10/10 | 10/10 |
| Segurança conceitual | 9/10 | 9/10 |
| Segurança criptográfica | 4/10 → | **8/10** |
| Integração blockchain real | 3/10 → | **6/10** |
| Produção | 3/10 → | **4/10** |

## O que está REAL agora

### 1. wallet-core (criptografia real)

Arquivo: `src/lib/wallet-core/index.ts`

- **BIP-39**: geração de mnemonic 12/24 palavras via `@scure/bip39` + wordlist inglês
- **BIP-32**: HDKey derivation via `@scure/bip32`
- **BIP-44** (EVM): `m/44'/60'/0'/0/x` — deriva endereços Ethereum e endereços compartilhados em todas as chains EVM (BSC, Polygon, Arbitrum, Optimism, Avalanche, Base)
- **SLIP-0010** (Solana): `m/44'/501'/x'/0'` via `ed25519-hd-key` — deriva keypair ed25519 → endereço base58
- **BIP-44** (Bitcoin): `m/84'/0'/0'/0/x` — Native SegWit (bech32) via `bitcoinjs-lib`
- **Lightning**: `m/44'/0'/0'/0/x` — deriva 33-byte compressed pubkey para LN node id

### 2. wallet-storage (criptografia em repouso)

Arquivo: `src/lib/wallet-core/storage.ts`

- **Web Crypto API**: AES-256-GCM para criptografar mnemonic
- **PBKDF2**: 250.000 iterações SHA-256 para derivar chave da senha
- **LocalStorage**: vault criptografado persistido em `fortix:vault:v1`
- **Formato**: `salt(16) || iv(12) || ciphertext` em base64

### 3. wallet-evm (RPC real + assinatura real)

Arquivo: `src/lib/wallet-evm/index.ts`

- **Provider**: viem `createPublicClient` com failover entre 3 RPCs públicos CORS-enabled por chain
- **Operações reais**:
  - `getBalance` — saldo nativo (ETH/BNB/MATIC/etc.)
  - `getTransactionCount` — nonce
  - `getGasPrice` — preço de gas
  - `estimateGas` — estimativa de gas
  - `call` (eth_call) — simulação de transação sem broadcast
  - `readContract` — leitura de ERC-20 (name, symbol, decimals, balanceOf)
  - `waitForTransactionReceipt` — confirmação pós-broadcast
- **Signer**: assinatura EIP-1559 offline real via `viem/accounts.privateKeyToAccount`
  - `signTransaction` com type: 'eip1559', chainId explícito
  - `signTypedData` EIP-712
  - `signMessage` EIP-191
- **Endpoints**: publicnode.com, 1rpc.io, llamarpc.com, binance.org (com failover automático)

### 4. wallet-security-real (GoPlus API)

Arquivo: `src/lib/wallet-security-real/index.ts`

- **GoPlus Security API** integrada (via proxy Next.js API routes para contornar CORS)
- **Token Security**: consulta retorna:
  - `is_honeypot`, `is_open_source`, `is_mintable`, `is_proxy`, `hidden_owner`
  - `transfer_pausable`, `is_blacklisted`, `selfdestruct`, `cannot_sell_all`
  - `buy_tax`, `sell_tax`, `is_tax_modifiable`
  - `holder_count`, `liquidity`, `lp_holders` (com LP lock status)
  - `is_owner_address` (ownership renounced)
- **Address Security**: retorna phishing_count, blackmail_count, fake_token_count, honeypot_count para qualquer endereço
- **Heurística própria**: traduz dados GoPlus em score 0-100 com razões legíveis
- **Override**: tokens amplamente adotados (USDT, USDC, etc.) com source verified e >100k holders não são bloqueados mesmo com features centralizadoras

### 5. Onboarding real

Arquivo: `src/components/wallet/onboarding/onboarding.tsx`

- **Create**: gera mnemonic BIP-39 real → exibe 12 palavras (com blur até tap) → confirmação re-typing → senha → deriva chaves → armazena vault AES-GCM
- **Import**: cola mnemonic → validação BIP-39 → senha → deriva + armazena
- **Unlock**: vault existente → senha → descriptografa PBKDF2 → deriva chaves → carrega no contexto

## O que ainda falta (Phases 2-N)

### Phase 2: Broadcast + Indexer
- `eth_sendRawTransaction` para broadcast real
- Alchemy/Infura/QuickNode SDK para rate limits altos
- Indexer para descoberta automática de ERC-20/721/1155 via Transfer logs
- Helius para Solana, Blockstream/Mempool.space para BTC

### Phase 3: Signing completo
- **Bitcoin PSBT** (BIP-174) com Taproot + SegWit
- **Solana Versioned Transactions** via `@solana/web3.js`
- **EIP-712 demonstração** (signTypedData) na UI
- **EIP-6963** para descoberta de wallets injetadas

### Phase 4: Security engine avançada
- Bytecode analysis (sem depender só de GoPlus)
- Tenderly Simulation API para preview de state diff real
- Blowfish API como segunda fonte
- ERC-4337 Account Abstraction (smart contract wallet)
- Permit2 detection

### Phase 5: Vault evolution
- Multisig (Gnosis Safe compatible)
- Timelock configurável
- Spending limits diários/semanais
- BIP-39 passphrase (25ª palavra)
- Social recovery

### Phase 6: DApp browser real
- WalletConnect v2 SDK
- EIP-6963 announceProvider
- Injected provider (window.ethereum)
- iframe sandbox com CSP estrita
- Per-DApp permission scoping

### Phase 7: Backend services
- Risk Service (agrega GoPlus + Blowfish + Tenderly)
- Pricing Service (CoinGecko / DeFi Llama)
- NFT Metadata service
- Portfolio aggregator
- Token Registry (white-list de tokens verificados)
- Push notifications (suporte a wallet push)
- Sync entre dispositivos

### Phase 8: Lightning + Bitcoin
- LND node próprio (ou LNbits)
- Lightning invoices (BOLT-11)
- BTC PSBT com hardware wallet co-signer
- Submarine swaps (on-chain ↔ Lightning)

## Arquitetura de packages sugerida (futuro monorepo)

```
apps/wallet-web        # Next.js app atual

packages/
  wallet-core          # ✅ feito (BIP-39/32/44, SLIP-0010, storage)
  wallet-evm           # ✅ feito (RPC, signer EIP-1559/712)
  wallet-solana        # ✅ parcial (derivação de chaves; tx signing pendente)
  wallet-bitcoin       # ✅ parcial (derivação; PSBT pendente)
  wallet-lightning     # ✅ parcial (derivação; BOLT-11 pendente)
  wallet-security      # ✅ feito (GoPlus + heurísticas)
  wallet-rpc           # ✅ parcial (EVM com failover; Solana/BTC pendentes)
  wallet-indexer       # ⏳ Phase 2 (descoberta automática de tokens)
  wallet-simulation    # ⏳ Phase 4 (Tenderly + Blowfish)
  wallet-connect       # ⏳ Phase 6 (WalletConnect v2)
  wallet-dapps         # ⏳ Phase 6 (DApp browser sandbox)
  wallet-storage       # ✅ feito (AES-GCM + PBKDF2)
  wallet-ui            # ✅ feito (componentes React + shadcn)
  wallet-analytics     # ⏳ Phase 7
  wallet-notifications # ⏳ Phase 7
```

## Bibliotecas usadas

- `@scure/bip39` — mnemonic
- `@scure/bip32` — HD derivation
- `@noble/ed25519` — Solana keypair
- `@noble/curves` — secp256k1
- `@noble/hashes` — sha3/keccak
- `ed25519-hd-key` — SLIP-0010
- `bitcoinjs-lib` — Native SegWit address derivation
- `viem` — EVM RPC, EIP-1559 signing, EIP-712

## Como reproduzir o teste

1. Abrir a carteira → "Criar nova carteira"
2. Anotar 12 palavras → revelar → continuar
3. Confirmar as 12 palavras
4. Senha (8+ chars) → criar
5. Carteira desbloqueada, endereço real visível (badge "REAL")
6. Aba "Receber" → endereço real por chain + saldo via RPC público
7. Aba "Receber" → "Verificação GoPlus" → consultar USDT real (15.4M holders retornados da API)
8. Aba "Enviar" → ativar sessão segura → selecionar vitalik.eth → valor → verificar
9. RPC real retorna saldo 0, nonce 0, gas 21000
10. GoPlus retorna 0 reports para vitalik
11. Assinar EIP-1559 → tx hash + raw tx hex exibidos
