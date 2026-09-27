# ACCESSIBILITY — Acessibilidade (WCAG 2.1 AA)

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Requisito: **FR-UX-03** (PRD) · Gate: Lighthouse accessibility ≥ 0.9.

## 1. Padrão-alvo

**WCAG 2.1 nível AA.** Segurança é o produto; uma carteira que um usuário com deficiência não consegue operar com segurança falhou no objetivo central (ex.: confirmar um dialog de Lockdown por teclado apenas).

## 2. Regras obrigatórias (checklist de PR de UI)

### Percepível
- [ ] Contraste ≥ 4.5:1 (texto normal) e ≥ 3:1 (texto grande/componente) — paleta semântica do [DESIGN.md](DESIGN.md) já calibrada; novos tons precisam de prova.
- [ ] Informação nunca transmitida **só por cor** — todo estado de risco tem ícone + texto (Verificado/Desconhecido/Malicioso).
- [ ] Imagens com `alt` descritivo; decorativas com `alt=""`.

### Operável
- [ ] Toda ação acessível por teclado; ordem de tabulação lógica.
- [ ] Foco **sempre visível** (nunca `outline: none` sem substituto).
- [ ] Dialogs (Radix) prendem foco e fecham com `Esc` — confirmar em dialogs críticos (Lockdown).
- [ ] Alvo de toque ≥ 44×44px em mobile (375px).

### Compreensível
- [ ] `aria-label`/`aria-live` em ícones-only e status assíncronos (scans, progresso de revogação).
- [ ] Mensagens de erro claras, sem jargão cripto quando o usuário é retail.
- [ ] Idioma da página declarado (`<html lang>` via i18n pt-BR/en-US/es-ES).

### Robusto
- [ ] HTML semântico antes de `div`/`span`; landmarks (`nav`, `main`, `header`).
- [ ] Nomes acessíveis estáveis para seletores de E2E (`getByRole` no Playwright).

## 3. Motion e vestibular

- `prefers-reduced-motion: reduce` → desligar animações decorativas; manter transições de estado ≤ 200ms sem movimento de tela.
- Nada de parallax/zoom automático; badge LOCKDOWN pulsante precisa de variante estática acessível.

## 4. Verificação

| Instrumento | Frequência |
| --- | --- |
| Lighthouse a11y (≥ 0.9) | Todo PR de UI (CI) |
| Navegação só por teclado no fluxo crítico (onboarding → scan → revogar) | Manual por release |
| Leitor de tela (NVDA/VoiceOver) nos dialogs de segurança | Manual por release minor |
| E2E com `getByRole`/`getByText` | Todo PR (`e2e/*.spec.ts`) |

## 5. Instruções de atualização

1. Novo componente: preencha o checklist §2 no PR (o reviewer cobra).
2. Achado de acessibilidade vira issue com label `a11y` + severidade como bug (não "melhoria").
3. Exceção a qualquer regra aqui exige ADR + compensação equivalente.
