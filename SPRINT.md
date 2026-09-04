# SPRINT.md — Sprint Atual

> **Regra:** não implemente fora do que está neste arquivo. Todo trabalho nasce de uma Issue e termina em um PR com `Closes #N`.

## Sprint 51 — i18n Full 3 Locales (pt-BR / en-US / es-ES)

**Objetivo:** 3 idiomas completos com seletor, leis e termos traduzidos em toda a estrutura.

**Issues mãe:** nova #109 (i18n full)

### Tarefas

#### T1 — i18n Config + Provider + Hook (ALTO)
- **Arquivos:** `src/i18n/config.ts`, `src/i18n/provider.tsx`, `src/i18n/messages/{pt-BR,en-US,es-ES}.json`
- **Ações:**
  - `config.ts`: `LOCALES`, `LOCALE_LABELS`, `localeFromString`, `isSupportedLocale`
  - `provider.tsx`: `I18nProvider` (localStorage `tank:locale` + `navigator.language` fallback), `useI18n` hook
  - `messages`: 70+ chaves cada (common, nav, onboarding, footer, risk, auth, legal, errors)
- **Critério:** `bun test src/i18n 4 pass`, `tsc:0`

#### T2 — LanguageSelector + Layout (ALTO)
- **Arquivos:** `src/components/ui/language-selector.tsx`, `src/app/layout.tsx`
- **Ações:**
  - `language-selector.tsx`: `select` com `LOCALES` + `labels` + `compact` prop
  - `layout.tsx`: `I18nProvider` envolvendo app + `LanguageSelector compact` fixed `right-3 top-3`
- **Critério:** seletor visível em todas as rotas, `lang` attribute atualiza, `tsc:0`

#### T3 — Footer + Leis/Termos Traduzidos (MÉDIO)
- **Arquivos:** `src/components/wallet/wallet-footer.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`
- **Ações:**
  - `wallet-footer.tsx`: `useI18n` + `t('footer.*')` + `v1.2.1`
  - `terms/page.tsx` + `privacy/page.tsx`: `CONTENT` por `locale` + `useI18n`, sempre com `Copyright © 2026 END ART Studios`
- **Critério:** footer traduz `Termos/Terms/Términos`, `Privacidade/Privacy/Privacidad`, `tsc:0`

#### T4 — Onboarding Aceite Obrigatório (MÉDIO)
- **Arquivos:** `src/components/wallet/onboarding/onboarding.tsx`
- **Ações:**
  - `Checkbox` + `acceptedTerms` state + validação em `finalize()` + `localStorage tank:termsAccepted`
- **Critério:** sem aceite → erro + botão desabilitado

### Definição de pronto (DoD)

- [ ] `src/i18n/*` + `language-selector` + `footer` + `terms`/`privacy` + `onboarding` com `t()` e `Checkbox`
- [ ] `bun run lint:0 errors` `bunx tsc --noEmit:0` `bun test src/i18n:4 pass`
- [ ] Seletor em `layout.tsx` visível, footer com `Copyright © 2026 END ART Studios` em `pt-BR`/`en-US`/`es-ES`
- [ ] `LICENSE` proprietário + `docs/TERMS-OF-SERVICE.md` `docs/PRIVACY-POLICY.md` alinhados
