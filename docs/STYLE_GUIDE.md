# STYLE_GUIDE — Guia de Estilo de Código

> **Tipo:** Engenharia · **Atualizado:** 2026-09-23 · Aplicação: ESLint (`eslint.config.mjs`) + `tsc --noEmit` estrito no gate.
> Padrão de engenharia completo: `../ENGINEERING-STANDARDS.md` (17 seções).

## 1. Linguagem e nomenclatura

- **Idioma:** código/identificadores em **inglês**; docs/prosa em **pt-BR**.
- Arquivos: `kebab-case.ts` / `kebab-case.tsx`; componentes React: `PascalCase`.
- Funções/variáveis: `camelCase`; tipos/interfaces: `PascalCase`; constantes de config: `SCREAMING_SNAKE`.
- Booleans legíveis: `isVerified`, `hasApproval`, `shouldBlock` — não `flag1`.

## 2. TypeScript

- `strict: true`; **zero `any`** não justificado (historicamente 11 `any` → tipos próprios).
- Erros de domínio: `TankError` tipado — nunca `throw new Error` genérico.
- Validação de entrada: **zod em toda borda** (API, forms, env).
- Export público de lib: marcado `@stable` quando contrato congelado (36 exports hoje).

## 3. Estrutura

- Domínio em `src/lib/<modulo>/` com `index.ts` como fachada; testes em `__tests__/` ao lado.
- UI em `src/components/wallet/<area>/`; páginas finas em `src/app/` (server component por default, `"use client"` só com interatividade).
- Uma rota de API = um `route.ts` com validação zod + RBAC + rate limit (`src/proxy.ts` cobre o global).

## 4. React / Next

- Estado server: React Query; estado client leve: zustand; **nunca** duplicar fonte de verdade.
- Estilo: Tailwind 4 utilities + variantes CVA (shadcn); **proibido** CSS ad-hoc quando utility existe.
- Motion: Framer Motion para entrada/saída; GSAP só para timeline complexa — sem empilhar.
- Acessibilidade e motion são requisitos de estilo: ver [DESIGN.md](DESIGN.md) e [ACCESSIBILITY.md](ACCESSIBILITY.md).

## 5. Comentários e commits

- **Zero comentários**, salvo se solicitado ou para constraint não-óbvia do domínio (ex.: por que PBKDF2 250k).
- Commits: padrão curto do repo ("só o commit"); mensagens em inglês, imperativas.
- Branch: `feat|fix|chore/issue-N-descricao`.

## 6. Testes

- Nome do arquivo: `*.test.ts` (bun) / `*.spec.ts` (Playwright em `e2e/`).
- Asserções de UI por papel/texto (`getByRole`/`getByText`), não por classe CSS.
- Todo bug vira teste reprodutível antes da correção ([TESTING.md](TESTING.md)).

## 7. Proibições (o gate/lint pega, mas o review também cobra)

- `console.*` em produção (usar `logger.ts` estruturado).
- Segredo/chave/mnemonic hardcoded — nem em teste.
- `!` non-null assertion sem justificativa; `as any`.
- Query sem `LIMIT`; SELECT de coluna sensível sem necessidade.
- Dependência nova sem necessidade (ver [CHOOSE_TECH_STACK.md](CHOOSE_TECH_STACK.md) política de dependências).

## 8. Instruções de atualização

1. Nova regra de estilo consensual → adicione aqui + config do ESLint no mesmo PR.
2. Exceção concedida (legado) → marque no código com referência à issue de débito.
3. Este guia nunca contradiz o gate: se conflitar, o gate manda e o guia é corrigido.
