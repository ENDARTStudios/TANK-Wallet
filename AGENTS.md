# AGENTS.md — Padrão de Trabalho (TANK Wallet)

> **Instrução a qualquer agente de qualquer modelo:** este documento tem precedência sobre convenções locais.
> Ao trabalhar neste repositório, siga o fluxo abaixo. Não improvise fora do escopo.

## 0. Regra zero (não-negociável)

Nunca commit um segredo. Nunca versionar `.env`, chaves, DSN ou tokens. Descubra um → rode agora (ver `docs/SECRETS.md`).

## 1. Fluxo obrigatório: Issue → PR → Deploy Gate

1. **Todo** trabalho (correção, melhoria, nova função) nasce de **uma Issue** no GitHub.
2. Abra um branch: `feat/issue-123-descreto`, `fix/issue-124-...`, `chore/issue-125-...`.
3. **Descrição do PR precisa referenciar a Issue:**
   ```
   Closes #123
   #REF: issue nominal
   ```
4. O PR roda o **deploy gate** (sem green, no merge — ver `docs/SECURITY-GATE.md`):
   - ESLint · `tsc --noEmit` · `bun test` · `audit:code` · Semgrep · CodeQL · Gitleaks · Trivy · SBOM.
5. Depois do merge, `release.yml` assina a imagem (cosign keyless + Ed25519) + SBOM assinado + GHCR.
6. Regra de docs: todo PR de feature precisa atualizar os docs relacionados (PRD, UML, RBAC, RLS, ...).

> Nota: no terminal da equipe `gh` pode não existir. Na ausência, use o `docs/ISSUES-BACKLOG.md` como fonte de issue (title/body/labels prontas).

## 2. Disciplina de Sprint

- Analise o projeto e escolha a feature de **maior impacto e menor complexidade**.
- Divida em tarefas, com critério de fechamento, arquivos afetados e testes necessários.
- Salve em `SPRINT.md`. **Não implemente fora** do que está no SPRINT.md.
- Antes de editar: liste os arquivos + dependências que serão afetados.
- Crie o teste (failing), implemente, rode, verifique. **Não saia do escopo**.

## 3. Bug — fluxo de bug

- Seguro: primeiro um teste que reproduza o bug.
- Confirme que o teste **falha**.
- Corrija **apenas a raiz** (não o sintoma).
- Rode o novo teste + a suíte relacionada.
- Explique causa, correção e riscos restantes.

## 3.5. Motion / UX — obrigatório em toda interface

Todo elemento da interface segue a Skill **Motion Principles** (`github.com/kylezantos/design-principles`) + **UI/UX Pro Max** (skill local). Em todos os elementos:

- [ ] Skeleton / placeholder de carregamento
- [ ] Lazy-loading (rota, imagem, dados, componente pesado)
- [ ] Animação suave de **entrada** e **saída**
- [ ] Estado de **progresso** em toda ação assíncrona
- [ ] Responsivo sem overflow (375 / 390 / 768 px); teclado não cobre form
- [ ] Acessibilidade: contraste AA, foco visível, ARIA, teclado

Bibliotecas de animação/3D (escolher conforme necessidade, não empilhar): Framer Motion, GSAP, anime.js, Motion, Three.js / React Three Fiber / WebGL. Componentes prontos: Aceternity UI, React Bits, 21st.dev, Kokonut UI, Bklit, Componentry.

## 4. Observabilidade & Quality (mínimo de merge)

- **Erro:** `error.tsx` + `global-error.tsx` + logger estruturado; Sentry + OpenTelemetry rodando (ver `docs/OBSERVABILITY.md`).
- **Cobertura:** Codecov; PR não pode reduzir cobertura agregada (ver `docs/TESTING.md`).
- **E2E:** Playwright para fluxos críticos.
- **Lint:** ESLint (+ Biome e/ou Commitlint quando adotar). Estilo: tipagem estrita, sem `any` não justificado, validação com `zod` na entrada.

## 5. Segurança — auditoria antes do merge (skill Segurança)

Checklist obrigatório (zero-trust): Autenticação/autorização · permissões · rotas · banco (RLS) · inputs (zod) · segredos (.env) · upload · webhooks · SQL Injection · XSS · SSRF · APIs · criptografia · sessão · IA/agent security · race condition · config perigosa · dependências.

Exigências mínimas:
- `401` se não autenticado; `403` se sem permissão (RBAC → `docs/RBAC.md`, `docs/RLS.md`).
- Rate limit em toda rota de escrita (`docs/SECURITY-GATE.md`).
- Header de sessão + HSTS + CSP presentes.
- Teste "tenta acessar o que não é seu": conta de outro / rota admin / registro alheio / API sem sessão.

## 6. Performance (skill Auditoria de Performance)

- Evita: consulta repetida, render extras, operação bloqueante, cliente lento, sem cache, imagem gigante, JS desnecessário, requisição duplicada, fonte pesada, consulta lenta, componente over-render.
- Gates: Core Web Vitals (LCP < 2.5s, CLS < 0.1) + Lighthouse no PR de UI.

## 7. Banco (skill Auditoria de Banco)

- Toda tabela com tenant → `workspace_id` + RLS (`docs/RLS.md`).
- Consulta com `LIMIT`; índice (B-Tree) na chave de tenant.
- Sem query sem limite; sem exposição de dados sensíveis desnecessários.
- **Sempre:** exista backup restaurável (`docs/disaster-recovery.md`); teste no sprint.

## 8. SEO / AEO / AIO / GEO

- Estrutura de site: `title`, `description`, `canonical`, `robots.txt`, `sitemap.xml`, Open Graph, dados estruturados (JSON-LD).
- Valida: Google consegue descobrir e entender as páginas?
- CLI/utilidade de referência: OpenSeo (`every-app/open-seo`), Screaming Frog MCP, free-for-dev, public-apis, awesome.

## 9. Limpeza (skill Limpeza) — manter o repo saudável

Periodicamente (ou ao PR `chore/`): detectar código duplicado, arquivo órfão, função não usada, dependência abandonada, mock em produção, TODO esquecido, log de debug, código morto, componente sem uso, CSS morto, asset esquecido, dependência inútil.

**Produza um plano de limpeza por risco/impacto** antes de apagar.

## 10. Docs vivos (mantêm e atualizam no PR)

- `PRD.md` — produto (o que/por quê)
- `docs/uml/UML.md` — diagrama de classe e sequência
- `docs/RBAC.md` — matrix de níveis de acesso
- `docs/RLS.md` — segurança por linha
- `docs/SECRETS.md` + `.env.example` — segredos
- `docs/ARCHITECTURE-MODULES.md` — catálogo de apps + feature flags
- `docs/OBSERVABILITY.md` — error reporting + observabilidade
- `docs/TESTING.md` — unit/integração/E2E
- `docs/SECURITY-GATE.md` — gate de deploy + WAF/bot/rate + TLS/HSTS
- `SPRINT.md` — feature atual (não implemente fora dele)
- `docs/ISSUES-BACKLOG.md` — issues prontas (title/body/labels)
- `ARCHITECTURE.md` — arquitetura e fases técnicas

## 11. Convenções

- Idioma: código + nomes em inglês; docs/prosa em pt-BR.
- Estilo: follow codebase existente (Next 16 App Router + Prisma + zod).
- Zero comentário salvo se não solicitado.
- Nenhum trabalho sem issue; mínimo 1 PR por entrega.
- Commits: padrão do repo ("só o commit").
