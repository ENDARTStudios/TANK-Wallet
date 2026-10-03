// ============ Tank Wallet — Final Plan Tiers & Roadmap (v3) ============
//
// Free: Proteção inteligente para uso diário
// PRO: Institutional-grade security. Consumer-grade simplicity.
// Enterprise: Infraestrutura de segurança para empresas e instituições

export type PlanTier = 'free' | 'pro' | 'enterprise-starter' | 'enterprise-business' | 'enterprise-custom'

export interface PlanFeature {
  feature: string
  free: boolean | string
  pro: boolean | string
  entStarter: boolean | string
  entBusiness: boolean | string
  entCustom: boolean | string
}

export const COMPARISON_TABLE: PlanFeature[] = [
  // Core (Free — todos os engines, serviços contínuos limitados)
  { feature: 'Security Kernel', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Security Check', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Threat Intelligence', free: 'Cache periódico', pro: 'Real-time + Premium', entStarter: 'Enterprise', entBusiness: 'Enterprise', entCustom: 'Custom' },
  { feature: 'Simulation Engine', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Contract Scanner', free: true, pro: 'Avançado', entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Wallet Guardian', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Device Trust', free: true, pro: 'Avançado', entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Permission Manager', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'DApp Shield', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Wallet Health', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Policy Engine', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Audit Log', free: 'Local + limitado', pro: 'Local + completo', entStarter: 'Centralizado', entBusiness: 'Centralizado', entCustom: 'Centralizado' },
  { feature: 'Lockdown L1-L2', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Seed BIP-39', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Hardware Wallet Support', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Todas as redes suportadas', free: true, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // Free limits (serviços contínuos)
  { feature: 'Alertas em tempo real', free: 'Limitados', pro: 'Completos', entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Monitoramento (carteira fechada)', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Histórico de auditoria', free: 'Limitado', pro: 'Completo', entStarter: 'Ilimitado', entBusiness: 'Ilimitado', entCustom: 'Ilimitado' },

  // PRO — Continuous Protection
  { feature: 'Lockdown L3-L4', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Modo Fortress', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Behavioral AI', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'AI Security Assistant', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Monitoramento contínuo', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Scanner profundo', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Risk Intelligence avançada', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // PRO — Smart Access
  { feature: 'Passkeys (WebAuthn)', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Biometria (Face ID / Touch ID / Windows Hello)', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Smart Recovery', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Social Recovery', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Emergency Kit', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // PRO — Smart Accounts
  { feature: 'Smart Accounts (ERC-4337)', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Session Keys', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Spending Policies', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Auto Approvals', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Batch Transactions', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // PRO — Privacy
  { feature: 'RPC Quorum', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Anti Fingerprinting', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Private Broadcast', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Private Mempool (quando disponível)', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // PRO — Benefícios
  { feature: 'Zero taxa de swap', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Prioridade nas atualizações', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Suporte prioritário', free: false, pro: true, entStarter: true, entBusiness: true, entCustom: true },

  // Enterprise — Custódia
  { feature: 'MPC (2-de-3 threshold)', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'HSM Cloud', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'HSM Dedicado', free: false, pro: false, entStarter: false, entBusiness: false, entCustom: true },
  { feature: 'Threshold Signatures', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Key Escrow corporativo', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },

  // Enterprise — Governança
  { feature: 'RBAC', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'SSO (SAML/OIDC)', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'SCIM', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Approval Workflow', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },
  { feature: 'Multi-admin', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },
  { feature: 'Time Locks', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },
  { feature: 'Aprovações multinível', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },

  // Enterprise — Compliance
  { feature: 'SIEM Integration', free: false, pro: false, entStarter: 'Básico', entBusiness: 'Avançado', entCustom: 'Custom' },
  { feature: 'Audit API', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'SOC2', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },
  { feature: 'ISO 27001', free: false, pro: false, entStarter: false, entBusiness: false, entCustom: true },
  { feature: 'LGPD / GDPR', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Trilhas imutáveis', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Relatórios de compliance', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },

  // Enterprise — Integração
  { feature: 'REST API', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Webhooks', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'SDK', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'Dashboard corporativo', free: false, pro: false, entStarter: true, entBusiness: true, entCustom: true },
  { feature: 'On-premises', free: false, pro: false, entStarter: false, entBusiness: false, entCustom: true },
  { feature: 'Infraestrutura dedicada', free: false, pro: false, entStarter: false, entBusiness: false, entCustom: true },

  // Enterprise — Suporte
  { feature: 'SLA', free: false, pro: false, entStarter: 'Best effort', entBusiness: '99.9%', entCustom: '24×7' },
  { feature: 'Gerente técnico dedicado', free: false, pro: false, entStarter: false, entBusiness: true, entCustom: true },
  { feature: 'Usuários', free: '1', pro: '1', entStarter: 'Até 10', entBusiness: 'Ilimitado', entCustom: 'Ilimitado' },

  // Swap fee
  { feature: 'Swap Fee', free: '0.20%', pro: '0%', entStarter: '0%', entBusiness: '0%', entCustom: '0%' },

  // Telemetry
  { feature: 'Telemetria', free: 'Opt-in, anonimizada', pro: 'Opt-in, anonimizada', entStarter: 'Configurável', entBusiness: 'Configurável', entCustom: 'Configurável' },
]

// ============ Plan definitions ============

export interface PlanDefinition {
  id: PlanTier
  name: string
  tagline: string
  positioning: string
  price: string
  cta: string
  categories: Array<{ name: string; features: string[] }>
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Tank Wallet Free',
    tagline: 'Proteção inteligente para uso diário.',
    positioning: 'Todos os engines de segurança sem restrição. Serviços contínuos limitados para reduzir custo operacional.',
    price: 'US$ 0',
    cta: 'Get Started',
    categories: [
      {
        name: 'Segurança (sem restrições)',
        features: [
          'Security Kernel',
          'Security Check',
          'Threat Intelligence (cache periódico)',
          'Simulation Engine',
          'Policy Engine',
          'Permission Manager',
          'Wallet Guardian',
          'Device Trust',
          'DApp Shield',
          'Contract Scanner',
          'Wallet Health',
          'Lockdown L1-L2',
          'Hardware Wallet Support',
          'Audit Log (local + limitado)',
          'Todas as redes suportadas',
        ],
      },
      {
        name: 'Limites (serviços contínuos)',
        features: [
          'Threat Intel: cache periódico (menos frequente)',
          'Histórico de auditoria: limitado',
          'Alertas em tempo real: limitados',
          'Sem monitoramento contínuo (carteira fechada)',
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Tank Wallet PRO',
    tagline: 'Institutional-grade security. Consumer-grade simplicity.',
    positioning: 'Vende serviços contínuos, não tecnologia. Redução contínua de risco.',
    price: 'US$ 19,99/mês',
    cta: 'Start Free Trial',
    categories: [
      {
        name: 'Continuous Protection',
        features: [
          'Behavioral AI',
          'Monitoramento contínuo (24/7)',
          'AI Security Assistant',
          'Modo Fortress',
          'Alertas em tempo real',
          'Scanner profundo',
          'Risk Intelligence avançada',
          'Lockdown L1-L4',
        ],
      },
      {
        name: 'Smart Access',
        features: [
          'Passkeys (WebAuthn)',
          'Biometria (Face ID / Touch ID / Windows Hello)',
          'Smart Recovery',
          'Social Recovery',
          'Emergency Kit',
          'Session Keys',
        ],
      },
      {
        name: 'Smart Accounts',
        features: [
          'ERC-4337',
          'Spending Policies',
          'Auto Approvals',
          'Batch Transactions',
        ],
      },
      {
        name: 'Privacy',
        features: [
          'RPC Quorum',
          'Anti Fingerprinting',
          'Private Broadcast',
          'Private Mempool (quando disponível)',
        ],
      },
      {
        name: 'Benefícios',
        features: [
          'Zero taxa de swap',
          'Prioridade nas atualizações',
          'Suporte prioritário',
        ],
      },
    ],
  },
  {
    id: 'enterprise-starter',
    name: 'Enterprise Starter',
    tagline: 'Infraestrutura de segurança para equipes.',
    positioning: 'Para pequenas empresas, DAOs e fundos pequenos.',
    price: 'US$ 499/mês',
    cta: 'Contact Sales',
    categories: [
      {
        name: 'Custódia',
        features: ['MPC 2-de-3', 'HSM Cloud', 'Threshold Signatures'],
      },
      {
        name: 'Governança',
        features: ['RBAC', 'SSO', 'SCIM', 'API', 'Audit Log centralizado', 'Políticas corporativas'],
      },
      {
        name: 'Compliance',
        features: ['SIEM (integração básica)', 'LGPD / GDPR', 'Trilhas imutáveis', 'Audit API'],
      },
      {
        name: 'Integração',
        features: ['REST API', 'Webhooks', 'SDK', 'Dashboard corporativo', 'Até 10 usuários', 'Suporte prioritário'],
      },
    ],
  },
  {
    id: 'enterprise-business',
    name: 'Enterprise Business',
    tagline: 'Plataforma de segurança para exchanges, fintechs e empresas Web3.',
    positioning: 'Para exchanges, fintechs e empresas Web3.',
    price: 'US$ 1.499/mês',
    cta: 'Contact Sales',
    categories: [
      {
        name: 'Tudo do Starter, mais',
        features: [
          'Usuários ilimitados',
          'Múltiplos workspaces',
          'Múltiplos HSMs',
          'Alta disponibilidade',
          'SIEM avançado',
          'Integração com SOC',
          'Aprovações multinível',
          'Time Locks',
          'Key Escrow corporativo',
          'Multi-admin',
          'Approval Workflow',
          'Relatórios de compliance',
          'SOC2',
          'SLA 99,9%',
          'Gerente técnico dedicado',
        ],
      },
    ],
  },
  {
    id: 'enterprise-custom',
    name: 'Enterprise Custom',
    tagline: 'Infraestrutura dedicada para bancos, custodiantes e instituições.',
    positioning: 'Para bancos, custodiantes, gestoras, exchanges e instituições governamentais.',
    price: 'Sob consulta',
    cta: 'Contact Sales',
    categories: [
      {
        name: 'Tudo do Business, mais',
        features: [
          'HSM dedicado',
          'Infraestrutura dedicada',
          'On-premises',
          'ISO 27001',
          'Auditorias personalizadas',
          'Desenvolvimento sob demanda',
          'SLA 24×7',
        ],
      },
    ],
  },
]

// ============ Positioning ============

export const TAGLINES = {
  free: 'Proteção inteligente para uso diário.',
  pro: 'Institutional-grade security. Consumer-grade simplicity.',
  enterprise: 'Infraestrutura de segurança para empresas e instituições.',
  alternative_pro: 'Think before you sign. Automatically.',
  manifesto: 'Tank Wallet é uma plataforma de segurança para ativos digitais. Em vez de apenas armazenar chaves e assinar transações, ela analisa continuamente ameaças, simula operações, aplica políticas de segurança e toma decisões baseadas em evidências antes de autorizar qualquer ação, preservando a autocustódia do usuário.',
}

export const COMPETITIVE_POSITIONING = {
  metaMask: 'conecta carteiras.',
  rabby: 'mostra riscos.',
  phantom: 'foca em Solana.',
  ledger: 'protege chaves.',
  tank: 'toma decisões de segurança antes da assinatura.',
}

// ============ Telemetry policy ============

export const TELEMETRY_POLICY = {
  optIn: true,
  neverSends: ['seed', 'private keys', 'mnemonic', 'personal data', 'IP addresses (telemetry)'],
  sends: ['anonymous crash logs', 'anonymous performance metrics', 'anonymous feature usage'],
  disableable: true,
  fullyOptional: true,
}

// ============ Public metrics ============

export interface PublicMetric {
  label: string
  value: string
  icon: string
}

export const PUBLIC_METRICS: PublicMetric[] = [
  { label: 'Threat Intelligence', value: 'Updated 3 min ago', icon: '🌍' },
  { label: 'IOC Database', value: '1.842.337 indicators', icon: '🗄️' },
  { label: 'Engines', value: '16/16 healthy', icon: '⚙️' },
  { label: 'RPC Health', value: '99.98%', icon: '📡' },
  { label: 'Avg Decision Time', value: '84 ms', icon: '⚡' },
  { label: 'Simulations Run', value: '8.124.932', icon: '🔬' },
  { label: 'Approvals Blocked', value: '412.551', icon: '🛡️' },
  { label: 'Malicious DApps Detected', value: '5.391', icon: '⚠️' },
]

// ============ Financial roadmap ============

export interface FinancialPhase {
  phase: string
  goal: string
  monthlyCost: string
  fundedBy: string
}

export const FINANCIAL_ROADMAP: FinancialPhase[] = [
  { phase: 'Desenvolvimento', goal: 'Construir todas as funcionalidades', monthlyCost: 'Baixo (OSS + planos gratuitos)', fundedBy: 'Open source + infra de baixo custo' },
  { phase: 'Alpha privado', goal: 'Testes internos', monthlyCost: 'Baixo', fundedBy: 'Planos gratuitos' },
  { phase: 'Beta fechado', goal: '50–200 usuários', monthlyCost: 'US$ 0–20/mês', fundedBy: 'Supabase Free + Cloudflare Free + Vercel Hobby' },
  { phase: 'Beta público', goal: '1.000+ usuários', monthlyCost: 'US$ 50–200/mês', fundedBy: 'RPCs pagos + monitoramento + APIs' },
  { phase: 'Lançamento', goal: 'Escalar conforme receita', monthlyCost: 'Receita financia infraestrutura', fundedBy: 'PRO + Enterprise' },
]

// ============ Sprint roadmap ============

export interface SprintDefinition {
  id: string
  name: string
  goal: string
  items: string[]
}

export const SPRINT_ROADMAP: SprintDefinition[] = [
  {
    id: 'sprint-2',
    name: 'Chain Completion',
    goal: 'Todas as chains executando o pipeline completo',
    items: ['Ethereum completo', 'Bitcoin (PSBT/Taproot/SegWit)', 'Solana (Versioned TX/SPL)', 'Lightning (BOLT-11/canais)'],
  },
  {
    id: 'sprint-3',
    name: 'Security Validation',
    goal: 'Validar robustez sob adversidade',
    items: ['Testes unitários (≥95%)', 'Testes de integração', 'Testes E2E', 'Fuzz testing', 'Chaos testing', 'Property-based testing'],
  },
  {
    id: 'sprint-4',
    name: 'Production Readiness',
    goal: 'Pipeline de release seguro e reproduzível',
    items: ['CI/CD assinado', 'Builds reproduzíveis', 'SBOM', 'SAST', 'DAST', 'Release Signing'],
  },
  {
    id: 'sprint-5',
    name: 'Auditoria',
    goal: 'Validação externa independente',
    items: ['Pentest', 'Auditoria #1', 'Correções', 'Auditoria #2', 'Bug Bounty', 'SECURITY.md'],
  },
]

// ============ v1.0 Launch criteria ============

export const V1_LAUNCH_CRITERIA = [
  'Arquitetura estável (Architecture Freeze 1.0)',
  'Security Kernel completo',
  '100% das decisões baseadas em evidências',
  '100% autocustodial',
  'Free funcional (com limites de serviços contínuos)',
  'PRO operacional',
  'Enterprise documentado',
  'Todas as chains com pipeline completo',
  'Cobertura de testes ≥95% (Production engines)',
  '2 auditorias independentes aprovadas',
  'Bug bounty sem vulnerabilidades críticas abertas',
  'Builds reproduzíveis e assinados',
  'SBOM publicado',
  'Política de divulgação de vulnerabilidades ativa',
  'Telemetria opt-in, anonimizada, desativável',
  'Métricas públicas operacionais',
]
