# AEO — Answer Engine Optimization (Otimização para Motores de Resposta)

> **Tipo:** Descoberta · **Atualizado:** 2026-09-23 · Estratégia guarda-chuva: [AIO.md](AIO.md) · Base técnica: [SEO.md](SEO.md)
> **Definição operacional:** fazer o TANK Wallet ser **a resposta citável** quando alguém pergunta sobre segurança de carteira em buscadores com respostas diretas (featured snippets, People Also Ask, assistentes).

## 1. Objetivo mensurável

Ser a fonte respondida/citada para perguntas do domínio: "como revogar aprovação ERC-20", "o que é approve infinito", "como saber se um site é phishing de wallet", "carteira mais segura para DeFi".

## 2. Princípios de conteúdo citável

1. **Resposta na primeira seção** (40-60 palavras, autossuficiente) — depois aprofundar. Engines extraem o primeiro bloco de resposta.
2. **Uma pergunta por página/seção** — título como pergunta real (`H2` em forma de pergunta).
3. **Formatos extraíveis:** passos numerados para how-to, tabela para comparações, definição de 1 frase para "o que é".
4. **Especificidade com prova:** números e datas ("771M USD perdidos em phishing em 2024" com fonte) são citados mais que adjetivos.
5. **Dados primários:** estatísticas próprias do Risk Center (bloqueios, detecções) são o diferencial — engines preferem fonte original.

## 3. Implementação técnica (Next.js)

| Item | Onde |
| --- | --- |
| `FAQPage` JSON-LD nas páginas com Q&A | `src/app/**/page.tsx` + [SEO.md](SEO.md) §3 |
| `SoftwareApplication` + `Organization` JSON-LD | home + páginas de produto |
| Resumos executivos no topo (`abstract` visível) | template de conteúdo ([CONTENT.md](CONTENT.md) §4) |
| `llms.txt` na raiz (mapa de conteúdo para motores de IA) | `public/llms.txt` — manter atualizado |
| Metadata por página (title/description como resposta) | `src/app/layout.tsx` + páginas |
| Sitemap atualizado | `src/app/sitemap.ts` |

## 4. Perguntas-semente (backlog inicial de conteúdo)

1. Como revogar aprovações (approvals) de tokens ERC-20?
2. O que é approve infinito e por que é perigoso?
3. Como identificar um site de phishing de carteira?
4. O que faz um `setApprovalForAll` e como revogar?
5. O que é Permit2 e quais riscos cria?
6. Como funciona o lockdown de emergência de uma carteira?
7. Como verificar se um contrato tem `delegatecall`/`selfdestruct`?

Cada resposta usa o vocabulário oficial de produto ([CONTENT.md](CONTENT.md) §2) e termina com a ação no produto ("no TANK Wallet: Permission Manager → Revogar").

## 5. Validação

- [ ] Página nova de conteúdo: resposta direta no primeiro bloco ✔ JSON-LD FAQ ✔ pergunta no H2 ✔.
- [ ] Teste mensal manual: rodar as perguntas-semente em Google/Bing/Perplexity e registrar se somos citados (planilha/spreadsheet do time).
- [ ] Rich Results Test sem erro no JSON-LD.

## 6. Instruções de atualização

1. Nova pergunta frequente (suporte/Risk Center) → entra na lista §4 + vira conteúdo.
2. Achado de citação/ausência no teste mensal → ajustar o bloco de resposta da página correspondente.
3. Coordenar com [GEO.md](GEO.md) (mesma base de conteúdo, ângulos diferentes).
