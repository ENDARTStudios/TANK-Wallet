# Plano de Limpeza — por Risco/Impacto

> Skill Limpeza (`AGENTS.md:9`). Gerado em Sprint 4.

## Alto risco / Alto impacto
- [ ] `docs/security/pgp-private-key-DELETE-ME.asc` — **removido em Sprint 1** (ver `b8be531`)
- [ ] `.env` versionado — **removido em Sprint 1** (`git rm --cached`)
- [ ] `gsap-public/` — 3 cópias (esm, minified, public) com warnings ESLint; avaliar mover para `public/` ou CDN

## Médio risco / Médio impacto
- [ ] `next.config.ts: typescript.ignoreBuildErrors` — **corrigido Sprint 2** (`false`), `reactStrictMode:true`
- [ ] `src/middleware.ts` → `src/proxy.ts` — **migrado Sprint 2/3** (Next 16 deprecation)
- [ ] `public/robots.txt` estático vs `src/app/robots.ts` — **removido Sprint 4**, deixado App Router gerar
- [ ] `db/custom.db` — 139k SQLite com dados de teste; backup em `docs/disaster-recovery.md`, rotação em Sprint 4 (Postgres)

## Baixo risco / Baixo impacto (próximos sprints)
- [ ] Duplicação `wallet-*` (15 pacotes) → `src/features/` alvo (ver `ARCHITECTURE-MODULES.md`)
- [ ] `console.log` em `src/lib/observability/logger.ts` — mascarar segredos já feito, mas auditar
- [ ] `TODO`/`FIXME` — `grep -r TODO src/` (0 achados em 2026-08-26)
- [ ] `knip` — instalar `knip` e rodar `bunx knip` para órfãos (dependências não usadas, exports não usados)
- [ ] `sharp` 0.34 — verificar se necessário para `next/image` ou remover se não usa imagem otimizada

## Métricas
- Executar `bunx knip` + `bunx depcheck` no próximo `chore` PR e anexar relatório em `reports/`.
- Gate: sem `console.log` em `src/`, sem `TODO` sem issue linkada.
