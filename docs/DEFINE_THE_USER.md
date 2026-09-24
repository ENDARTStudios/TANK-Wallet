# DEFINE_THE_USER — Personas e Usuário-Alvo

> **Tipo:** Produto · **Atualizado:** 2026-09-23 · Base: PRD §2 · Usa: [CONTENT.md](CONTENT.md) (voz) · [PRD.md](PRD.md) (tiers)

## 1. Pergunta norteadora

**Para quem existe o TANK Wallet?** Para quem **assina (ou assinaria) transações em hot wallet** e já perdeu dinheiro — ou conhece quem perdeu — por approve malicioso, DApp de phishing ou token scam. Quem nunca assina nada não precisa do produto; quem quer custódia passiva é anti-persona.

## 2. Personas

### P1 — Usuário retail DeFi ("a vítima em potencial")
- **Perfil:** opera sozinho no celular/desktop; usa Uniswap/Aave/OpenSea; detém US$ 500-50k; não lê bytecode.
- **Jobs-to-be-done:** "quero usar DeFi sem perder tudo por um clique errado"; "quero entender rapidamente se esse site/token é armadilha".
- **Dores:** já aprovou `setApprovalForAll` sem saber; não sabe revogar; alertas de carteira convencionais não explicam nada.
- **Cenários-chave:** conectar DApp novo (DApp Shield) · receber token estranho (GoPlus no receive) · revogar approve infinito (Permission Manager).
- **Sucesso:** detecta e evita 1 golpe; primeira revogação em < 1 min.
- **Tier:** Free (porta de entrada).

### P2 — Operador diligente ("o caçador de alpha")
- **Perfil:** airdrops, DEX novas, pontes; alto volume de interações com contratos não auditados; entende `approve`, quer profundidade.
- **Dores:** velocidade × segurança (não quer bloqueio indevido); precisa distinguir "desconhecido" de "malicioso" em segundos.
- **Cenários-chave:** scanner de contrato antes do mint · simulação state-diff · lockdown L1 rápido pós-interação arriscada.
- **Sucesso:** zero falso-bloqueio em fluxo legítimo; detalhe técnico disponível quando pedido.
- **Tier:** Free → **PRO** (conversão principal — AI Risk Engine, Undo Center, Modo Paranoico).

### P3 — Equipe Enterprise ("a tesouraria")
- **Perfil:** DAO/treasury/instituição; múltiplos operadores; compliance exige trilha e SLA.
- **Dores:** um operador pode aprovar tudo; precisa RBAC, HSM/MPC, relatórios auditáveis.
- **Cenários-chave:** permissões por papel (viewer nunca assina) · lockdown com aprovação k-of-n · export de PermissionAuditLog.
- **Sucesso:** política de assinatura enforcement real (Cold Shield); audit externo passa.
- **Tier:** **Enterprise** (RBAC, HSM/MPC, SLA).

## 3. Anti-personas (não servir)

| Quem | Por quê | Resposta de produto |
| --- | --- | --- |
| Quer custódia/exchange ("recupera minha senha") | Autocustodial por design | Copy clara: sem senha, sem fundos — backup é do usuário |
| Quer só comprar/segurar cold | Não assina transações frequentes | Indicar cold storage; TANK é hot wallet de uso |
| Especulador que aceita qualquer risco por alpha | Atrito de segurança é o produto | Modo de tolerância não existe por padrão (FR-SEC-01 fail-closed) |

## 4. Princípios de UX derivados das personas

1. **P1 manda no default:** explicação em linguagem natural antes do jargão (AI Assistant).
2. **P2 exige honestidade de estado:** "Desconhecido" (azul) ≠ "Malicioso" (vermelho) — sem info não é perigo.
3. **P3 exige trilha:** tudo logado (HMAC chain), nada desaparece.
4. **Nenhuma persona quer falso positivo bloqueante** em fluxo legítimo — calibrar thresholds (≥85/≥35/<35).

## 5. Instruções de atualização

1. Nova persona ou mudança de comportamento: atualizar com evidência (pesquisa, suporte, métrica do Risk Center).
2. Decisão de UX que contraria uma persona: registrar em `../DECISOES.md`.
3. Anti-persona nova: verificar se a copy de produto está deixando expectativa clara.
