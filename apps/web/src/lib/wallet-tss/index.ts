// ============ Tank Security Standard (TSS) ============
//
// Especificação técnica oficial da Tank Wallet.
// Toda funcionalidade deve atender aos requisitos abaixo.
//
// REGRA: nenhum novo recurso entra na Tank Wallet sem passar pelo Security Kernel
// e sem atender ao TSS.

export interface TssSpec {
  id: string
  title: string
  principle: string
  description: string
  requirements: string[]
  appliesTo: string[]
  status: 'enforced' | 'partial' | 'planned'
}

export const TSS_SPECIFICATIONS: TssSpec[] = [
  {
    id: 'TSS-001',
    title: 'Zero Trust',
    principle: 'Nada é considerado confiável por padrão.',
    description: 'Todo token, contrato, DApp, RPC, bridge, plugin e atualização passa por verificação antes de ser confiável.',
    requirements: [
      'Threat Intelligence database consulta antes de qualquer interação',
      'Contratos não verificados são tratados como suspeitos',
      'RPCs consultados em quorum (mín. 2) para leituras críticas',
      'DApps verificados contra blocklist + WHOIS + typosquatting',
      'Bridges verificadas contra lista de exploits',
      'Plugins executados em sandbox isolado',
      'Atualizações verificadas por assinatura Ed25519',
    ],
    appliesTo: ['tokens', 'contratos', 'DApps', 'RPCs', 'bridges', 'plugins', 'atualizações'],
    status: 'enforced',
  },
  {
    id: 'TSS-002',
    title: 'Explainability',
    principle: 'Nenhuma assinatura pode exibir apenas dados técnicos.',
    description: 'Sempre mostrar o que acontecerá, quais ativos serão afetados, quais permissões serão criadas, impacto financeiro e nível de risco.',
    requirements: [
      'Human Explanation gerada pelo Simulation Engine',
      'Asset Diff (saldo antes/depois)',
      'Permission Diff (permissões criadas/removidas)',
      'Gas Diff (custo estimado)',
      'Risk Score visível antes da assinatura',
      'AI Security Assistant disponível para explicar riscos',
    ],
    appliesTo: ['transações', 'assinaturas', 'approvals', 'Permit2', 'EIP-712'],
    status: 'enforced',
  },
  {
    id: 'TSS-003',
    title: 'Mandatory Simulation',
    principle: 'Nenhuma transação segue para broadcast sem simulação.',
    description: 'Toda transação é simulada via eth_call + trace_call antes da assinatura. State diff, asset diff, approval diff, NFT diff, gas diff e eventos emitidos são obrigatórios.',
    requirements: [
      'Simulation Engine executado antes de cada assinatura',
      'eth_call com failover (RPC pool)',
      'State diff completo',
      'Bloqueio automático se simulação falhar criticamente',
      'Bloqueio se selfdestruct detectado',
    ],
    appliesTo: ['transações', 'broadcast'],
    status: 'enforced',
  },
  {
    id: 'TSS-004',
    title: 'Multi-source Consensus',
    principle: 'Nenhuma informação crítica depende de uma única fonte.',
    description: 'Sempre consultar múltiplas fontes quando possível: RPC, preço, reputação, risco, auditoria.',
    requirements: [
      'RPC quorum para leituras críticas (mín. 2 RPCs consultados)',
      'Threat Intelligence agrega GoPlus + ChainPatrol + ScamSniffer + HashDit + PhishFort + interno',
      'Preços consultados em múltiplas fontes (CoinGecko + DeFi Llama)',
      'Reputação de DApps verificada em múltiplas listas',
    ],
    appliesTo: ['RPC', 'preço', 'reputação', 'risco', 'auditoria'],
    status: 'partial', // GoPlus + interno ativos, demais planejados
  },
  {
    id: 'TSS-005',
    title: 'Cryptographic Hygiene',
    principle: 'Criptografia deve seguir padrões rigorosos.',
    description: 'Zeroização de memória, RNG criptograficamente seguro, derivação padronizada, chaves efêmeras quando aplicável, criptografia autenticada.',
    requirements: [
      'SecureBuffer com zeroização após uso',
      'crypto.getRandomValues (CSPRNG) para toda entropia',
      'BIP-39/32/44/84/86 + SLIP-0010 para derivação',
      'AES-256-GCM (AEAD) para criptografia em repouso',
      'HMAC-SHA256 para auditoria',
      'Self-test criptográfico na inicialização',
    ],
    appliesTo: ['chaves', 'seeds', 'storage', 'auditoria', 'assinaturas'],
    status: 'enforced',
  },
  {
    id: 'TSS-006',
    title: 'Least Privilege',
    principle: 'A carteira nunca solicita permissões maiores que o necessário.',
    description: 'Approve infinito é bloqueado por padrão para contratos desconhecidos. Approve infinito requer biometria + confirmação dupla + explicação de risco.',
    requirements: [
      'Approve infinito bloqueado para contratos não verificados',
      'Approve infinito exige biometria + double confirmation',
      'Policy Engine regra "No infinite approve to unknown"',
      'Recomendação de approve apenas do valor necessário',
      'Permit2 tratado como risco alto',
    ],
    appliesTo: ['approvals', 'Permit2', 'setApprovalForAll', 'session keys'],
    status: 'enforced',
  },
  {
    id: 'TSS-007',
    title: 'Revocability',
    principle: 'Toda permissão revogável deve aparecer no Permission Engine.',
    description: 'O usuário pode visualizar e revogar todas as permissões em um único painel.',
    requirements: [
      'Permission Engine universal (ERC-20/721/1155/Permit2/ERC-4337/Solana/SPL/BTC/Lightning)',
      'Revogação com um clique',
      'Lockdown revoga todas as permissões',
      'Permissões não-revogáveis (Permit, PSBT) explicadas claramente',
    ],
    appliesTo: ['ERC-20', 'ERC-721', 'ERC-1155', 'Permit2', 'ERC-4337', 'SPL', 'Lightning'],
    status: 'enforced',
  },
  {
    id: 'TSS-008',
    title: 'Continuous Monitoring',
    principle: 'A carteira continua protegendo mesmo sem uso.',
    description: 'Monitora contratos comprometidos, novos exploits, permissões perigosas, bridges hackeadas — mesmo com a carteira fechada.',
    requirements: [
      'Behavior Engine aprende padrões continuamente',
      'Threat Intelligence workers atualizam database',
      'Notification Engine alerta sobre novos riscos',
      'Monitoramento de aprovações expirando (Permit2)',
      'Alertas de tokens que viraram scam',
    ],
    appliesTo: ['contratos', 'exploits', 'permissões', 'bridges', 'tokens'],
    status: 'partial', // behavior + threat intel + notification ativos, workers 24/7 planejados
  },
  {
    id: 'TSS-009',
    title: 'Immutable Audit',
    principle: 'Toda ação crítica produz um registro auditável.',
    description: 'Logs HMAC-signed, append-only, tamper-evident. Exportáveis e verificáveis.',
    requirements: [
      'Audit Engine com 28 action types',
      'HMAC-SHA256 por entry',
      'Chain de assinaturas (tamper-evident)',
      'verifyAuditLog() para checar integridade',
      'exportAuditLog() para download',
      'Nunca conter seeds, keys, ou mnemonics',
    ],
    appliesTo: ['unlock', 'approve', 'swap', 'bridge', 'lockdown', 'recovery', 'export'],
    status: 'enforced',
  },
  {
    id: 'TSS-010',
    title: 'Human First',
    principle: 'A IA recomenda. O usuário decide. Nunca ocultar decisões automáticas.',
    description: 'Nenhuma ação automática é tomada sem explicação. O usuário sempre tem a decisão final (exceto bloqueios de segurança críticos).',
    requirements: [
      'AI Security Assistant explica riscos em linguagem natural',
      'Security Decision Engine mostra score + reasons',
      'Bloqueios automáticos explicados (blockReason)',
      'Modo Paranoico exige confirmação explícita para tudo',
      'Usuário pode override de WARN (não de BLOCK)',
    ],
    appliesTo: ['decisões automáticas', 'IA', 'bloqueios', 'warnings'],
    status: 'enforced',
  },
]

// ============ Compliance check ============

export interface TssComplianceResult {
  total: number
  enforced: number
  partial: number
  planned: number
  percentage: number
  details: Array<{ spec: TssSpec; compliant: boolean }>
}

export function checkTssCompliance(): TssComplianceResult {
  const details = TSS_SPECIFICATIONS.map(spec => ({
    spec,
    compliant: spec.status === 'enforced',
  }))
  const enforced = TSS_SPECIFICATIONS.filter(s => s.status === 'enforced').length
  const partial = TSS_SPECIFICATIONS.filter(s => s.status === 'partial').length
  const planned = TSS_SPECIFICATIONS.filter(s => s.status === 'planned').length
  return {
    total: TSS_SPECIFICATIONS.length,
    enforced,
    partial,
    planned,
    percentage: Math.round((enforced / TSS_SPECIFICATIONS.length) * 100),
    details,
  }
}
