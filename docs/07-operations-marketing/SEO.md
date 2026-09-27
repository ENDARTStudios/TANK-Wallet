# SEO — Estratégia de Busca Tradicional

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Gate: Lighthouse SEO ≥ 0.9 no CI
> Extensões para motores de IA: [AEO.md](AEO.md) (respostas) · [GEO.md](GEO.md) (engines generativos) · [AIO.md](AIO.md) (guarda-chuva).

## 1. Fundamentos já implementados

| Item | Implementação |
| --- | --- |
| `robots.txt` | `src/app/robots.ts` |
| `sitemap.xml` | `src/app/sitemap.ts` |
| Metadata API (title, description, canonical, OG) | `src/app/layout.tsx` + por página |
| Open Graph image | `public/og.png` (1200×630) |
| PWA manifest | `public/manifest.json` |
| HSTS + headers de segurança | `next.config.ts` + Caddy |
| Smoke E2E de descoberta | `e2e/smoke.spec.ts` (home, sitemap, robots, HSTS) |

## 2. Metas por página

- `title` único, ≤ 60 chars, com "TANK Wallet" ao final.
- `description` persuasiva, ≤ 155 chars, mencionando a proposta (zero trust / prevenção).
- `canonical` absoluta para `https://tankwallet.dev`.
- OG + Twitter card em toda página pública.

## 3. Dados estruturados (JSON-LD)

Mínimo por página pública: `SoftwareApplication` (com `offers` Free/PRO), `Organization` (END ART Studios) e `FAQPage` onde houver Q&A (alinhado com [AEO.md](AEO.md)). Validar no Rich Results Test a cada nova página.

## 4. Páginas de destino e palavras-chave

| Página | Intenção de busca |
| --- | --- |
| `/` (home) | "hot wallet segura", "wallet segurança DeFi", "revogar approvals" |
| `/privacy`, `/terms` | consultas de conformidade/due diligence (Enterprise) |
| Blog/docs públicas (futuro) | "como revogar aprovação ERC-20", "o que é approve infinito", "detectar site de phishing" |

Conteúdo editorial segue [CONTENT.md](CONTENT.md); cada peça responde a **uma pergunta real** do usuário.

## 5. Performance como fator de ranking

Core Web Vitals são SEO: LCP < 2.5s, CLS < 0.1, TBT < 200ms ([PERFORMANCE.md](PERFORMANCE.md)). O CI falha se Lighthouse SEO/perf/best-practices/accessibility < 0.9 (`.lighthouserc.json`).

## 6. Auditoria

- Auditoria formal: [audit/SEO-AUDIT.md](audit/SEO-AUDIT.md).
- CLI de referência: OpenSeo (`every-app/open-seo`), Screaming Frog MCP.
- Checklist de PR de página pública: metadata ✔ canonical ✔ JSON-LD ✔ OG ✔ sitemap atualizado ✔ teste smoke ✔.

## 7. Instruções de atualização

1. Nova página pública: atualize `src/app/sitemap.ts` e adicione smoke/assert de metadata.
2. Mudança de domínio/URLs: 301 + atualizar canonical + resubmeter sitemap.
3. Auditoria SEO a cada release minor; achados viram issues com label `seo`.
