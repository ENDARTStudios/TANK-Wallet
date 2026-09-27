# QA_TESTING — Processo de QA

> **Tipo:** Qualidade · **Atualizado:** 2026-09-23 · Relatórios: [audit/QA-REPORT.md](audit/QA-REPORT.md) · Estratégia de testes: [TESTING.md](TESTING.md)

## 1. Papel do QA no fluxo

QA aqui é **contínuo e embutido no CI** (E2E, Lighthouse, DAST, fuzzing) + **hostil manual** por release. Não existe "fase de QA" após o desenvolvimento — existe gate por PR e bateria por release.

## 2. Matrix de dispositivos (mínimo de execução)

| Perfil | Onde | Verificação principal |
| --- | --- | --- |
| Desktop (chromium) | Playwright CI | Fluxo completo + teclado |
| Mobile 375px | Playwright CI | Sem overflow horizontal; teclado não cobre form; alvo de toque ≥ 44px |
| Tablet 768px | Playwright CI | Layout adaptado (sidebar/toolbar) |
| Mobile real (PWA) | Manual por release minor | Manifest, offline fallback (`sw.js`), push |

## 3. Fluxos críticos (nunca regressam)

1. Onboarding: criar carteira (BIP-39) → senha → protegida.
2. Scan: contrato real (bytecode via RPC) + score + findings.
3. DApp Shield: verificado/desconhecido/malicioso com WHOIS real.
4. Permissões: listar → revogar individual → revogar tudo (PRO).
5. Lockdown: L1→L4 com confirmação, execução animada e estado na UI.
6. Histórico: linha do tempo unificada com eventos.
7. Billing PRO: checkout Stripe (sandbox) + webhook assinado.

## 4. QA hostil (manual, por release)

Tentar **quebrar** a funcionalidade:

- Campos: vazio, texto gigante, emoji, colado de fontes estranhas.
- Timing: duplo clique, duplo submit, duas abas concorrentes, sessão expirando no meio da ação.
- Rede: API 500, timeout de RPC, offline (PWA fallback).
- Segurança: acessar dado de outra conta, rota admin como viewer, API sem sessão.
- **Regra:** todo bug achado vira teste reprodutível antes da correção ([TESTING.md](TESTING.md) §6).

## 5. Bateria de release (antes de promover)

- [ ] `bun run verify` 11/11 ✅ (ambiente limpo).
- [ ] E2E completo verde (incluindo os fluxos §3).
- [ ] Lighthouse 4 categorias ≥ 0.9 em desktop+mobile.
- [ ] DAST baseline ZAP sem novo crítico/alto.
- [ ] QA hostil executado e achados triados.
- [ ] Restore de backup testado ([BACKUP_DR.md](BACKUP_DR.md) drill).
- [ ] Checklist de release: [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md).

## 6. Triagem de defeitos

| Severidade | Critério | Ação |
| --- | --- | --- |
| S1 Blocker | Perda/fuga de fundos ou dados; segurança bypass | Release parado; hotfix |
| S2 Crítico | Fluxo crítico quebrado (§3) | Corrigir antes do release |
| S3 Maior | Funcionalidade degradada com workaround | Issue com sprint alvo |
| S4 Menor | Cosmético/UX | Backlog |

Todo defeito registrado com: passos, evidência (screenshot/vídeo do Playwright), ambiente (device/build), severidade.

## 7. Instruções de atualização

1. Novo fluxo crítico em produto → adicione à lista §3 + spec E2E.
2. Novo achado recorrente do QA hostil → virar teste automatizado (deixa de ser manual).
3. Release executada → anexar resultado da bateria §5 ao PR de release + QA-REPORT quando formal.
