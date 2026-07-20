# Tank Wallet — Architecture & Roadmap

## Filosofia

> **A hot wallet mais segura do mercado.**

Princípio nº 1: **Nada é permanente sem o consentimento contínuo do usuário.**

A maioria das hot wallets é projetada para executar transações. A Tank Wallet é projetada para **evitar que o usuário assine uma transação perigosa**. Nenhum token, contrato ou DApp é considerado confiável por padrão: todos passam por inspeção, simulação e classificação de risco antes de qualquer interação.

## Status atual (após Phase 1 + 2)

| Área | Phase 0 | Phase 1 | Phase 2 |
| --- | --- | --- | --- |
| UX | 10/10 | 10/10 | 10/10 |
| Arquitetura | 10/10 | 10/10 | 10/10 |
| Modularidade | 10/10 | 10/10 | 10/10 |
| Segurança conceitual | 9/10 | 9/10 | 10/10 |
| Segurança criptográfica | 4/10 | 8/10 | 8/10 |
| Integração blockchain real | 3/10 | 6/10 | 7/10 |
| Soberania do usuário | 2/10 | 2/10 | **8/10** |
| Produção | 3/10 | 4/10 | 5/10 |

## Phase 1 — Fundação criptográfica (entregue)

### wallet-core (criptografia real)
- BIP-39 mnemonic via `@scure/bip39`
- BIP-32 HD derivation via `@scure/bip32`
- BIP-44 EVM (`m/44'/60'/0'/0/0`) via `@noble/curves`
- SLIP-0010 Solana (`m/44'/501'/0'/0'`) via `ed25519-hd-key`
- BIP-44 Bitcoin Native SegWit (`m/84'/0'/0'/0/0`) via `bitcoinjs-lib`
- Lightning 33-byte compressed pubkey

### wallet-storage (criptografia em repouso)
- AES-256-GCM via Web Crypto API
- PBKDF2 250.000 iterações SHA-256
- Vault persistido em localStorage

### wallet-evm (RPC + signer reais)
- EvmProvider com failover entre 3 RPCs CORS-enabled por chain (publicnode, 1rpc, llamarpc)
- Operações reais: getBalance, getTransactionCount, getGasPrice, estimateGas, eth_call, readContract (ERC-20)
- EvmSigner EIP-1559 real (offline)
- EIP-712 signTypedData + EIP-191 signMessage

### wallet-security-real (GoPlus API)
- Token Security API: honeypot, mintable, proxy, hidden_owner, transfer_pausable, blacklist, sell_tax, liquidity, LP lock, holder_count
- Address Security API: phishing/blackmail/fake_token/honeypot counts
- Proxy Next.js API routes para contornar CORS

## Phase 2 — Sovereignty Layer (entregue)

### wallet-sovereignty (`src/lib/wallet-sovereignty/`)

**Princípio nº 1 implementado:** toda permissão concedida pode ser auditada e revogada.

#### ERC-20 Approvals
- `readErc20Approvals(chain, walletAddress, tokens)` — lê allowances reais via `readContract` no viem
- Para cada token × spender conhecido (Uniswap, 1inch, PancakeSwap, Permit2, etc.) consulta `allowance(owner, spender)`
- Detecta aprovações infinitas (max uint256)
- `buildRevokeErc20ApprovalCalldata(spender)` — gera calldata `approve(spender, 0)`

#### NFT Approvals
- `readNftApprovals(chain, walletAddress)` — lê `isApprovedForAll(owner, spender)` para coleções conhecidas (BAYC, Azuki, Otherdeed, Moonbirds)
- `buildRevokeNftApprovalCalldata(spender)` — gera calldata `setApprovalForAll(spender, false)`

#### Sessions
- Sessões DApp mockadas (Uniswap, OpenSea, Aave) com permissões detalhadas
- Em produção: WalletConnect v2 sessions

#### Permission history
- Log imutável de eventos: granted / revoked / expired / used
- Combina com security events e transactions em linha do tempo unificada

#### Lockdown
- `executeLockdown(approvals, nftApprovals, sessions)` — executa protocolo de emergência
- Revoga todas as aprovações ERC-20 + NFT
- Cancela Permit2
- Encerra sessões DApp
- Desconecta WalletConnect
- Bloqueia novas assinaturas
- Ativa modo somente leitura
- Tempo estimado: 30-90 segundos
- Registra evento crítico na Central de Risco

