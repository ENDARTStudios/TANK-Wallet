# docs/ — Central de Documentação do TANK Wallet

> **Projeto:** TANK Wallet v1.2.1 · **Atualizado:** 2026-09-23 · **Dono:** ENDARTStudios
> **Regra de ouro:** todo PR de feature atualiza os docs relacionados (ver `AGENTS.md` §10).

## Como usar esta pasta

Cada arquivo é um **documento vivo** com um dono, um propósito e instruções de atualização. Nada aqui é histórico morto: se o código mudou e o doc não mudou, o PR não está pronto.

## Índice

### Produto e visão

| Documento | Conteúdo |
| --- | --- |
| [PRD.md](PRD.md) | Requisitos de produto: visão, personas, objetivos, escopo por fase, métricas |
| [DEFINE_THE_USER.md](DEFINE_THE_USER.md) | Personas detalhadas: jobs-to-be-done, dores, cenários, anti-personas |
| [ROADMAP.md](ROADMAP.md) | Roadmap consolidado: versões entregues, sprint atual, fases futuras |
| [TASKS.md](TASKS.md) | Tarefas do sprint atual e próximas, com status e rastreio |
| [CONTENT.md](CONTENT.md) | Diretrizes de conteúdo: tom de voz, i18n, copy de UI, changelog |

### Engenharia

| Documento | Conteúdo |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura técnica: camadas, módulos, fluxo de dados |
| [RULES.md](RULES.md) | Regras obrigatórias do repositório (síntese executável do `AGENTS.md`) |
| [CHOOSE_TECH_STACK.md](CHOOSE_TECH_STACK.md) | Decisões de stack com justificativa e alternativas |
| [ADR.md](ADR.md) | Architecture Decision Records (indexado) |
| [API.md](API.md) | API interna `/api/*`: convenções, rotas, contratos |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Integrações externas: GoPlus, Alchemy, Stripe, Sentry, RPCs... |
| [STYLE_GUIDE.md](STYLE_GUIDE.md) | Estilo de código: TypeScript, nomenclatura, commits, i18n |
| [DESIGN.md](DESIGN.md) | Design system: identidade, paleta, motion, componentes |
| [RESEARCH.md](RESEARCH.md) | Pesquisas técnicas com conclusões e status |

### Qualidade e segurança

| Documento | Conteúdo |
| --- | --- |
| [TESTING.md](TESTING.md) | Estratégia de testes: unit (bun), integração, E2E (Playwright) |
| [QA_TESTING.md](QA_TESTING.md) | Processo de QA: matrix de dispositivos, QA hostil, smoke |
| [CODE_REVIEW.md](CODE_REVIEW.md) | Processo de review de PR: checklist, gates, CODEOWNERS |
| [SECURITY_REVIEW.md](SECURITY_REVIEW.md) | Review de segurança zero-trust + gates SAST/DAST |
| [PERFORMANCE.md](PERFORMANCE.md) | Budgets de performance e Web Vitals |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Acessibilidade WCAG 2.1 AA |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Tratamento de erros: TankError, boundaries, Sentry |
| [SEO.md](SEO.md) · [AEO.md](AEO.md) · [GEO.md](GEO.md) · [AIO.md](AIO.md) | Descoberta: busca tradicional e motores de IA |
| [ANALYTICS.md](ANALYTICS.md) | Métricas de produto e técnica (KPIs, Prometheus, Codecov) |
| [COMPLIANCE.md](COMPLIANCE.md) | LGPD/GDPR, licenças, privacidade, auditorias |

### Operação

| Documento | Conteúdo |
| --- | --- |
| [SETUP.md](SETUP.md) | Instalação do ambiente do zero |
| [ONBOARDING.md](ONBOARDING.md) | Onboarding de novos devs (ordem de leitura, primeiras tarefas) |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Rotina de desenvolvimento dia a dia |
| [TASK_BREAKING_DOWN.md](TASK_BREAKING_DOWN.md) | Como quebrar épicos em tarefas de sprint |
| [PREVIEW_DEPLOYMENT.md](PREVIEW_DEPLOYMENT.md) | Deploys de preview e ambiente local de produção |
| [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md) | Deploy de produção: release assinada, preflight, rollback |
| [MONITORING.md](MONITORING.md) | Observabilidade em produção: Sentry, OTel, Grafana, alertas |
| [BACKUP_DR.md](BACKUP_DR.md) | Backup e recuperação de desastres |
| [ITERATION.md](ITERATION.md) | Processo de iteração: sprints, retro, melhoria contínua |
| [MEMORY.md](MEMORY.md) | Memória institucional: decisões, aprendizados, armadilhas |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões (formato e resumo) |

## Documentação pré-existente (não duplicada aqui)

| Arquivo | Papel |
| --- | --- |
| `../AGENTS.md` | **Contrato de trabalho dos agentes** — fluxo Issue → PR → gate, GRAFT-FIRST |
| `../ARCHITECTURE.md` | Arquitetura detalhada por fase (canônico) |
| `../ENGINEERING-STANDARDS.md` | Padrões de implementação (17 seções) |
| `../KPI-FORMULAS.md` | Fórmulas reproduzíveis de métricas |
| [ARCHITECTURE-MODULES.md](ARCHITECTURE-MODULES.md) | Catálogo de apps + feature flags |
| [RBAC.md](RBAC.md) · [RLS.md](RLS.md) | Matriz de permissões e segurança por linha |
| [SECRETS.md](SECRETS.md) · [SECURITY-GATE.md](SECURITY-GATE.md) | Gestão de segredos e gate de deploy |
| [OBSERVABILITY.md](OBSERVABILITY.md) | Error reporting + tracing (detalhe) |
| [ISSUES-BACKLOG.md](ISSUES-BACKLOG.md) | Issues prontas (title/body/labels) |
| [HANDOFF.md](HANDOFF.md) | Handoff de engenharia v1.2.0 |
| [disaster-recovery.md](disaster-recovery.md) · [incident-response.md](incident-response.md) | Runbooks DR/IR |
| [uml/UML.md](uml/UML.md) | Diagramas UML |
| `../SPRINT.md` · `../worklog.md` · `../DECISOES.md` | Sprint atual, log multi-agente, decisões |

## Instruções de manutenção

1. **Atualização por PR:** todo PR que muda comportamento atualiza o doc correspondente na mesma entrega.
2. **Data e versão:** ao editar, atualize a linha `> Atualizado:` do cabeçalho.
3. **Novo doc:** use o modelo de cabeçalho padrão (Título · Tipo · Versão · Data · Dono) e adicione ao índice acima.
4. **Doc morto:** se um doc não reflete mais a realidade e não há dono para atualizá-lo, sinalize no topo com `> ⚠️ DESATUALIZADO` em vez de apagar.
5. **Idioma:** prosa em pt-BR; código, identificadores e comandos em inglês.
