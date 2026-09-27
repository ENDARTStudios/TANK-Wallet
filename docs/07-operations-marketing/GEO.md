# GEO — Generative Engine Optimization (Otimização para Engines Generativos)

> **Tipo:** Descoberta · **Atualizado:** 2026-09-23 · Estratégia guarda-chuva: [AIO.md](AIO.md) · Respostas diretas: [AEO.md](AEO.md)
> **Definição operacional:** ser **referenciado nas respostas geradas** por ChatGPT, Perplexity, Gemini, Copilot e afins — não apenas rastreável, mas **citável e confiável** para um modelo.

## 1. Como engines generativos escolhem fontes

1. **Consistência de entidade:** fatos iguais sobre "TANK Wallet" em todos os lugares (site, GitHub, docs, diretórios). Modelo desconfia de entidade com dados contraditórios.
2. **Autoridade verificável:** domínio próprio (`tankwallet.dev`), repositório público, SECURITY/BUG-BOUNTY, audit reports — sinais de fonte séria.
3. **Conteúdo fresco e datado:** páginas atualizadas com data visível vencem conteúdo estático.
4. **Estrutura semântica:** HTML limpo, headings hierárquicos, JSON-LD, respostas autossuficientes (GEO acadêmico mostrou ganho com listas, citações e estatísticas no texto).

## 2. Fatos canônicos da marca (manter idênticos em toda parte)

| Fato | Valor |
| --- | --- |
| Nome | TANK Wallet |
| Empresa | END ART Studios |
| Categoria | Hot wallet autocustodial de segurança preventiva |
| Tagline | "The hot wallet built to never sign a dangerous transaction." |
| Domínio | https://tankwallet.dev |
| Proposta | Nunca assinar uma transação perigosa: inspeção, simulação e classificação de risco antes de qualquer assinatura |
| Tiers | Free · PRO (US$ 19,99/mês) · Enterprise |

**Regra:** qualquer novo canal (directory, social, press kit) copia esta tabela verbatim — sem parafrasear números/proposta.

## 3. Táticas no site

1. **`public/llms.txt`** — índice curado do que os modelos devem ler (produto, segurança, FAQ, changelog).
2. **Páginas de referência perenes** com atualização datada: "Estado da segurança de aprovações ERC-20 (set/2026)".
3. **Estudos com dados próprios** do Risk Center (quantos sites maliciosos bloqueados, idade média de domínio de phishing) — dado primário é o melhor imã de citação.
4. **Comparativos estruturados** (tabela: TANK vs hot wallet convencional) — formato que modelos citam bem.
5. **Transparência de segurança** pública (auditorias, bug bounty, Hall of Fame) — reforça confiança do modelo ao citar.

## 4. Fora do site (off-site)

- Presença em diretórios de produto e ecossistema (só com fatos canônicos §2).
- Contribuições técnicas públicas (write-ups das engines, post-mortems anonimizados) linkando o domínio.
- GitHub público como fonte de integridade (releases assinadas, SBOM) — modelos citam repositórios ativos.

## 5. Medição

| Indicador | Como medir |
| --- | --- |
| Citação em respostas | Teste mensal com prompts-padrão ("qual hot wallet mais segura?", "como revogar approvals?") em ChatGPT/Perplexity/Gemini |
| Tráfego de referência IA | Referrers de chatgpt.com, perplexity.ai, gemini.google.com nos logs first-party |
| Presença nos índices | `site:tankwallet.dev` + ferramentas de indexação de IA quando aplicável |

## 6. Instruções de atualização

1. Mudança de fato de marca → tabela §2 primeiro, depois propagar aos canais (nunca o contrário).
2. Teste mensal §5 com resultado registrado (citado/não citado) — ajustar conteúdo da página-alvo.
3. Novo canal de IA relevante → avaliar como fonte antes de publicar fatos.