### wallet-scanner (`src/lib/wallet-scanner/`)

**"Antes de qualquer assinatura: análise completa."**

#### Smart Contract Scanner
- `scanContract(chain, address)` — lê bytecode real via `eth_getCode`
- Detecta padrões perigosos no bytecode:
  - delegatecall (opcode 0xf4)
  - selfdestruct (opcode 0xff)
  - upgradeTo (proxy pattern, selector 0x3659cfe6)
  - transferOwnership (selector 0xf2fde38b)
  - mint (selector 0x40c10f19)
  - multicall (selector 0xac9650d8)
- Retorna score 0-100 com findings detalhados

#### Calldata Analyzer
- `analyzeCalldata(calldata)` — detecta seletores perigosos antes de assinar
- Identifica: approve, setApprovalForAll, Permit2, transferOwnership, delegatecall, upgradeTo, multicall, selfdestruct
- Detecta aprovação infinita (max uint256 nos últimos 32 bytes)

#### DApp Shield
- `runDappShield(url, blockedSites)` — verificação completa antes de conectar
- Verificações:
  1. **Blocklist global** — checa contra blocklist interna
  2. **Typosquatting** — detecta imitações de marcas (metarnask, uniswap, opensea, etc.)
  3. **SSL** — verifica HTTPS
  4. **WHOIS real** — consulta idade do domínio via RDAP (proxy Next.js)
     - < 30 dias: altíssimo risco (-50 pontos)
     - < 180 dias: risco moderado (-20 pontos)
  5. **Reputação** — checa contra lista de DApps verificados
  6. **Subdomínios** — detecta padrões suspeitos
  7. **TLD suspeito** — .xyz, .top, .click, etc.
- Retorna rating: verified / unknown / suspicious / malicious
- Recomendação: allow / limit / block

#### WHOIS Proxy (`/api/whois`)
- Rota Next.js que consulta RDAP via rdap.org
- Extrai root domain de subdomínios (app.uniswap.org → uniswap.org)
- Retorna: ageDays, registeredAt, status
- Cache de 1 hora

#### Secure Transaction Mode (state diff simulation)
- `simulateTxDiff(params)` — preview do estado antes/depois
- Mostra: balanceBefore, balanceAfter, tokensSent, tokensReceived, nftsInvolved, permissionsCreated, permissionsRemoved
- Bloqueia transações com selfdestruct
- Em produção: integrar com Tenderly Simulation API para state diff real

### Sovereignty Center (`src/components/wallet/sovereignty/sovereignty-view.tsx`)
- 4 tabs: ERC-20 / NFTs / Sessions / Histórico
- Cards com cada aprovação ativa
- Botão "Revogar" em cada item
- Stats: total de approvals, NFT approvals, sessions, eventos no log
- Undo Center (PRO): sugestões automáticas de ações corretivas

### Permission Manager (`permissions-view.tsx`)
- Foco em revogação rápida
- Botão "Revogar tudo" (PRO)
- Warning para aprovações infinitas
- Lista ERC-20 + NFT em cards compactos

### Lockdown View (`lockdown-view.tsx`)
- Botão circular vermelho de emergência
- Dialog de confirmação
- Execução animada (800ms-2s)
- Resultado detalhado: duração, total revogado, ações executadas
- Botão "Desativar Lockdown" para voltar ao normal
- Tela de upgrade PRO se não for PRO

### History View (`history-view.tsx`)
- Linha do tempo unificada: permissões + eventos de segurança + transações
- Agrupado por dia
- Badges por tipo e severidade
- Ícones coloridos por categoria

### Settings (atualizado)
- Toggle PRO / Free (demo)
- Modo Paranoico (PRO) — toda assinatura exige simulação + biometria + confirmação dupla
- Device warnings (detecção de DevTools, headless browser, etc.)
- Blocklist manual
- Backup & recovery (incluindo Shamir Backup PRO)

