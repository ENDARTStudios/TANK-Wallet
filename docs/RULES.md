# RULES — Regras do Repositório

> **Tipo:** Governança · **Versão:** 1.2.1 · **Atualizado:** 2026-09-23 · **Dono:** ENDARTStudios
> **Fonte canônica:** [`../AGENTS.md`](../AGENTS.md) — este arquivo é a síntese de referência rápida. Em conflito, o `AGENTS.md` prevalece.

## Regra zero (não-negociável)

**Nunca commit um segredo.** Nunca versionar `.env`, chaves, DSN ou tokens. Descobriu um → aja agora ([SECRETS.md](SECRETS.md)).

## R1 — Toda obra nasce de uma Issue

1. Todo trabalho (correção, melhoria, feature) nasce de **uma Issue** no GitHub (ou do [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md) se `gh` não existir).
2. Branch nomeado: `feat/issue-123-descricao`, `fix/issue-124-...`, `chore/issue-125-...`.
3. PR referencia a Issue: `Closes #123`.
4. Sem green no deploy gate, sem merge.
5. PR de feature **atualiza os docs relacionados** (PRD, UML, RBAC, RLS...).

## R2 — GRAFT-FIRST (navegação com grafo)

Antes de `grep`/ler fonte em qualquer tarefa de navegação, consulte o grafo (`graft/`, regenerável com `graft build`):

```bash
npx @nanonets/graft ask "onde fica a lógica de RBAC?"
npx @nanonets/graft grep "requirePermission"
npx @nanonets/graft callers --function "initObservability"
```

Menos tokens, menos acerto às cegas.

## R3 — Disciplina de Sprint

- Escolha a feature de **maior impacto e menor complexidade**.
- Divida em tarefas com critério de fechamento, arquivos afetados e testes necessários.
- Salve em `../SPRINT.md`. **Não implemente fora do SPRINT.md.**
- Antes de editar: liste arquivos + dependências afetados.
- Crie o teste (failing) → implemente → rode → verifique. **Não saia do escopo.**

## R4 — Fluxo de bug

1. Primeiro um teste que reproduza o bug.
2. Confirme que o teste **falha**.
3. Corrija **apenas a raiz** (não o sintoma).
4. Rode o novo teste + a suíte relacionada.
5. Explique causa, correção e riscos restantes. Todo bug achado vira teste reprodutível.

## R5 — Motion/UX obrigatório em toda interface

- [ ] Skeleton / placeholder de carregamento
- [ ] Lazy-loading (rota, imagem, dados, componente pesado)
- [ ] Animação suave de entrada e saída
- [ ] Estado de progresso em toda ação assíncrona
- [ ] Responsivo sem overflow (375 / 390 / 768 px); teclado não cobre form
- [ ] Acessibilidade: contraste AA, foco visível, ARIA, teclado

Bibliotecas: Framer Motion, GSAP, anime.js, Motion, Three.js/R3F — **escolha conforme necessidade, não empilhe**.

## R6 — Mínimo de merge (qualidade)

- Erro: `error.tsx` + `global-error.tsx` + logger estruturado; Sentry + OTel ligados.
- Cobertura: Codecov; PR não pode reduzir cobertura agregada (alvo 80% em `src/lib`).
- E2E: Playwright para fluxos críticos.
- Lint: ESLint; tipagem estrita; sem `any` não justificado; validação com `zod` na entrada.

## R7 — Segurança antes do merge (zero-trust)

Checklist: autenticação/autorização · permissões · rotas · banco (RLS) · inputs (zod) · segredos · upload · webhooks · SQLi · XSS · SSRF · APIs · criptografia · sessão · IA/agent security · race condition · config perigosa · dependências.

- `401` se não autenticado; `403` se sem permissão ([RBAC.md](RBAC.md), [RLS.md](RLS.md)).
- Rate limit em toda rota de escrita ([SECURITY-GATE.md](SECURITY-GATE.md)).
- Header de sessão + HSTS + CSP presentes.
- Teste "tenta acessar o que não é seu": conta alheia / rota admin / API sem sessão.

## R8 — Performance

- Evitar: consulta repetida, render extra, operação bloqueante, sem cache, imagem gigante, JS desnecessário, requisição duplicada, fonte pesada, componente over-render.
- Gates: LCP < 2.5s, CLS < 0.1, Lighthouse ≥ 0.9 no PR de UI ([PERFORMANCE.md](PERFORMANCE.md)).

## R9 — Banco

- Tabela com tenant → `workspace_id` + RLS ([RLS.md](RLS.md)).
- Consulta com `LIMIT`; índice na chave de tenant.
- Sem query sem limite; sem exposição de dado sensível desnecessário.
- **Sempre:** backup restaurável existente ([BACKUP_DR.md](BACKUP_DR.md)); testar no sprint.

## R10 — SEO / AEO / GEO / AIO

- Estrutura: `title`, `description`, `canonical`, `robots.txt`, `sitemap.xml`, Open Graph, JSON-LD.
- Valida: Google (e motores de IA) conseguem descobrir e entender as páginas? ([SEO.md](SEO.md) · [AIO.md](AIO.md)).

## R11 — Limpeza periódica

Detectar: código duplicado, arquivo órfão, função não usada, dependência abandonada, mock em produção, TODO esquecido, log de debug, código morto, CSS morto. **Plano por risco/impacto antes de apagar** (ver [CLEANUP-PLAN.md](CLEANUP-PLAN.md)).

## R12 — Convenções

- **Idioma:** código + nomes em inglês; docs/prosa em pt-BR.
- **Estilo:** seguir o codebase (Next 16 App Router + Prisma + zod).
- **Comentários:** zero, salvo se solicitado.
- **Trabalho sem issue é proibido**; mínimo 1 PR por entrega.
- **Commits:** padrão do repo ("só o commit").
