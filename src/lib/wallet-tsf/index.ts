// ============ Tank Security Framework (TSF) ============
//
// Modelo que separa ameaças por domínio de responsabilidade.
// Cada domínio (TSF-1 a TSF-7) define:
// - ameaças cobertas
// - engines responsáveis
// - controles aplicáveis

export interface TsfDomain {
  id: string
  title: string
  description: string
  threats: TsfThreat[]
  responseEngines: string[]
  controls: string[]
  principle: string
}

export interface TsfThreat {
  name: string
  description: string
  threatId?: string // reference to Threat Registry
}

export const TSF_DOMAINS: TsfDomain[] = [
  {
    id: 'TSF-1',
    title: 'User Protection',
    description: 'A carteira pode agir diretamente para proteger o usuário de engenharia social.',
    principle: 'A primeira linha de defesa é o próprio usuário — a carteira o protege de si mesmo.',
    threats: [
      { name: 'Phishing', description: 'Sites falsos que capturam credenciais ou assinaturas', threatId: 'THR-0007' },
      { name: 'QR Code malicioso', description: 'QR codes que levam a sites de phishing' },
      { name: 'Falso suporte', description: 'Atacantes se passam por suporte da Tank', threatId: 'THR-0008' },
      { name: 'Deepfake', description: 'Vídeo/áudio sintético para impersonar autoridade', threatId: 'THR-0008' },
      { name: 'Áudio sintético', description: 'Voz clonada para solicitações urgentes' },
      { name: 'Airdrops falsos', description: 'Airdrops que exigem assinatura de contratos maliciosos' },
      { name: 'Address poisoning', description: 'Endereços visualmente similares no histórico', threatId: 'THR-0003' },
      { name: 'Clipboard hijacking', description: 'Malware substitui endereço copiado', threatId: 'THR-0004' },
      { name: 'Ofertas irreais', description: 'Promessas de retorno impossível para induzir assinatura' },
      { name: 'Lojas falsas', description: 'E-commerces que exigem pagamento em cripto e não entregam' },
    ],
    responseEngines: ['DApp Shield', 'QR Shield', 'AI Security Assistant', 'Domain Reputation', 'Device Guardian', 'Wallet Guardian', 'Decision Engine'],
    controls: [
      'DApp Shield verifica domínio + WHOIS + SSL + typosquatting',
      'Wallet Guardian detecta clipboard hijacking + address poisoning',
      'AI Security Assistant explica riscos em linguagem natural',
      'Notificação de fake support ao detectar links Telegram/Discord/WhatsApp',
      'Alerta de deepfake ao detectar solicitações de seed phrase',
    ],
  },
  {
    id: 'TSF-2',
    title: 'Blockchain Protection',
    description: 'A carteira pode analisar contratos antes da assinatura.',
    principle: 'Toda interação com a blockchain é suspeita até ser comprovada segura.',
    threats: [
      { name: 'Honeypot', description: 'Token com venda bloqueada', threatId: 'THR-0005' },
      { name: 'Rug Pull', description: 'Deployer remove liquidez', threatId: 'THR-0006' },
      { name: 'Reentrancy', description: 'Contrato chama externo antes de atualizar estado', threatId: 'THR-0014' },
      { name: 'Flash Loan Exploits', description: 'Manipulação de preço via flash loan', threatId: 'THR-0015' },
      { name: 'Oracle Manipulation', description: 'Manipulação de oráculo para liquidar posições' },
      { name: 'First Depositor', description: 'Atacante domina pool inicial para inflar taxa' },
      { name: 'Unlimited Approval', description: 'Aprovação infinita', threatId: 'THR-0001' },
      { name: 'Delegatecall', description: 'Execução no contexto do chamador' },
      { name: 'Proxy Abuse', description: 'Upgrade malicioso em proxy' },
      { name: 'Hidden Owner', description: 'Owner oculto com privilégios' },
      { name: 'Upgradeable Contracts', description: 'Lógica pode ser alterada' },
      { name: 'Liquidity Frauds', description: 'LP não bloqueada, wash trading' },
      { name: 'Signature Phishing', description: 'Assinatura EIP-712 maliciosa' },
    ],
    responseEngines: ['Simulation Engine', 'Contract Intelligence', 'Permission Engine', 'Liquidity Engine', 'Threat Intelligence', 'Signature Engine', 'Decision Engine'],
    controls: [
      'Simulation Engine executa eth_call + state diff antes de cada assinatura',
      'Contract Scanner analisa bytecode (delegatecall, selfdestruct, proxy, mint)',
      'Permission Engine detecta approve infinito + setApprovalForAll',
      'Liquidity Engine verifica LP lock, holder count, volume',
      'Threat Intelligence consulta database própria + GoPlus',
      'Signature Engine classifica cada tipo de assinatura',
    ],
  },
  {
    id: 'TSF-3',
    title: 'Wallet Protection',
    description: 'Protege a própria carteira — chaves, memória, dispositivo.',
    principle: 'As chaves são o ativo mais crítico. Sua proteção é não-negociável.',
    threats: [
      { name: 'Memory scraping', description: 'Malware extrai chaves da memória', threatId: 'THR-0010' },
      { name: 'Key extraction', description: 'Extração de chave privada por malware' },
      { name: 'Side-channel', description: 'Ataques de timing para inferir chaves' },
      { name: 'Infostealers', description: 'Malware especializado em roubar credenciais', threatId: 'THR-0010' },
      { name: 'Malware', description: 'Software malicioso no dispositivo' },
      { name: 'Root', description: 'Acesso root no Android', threatId: 'THR-0011' },
      { name: 'Jailbreak', description: 'Jailbreak no iOS', threatId: 'THR-0011' },
      { name: 'Screen capture', description: 'Captura de tela para roubar seed' },
      { name: 'Overlay', description: 'Janela sobreposta para capturar input' },
      { name: 'Hooking', description: 'Frida/Xposed para interceptar funções' },
      { name: 'Frida', description: 'Framework de instrumentação dinâmica' },
      { name: 'Magisk', description: 'Sistema de root sem sistema' },
    ],
    responseEngines: ['Key Management Engine', 'Device Trust Engine', 'Secure Buffer', 'Memory Zeroization', 'Policy Engine'],
    controls: [
      'SecureBuffer zeroiza memória após uso',
      'Key cache singleton com auto-lock de 5 min',
      'Console.log sanitizado para nunca expor seeds/keys',
      'Device Trust Engine detecta DevTools, headless, debugger',
      'Auto-lock em inatividade',
      'Lockdown L1 bloqueia assinaturas',
    ],
  },
  {
    id: 'TSF-4',
    title: 'Infrastructure Protection',
    description: 'Protege a plataforma Tank — não a carteira do usuário.',
    principle: 'A infraestrutura da Tank deve ser tão segura quanto a carteira que ela oferece.',
    threats: [
      { name: 'Supply Chain', description: 'Dependência comprometida', threatId: 'THR-0013' },
      { name: 'CI/CD', description: 'Pipeline de deploy comprometido' },
      { name: 'Build Pipeline', description: 'Build reproduzível violado' },
      { name: 'Dependências', description: 'Vulnerabilidades em libs de terceiros' },
      { name: 'Secrets', description: 'Vazamento de segredos da infraestrutura' },
      { name: 'Insider', description: 'Ameaça interna de funcionários' },
      { name: 'Ransomware', description: 'Sequestro de dados da infraestrutura' },
      { name: 'DDoS', description: 'Negação de serviço' },
      { name: 'APT', description: 'Ameaça persistente avançada' },
      { name: 'Comprometimento operacional', description: 'Acesso administrativo comprometido' },
    ],
    responseEngines: ['Secure Update Engine', 'Signed Builds', 'SBOM', 'SAST', 'DAST', 'Secret Rotation', 'HSM', 'IAM', 'Audit Engine'],
    controls: [
      'Secure Update Engine: assinatura Ed25519 + SHA-256 + rollback protection',
      'Signed Builds: builds reproduzíveis com hash verificável',
      'SBOM: CycloneDX ou SPDX para todas as dependências',
      'SAST/DAST: análise estática e dinâmica no CI/CD',
      'Secret Rotation: rotação automática de chaves de infraestrutura',
      'HSM: Hardware Security Module para segredos críticos',
      'IAM: acesso JIT (Just-In-Time) + segregação de funções',
      'Audit Engine: auditoria imutável + aprovação em duas pessoas',
    ],
  },
  {
    id: 'TSF-5',
    title: 'Privacy Protection',
    description: 'Elimina vazamentos de dados do usuário.',
    principle: 'Sua carteira, suas transações, seu histórico — não são da conta de ninguém.',
    threats: [
      { name: 'RPC Tracking', description: 'RPC correlaciona endereços', threatId: 'THR-0012' },
      { name: 'Fingerprinting', description: 'Identificação única do usuário' },
      { name: 'Address Correlation', description: 'Vinculação de múltiplos endereços' },
      { name: 'Metadata Leakage', description: 'Vazamento de metadados de transação' },
      { name: 'Provider Injection', description: 'RPC injeta dados falsos' },
    ],
    responseEngines: ['Privacy Engine', 'Network Engine', 'RPC Pool', 'Provider Sandbox'],
    controls: [
      'Privacy Engine: batching, cache, rotação de RPCs',
      'Nunca enviar carteira completa ao RPC',
      'RPC Pool com múltiplos endpoints para evitar correlação',
      'Provider Sandbox: DApps não acessam providers globais',
      'Telemetria opcional, anonimizada, desativada por padrão',
    ],
  },
  {
    id: 'TSF-6',
    title: 'AI Protection',
    description: 'Novo domínio — proteção contra ameaças geradas por IA.',
    principle: 'IA pode ser usada contra o usuário. A Tank usa IA para proteger, nunca para atacar.',
    threats: [
      { name: 'Prompt Injection', description: 'Atacante injeta instruções em prompts', threatId: 'THR-0009' },
      { name: 'Shadow AI', description: 'IA não autorizada operando no backend' },
      { name: 'Jailbreak Prompts', description: 'Tentar contornar restrições de IA' },
      { name: 'Synthetic Identity', description: 'IA gera identidades falsas', threatId: 'THR-0008' },
      { name: 'AI Malware', description: 'Malware gerado por IA' },
      { name: 'Autonomous Agents', description: 'Agentes de IA operando sem supervisão' },
      { name: 'Deepfake', description: 'Vídeo/áudio sintético', threatId: 'THR-0008' },
      { name: 'Hyper-personalized Phishing', description: 'Phishing customizado por IA' },
    ],
    responseEngines: ['AI Security Engine', 'AI Security Assistant'],
    controls: [
      'AI Security Engine valida prompts e respostas',
      'Detecção de prompt injection e jailbreak attempts',
      'Verificação de identidade para solicitações sensíveis',
      'Análise de mensagens para identificar phishing gerado por IA',
      'AI Security Assistant explica riscos — nunca toma decisões automáticas (TSS-010)',
    ],
  },
  {
    id: 'TSF-7',
    title: 'Business Protection',
    description: 'Ameaças que a carteira pode detectar mas não impedir diretamente.',
    principle: 'A carteira protege o que está no seu escopo. Fora dele, alerta e educa.',
    threats: [
      { name: 'Fraude de triangulação', description: 'Golpe onde vítima paga via intermediário' },
      { name: 'Golpe da falsa entrega', description: 'Compra que nunca é entregue' },
      { name: 'Roubo de identidade', description: 'Identidade usada para abrir contas' },
      { name: 'Account Takeover', description: 'Conta de exchange comprometida' },
      { name: 'Credential Stuffing', description: 'Reuso de credenciais vazadas' },
    ],
    responseEngines: ['Behavior Engine', 'Notification Engine', 'AI Security Assistant'],
    controls: [
      'Behavior Engine detecta padrões anômalos que podem indicar coerção',
      'Notification Engine alerta sobre tentativas suspeitas',
      'AI Security Assistant explica riscos de negócios suspeitos',
      'Exigir autenticação adicional para alterações críticas',
      'A carteira não pode impedir compras fora do seu ambiente — mas pode alertar',
    ],
  },
]

