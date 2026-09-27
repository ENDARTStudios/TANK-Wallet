# Auditoria SEO / AEO / AIO / GEO — TANK Wallet (Sprint 5)

> Base: `src/app/layout.tsx:17` `src/app/robots.ts:1` `src/app/sitemap.ts:1` · `AGENTS.md:8`

## Checklist técnico

| Item | Status | Evidência |
| --- | --- | --- |
| `title` | ✅ | `src/app/layout.tsx:22` `title default/template` |
| `description` | ✅ | `src/app/layout.tsx:23` |
| `canonical` | ✅ | `src/app/layout.tsx:27` `alternates.canonical` `metadataBase: baseUrl` |
| `robots.txt` | ✅ | `src/app/robots.ts:1` `allow /` `disallow /api/,/_next/` `sitemap: base/sitemap.xml` (removeu `public/robots.txt` duplicado) |
| `sitemap.xml` | ✅ | `src/app/sitemap.ts:1` `/` + `/#security` |
| Open Graph | ✅ | `src/app/layout.tsx:30` `openGraph pt_BR` `og.png` |
| Twitter | ✅ | `src/app/layout.tsx:38` `summary_large_image` |
| JSON-LD | ✅ | `src/app/layout.tsx:43` `SoftwareApplication` `END ART` |
| `metadataBase` | ✅ | `src/app/layout.tsx:20` `new URL(baseUrl)` |
| `robots index/follow` | ✅ | `src/app/layout.tsx:42` |

## Descoberta (Google consegue descobrir e entender?)

- `view-source` contém `canonical` + `og:title` + `application/ld+json` ✅
- `sitemap.xml` acessível em `base/sitemap.xml` com `lastModified` ✅
- `robots.txt` não bloqueia `/` por engano (`Allow` + `Disallow` específico) ✅
- Sem `noindex` acidental ✅

## Ferramentas recomendadas (ver `AGENTS.md:8`)

- `every-app/open-seo` + `Screaming Frog MCP` + `free-for-dev`/`public-apis`/`awesome` — rodar em próximo PR de SEO
- Lighthouse SEO 100 esperado (metas já no `layout.tsx`)

## Achados

- `og.png` referenciado mas não existe em `public/` (só `logo.svg`) — criar `public/og.png` 1200x630 em próximo PR (BAIXO)
- Sem `manifest.json` PWA — não requerido agora