### Sidebar (expandida)
- 12 seções: Portfolio, Receber, Enviar, Cofre, DApps, Scanner, Permission Manager, Sovereignty Center, Lockdown, Central de Risco, Histórico, Ajustes
- Badge com contagem de permissões abertas
- Indicador de LOCKDOWN ATIVO
- Indicador de Modo Paranoico
- Badge PRO
- Device warnings

### Header (atualizado)
- Badge REAL (BIP-44)
- Badge PRO (se ativo)
- Badge Paranoid (se ativo)
- Indicador LOCKDOWN no score
- Botão de refresh de saldos via RPC

## Tiers

### Tank Wallet Free
- Multi-chain automática (10 redes)
- Todos os padrões de token
- Scanner básico de contratos
- Scanner básico de DApps
- Detector de phishing
- Bloqueio de tokens scam
- Simulação básica
- Central de Risco
- Revogação de permissões (individual)
- Security Score
- Vault básico
- Taxa de swap: 0,20%

### Tank Wallet PRO (US$ 19,99/mês ou US$ 203,90/ano)
- Tudo do Free +
- Lockdown (botão de emergência)
- Modo Paranoico
- Revogação em massa
- Shamir Backup
- Monitoramento contínuo (alertas com carteira fechada)
- Undo Center (auto-revoke sugestões)
- Smart Simulation completa (em produção: Tenderly)
- AI Risk Engine
- Auto-Revoke
- Cold Shield (políticas de assinatura)
- Taxa de swap: 0% (Tank)

## Verificação end-to-end (Phase 2)

Testado com Agent Browser:

1. **Carteira criada** com mnemonic BIP-39 real → endereço `0x1777f...22b6d`
2. **Sidebar mostra "3 permissões abertas"** — badge dinâmico
3. **Sovereignty Center**:
   - 3 Sessions ativas (Uniswap, OpenSea, Aave)
   - OpenSea com setApprovalForAll em BAYC
   - 5 eventos no histórico
4. **Lockdown** (após ativar PRO):
   - Botão circular vermelho clicado
   - Dialog de confirmação
   - Execução: 3 permissões revogadas, 3 sessões encerradas, Permit2 cancelado, WC desconectado, modo somente leitura ativado
   - Sidebar mostra "LOCKDOWN ATIVO"
   - Header score muda para "ATIVO" em vermelho
5. **Scanner de Contratos** (USDT real):
   - Bytecode de 22.152 bytes lido via RPC público
   - Score: 10/100 (Crítico)
   - Detectou: delegatecall presente, selfdestruct presente, transferOwnership presente
6. **DApp Shield** (app.uniswap.org):
   - WHOIS real: "Domínio registrado há 2786 dias" (desde 2018-11-26)
   - Score: 100/100 (Verificado)
   - Recomendação: Conexão Permitida
7. **DApp Shield** (metarnask-login.com):
   - Score: 0/100 (Malicioso)
   - Recomendação: Conexão Bloqueada
8. **Histórico**:
   - Linha do tempo unificada com permissões + segurança + transações
   - Agrupado por dia com badges por tipo

## Roadmap futuro

### Phase 3: Broadcast + Indexer
- `eth_sendRawTransaction` para broadcast real
- Alchemy/Infura SDK para rate limits altos
- Indexer para descoberta automática de ERC-20/721/1155 via Transfer logs
- Helius para Solana, Blockstream/Mempool.space para BTC

### Phase 4: Signing completo
- Bitcoin PSBT (BIP-174) com Taproot + SegWit
- Solana Versioned Transactions via `@solana/web3.js`
- EIP-712 demonstração na UI
- EIP-6963 para descoberta de wallets injetadas

### Phase 5: Security engine avançada
- Bytecode analysis próprio (sem depender só de GoPlus)
- Tenderly Simulation API para state diff real
- Blowfish API como segunda fonte
- ERC-4337 Account Abstraction
- Permit2 detection completa

### Phase 6: Vault evolution
- Multisig (Gnosis Safe compatible)
- Timelock configurável
- Spending limits diários/semanais
- BIP-39 passphrase (25ª palavra)
- Social recovery

### Phase 7: DApp browser real
- WalletConnect v2 SDK
- EIP-6963 announceProvider
- Injected provider (window.ethereum)
- iframe sandbox com CSP estrita
- Per-DApp permission scoping

