# CONTENT — Diretrizes de Conteúdo

> **Tipo:** Produto · **Atualizado:** 2026-09-23 · i18n: pt-BR (default) · en-US · es-ES (`src/i18n/config.ts` + `messages/`)

## 1. Tom de voz

**Seguro, claro, direto — sem FUD e sem jargão gratuito.**

- Falar de risco com precisão: "este contrato permite `delegatecall`, que pode mover fundos sem nova aprovação" — não "CUIDADO!!! SCAM!!!".
- Usuário retail precisa entender o perigo em 1 frase; operador diligente quer o detalhe técnico. Dar os dois (resumo → detalhe).
- Nunca prometer garantia absoluta ("impossível ser hackeado") — o produto é **redução de risco**.
- Inglês para termos técnicos padrão (approve, spender, calldata) mesmo em pt-BR; explicar na primeira ocorrência para retail.

## 2. Vocabulário de produto (consistência de marca)

| Conceito | Termo oficial |
| --- | --- |
| Ação de emergência | **Lockdown** (L1 Block Signatures → L4 Migrate) |
| Verificação de DApp | **DApp Shield** — estados Verificado / Desconhecido / Malicioso |
| Saúde da carteira | **Wallet Health** (score 0-100) |
| Central de riscos | **Risk Center** |
| Revogação de permissões | **Permission Manager** / **Sovereignty Center** |
| Postura de segurança | `ZERO TRUST SECURITY` (sempre caixa alta na marca) |

## 3. UI copy

- Botões: verbo + objeto ("Revogar aprovação", não "OK").
- Estados assíncronos: sempre dizer o que está acontecendo ("Analisando bytecode…", "Revogando 3 aprovações…").
- Erros: o que aconteceu + o que fazer (ver [ERROR_HANDLING.md](ERROR_HANDLING.md)).
- Confirmações destrutivas (Lockdown, L4 Migrate): warning específico do nível com tempo estimado real.
- Chaves de i18n novas entram nos **3 locales simultaneamente** (14 chaves base em `messages/*.json`).

## 4. Conteúdo público (site/blog/FAQ)

- Cada peça responde **uma pergunta real** (ex.: "como revogar approve infinito?") — também alimenta [AEO.md](AEO.md)/[GEO.md](GEO.md).
- Estrutura: resposta direta na primeira seção → passo-a-passo → contexto técnico → CTA.
- Dados e claims: datar ("dados de set/2026") e citar fonte (GoPlus, chain analytics).
- Nunca publicar endereço de carteira de usuário real em exemplo — usar endereços de teste/known-contratos.

## 5. Changelog e anúncios

- Changelog técnico: ver formato em [CHANGELOG.md](CHANGELOG.md) (rastreio, não marketing).
- Anúncio de release: template em [RELEASE-ANNOUNCEMENT-v1.2.1.md](RELEASE-ANNOUNCEMENT-v1.2.1.md) — o que mudou para o usuário, em 3 bullets + link ao changelog.
- Aviso de segurança: canal dedicado, tom sóbrio, com ação imediata ("revogue X, execute L3").

## 6. Assets

- OG image: `public/og.png` (1200×630) com identidade da marca ([DESIGN.md](DESIGN.md)).
- Screenshots de UI: sempre do tema dark com dados de demonstração.

## 7. Instruções de atualização

1. Novo termo de produto: adicione à tabela §2 antes de usar na UI.
2. Nova chave de i18n: 3 locales no mesmo PR; sem tradução esquecida.
3. Peça pública nova: checklist de SEO/AEO ([SEO.md](SEO.md) §6) antes de publicar.
