# DESIGN — Design System & Identidade Visual

> **Tipo:** Design · **Versão:** 1.2.1 · **Atualizado:** 2026-09-23 · **Dono:** ENDARTStudios
> Skills de referência: **Motion Principles** (`github.com/kylezantos/design-principles`) + **UI/UX Pro Max** (local).

## 1. Posicionamento

A interface reforça que a carteira atua continuamente para **prevenir riscos** — estilo "software de segurança" (antivírus), não "gestor de ativos". Todo componente comunica estado de proteção.

## 2. Identidade de marca

### Logo
- **TANK** → `font-black uppercase tracking-tight` (weight 900).
- **Wallet** → `font-medium text-muted-foreground` (weight 500).
- **Nunca invertido** — a hierarquia fortalece a marca.

### Tagline
- `ZERO TRUST SECURITY` — caixa alta, tracking amplo, abaixo do logo.
- Subtítulo: "The hot wallet built to never sign a dangerous transaction."

## 3. Paleta por significado (aprendizado intuitivo)

| Cor | Significado | Uso |
| --- | --- | --- |
| **Verde** | Seguro / Verificado / Protegido | Score alto, DApp verificado, status Protected |
| **Amarelo** | Atenção / Risco moderado | Warnings, status Standby, desconhecido |
| **Vermelho** | Crítico / Bloqueado / Lockdown | Score crítico, DApp malicioso, LOCKDOWN ATIVO (pulsante) |
| **Azul** | Informação / Rede / Navegação | Redes conectadas, links, estado neutro-informativo |

Tema: dark-first (next-themes); accent `#10b981` (emerald) conforme `public/manifest.json`.

## 4. Estrutura de navegação

Sidebar em 4 grupos: **HOME** (Dashboard, Assets soon, NFTs soon, Activity) · **OPERATIONS** (Send, Receive, Swap soon, Bridge soon, Staking soon) · **SECURITY** (Vault, Wallet Health, Risk Center, Permission Manager, Sovereignty Center, Contract Scanner, DApp Shield, Security Timeline, AI Assistant PRO, Lockdown PRO) · **SETTINGS** (Notifications, Settings).

Header: logo + badge REAL (BIP-44) + endereço + redes + **Wallet Status pill** (Standby/Protected/Lockdown) + mini score + badges PRO/Paranoid.

## 5. Componentes

- Base: **Radix UI** (23 primitivos) + **shadcn/ui** com `class-variance-authority`.
- Ícones: `lucide-react`. Gráficos: `recharts`. Toast: `sonner`. Drawer: `vaul`.
- Estados obrigatórios em todo componente assíncrono: skeleton → dado → erro (com retry) → vazio.
- Componentes prontos (se necessário): Aceternity UI, React Bits, 21st.dev, Kokonut UI — **sem empilhar bibliotecas**.

## 6. Motion (obrigatório)

| Regra | Implementação |
| --- | --- |
| Entrada/saída suave | Framer Motion (`animate`/`exit`) ou GSAP |
| Progresso em ação assíncrona | Progress/Spinner + transição de estado (ex.: lockdown 800ms-2s animado) |
| Skeleton antes do dado | `[data-skeleton]` asserido por Playwright |
| Micro-interação | Hover/focus com transição ≤ 200ms |
| Respect | `prefers-reduced-motion` → desligar animação decorativa ([ACCESSIBILITY.md](ACCESSIBILITY.md)) |

## 7. Responsividade

- Breakpoints de verificação: **375 / 390 / 768 px** — sem overflow horizontal.
- Teclado virtual nunca cobre formulário.
- E2E roda em `chromium`, `mobile-375`, `tablet-768` (playwright.config.ts).

## 8. Padrões de tela de referência

- **Dashboard:** Wallet Health hero (score + estrelas + status) + quick stats grid + quick actions.
- **Lockdown:** botão circular vermelho de emergência + dialog de confirmação + resultado detalhado.
- **DApp Shield:** 3 estados — Verificado (verde) / Desconhecido (azul) / Malicioso (vermelho); thresholds ≥85 / ≥35 / <35.
- **Lock Screen:** painel Wallet Status com checkmarks de proteção + "Last protection scan".

## 9. Instruções de atualização

1. Novo componente compartilhado: documente aqui (seção §5) e siga os estados obrigatórios.
2. Mudança de cor/semântica: atualize §3 e verifique contraste AA.
3. Nova tela de segurança: siga os padrões de §8 (score + status + ação recomendada).
4. Toda mudança de UI passa pelos checks de motion (§6) e responsividade (§7) no PR.
