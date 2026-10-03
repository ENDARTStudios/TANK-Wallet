// ============ Tank Wallet PRO Features ============
//
// Features do plano PRO, implementadas sobre os engines existentes,
// sem alterar o Security Kernel, TSS, TSF ou Event Bus.

export interface ProFeature {
  id: string
  name: string
  description: string
  status: 'planned' | 'in_progress' | 'alpha' | 'beta' | 'production'
  engines: string[]
  priority: 'critical' | 'high' | 'medium'
  category: 'security' | 'recovery' | 'automation' | 'enterprise'
}

export const PRO_FEATURES: ProFeature[] = [
  {
    id: 'mpc',
    name: 'MPC Wallet (Enterprise Grade)',
    description: 'Chave privada nunca existe inteira. Share A (dispositivo) + Share B (enclave seguro) + Share C (recovery). Threshold 2-de-3.',
    status: 'planned',
    engines: ['Key Management Engine', 'Signature Engine', 'Security Kernel'],
    priority: 'critical',
    category: 'security',
  },
  {
    id: 'passwordless-recovery',
    name: 'Passwordless Recovery',
    description: 'Face ID 3D + Passkey + E-mail + Recovery Policy. Biometria libera share MPC, não a chave completa.',
    status: 'planned',
    engines: ['Recovery Engine', 'Device Trust Engine', 'Behavior Engine'],
    priority: 'critical',
    category: 'recovery',
  },
  {
    id: 'smart-recovery',
    name: 'Smart Recovery',
    description: 'Políticas configuráveis: 2 fatores = imediato, 4 fatores = remove waiting period.',
    status: 'planned',
    engines: ['Recovery Engine', 'Policy Engine'],
    priority: 'high',
    category: 'recovery',
  },
  {
    id: 'account-abstraction',
    name: 'Account Abstraction (ERC-4337)',
    description: 'Smart contract wallet. Gas patrocinado, sessões temporárias, spending limits, whitelist/blacklist.',
    status: 'planned',
    engines: ['Security Kernel', 'Policy Engine', 'Permission Engine'],
    priority: 'high',
    category: 'automation',
  },
  {
    id: 'session-keys',
    name: 'Session Keys',
    description: 'Aprovação única com limites: 30min, máximo $20. Micro transações sem nova assinatura.',
    status: 'planned',
    engines: ['Permission Engine', 'Policy Engine', 'Security Kernel'],
    priority: 'high',
    category: 'automation',
  },
  {
    id: 'social-recovery-2',
    name: 'Social Recovery 2.0',
    description: 'Biometria + passkeys + MPC + Shamir + guardian devices. 3 de 5 shares.',
    status: 'planned',
    engines: ['Recovery Engine', 'Key Management Engine'],
    priority: 'medium',
    category: 'recovery',
  },
  {
    id: 'vault-mpc',
    name: 'Secure Vault (MPC)',
    description: 'Hot Wallet até $5K. Acima: Vault Approval + MPC Signature. Cold policy.',
    status: 'planned',
    engines: ['Security Kernel', 'Key Management Engine', 'Policy Engine'],
    priority: 'high',
    category: 'security',
  },
  {
    id: 'enterprise-policies',
    name: 'Enterprise Policies',
    description: 'Admins definem regras: never sign unknown contract, always Face ID >$500, Ethereum only during hours.',
    status: 'planned',
    engines: ['Policy Engine', 'Security Kernel'],
    priority: 'medium',
    category: 'enterprise',
  },
  {
    id: 'continuous-auth',
    name: 'Continuous Authentication',
    description: 'Device Trust + Behavior + Network + AI Security durante toda a sessão. Mudança = Lock Session.',
    status: 'planned',
    engines: ['Device Trust Engine', 'Behavior Engine', 'Network Engine', 'AI Security Engine'],
    priority: 'high',
    category: 'security',
  },
  {
    id: 'premium-center',
    name: 'Premium Security Center',
    description: 'Tela exclusiva PRO com 12 indicadores de segurança em tempo real.',
    status: 'planned',
    engines: ['All engines'],
    priority: 'medium',
    category: 'enterprise',
  },
]

export const PRO_POSITIONING = {
  promise: 'Você não precisa usar a seed phrase no dia a dia. Ela permanece disponível como mecanismo de recuperação de última instância, enquanto MPC, Passkeys e biometria protegem e simplificam o acesso.',
  pricing: { monthly: 19.99, annual: 203.90, annualDiscount: '15% off' },
}
