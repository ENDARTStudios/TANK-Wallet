# CHOOSE_TECH_STACK — Decisões de Stack

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Decisões formais em [ADR.md](ADR.md) · Versões vivas em `package.json`

## 1. Stack atual (v1.2.1)

| Camada | Escolha | Por quê | Alternativa considerada |
| --- | --- | --- | --- |
| Framework | **Next.js 16** (App Router) | RSC para performance/SEO, metadata API, rotas de API integradas | Vite SPA (perde SSR/SEO); Remix |
| UI | **React 19** + **Tailwind CSS 4** + **Radix/shadcn** | Acessível por padrão (Radix), utilitário rápido (Tailwind), CVA para variantes | MUI (peso, estilo próprio) |
| Runtime/PM/Test | **Bun** | Install/test rápidos, TS nativo em scripts (ADR-001) | Node+jest (mais lento no CI) |
| Linguagem | **TypeScript 5 strict** | Contrato interno; 16 engines de segurança sem tipagem é irresponsável | — |
| Estado | **zustand** + **TanStack Query** | Cliente leve + cache server-state; sem Redux (overkill) | Redux Toolkit |
| Forms/Validação | **react-hook-form** + **zod** | Validação compartilhada client/server na borda da API | — |
| ORM/Banco | **Prisma 6** → SQLite dev / **Postgres 16** prod | Type-safe + RLS no Postgres (ADR-003) | Drizzle (menos maduro p/ o time) |
| Crypto wallet | **viem** + **@noble/*** + **@scure/*** + **bitcoinjs-lib** + **ed25519-hd-key** | Auditáveis, modulares, BIP-39/32/44 + SLIP-0010 cobertos | ethers.js (mais pesado) |
| Motion | **Framer Motion** (+ GSAP p/ timeline complexa) | Entrada/saída declarativa com exit; GSAP só quando precisa | Nunca empilhar mais (R5) |
| Auth | **next-auth** + WebAuthn + TOTP + OAuth | Credentials + social + 2FA sem reinventar sessão | Auth.js custom |
| Observabilidade | **Sentry** + **OTel** + **prom-client** | Padrão de mercado; traceId ponta a ponta | Datadog (custo) |
| Pagamento | **Stripe** (checkout + webhook assinado) | Confiabilidade + conformidade PCI fora de escopo nosso | PagarME/mercadopago (futuro BR?) |
| E2E | **Playwright** | Multi-device (chromium/mobile-375/tablet-768), determinístico | Cypress (mobile fraco) |
| Deploy | **Docker standalone** → **Render** + **Caddy** | Imagem non-root assinada; healthcheck `/api/health` | Vercel (menos controle de WAF/edge) |

## 2. Política de dependências

1. **Nada entra sem necessidade demonstrada** — reutilizar antes (regra R11 de limpeza cobre saída, esta cobre entrada).
2. **Frozen lockfile:** `bun install --frozen-lockfile` no CI; upgrade é PR dedicado com `bun run golden` (crypto) + suíte completa.
3. **Dependabot** ativo; Trivy + SBOM CycloneDX no gate (vulnerabilidade bloqueia).
4. Lib **copyleft** exige ADR (impacto de licença — [COMPLIANCE.md](COMPLIANCE.md) §4).
5. Lib de **criptografia** só com auditoria/reputação (noble/scure); implementação própria só com vectors golden (Shamir).
6. Dependência abandonada (sem release 12m+) → candidato a remoção no plano de limpeza.

## 3. Upgrade policy

| Tipo | Ritmo | Gate extra |
| --- | --- | --- |
| Patch | Libre no PR que precisa | suíte |
| Minor | PR dedicado por lib | suíte + verify |
| Major | PR dedicado + ADR se quebra contrato | golden + E2E + bench |
| Next/React | Esperar estabilidade; testar em branch 1 sprint | tudo + Lighthouse |

Compatibilidade conhecida: `viem` ↔ `@noble/curves` (fixado em 2.4.0 — aprendizado A3).

## 4. Instruções de atualização

1. Nova dependência: linha na tabela §1 (ou justificativa de remoção) + checklist §2 no PR.
2. Upgrade de major: ADR se muda arquitetura/contrato; atualizar §1.
3. Stack auditada trimestralmente contra alternativas — só mudar com ganho mensurável (bench/métrica), não por hype.
