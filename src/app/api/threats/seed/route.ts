import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Seed data — known malicious tokens, sites, addresses, and exploits
// In production this would be synced from ChainPatrol, ScamSniffer, GoPlus, HashDit, PhishFort
const SEED_TOKENS = [
  // Ethereum
  { chain: 'ethereum', address: '0x8a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d', symbol: 'SAFEMOON2', name: 'SafeMoon 2.0', reason: 'Taxa de 99% ao vender — padrão de rug pull', category: 'rugpull', source: 'community', severity: 90 },
  { chain: 'ethereum', address: '0x2b3c4d5e6f7081920a3b4c5d6e7f8091a2b3c4d5', symbol: 'ELONMARS', name: 'ElonMars Inu', reason: 'Mint authority não revogada — supply infinito', category: 'hidden_mint', source: 'auto', severity: 85 },
  { chain: 'ethereum', address: '0x5e6f7081920a3b4c5d6e7f8091a2b3c4d5e6f708', symbol: 'AIRDROP-X', name: 'Free Airdrop X', reason: 'Phishing via assinatura — drainer de permissões', category: 'phishing', source: 'community', severity: 95 },
  // BSC
  { chain: 'bsc', address: '0x4f2a9c2b3e1d4a5f6b7c8d9e0f1a2b3c4d5e6f70', symbol: 'USDC-FAKE', name: 'USD Coin Fake', reason: 'Honeypot — função de transferência bloqueia saída', category: 'honeypot', source: 'auto', severity: 100 },
  { chain: 'bsc', address: '0x192a3b4c5d6e7f8091a2b3c4d5e6f7081920a3b4', symbol: 'BSC-RUG', name: 'BSC Rugged Token', reason: 'Liquidez removida pelo deployer', category: 'rugpull', source: 'auto', severity: 95 },
  { chain: 'bsc', address: '0x6f7081920a3b4c5d6e7f8091a2b3c4d5e6f7081', symbol: 'BNB-SCAM', name: 'BNB Scam Token', reason: 'Wash trading detectado — volume artificial', category: 'wash_trading', source: 'auto', severity: 80 },
  // Polygon
  { chain: 'polygon', address: '0x3c4d5e6f7081920a3b4c5d6e7f8091a2b3c4d5e', symbol: 'POLY-DRAIN', name: 'Poly Drainer', reason: 'Contrato drainer — rouba tokens via approve', category: 'phishing', source: 'community', severity: 100 },
  // Arbitrum
  { chain: 'arbitrum', address: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', symbol: 'ARB-FAKE', name: 'Arbitrum Fake Airdrop', reason: 'Airdrop falso — captura assinaturas EIP-712', category: 'phishing', source: 'community', severity: 90 },
]

const SEED_SITES = [
  { url: 'metarnask-login.com', reason: 'Phishing de MetaMask — captura seed phrase', category: 'phishing', source: 'community', severity: 100 },
  { url: 'uniswap-airdrop.pro', reason: 'Drainer de tokens — imita Uniswap', category: 'drainer', source: 'community', severity: 100 },
  { url: 'opensea-mint-free.io', reason: 'Falso mint NFT — roubo de carteira', category: 'fake_dapp', source: 'community', severity: 100 },
  { url: 'wallet-connect-restore.app', reason: 'Malware — falso WalletConnect', category: 'malware', source: 'community', severity: 100 },
  { url: 'aave-v3-bonus.com', reason: 'Phishing de Aave — captura assinatura', category: 'phishing', source: 'community', severity: 95 },
  { url: 'metamask-web.com', reason: 'Phishing de MetaMask — imitação do site oficial', category: 'phishing', source: 'chainpatrol', severity: 100 },
  { url: 'coinbase-secure-login.net', reason: 'Phishing de Coinbase — captura credenciais', category: 'phishing', source: 'community', severity: 100 },
  { url: 'ledger-recovery-phrase.com', reason: 'Phishing de Ledger — captura seed phrase', category: 'phishing', source: 'community', severity: 100 },
  { url: 'sushi-swap-bonus.io', reason: 'Drainer — imita SushiSwap', category: 'drainer', source: 'community', severity: 95 },
  { url: 'binance-airdrop-free.com', reason: 'Airdrop falso — captura assinaturas', category: 'fake_airdrop', source: 'community', severity: 95 },
]

const SEED_ADDRESSES = [
  // Known drainers
  { chain: 'ethereum', address: '0x000000006f9320e7a7a7a7a7a7a7a7a7a7a7a7a7', reason: 'Drainer address — conocido por robar tokens via setApprovalForAll', category: 'drainer', source: 'community', severity: 100, reportCount: 247 },
  { chain: 'ethereum', address: '0x00000000dead000000000000000000000000dead', reason: 'Address sancionado pelo OFAC', category: 'sanctioned', source: 'ofac', severity: 100, reportCount: 50 },
  { chain: 'ethereum', address: '0x00000000fade000000000000000000000000fade', reason: 'Mixer Tornado Cash relay', category: 'mixer', source: 'community', severity: 80, reportCount: 89 },
  { chain: 'ethereum', address: '0x00000000bad000000000000000000000000bad0', reason: 'Hacker — exploração de bridge Wormhole', category: 'hacker', source: 'community', severity: 100, reportCount: 156 },
  { chain: 'bsc', address: '0x00000000bad000000000000000000000000bad1', reason: 'Hacker — exploit de PancakeSwap', category: 'hacker', source: 'community', severity: 100, reportCount: 78 },
  { chain: 'ethereum', address: '0x00000000blk000000000000000000000000blk0', reason: 'Blackmail — exige pagamento para não vazar dados', category: 'blackmail', source: 'community', severity: 70, reportCount: 34 },
]

const SEED_EXPLOITS = [
  {
    protocolName: 'Wormhole Bridge',
    affectedAddresses: '["0xae28bf35a06d3b2524f2c0c45e7b2d193c5c0c0a"]',
    description: 'Attacker forged messages to mint 120k wETH on Solana, bridged back to Ethereum. $326M lost.',
    category: 'bridge',
    lossUsd: 326000000,
    exploitedAt: '2022-02-02T06:13:00Z',
    active: false,
  },
  {
    protocolName: 'Ronin Bridge',
    affectedAddresses: '["0x098b716b8aaf21512996dc57eb0615e2383e2f96"]',
    description: 'Attacker compromised 5 of 9 validator keys. $625M lost in ETH and USDC.',
    category: 'bridge',
    lossUsd: 625000000,
    exploitedAt: '2022-03-23T00:00:00Z',
    active: false,
  },
  {
    protocolName: 'Curve Finance',
    affectedAddresses: '["0x448b8e3f6f0a1e7a9b8c2d3e4f5a6b7c8d9e0f1a"]',
    description: 'Reentrancy vulnerability in Curve\'s Vyper compiler. $70M lost across multiple pools.',
    category: 'dex',
    lossUsd: 70000000,
    exploitedAt: '2023-07-30T00:00:00Z',
    active: false,
  },
  {
    protocolName: 'Euler Finance',
    affectedAddresses: '["0x5fa25b9c92ebe7a0d85c5d3a9b5f5b5b5b5b5b5b"]',
    description: 'Flash loan attack exploiting donation function. $197M lost, later returned by attacker.',
    category: 'lending',
    lossUsd: 197000000,
    exploitedAt: '2023-03-13T00:00:00Z',
    active: false,
  },
  {
    protocolName: 'Mixin Network',
    affectedAddresses: '["0xa0b0c0d0e0f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4"]',
    description: 'Database compromised via compromised cloud provider. $200M lost.',
    category: 'bridge',
    lossUsd: 200000000,
    exploitedAt: '2023-09-23T00:00:00Z',
    active: false,
  },
]

export async function POST() {
  try {
    let tokensAdded = 0
    let sitesAdded = 0
    let addressesAdded = 0
    let exploitsAdded = 0

    // Seed tokens
    for (const t of SEED_TOKENS) {
      await db.threatToken.upsert({
        where: { chain_address: { chain: t.chain, address: t.address } },
        create: t,
        update: { lastConfirmedAt: new Date() },
      })
      tokensAdded++
    }

    // Seed sites
    for (const s of SEED_SITES) {
      await db.threatSite.upsert({
        where: { url: s.url },
        create: s,
        update: { lastConfirmedAt: new Date() },
      })
      sitesAdded++
    }

    // Seed addresses
    for (const a of SEED_ADDRESSES) {
      await db.threatAddress.upsert({
        where: { chain_address: { chain: a.chain, address: a.address } },
        create: a,
        update: { lastConfirmedAt: new Date() },
      })
      addressesAdded++
    }

    // Seed exploits
    for (const e of SEED_EXPLOITS) {
      const existing = await db.threatExploit.findFirst({
        where: { protocolName: e.protocolName },
      })
      if (!existing) {
        await db.threatExploit.create({
          data: {
            ...e,
            exploitedAt: new Date(e.exploitedAt),
          },
        })
        exploitsAdded++
      }
    }

    return NextResponse.json({
      success: true,
      seeded: { tokens: tokensAdded, sites: sitesAdded, addresses: addressesAdded, exploits: exploitsAdded },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [tokens, sites, addresses, exploits] = await Promise.all([
      db.threatToken.count({ where: { active: true } }),
      db.threatSite.count({ where: { active: true } }),
      db.threatAddress.count({ where: { active: true } }),
      db.threatExploit.count(),
    ])
    return NextResponse.json({ tokens, sites, addresses, exploits, total: tokens + sites + addresses + exploits })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
