# AGENTS.md — Padrão de Trabalho (TANK Wallet)

> **Instrução a qualquer agente de qualquer modelo:** este documento tem precedência sobre convenções locais.
> Ao trabalhar neste repositório, siga o fluxo abaixo. Não improvise fora do escopo.

## 0. Regra zero (não-negociável)

Nunca commit um segredo. Nunca versionar `.env`, chaves, DSN ou tokens. Descubra um → rode agora (ver `docs/05-security-compliance/SECRETS.md`).

## 0.5. GRAFT-FIRST — navegação com grafo (obrigatório)

> **Grafo local/regenerável:** `graft` em `D:\PROJETOS\TANK Wallet\TANK Wallet\graft` (6396 nós, 14933 edges, 448 files). É `git-ignored` — cada dev roda `graft build` para gerar o seu. Use `graft check` para manter frescura e `graft build` para regenerar.

**Claude Code → automático:** hooks/statusline/MCP já consomem o grafo — não precisa chamar manualmente.

**OpenCode / qualquer agente sem MCP → manual (GRAFT-FIRST):** em *qualquer* tarefa de navegação (explorar código, achar arquivos, entender arquitetura, planejar refator), **rode `graft ask` / `graft grep` / `graft callers` e leia os nós do grafo *antes* de `grep`/ler fonte**. Menos tokens, menos acerto às cegas, mais acerto na primeira tentativa.

```bash
npx @nanonets/graft ask "onde fica a lógica de RBAC?"
npx @nanonets/graft grep "requirePermission"
npx @nanonets/graft callers --function "initObservability"
```

Se em algum momento o agente não usar o grafo, lembre-o: **"siga o AGENTS.md — GRAFT-FIRST"**.

## 1. Fluxo obrigatório: Issue → PR → Deploy Gate

1. **Todo** trabalho (correção, melhoria, nova função) nasce de **uma Issue** no GitHub.
2. Abra um branch: `feat/issue-123-descreto`, `fix/issue-124-...`, `chore/issue-125-...`.
3. **Descrição do PR precisa referenciar a Issue:**
   ```
   Closes #123
   #REF: issue nominal
   ```
4. O PR roda o **deploy gate** (sem green, no merge — ver `docs/05-security-compliance/SECURITY-GATE.md`):
   - ESLint · `tsc --noEmit` · `bun test` · `audit:code` · Semgrep · CodeQL · Gitleaks · Trivy · SBOM.
5. Depois do merge, `release.yml` assina a imagem (cosign keyless + Ed25519) + SBOM assinado + GHCR.
6. Regra de docs: todo PR de feature precisa atualizar os docs relacionados (PRD, UML, RBAC, RLS, ...).

> Nota: no terminal da equipe `gh` pode não existir. Na ausência, use o `docs/03-development-process/ISSUES-BACKLOG.md` como fonte de issue (title/body/labels prontas).

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

- **Erro:** `error.tsx` + `global-error.tsx` + logger estruturado; Sentry + OpenTelemetry rodando (ver `docs/07-operations-marketing/OBSERVABILITY.md`).
- **Cobertura:** Codecov; PR não pode reduzir cobertura agregada (ver `docs/03-development-process/TESTING.md`).
- **E2E:** Playwright para fluxos críticos.
- **Lint:** ESLint (+ Biome e/ou Commitlint quando adotar). Estilo: tipagem estrita, sem `any` não justificado, validação com `zod` na entrada.

## 5. Segurança — auditoria antes do merge (skill Segurança)

Checklist obrigatório (zero-trust): Autenticação/autorização · permissões · rotas · banco (RLS) · inputs (zod) · segredos (.env) · upload · webhooks · SQL Injection · XSS · SSRF · APIs · criptografia · sessão · IA/agent security · race condition · config perigosa · dependências.

Exigências mínimas:
- `401` se não autenticado; `403` se sem permissão (RBAC → `docs/05-security-compliance/RBAC.md`, `docs/05-security-compliance/RLS.md`).
- Rate limit em toda rota de escrita (`docs/05-security-compliance/SECURITY-GATE.md`).
- Header de sessão + HSTS + CSP presentes.
- Teste "tenta acessar o que não é seu": conta de outro / rota admin / registro alheio / API sem sessão.

## 6. Performance (skill Auditoria de Performance)

- Evita: consulta repetida, render extras, operação bloqueante, cliente lento, sem cache, imagem gigante, JS desnecessário, requisição duplicada, fonte pesada, consulta lenta, componente over-render.
- Gates: Core Web Vitals (LCP < 2.5s, CLS < 0.1) + Lighthouse no PR de UI.