// ============ Coverage Matrix ============

export interface CoverageMatrixEntry {
  threat: string
  detect: boolean | 'partial'
  block: boolean | 'partial'
  recover: boolean
  audit: boolean
}

export const COVERAGE_MATRIX: CoverageMatrixEntry[] = [
  { threat: 'Honeypot', detect: true, block: true, recover: false, audit: true },
  { threat: 'Rug Pull', detect: true, block: true, recover: false, audit: true },
  { threat: 'Phishing', detect: true, block: true, recover: false, audit: true },
  { threat: 'Clipboard Hijacking', detect: true, block: true, recover: false, audit: true },
  { threat: 'Unlimited Approval', detect: true, block: true, recover: true, audit: true },
  { threat: 'Deepfake', detect: true, block: 'partial', recover: false, audit: true },
  { threat: 'Prompt Injection', detect: true, block: true, recover: false, audit: true },
  { threat: 'DDoS', detect: true, block: 'partial', recover: true, audit: true },
  { threat: 'Supply Chain', detect: true, block: true, recover: true, audit: true },
  { threat: 'APT', detect: true, block: 'partial', recover: true, audit: true },
  { threat: 'Address Poisoning', detect: true, block: true, recover: false, audit: true },
  { threat: 'Memory Scraping', detect: true, block: true, recover: false, audit: true },
  { threat: 'RPC Tracking', detect: true, block: 'partial', recover: false, audit: true },
  { threat: 'Reentrancy', detect: true, block: 'partial', recover: false, audit: true },
  { threat: 'Flash Loan Exploit', detect: true, block: 'partial', recover: false, audit: true },
]

// ============ OWASP ASVS requirement ============

export const OWASP_REQUIREMENT = {
  standard: 'OWASP ASVS (Application Security Verification Standard)',
  requirement: 'Toda API, backend, extensão e aplicativo da Tank deve atender ao OWASP ASVS, além de tratar continuamente os riscos do OWASP Top 10 vigente.',
  level: 'Level 2 (Standard)',
  scope: ['API', 'backend', 'extensão', 'aplicativo'],
  status: 'mandatory' as const,
}