### Phase 8: Backend services
- Risk Service (agrega GoPlus + Blowfish + Tenderly + ChainPatrol + ScamSniffer + HashDit + PhishFort)
- Pricing Service (CoinGecko / DeFi Llama)
- NFT Metadata service
- Portfolio aggregator
- Token Registry
- Push notifications
- Sync entre dispositivos

### Phase 9: Lightning + Bitcoin
- LND node próprio (ou LNbits)
- Lightning invoices (BOLT-11)
- BTC PSBT com hardware wallet co-signer
- Submarine swaps (on-chain ↔ Lightning)

### Phase 10: Universal Asset Engine
- ERC20, ERC721, ERC1155
- SPL
- BRC20, Runes, Ordinals, ARC20
- Jettons (TON)
- CW20 (Cosmos)
- Descoberta automática via indexers

## Estrutura de arquivos (Phase 2)

```
src/
  lib/
    wallet-core/          # BIP-39/32/44, SLIP-0010, AES-GCM storage
    wallet-evm/           # RPC + EIP-1559 signer
    wallet-security-real/ # GoPlus API
    wallet-sovereignty/   # ERC-20/NFT approvals, sessions, lockdown
    wallet-scanner/       # Contract scanner, DApp Shield, calldata analyzer
    wallet/               # Tipos, dados mock, heurísticas locais
  app/
    api/
      goplus/token/       # Proxy GoPlus token_security
      goplus/address/     # Proxy GoPlus address_security
      whois/              # Proxy RDAP (WHOIS real)
  components/wallet/
    onboarding/           # Create / Import / Unlock
    sovereignty/          # Sovereignty, Permissions, Lockdown, History
    scanner/              # Smart Contract Scanner
    wallet-context.tsx    # Estado global com soberania
    wallet-sidebar.tsx    # 12 seções
    wallet-header.tsx     # Badges PRO/Lockdown/Paranoid
    dashboard-view.tsx
    receive-view.tsx
    send-view.tsx
    vault-view.tsx
    dapps-view.tsx        # DApp Shield com WHOIS
    risk-center-view.tsx
    settings-view.tsx     # Toggles PRO/Paranoid
```

## Bibliotecas usadas

### Crypto
- `@scure/bip39` — mnemonic
- `@scure/bip32` — HD derivation
- `@noble/ed25519` — Solana keypair
- `@noble/curves` — secp256k1
- `@noble/hashes` — sha3/keccak
- `ed25519-hd-key` — SLIP-0010
- `bitcoinjs-lib` — Native SegWit + address derivation

### EVM
- `viem` — RPC, EIP-1559 signing, EIP-712, readContract, keccak256

### RPCs públicos (CORS-enabled)
- publicnode.com (primário)
- 1rpc.io (failover)
- llamarpc.com (failover)

### Security APIs
- GoPlus Security API (via proxy Next.js)
- RDAP / rdap.org (via proxy Next.js)

## Diferencial competitivo

A Tank Wallet assume que **tudo é suspeito até ser comprovado seguro**:

1. **Receive**: todo token recebido passa por GoPlus + heurísticas locais
2. **Send**: verificação de endereço via GoPlus + simulação eth_call + assinatura EIP-1559
3. **DApp connection**: 7 verificações (blocklist, typosquatting, SSL, WHOIS real, reputação, subdomínios, TLD)
4. **Contract interaction**: scanner de bytecode detecta delegatecall, selfdestruct, proxy, mint, etc.
5. **Calldata**: analyzer detecta approve infinito, setApprovalForAll, Permit2 antes de assinar
6. **Permissions**: leitura real de allowances ERC-20 + NFT approvals on-chain
7. **Lockdown**: botão de emergência revoga tudo em um toque
8. **History**: nada desaparece — toda ação é logada

Essa abordagem transforma a segurança no núcleo do produto, não em um recurso adicional.

# Phase 3 — Brand Identity & UX Overhaul (entregue)

## Filosofia atualizada

> **A hot wallet built to never sign a dangerous transaction.**

Posicionamento: **proteção ativa**, não gerenciamento de ativos. Toda a interface, terminologia e identidade visual reforçam que a carteira atua continuamente para prevenir riscos.

## Identidade visual