## 7. Banco (skill Auditoria de Banco)

- Toda tabela com tenant → `workspace_id` + RLS (`docs/05-security-compliance/RLS.md`).
- Consulta com `LIMIT`; índice (B-Tree) na chave de tenant.
- Sem query sem limite; sem exposição de dados sensíveis desnecessários.
- **Sempre:** exista backup restaurável (`docs/06-devops-deployment/BACKUP_DR.md`); teste no sprint.

## 8. SEO / AEO / AIO / GEO

- Estrutura de site: `title`, `description`, `canonical`, `robots.txt`, `sitemap.xml`, Open Graph, dados estruturados (JSON-LD).
- Valida: Google consegue descobrir e entender as páginas?
- CLI/utilidade de referência: OpenSeo (`every-app/open-seo`), Screaming Frog MCP, free-for-dev, public-apis, awesome.

## 9. Limpeza (skill Limpeza) — manter o repo saudável

Periodicamente (ou ao PR `chore/`): detectar código duplicado, arquivo órfão, função não usada, dependência abandonada, mock em produção, TODO esquecido, log de debug, código morto, componente sem uso, CSS morto, asset esquecido, dependência inútil.

**Produza um plano de limpeza por risco/impacto** antes de apagar.

## 10. Docs vivos (mantêm e atualizam no PR)

- `docs/01-product-discovery/PRD.md` — produto (o que/por quê)
- `docs/02-architecture-design/UML.md` — diagrama de classe e sequência
- `docs/05-security-compliance/RBAC.md` — matrix de níveis de acesso
- `docs/05-security-compliance/RLS.md` — segurança por linha
- `docs/05-security-compliance/SECRETS.md` + `.env.example` — segredos
- `docs/02-architecture-design/ARCHITECTURE-MODULES.md` — catálogo de apps + feature flags
- `docs/07-operations-marketing/OBSERVABILITY.md` — error reporting + observabilidade
- `docs/03-development-process/TESTING.md` — unit/integração/E2E
- `docs/05-security-compliance/SECURITY-GATE.md` — gate de deploy + WAF/bot/rate + TLS/HSTS
- `SPRINT.md` — feature atual (não implemente fora dele)
- `docs/03-development-process/ISSUES-BACKLOG.md` — issues prontas (title/body/labels)
- `docs/02-architecture-design/ARCHITECTURE.md` — arquitetura e fases técnicas

## 11. Convenções

- Idioma: código + nomes em inglês; docs/prosa em pt-BR.
- Estilo: follow codebase existente (Next 16 App Router + Prisma + zod).
- Zero comentário salvo se não solicitado.
- Nenhum trabalho sem issue; mínimo 1 PR por entrega.
- Commits: padrão do repo ("só o commit").

## 12. Project Automation Guidelines

### Strict Rule: Terminal & CLI First Policy

You (the AI Agent) have complete command-line and terminal access to this environment. You must maximize your autonomy using CLIs and never delegate web-based infrastructure tasks to the human operator.

### 1. Prohibited Requests

* **NEVER** ask the operator to manually open a browser or log into dashboards (such as Vercel, Railway, Supabase, Netlify, AWS, or GitHub web).
* **NEVER** ask the operator to manually create projects, trigger deployments, set environment variables, or check build logs inside a web user interface.

### 2. Autonomous Execution Flow

* **CLI Over Web UI:** If an infrastructure action is needed, immediately use the respective terminal tool (e.g., vercel, railway, gh).
* **Session Verification:** Before asking for credentials, autonomously check if a session exists using commands like vercel whoami, railway whoami, or gh auth status.
* **Deployments & Variables:** Always use execution commands (e.g., vercel deploy, railway up) and pipe/inject environment variables directly via the CLI tool tools instead of requesting manual copy-pasting.

> Neste repo: `gh` (GitHub — issues/PRs/checks), deploy é Vercel (`vercel.json` + preview/production; `render.yaml` legado), banco via `prisma` CLI, segredos via CLI/cofre — nunca colar na UI web.

### 3. Allowed Exceptions

You may only prompt the human operator regarding external platforms if:

* The CLI tool explicitly requires a browser-based OAuth validation link that your environment cannot automatically bypass.
* There is a terminal-blocking account restriction (e.g., payment failure or missing team permissions) that cannot be handled programmatically.
