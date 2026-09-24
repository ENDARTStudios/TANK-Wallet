# AIO — AI Optimization (Estratégia Guarda-Chuva de Descoberta por IA)

> **Tipo:** Descoberta · **Atualizado:** 2026-09-23 · Origem: `../AGENTS.md` §8 (SEO/AEO/AIO/GEO como requisito de projeto)
> **Definição:** AIO é a camada que **unifica** [SEO](SEO.md) (buscadores tradicionais), [AEO](AEO.md) (motores de resposta) e [GEO](GEO.md) (engines generativos) numa estratégia só — mesmo conteúdo, três superfícies de descoberta.

## 1. Por que existe

O usuário de carteira pergunta cada vez mais para um assistente de IA antes de procurar no Google. Se o TANK Wallet não existe como resposta/citação, não existe para esse usuário. AIO garante que **uma base de conteúdo** sirva às três superfícies sem trabalho triplo.

## 2. Arquitetura da estratégia

```
Base única de conteúdo (páginas de resposta, dados próprios, fatos canônicos)
   ├─ SEO  → crawlability + ranking      (robots, sitemap, metadata, CWV)
   ├─ AEO  → resposta direta citável    (FAQ schema, resposta-na-1ª-seção)
   └─ GEO  → citação em engines gerados (entidade consistente, llms.txt, autoridade)
```

**Regra prática:** nenhuma página pública é publicada sem servir às três camadas — checklist §5.

## 3. Responsabilidades por doc

| Doc | Superfície | Métrica-chave |
| --- | --- | --- |
| [SEO.md](SEO.md) | Google/Bing (blue links + snippets) | Lighthouse SEO ≥ 0.9; indexação; ranking de perguntas-semente |
| [AEO.md](AEO.md) | Featured snippets / PAA / assistentes | Ser a resposta exibida nas perguntas-semente |
| [GEO.md](GEO.md) | ChatGPT/Perplexity/Gemini | Citação em respostas geradas; tráfego referral de IA |
| Este doc | Coerência entre os três | Cobertura do checklist §5 em 100% das páginas novas |

## 4. Governança

- Todo PR de página pública passa pelo checklist §5 (o reviewer cobra — faz parte de R10).
- Conteúdo-canonical: fatos de marca em [GEO.md](GEO.md) §2; vocabulário em [CONTENT.md](CONTENT.md) §2 — nunca divergir.
- Métricas de descoberta (testes mensais AEO/GEO) entram no ritual de release ([ANALYTICS.md](ANALYTICS.md) §6).
- Ferramentas de referência: OpenSeo (`every-app/open-seo`), Screaming Frog MCP.

## 5. Checklist de publicação (página/conteúdo público novo)

**Base SEO**
- [ ] `title` + `description` únicos; `canonical` absoluta; no `sitemap.ts`.
- [ ] OG image; robots correto; Core Web Vitals no budget.

**Camada AEO**
- [ ] Primeiro bloco responde a pergunta em ≤ 60 palavras.
- [ ] Pergunta no `H2`; passos numerados/tabela onde couber.
- [ ] `FAQPage` JSON-LD se há Q&A; Rich Results Test verde.

**Camada GEO**
- [ ] Fatos da marca idênticos aos canônicos ([GEO.md](GEO.md) §2).
- [ ] Data de atualização visível; dados com fonte.
- [ ] `llms.txt` atualizado se a página é de referência.

## 6. Ciclo de melhoria (mensal)

1. Rodar perguntas-semente ([AEO.md](AEO.md) §4) em Google + 2 engines generativos.
2. Registrar citado/não-citado por página-alvo.
3. Ajustar o bloco de resposta da página que falhou (uma mudança por vez).
4. Revisar referrers de IA nos logs first-party; crescimento = estratégia funcionando.

## 7. Instruções de atualização

1. Nova superfície de IA relevante (novo engine dominante) → avaliar se vira camada própria ou entra em GEO.
2. Mudança nos fatos canônicos → propagar na ordem: GEO §2 → site → canais externos.
3. Este doc define o checklist; mudanças de checklist exigem entrada em `../DECISOES.md` (afeta todo PR de página).