### Logo
- **TANK** → `font-black uppercase tracking-tight` (weight 900)
- **Wallet** → `font-medium text-muted-foreground` (weight 500)
- Nunca invertido — fortalece a marca

### Tagline
- `ZERO TRUST SECURITY` — em caixa alta com tracking amplo, abaixo do logo
- Subtítulo: "The hot wallet built to never sign a dangerous transaction."

### Paleta padronizada (aprendizado intuitivo)
- **Verde**: Seguro / Verificado / Protegido
- **Amarelo**: Atenção / Risco moderado
- **Vermelho**: Crítico / Bloqueado / Lockdown
- **Azul**: Informação / Rede / Navegação

## Mudanças de status

| Área | Phase 2 | Phase 3 |
| --- | --- | --- |
| UX | 10/10 | 10/10 |
| Brand identity | 4/10 → | **9/10** |
| Soberania do usuário | 8/10 | 8/10 |
| Proteção ativa | 5/10 → | **8/10** |

## Componentes novos

### Header (reescrito)
- Logo TANK Wallet compacto à esquerda
- Badge REAL (BIP-44) + endereço
- Indicador de redes (7 EVM + 3) com ícone Wifi azul
- Botão refresh de saldos
- **Wallet Status pill**: Standby (amarelo) / Protected (verde) / Lockdown (vermelho pulsante)
- Botão Safe Session
- Mini score (muda para "ATIVO" em vermelho durante Lockdown)
- Badges PRO e Paranoid (quando ativos)
- Botão Lock

### Sidebar (agrupada por categorias)
4 grupos:
1. **HOME**: Dashboard, Assets (soon), NFTs (soon), Activity
2. **OPERATIONS**: Send, Receive, Swap (soon), Bridge (soon), Staking (soon)
3. **SECURITY**: Vault, Wallet Health, Risk Center, Permission Manager, Sovereignty Center, Contract Scanner, DApp Shield, Security Timeline, AI Security Assistant (PRO), Lockdown (PRO)
4. **SETTINGS**: Notifications, Settings

Badges "SOON" nos módulos em desenvolvimento. Badge dinâmico de permissões abertas no Permission Manager. Indicadores de Lockdown/Paranoid/PRO no painel de score.

### Footer (reescrito)
- **Left**: TANK Wallet · v1.0.0-beta · Security Engine 2.0
- **Right (Free)**: Copyright © 2026 END ART
- **Right (PRO)**: PRO ACTIVE · Threat Intel Online · Last sync: 12s ago

### Lock Screen (reescrito)
Estilo software de segurança:
- Logo TANK Wallet + ZERO TRUST SECURITY
- **Wallet Status panel**:
  - ✓ Device Secure
  - ✓ No Malware Detected
  - ✓ Threat Intelligence Updated
  - Last protection scan: 18 seconds ago
- Input de senha + botão "Unlock Wallet"

### Dashboard (reescrito)
Painel de controle estilo antivírus:
- **Wallet Health hero**: score 91/100 + estrelas + status Protected/Attention/Critical
- Total Balance + variação 24h
- Quick actions: Receive / Send / Vault / Scan
- **Quick stats grid**:
  - Risk Score
  - Threats Blocked
  - Permissions (com badge)
  - Connected DApps
- Connected Networks com saldo real via RPC
- Assets list
- Recent Activity
- Security Alerts preview

### Wallet Health (novo)
Painel estilo antivírus:
- **Saúde Geral**: score % + status + stars + badges
- Contadores: OK / Warnings / Critical
- Last protection scan: 18 seconds ago
- Cards detalhados:
  - Backups (OK)
  - Seed (OK)
  - Biometria (OK)
  - Permissões (críticas/warning/ok)
  - Dispositivo (warnings)
  - Atualizações (OK)
  - Vault (sealed/unsealed)
  - Sessão (active/idle)
- Ação recomendada quando há critical

### Security Timeline (novo)
Linha do tempo visual com timestamps:
- Eventos agrupados por dia (sticky headers)
- Cada evento: timestamp + ícone colorido + título + descrição + tags
- **Conectados por setas ↓** mostrando fluxo de ações
- Stats: Events / Permissions / Blocked / Sessions

### AI Security Assistant (novo, PRO)
Explica riscos em linguagem natural:
- 5 cenários pré-definidos (approve infinito, setApprovalForAll, honeypot, phishing, swap legítimo)
- Cada cenário: explicação detalhada + recomendação
- Campo "Pergunte ao assistente" com resposta simulada
- Reduz erros de usuários menos experientes

### Lockdown (reescrito com 4 níveis)
- **L1 Block Signatures** (5-10s): bloqueia assinaturas EVM/EIP-712/EIP-191 + modo leitura
- **L2 Disconnect DApps** (15-30s): L1 + encerra sessões + desconecta WalletConnect
- **L3 Revoke All Approvals** (30-90s): L2 + revoga ERC-20 + NFT + Permit2
- **L4 Migrate to New Wallet** (10-30min): L3 + gera nova carteira + migra ativos + desativa antiga
- Cards selecionáveis com descrição e lista de ações
- Botão circular vermelho de emergência
- Dialog de confirmação com warning específico por nível

### Permission Manager (reescrito com filtros)
Filtros:
- Todas / Maior risco / Sem uso 180d / Approve infinito / Permit2 / NFTs / Delegações / Bridge / DEX / Gaming / Marketplace
- Cada filtro mostra contagem
- Warning para approves infinitos
- Botão "Revogar tudo" (PRO)
- Categorização automática de spenders por tipo (DEX, Bridge, Marketplace, etc.)

### DApp Shield (3 estados)
Mudou de 4 estados (verified/unknown/suspicious/malicious) para 3:
- **Verificado** (verde) — Conexão permitida
- **Desconhecido** (azul) — Conexão limitada (sem info ≠ perigoso)
- **Malicioso** (vermelho) — Conexão bloqueada

Thresholds ajustados: ≥85 = verificado, ≥35 = desconhecido, <35 = malicioso

## Roadmap atualizado (conforme sugestão do usuário)

Phase 4: **Universal Asset Engine** — descoberta automática de ERC-20/721/1155/SPL/BRC-20/Runes/Ordinals/ARC20/Jettons/CW20
Phase 5: **Broadcast Engine** — eth_sendRawTransaction + Alchemy/Infura SDK
Phase 6: **Bitcoin + Lightning** — PSBT (BIP-174) + Taproot + SegWit + BOLT-11 + LND
Phase 7: **Solana** — Versioned Transactions via @solana/web3.js
Phase 8: **Account Abstraction (ERC-4337)** — smart contract wallet
Phase 9: **WalletConnect v2** — EIP-6963 + injected provider + sandbox
Phase 10: **Threat Intelligence Backend** — ChainPatrol + ScamSniffer + HashDit + PhishFort + IA própria
Phase 11: **MPC e Passkeys** — substituir seed por Multi-Party Computation
Phase 12: **Sistema de recuperação social** — k-of-n friends/family
Phase 13: **IA de detecção comportamental** — perfil de uso (horários, redes, valores, dispositivos) + ativação automática de Modo Paranoico/Lockdown quando transação foge do padrão

## Verificação end-to-end (Phase 3)

1. **Onboarding**: TANK Wallet + ZERO TRUST SECURITY + tagline + footer Copyright © 2026 END ART
2. **Lock screen**: Wallet Status panel com ✓ Device Secure / ✓ No Malware / ✓ Threat Intel Updated / Last scan 18s
3. **Dashboard**: Wallet Health 91/100 PROTECTED + quick stats (Risk Score 91, Threats Blocked 7, Permissions 3, Connected DApps 3)
4. **Sidebar agrupada**: HOME / OPERATIONS / SECURITY / SETTINGS com badges SOON
5. **Wallet Health**: 6 OK / 2 Warnings / 0 Critical + cards detalhados
6. **Security Timeline**: 15 events com timestamps e setas conectando ações
7. **AI Security Assistant** (PRO): 5 cenários com explicações em linguagem natural
8. **Lockdown 4 níveis**: L1/L2/L3/L4 selecionáveis com estimativas de tempo
9. **Permission Manager**: 11 filtros com contagens dinâmicas
10. **DApp Shield**: 3 estados (Verificado/Desconhecido/Malicioso)
11. **Footer PRO**: PRO ACTIVE + Threat Intel Online + Last sync 12s ago
