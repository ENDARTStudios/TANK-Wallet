# Tank Wallet — Engineering Standards

> **Documento normativo para toda implementação na série 1.x.**
> Substitui qualquer convenção informal anterior. Em caso de conflito com
> outros documentos, **este prevalece para decisões de engenharia**.
>
> Status: **Ativo a partir de Architecture Frozen 1.0**
> Mantenedor: Engineering Lead
> Revisão: obrigatória a cada mudança de minor (1.x.0)

---

## 0. Propósito e Escopo

A arquitetura está congelada (Architecture Frozen 1.0). O backlog passa a ser
**exclusivamente de engenharia**: nenhum novo componente estrutural pode ser
adicionado durante a série 1.x.

Este documento existe para:

1. **Reduzir variabilidade** entre implementações executadas por pessoas
   diferentes, em momentos diferentes, em engines diferentes.
2. **Preparar o terreno para auditoria independente** — um auditor precisa
   conseguir navegar no repositório e entender as regras sem perguntar a ninguém.
3. **Transformar qualidade em processo** — não em boa vontade. Qualidade
   precisa ser verificável, automática e bloqueante quando necessário.
4. **Garantir reprodutibilidade** — qualquer build, qualquer teste, qualquer
   métrica precisa poder ser reproduzida por um terceiro com acesso ao repo.

O escopo cobre todo código que vive dentro de `src/`, `scripts/`, `prisma/`,
`examples/` e qualquer diretório futuro que entre no build de produção.

---

## 1. Convenções de Código

### 1.1 Linguagem e Versão

- **TypeScript** strict mode, sem `any` em código de produção.
- `tsconfig.json` com `"strict": true`, `"noUncheckedIndexedAccess": true`,
  `"exactOptionalPropertyTypes": true`.
- Target: ES2022. Module: ESNext. ModuleResolution: Bundler.
- **Zero `// @ts-ignore`** em código de produção. `// @ts-expect-error` é
  permitido apenas com referência ao issue que o justifica.
- **Zero `as unknown as T`** sem justificativa escrita em comentário adjacente.

### 1.2 Estilo

- ESLint config oficial Next.js + regras adicionais obrigatórias:
  - `no-console` em produção (apenas `logger` estruturado, ver §6).
  - `no-floating-promises` — todo `Promise` deve ser `await`-ed ou `.catch`-ed.
  - `require-await` — async sem await é erro.
  - `eqeqeq` estrito.
  - `no-implicit-coercion`.
- Prettier: 2 espaços, sem ponto-e-vírgula, aspas simples, trailing comma `all`,
  printWidth 100.
- Importes ordenados: `builtin → external → internal → relative → type`.
- **Tamanho máximo de arquivo: 500 linhas.** Acima disso, decompor.

### 1.3 Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivo de componente React | `kebab-case.tsx` | `threat-intel-view.tsx` |
| Arquivo de módulo lib | `kebab-case.ts` | `key-management.ts` |
| Componente React | `PascalCase` | `ThreatIntelView` |
| Função / variável | `camelCase` | `simulateTransaction` |
| Constante | `SCREAMING_SNAKE_CASE` | `MAX_RPC_RETRIES` |
| Tipo / Interface | `PascalCase` | `SecurityContext` |
| Enum | `PascalCase` + membros `PascalCase` | `enum Posture { Normal, Elevated }` |
| Hook | `useCamelCase` | `useSecurityScore` |
| Test file | `*.test.ts` ou `*.spec.ts` ao lado do fonte | `policy.test.ts` |
| Snapshot | `__snapshots__/foo.test.snap` | — |

### 1.4 Estrutura de Arquivos por Engine

Cada engine segue o mesmo esqueleto (contrato congelado em
`SecurityEngine` interface):

```
src/lib/wallet-engines/<engine>/
├── index.ts          # exports públicos
├── engine.ts         # classe implementando SecurityEngine
├── types.ts          # tipos do domínio
├── constants.ts      # constantes (limites, pesos)
├── validators.ts     # schemas zod
├── errors.ts         # erros tipados do domínio
└── __tests__/
    ├── engine.test.ts
    ├── engine.fuzz.test.ts
    ├── engine.property.test.ts
    ├── vectors.test.ts        # vetores oficiais (quando aplicável)
    └── __snapshots__/
```

### 1.5 Proibições Absolutas

- ❌ `TODO`, `FIXME`, `HACK`, `XXX` em código mergeado para `main`. Sempre
  abrir issue e referenciá-lo no commit, não no código.
- ❌ Stubs que retornam valores fake (ex.: `return 0.95 as ThreatScore`).
- ❌ Mocks em arquivos que não sejam `*.test.ts` ou `*.mock.ts`.
- ❌ `console.log`, `console.error`, `console.warn` em produção.
- ❌ Comentários explicando o óbvio (`// incrementa i`). Comentários explicam
  **por que**, nunca **o quê**.
- ❌ Branches mortas (`if (false)`, feature flags removidas sem limpeza).
- ❌ `eslint-disable` sem comentário justificando o porquê e até quando.

---

## 2. Definição de APIs

### 2.1 Princípio

Toda API interna é uma **fronteira contratual**. Mudar uma assinatura é tão
caro quanto mudar uma tabela no banco — deve ser feito com cuidado,
versionamento e migração.

### 2.2 Contratos

- Toda função pública tem **tipos explícitos** em todos os parâmetros e no
  retorno. Inferência é permitida apenas em funções privadas internas a um
  arquivo.
- Toda input de API (função exposta no `index.ts` de um engine) é validada
  por **schema zod** antes de processar. Falha na validação = erro tipado,
  nunca `throw new Error("invalid input")`.
- Toda API expõe seus erros como **union de tipos discriminados**, nunca como
  `Error` genérico.

```typescript
// ✅ correto
export type SimulateResult =
  | { ok: true; stateDiff: StateDiff; gas: bigint }
  | { ok: false; error: SimulationError; reason: string };

// ❌ proibido
export function simulate(input: unknown): Promise<any> { ... }
```

### 2.3 Versionamento de API

- APIs internas usam **versionamento por arquivo**: `v1/`, `v2/` quando há
  breaking change. A versão antiga permanece marcada `@deprecated` por uma
  minor release e é removida na major seguinte.
- APIs HTTP (rotas Next.js `/api/...`) seguem SemVer na URL para breaking
  changes: `/api/v1/threats/...`.
- Adicionar campo opcional a uma response = minor. Remover campo = major.
  Mudar tipo de campo = major.

### 2.4 Documentação de API

- Toda função pública tem **doc comment** no formato TSDoc com:
  - Descrição de uma linha
  - `@param` para cada parâmetro
  - `@returns` com tipo e descrição
  - `@throws` para erros tipados esperados
  - `@example` para casos não triviais
- APIs HTTP expostas em `/api-docs/openapi.yaml` (gerado a partir de schemas
  zod via `zod-to-openapi`).

### 2.5 Contratos com o Kernel

O Security Kernel orquestra engines via `SecurityEngine` interface. Esse
contrato está **congelado** (Architecture Frozen 1.0) e **não pode ser alterado**
durante a série 1.x. Qualquer necessidade de mudança é candidata a
Architecture Freeze 2.0 e deve ser registrada em `docs/freeze-2-candidates.md`.

---

## 3. Regras de Versionamento

### 3.1 SemVer Estrito

O projeto segue **Semantic Versioning 2.0.0** sem extensões proprietárias.

```
MAJOR.MINOR.PATCH
   1     0     3
```

- **MAJOR**: mudança incompatível. Durante a série 1.x, MAJOR permanece `1`.
  Mudar para `2` só acontece com Architecture Freeze 2.0.
- **MINOR**: nova funcionalidade compatível. Atualiza `package.json#version`,
  incrementa minor do Kernel/TSS/TSF conforme §3.2.
- **PATCH**: correção de bug compatível.

### 3.2 Versionamento Independente por Artefato

| Artefato | Formato | Exemplo |
|----------|---------|---------|
| Architecture | `MAJOR.MINOR` | `1.0` |
| Security Kernel | `MAJOR.MINOR.PATCH` | `1.0.3` |
| TSS (spec) | `MAJOR.MINOR.PATCH` | `1.0.2` |
| TSF (framework) | `MAJOR.MINOR.PATCH` | `1.0.1` |
| Chain Plugins | `MAJOR.MINOR.PATCH` (por plugin) | `ethereum: 1.2.0` |
| Threat Database | `YYYY.MM.DD` | `2026.07.15` |
| IOC Feed | `YYYY.MM.DD.hh` | `2026.07.15.14` |
| UI Components | `MAJOR.MINOR.PATCH` | `1.0.0` |
| Documentation | `MAJOR.MINOR.PATCH` | `1.0.0` |

Cada artefato evolui independentemente. O changelog agrega todas as mudanças.

### 3.3 Branches e Tags

- `main` — sempre verde, sempre deployable, sempre assinada.
- `release/1.x` — branch estável para patches.
- Tags: `v1.2.3` para releases, `kernel-1.0.3`, `tss-1.0.2`, etc.
- **Commits assinados** (GPG ou sigstore) obrigatórios em `main`.

### 3.4 Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`, `security`.

Scopes: `kernel`, `engine:<name>`, `plugin:<chain>`, `ux`, `api`, `db`,
`crypto`, `rpc`, `tests`, `docs`, `ci`.

**Breaking changes**: footer `BREAKING CHANGE: <descrição>` ou `!` após o scope.
Exige bump de major (impossível na série 1.x sem Architecture Freeze 2.0).

---

## 4. Critérios de Testes

### 4.1 Filosofia

> **Cobertura não é qualidade. Cobertura é a ausência mensurável de não-teste.**

O objetivo não é atingir 95% de cobertura. O objetivo é que o sistema se
comporte corretamente em todos os cenários relevantes — incluindo cenários
que ninguém pensou ainda. Por isso, **testes de propriedade e fuzz** têm
peso maior que testes unitários triviais.

### 4.2 Camadas Obrigatórias

| Camada | Ferramenta | Quando | Cobertura Mínima |
|--------|-----------|--------|------------------|
| Unit | `bun test` / `vitest` | Todo commit | 95% (linhas + branches) |
| Property | `fast-check` | Toda função pura crítica | 100% invariantes declaradas |
| Fuzz | `fast-check` | Toda função que recebe input não-confiável | Inputs aleatórios por 60s sem panic |
| Snapshot | `vitest` | Outputs serializáveis estáveis | Toda mudança exige revisão |
| Integration | `vitest` + DB de teste | Por engine, contra deps reais | Fluxo end-to-end do engine |
| E2E | `playwright` | Fluxos de usuário críticos | Login, send, lockdown, recovery |
| Regression | `vitest` | Todo bug fix | Teste reproduz o bug antes do fix |
| Conformance | `vitest` | Todo Chain Plugin | 11 testes × 4 plugins (já existe) |
| Compatibility | `vitest` | Entre versões de plugin | Round-trip v1 → v2 → v1 sem perda |
| Memory | `--expose-gc` + heapdump | Engines com estado | Sem leak após 10k iterações |
| Chaos | script custom | Em staging semanal | Falha de RPC, queda de engine, etc. |

### 4.3 Critérios de Aceite por Camada

#### Unit
- Toda branch pública coberta.
- Todo erro tipado tem teste que o dispara.
- Zero `expect(true).toBe(true)` (teste falso).

#### Property
- Toda função pura com invariantes matemáticos (crypto, scoring, quorum,
  shamir) tem pelo menos 3 invariantes declaradas como testes de propriedade.
- Exemplos de invariantes:
  - `BIP32.fromSeed(seed).derive("m/0").derive("m/0'").fingerprint` é determinístico.
  - `AES-GCM encrypt + decrypt` é involução para qualquer chave e plaintext.
  - `Shamir.combine(threshold, shares[..threshold])` recupera o segredo para
    qualquer segredo e qualquer conjunto de shares.

#### Fuzz
- Toda função que recebe input do usuário (endereço, calldata, URL, mnemonic,
  BIP-32 path) recebe fuzz por no mínimo 60 segundos em CI sem crash.
- Fuzz não verifica corretude — verifica **ausência de crash, panic, hang,
  exceção não-tratada, leak**.

#### Snapshot
- Snapshots são **constatação de estabilidade**, não prova de corretude.
- Toda mudança de snapshot precisa de justificativa no PR.
- Snapshots são regenerados a cada release minor e diff revisado.

#### Integration
- Toda engine tem teste de integração contra **deps reais** (DB, RPC, GoPlus),
  não mocks. Usa-se `docker-compose.test.yml` para subir dependências.
- Mocks em integration test = teste não conta para coverage.

#### E2E
- Fluxos críticos de usuário:
  - Onboarding completo (criar wallet, backup, confirmar)
  - Send real (testnet)
  - Lockdown
  - Recovery via Shamir
  - Revoke permission
- Executam em CI contra `next dev` real + DB de teste isolado.

#### Regression
- Todo bug fix vem com teste que **reproduz o bug antes do fix**.
- Sem teste de regressão, PR é bloqueado.

#### Conformance (Chain Plugins)
- Suite já existe: 11 testes × 4 plugins.
- Plugin novo precisa passar a mesma suite antes de merge.
- Falha em qualquer um dos 11 testes = bloqueio de release.

#### Compatibility
- Round-trip: assinar TX na v1, decodificar na v2, re-assinar na v2, decodificar
  na v1. Resultados devem ser compatíveis ou migrados explicitamente.
- Aplica-se a: formato de vault, formato de audit log, formato de permission
  grant, ABI de plugin.

#### Memory
- Engines com estado interno (Behavior, Audit, Threat Intel cache) executam
  10.000 iterações com `global.gc()` entre elas. Heap final deve estar dentro
  de 110% do heap inicial.
- Heapdump em cada milésima iteração para inspeção em caso de leak.

#### Chaos
- Staging semanal: matar um RPC aleatório, matar um engine aleatório,
  simular latência 10s em uma dependência, simular resposta inválida.
- Sistema deve entrar em Fail-Safe Mode correspondente e continuar operando
  em modo degradado, sem panic nem crash.

### 4.4 Cobertura — Regras

- **Denominador**: linhas e branches em `src/` (exclui `*.test.ts`, `*.mock.ts`,
  `__tests__/`, `examples/`, `scripts/`).
- **Mínimo global**: 95%.
- **Mínimo por engine**: 95%.
- **Mínimo por arquivo de crypto**: 100%.
- **Cobertura de branch**: reportada separadamente, mínimo 90%.
- **Cobertura reportada em CI** via `c8` ou `vitest --coverage`, artefato
  persistido por 90 dias.
- **Diff coverage**: todo PR precisa adicionar testes para ≥90% das linhas
  novas. Abaixo disso, PR bloqueado.

### 4.5 Performance de Testes

- Suite completa em CI: **< 5 minutos**.
- Unit + property: < 60s.
- Integration: < 3min.
- E2E: < 5min (paralelo).
- Fuzz em CI: rodada curta (5s por target). Fuzz extendido (60s+) roda
  noturno em job separado.

---

## 5. Tratamento de Erros

### 5.1 Princípio

> **Erros são tipados, explícitos e tratados no ponto certo. Nunca silenciados.**

Não existe `try { ... } catch (e) { /* ignore */ }` em produção. Não existe
`throw new Error("algo deu errado")` em engine. Erros são valores, não
exceções surpresa.

### 5.2 Hierarquia de Erros

```typescript
// Base — NUNCA instanciada diretamente
abstract class TankError<T extends string> {
  abstract readonly kind: T;
  readonly timestamp: number;
  readonly traceId: string;
  readonly message: string;
  readonly cause?: TankError<unknown>;
  abstract readonly severity: 'low' | 'medium' | 'high' | 'critical';
  abstract readonly userFacing: boolean;
}

// Por engine — todas herdam de TankError
class KeyManagementError extends TankError<'KeyManagementError'> { ... }
class SimulationError extends TankError<'SimulationError'> { ... }
// etc.
```

### 5.3 Regras

1. **Toda função pública** declara seus erros como union de tipos
   discriminados no retorno. Erros são **valores**, não exceptions.
2. **Exceptions são reservadas para** bugs de programação (null dereference,
   type assertion falha, invariantes internos violados). Nunca para fluxo
   de negócio esperado.
3. **Toda exception não-tratada** é capturada pelo Kernel, logada como
   `severity: critical`, e dispara Fail-Safe Mode correspondente.
4. **Erros user-facing** têm mensagem traduzida e action sugerida
   (ex.: "RPC indisponível. Tentando próximo provedor...").
5. **Erros internos** têm `traceId` para correlação no observability stack.
6. **Stack trace** nunca exposto ao usuário. Logado internamente com severidade.

### 5.4 Fail-Safe Modes

Cada engine declara seu Fail-Safe Mode (contrato congelado). Exemplos:

| Engine | Fail-Safe |
|--------|-----------|
| Network | Fallback para próximo RPC; se todos falham, read-only mode |
| Threat Intel | Cache stale + warning; bloqueia transações high-value |
| Simulation | Bloqueia execução; exige confirmação explícita |
| Behavior | Modo conservative; threshold rebaixado |
| Key Management | Zeroiza buffers; exige re-unlock |
| Audit | Buffer local; reflusha quando recupera |
| Recovery | Bloqueia operações até recovery completar |

### 5.5 Proibições

- ❌ `catch (e) { }` vazio.
- ❌ `catch (e) { console.log(e) }` — use logger.
- ❌ `throw new Error(string)` em engine — use erro tipado.
- ❌ Re-throw sem adicionar contexto.
- ❌ Assumir formato de erro desconhecido (`(e as Error).message`).

---

## 6. Política de Logging

### 6.1 Estrutura

Todo log é **JSON estruturado**, uma linha por evento. Campos obrigatórios:

```json
{
  "ts": "2026-07-15T14:23:11.456Z",
  "level": "info",
  "traceId": "01HXYZ...",
  "spanId": "01HXYZ...",
  "engine": "threat-intel",
  "event": "lookup.completed",
  "durationMs": 41,
  "data": { ... },
  "userId": "u_...",
  "sessionId": "s_...",
  "version": "kernel-1.0.3"
}
```

### 6.2 Níveis

| Nível | Uso | Persistência |
|-------|-----|--------------|
| `trace` | Diagnóstico fino, apenas dev | Nunca em prod |
| `debug` | Diagnóstico de desenvolvimento | 24h em staging |
| `info` | Eventos de negócio relevantes | 30 dias |
| `warn` | Condição anormal recuperável | 90 dias |
| `error` | Erro esperado tratado | 1 ano |
| `critical` | Falha de segurança, lockdown, perda de integridade | Retenção indefinida + alerta |

### 6.3 O que NUNCA aparece em log

- Mnemonic, seed, chave privada, qualquer derivada.
- Password ou derivado.
- Token de sessão.
- Endereço IP completo do usuário (mascarar último octeto).
- Calldata que possa conter dados sensíveis (PII).
- Payload completo de requisição — apenas hash + tamanho.

### 6.4 Implementação

- Logger único: `src/lib/observability/logger.ts` (a ser criado).
- Pino ou `@logtape/logger` como backend.
- Em browser: batch + `navigator.sendBeacon` para endpoint `/api/logs`.
- Em server: stream para stdout (container) ou arquivo rotacionado.
- **Sanitização obrigatória**: `sanitizeForLog(payload)` remove campos
  proibidos baseado em schema.

### 6.5 Audit Log (separado do app log)

- Audit log é **append-only, HMAC-signed, tamper-evident** (já especificado
  no Architecture Freeze 1.0).
- Não passa pelo logger geral — tem canal dedicado.
- Replicado em storage WORM (write-once-read-many) quando disponível.

---

## 7. Requisitos de Performance

### 7.1 Filosofia

> **Performance nunca é estimada. É medida.**

Estimativas em PRs não são aceitas. Toda claim de performance vem acompanhada
de benchmark reproduzível em `scripts/bench/<name>.bench.ts`.

### 7.2 Orçamento de Performance (contrato congelado)

| Operação | Alvo | Hard Limit | Medição |
|----------|------|------------|---------|
| Security Check (boot) | 600ms | 1200ms | P95 em cold start |
| Kernel decision pipeline | 100ms | 200ms | P95, exlui network |
| Simulation (eth_call) | 150ms | 400ms | P95 contra mainnet RPC |
| Threat Intel lookup | 50ms | 150ms | P95 com cache hit |
| Threat Intel lookup (cache miss) | 800ms | 2000ms | P95 contra GoPlus |
| Policy evaluation | 10ms | 25ms | P95 |
| Behavior anomaly check | 30ms | 80ms | P95 |
| Network RPC (single call) | 200ms | 800ms | P95 |
| TX signing (EVM) | 20ms | 50ms | P95 |
| TX signing (BTC PSBT) | 50ms | 150ms | P95 |
| Audit append | 5ms | 15ms | P95 |
| UI responsiveness (TBT) | <200ms | 500ms | Lighthouse CI |
| First Contentful Paint | <1.5s | 3s | Lighthouse CI |
| Time to Interactive | <3s | 5s | Lighthouse CI |
| Bundle size (initial JS) | <250KB gzipped | 350KB | Size-limit CI |

### 7.3 Benchmarks

- `scripts/bench/` contém benchmarks para toda operação no orçamento.
- Executam em CI em job separado, resultados publicados como artefato.
- Toda PR que toca um caminho crítico executa o benchmark correspondente.
- **Regressão > 10% em qualquer métrica** bloqueia merge (salvo justificativa
  explícita aprovada por Engineering Lead).

### 7.4 Profiling Contínuo

- Em staging: profiling contínuo com `0x` ou `clinic.js`.
- Heapdump automático a cada 6h para inspeção de leak.
- Flamegraph semanal revisado em Engineering Review.

### 7.5 Memory

- Memória residente do client (browser): < 80MB após 5 min de uso ativo.
- Memória residente do server (Next.js): < 512MB em steady state.
- **Sem leak** após 30 min de uso com 100 operações.

---

## 8. Política de Dependências

### 8.1 Princípio

> **Toda dependência é risco. Toda dependência precisa de justificativa.**

Não se adiciona dependência para evitar escrever 50 linhas. Adiciona-se
dependência quando:
1. A funcionalidade é complexa o suficiente para justificar manutenção
   terceirizada (ex.: crypto, parsing de BIP-32, RPC client).
2. A dependência é **auditorável** (código aberto, mantida, sem supply chain
   obscura).
3. Não existe alternativa interna viável.

### 8.2 Critérios de Aceitação de Dependência

Antes de adicionar uma dependência (em `package.json`), abrir issue
`deps: propose <name>@<version>` contendo:

| Critério | Resposta obrigatória |
|----------|---------------------|
| Licença | MIT / Apache-2.0 / BSD / ISC. Outras requerem aprovação legal. |
| Mantenedor | Pessoa ou organização identificável. |
| Último release | < 12 meses. |
| Downloads semanais | > 1.000 (salvo justificativa). |
| Tamanho bundle | < 50KB gzipped (salvo justificativa). |
| Issues abertas | < 100 ou taxa de resposta do mantenedor > 50%. |
| CVEs conhecidos | 0 críticos não corrigidos. |
| Subdependências | < 20 transitivas. |
| Alternativa considerada | Nome da alternativa rejeitada e por quê. |
| Auditoria | Já auditada por equipe externa? Por quem? |

### 8.3 Lista Permitida (allowlist)

Apenas as seguintes categorias são pré-aprovadas (mas cada versão ainda
passa por verificação):

| Categoria | Biblioteca |
|-----------|-----------|
| Crypto primitives | `@noble/curves`, `@noble/hashes`, `@noble/ed25519`, `@scure/bip32`, `@scure/bip39`, `bitcoinjs-lib`, `ed25519-hd-key` |
| Ethereum | `viem` |
| React framework | `next`, `react`, `react-dom` |
| UI primitives | `@radix-ui/*`, `lucide-react`, `tailwindcss` |
| State / data | `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod` |
| DB | `prisma`, `@prisma/client` |
| Utilities | `clsx`, `tailwind-merge`, `date-fns`, `uuid` |

Qualquer fora desta lista exige aprovação explícita.

### 8.4 Proibições

- ❌ `eval`, `Function`, `vm.runInThisContext`.
- ❌ Dependências com `postinstall` que execute código arbitrário.
- ❌ Dependências com `<script>` no README que não seja documentação.
- ❌ Dependências que importam dinamicamente URL remota.
- ❌ Pinagem por `*` ou `^` em produção — usar `~` ou pin exato em
  `package.json` + `bun.lockb` commitado.

### 8.5 Atualização

- **Renovate** configurado para abrir PRs de update automaticamente.
- Updates de patch: auto-merge após CI verde.
- Updates de minor: revisão manual rápida (5 min).
- Updates de major: revisão obrigatória + testes completos + changelog review.

### 8.6 SBOM

- **SBOM** gerado em CycloneDX format a cada build via `@cyclonedx/cyclonedx-npm`.
- Publicado como artefato de release.
- Comparado com release anterior; diff revisado em release review.

### 8.7 Auditoria Contínua

- `bun audit` em CI, diário.
- `npm ls` para detectar subdependências inesperadas.
- `renovate config-validator` em CI.
- Alertas de CVE críticos bloqueiam deploy automaticamente.

---

## 9. Checklist Obrigatório de Pull Request

> Antes de solicitar review, **todos** os itens abaixo devem estar verificados.
> Reviewer rejeita PR que não atende todos os itens sem nem abrir o diff.

### 9.1 Pré-Condições

- [ ] Branch atualizada com `main` (rebase limpo, sem merge commits).
- [ ] Commit messages seguem Conventional Commits (§3.4).
- [ ] Commits assinados (GPG ou sigstore).
- [ ] Sem `console.log`, `TODO`, `FIXME`, `HACK` (§1.5).
- [ ] Sem `eslint-disable` sem justificativa (§1.5).
- [ ] Sem dependência nova sem issue `deps: propose` aprovado (§8.2).

### 9.2 Código

- [ ] TypeScript strict, sem `any`, sem `as unknown as` (§1.1).
- [ ] Nomenclatura segue convenções (§1.3).
- [ ] Estrutura de diretórios segue esqueleto (§1.4).
- [ ] Arquivos < 500 linhas (§1.2).
- [ ] APIs tipadas, validadas com zod, erros como union (§2.2).

### 9.3 Testes

- [ ] Cobertura global ≥ 95% (CI reporta).
- [ ] Diff coverage ≥ 90% (CI bloqueia).
- [ ] Bugs fix vêm com teste de regressão (§4.2).
- [ ] Funções puras críticas têm property tests (§4.2).
- [ ] Funções com input externo têm fuzz test (§4.2).
- [ ] Engine alterada roda conformance suite (§4.2).
- [ ] Sem testes marcados `.skip` ou `.only`.

### 9.4 Performance

- [ ] Sem regressão > 10% em benchmark tocado (§7.3).
- [ ] Sem aumento de bundle > 5KB gzipped (CI reporta).
- [ ] Operação crítica nova tem benchmark (§7.3).

### 9.5 Segurança

- [ ] Sem segredo hardcodeado (gitleaks em CI).
- [ ] Input de usuário validado com zod (§2.2).
- [ ] Erros tipados, não `throw new Error` (§5).
- [ ] Logging sem dados sensíveis (§6.3).
- [ ] Sem `eval`, `Function`, `dangerouslySetInnerHTML` sem sanitizer.

### 9.6 Documentação

- [ ] Toda função pública tem TSDoc (§2.4).
- [ ] Mudança de API documentada em CHANGELOG.
- [ ] Mudança arquitetural registrada em ADR (Architecture Decision Record).
- [ ] Screenshots/GIFs para mudanças de UI.

### 9.7 CI Verde

- [ ] Lint passa.
- [ ] Type-check passa (`tsc --noEmit`).
- [ ] Testes unit + property + fuzz passam.
- [ ] Testes integration passam.
- [ ] Build de produção passa.
- [ ] Semgrep / CodeQL / Trivy / Gitleaks sem findings novos.
- [ ] Lighthouse CI sem regressão crítica.

### 9.8 Review

- [ ] Pelo menos 1 approval de reviewer com ownership no path.
- [ ] Para alterar engine crítica (Kernel, Key Management, Recovery, Audit):
  2 approvals obrigatórios.
- [ ] Reviewer não aprovar PR próprio.
- [ ] Threads de review resolvidas (não apenas "resolved" — lidas e endereçadas).

---

## 10. Definition of Done (DoD)

> Uma tarefa está "done" quando atende **todos** os critérios abaixo.
> "Quase pronto" = "não pronto".

### 10.1 Para uma Feature

- [ ] Especificação escrita e aprovada antes da implementação.
- [ ] Código implementado seguindo §1-§2.
- [ ] Testes de todas as camadas aplicáveis (§4).
- [ ] Performance medida, sem regressão (§7).
- [ ] Documentação atualizada (TSDoc + ADR se aplicável).
- [ ] CI 100% verde.
- [ ] Code review aprovado por 1 (ou 2 para críticos) reviewer.
- [ ] Mergeado em `main` via squash + commit assinado.
- [ ] Feature flag desligada por padrão (se feature nova) ou removida.
- [ ] Monitoramento e alertas configurados (se feature operacional).
- [ ] Comunicado em release notes da próxima minor.

### 10.2 Para um Bug Fix

- [ ] Bug reproduzido (passos reproduzíveis em issue).
- [ ] Root cause identificada (não apenas sintoma tratado).
- [ ] Teste de regressão escrito (reproduz bug antes do fix).
- [ ] Fix aplicado.
- [ ] Teste passa após fix.
- [ ] Sem regressão em outras áreas (CI verde).
- [ ] Postmortem escrito se bug foi critical (incident report).
- [ ] Métricas relevantes atualizadas (MTTR, etc.).

### 10.3 Para uma Refatoração

- [ ] Justificativa clara: o que melhora? (legibilidade, performance,
  manutenabilidade, segurança?).
- [ ] Sem mudança de comportamento observável (testes unchanged).
- [ ] Diff revisado por especialista no domínio.
- [ ] Não combinado com feature ou bug fix no mesmo PR.

### 10.4 Para um Release

- [ ] Todas as features da minor com DoD completa.
- [ ] Todos os bugs críticos e high fechados.
- [ ] Auditoria de dependências passa (sem CVE críticos).
- [ ] SBOM gerado e publicado.
- [ ] Build reproduzível (rebuild produz mesmo hash).
- [ ] Release assinado (sigstore ou GPG).
- [ ] CHANGELOG atualizado.
- [ ] Release notes escritos.
- [ ] Smoke test em produção pós-deploy.
- [ ] Rollback plan documentado e testado.

---

## 11. Ferramentas de Qualidade Contínua

### 11.1 Scanners de Segurança (execução contínua)

| Scanner | Frequência | Bloqueia | Owner |
|---------|-----------|----------|-------|
| Semgrep | A cada commit + diário | Sim (findings críticos) | Security |
| CodeQL | Diário + a cada PR em path crítico | Sim (high+) | Security |
| Trivy (deps + container) | Diário + a cada build | Sim (critical CVE) | Security |
| Gitleaks | A cada commit | Sim (qualquer finding) | Security |
| npm/bun audit | Diário | Sim (critical) | Security |
| Snyk (opcional) | Semanal | Não (advisory) | Security |
| DAST (ZAP baseline) | Semanal em staging | Não (advisory) | Security |

### 11.2 Quality Gates (CI bloqueia merge)

1. Lint clean.
2. Type-check clean.
3. Unit + property + fuzz: 100% pass, cobertura ≥ 95%.
4. Integration: 100% pass.
5. E2E: 100% pass (fluxos críticos).
6. Semgrep: 0 critical.
7. CodeQL: 0 high+.
8. Gitleaks: 0 findings.
9. Trivy: 0 critical CVE.
10. Bundle size dentro do limite (§7.2).
11. Lighthouse: sem regressão crítica.
12. Benchmark: sem regressão > 10% (§7.3).

### 11.3 Observability (Pós-Deploy)

| Sinal | Ferramenta | Alerta |
|-------|-----------|--------|
| Logs estruturados | Pino → Loki | Erro rate > 1% em 5min |
| Métricas | Prometheus | Latência P95 > 2× baseline |
| Tracing | OpenTelemetry → Tempo | Span órfão > 5min |
| Error tracking | Sentry | Qualquer critical |
| Uptime | Uptime Kuma / BetterUptime | Qualquer downtime |
| SLO burn rate | Prometheus alerting | Burn rate > 2× em 1h |

### 11.4 Reporting

- **Engineering Dashboard**: cobertura, performance, scanner findings, SLO,
  atualizado diariamente.
- **Security Posture Report**: semanal, enviado a Engineering Lead + Security Lead.
- **Transparency Report**: mensal, público, com métricas agregadas.
- **Release Notes**: a cada release, com changelog legível por humanos.

---

## 12. Criptografia — Validação contra Vetores Oficiais

> Esta seção é a mais sensível do documento. Erro aqui = perda de fundos.

### 12.1 Princípio

> **Toda implementação criptográfica deve ser validada contra vetores de teste
> oficiais publicados pelo autor do padrão.** Implementação sem validação
> contra vetores é considerada não-conforme e não pode entrar em produção.

### 12.2 Vetores Obrigatórios

| Padrão | Fonte Oficial | Arquivo de Vetores | Cobertura Mínima |
|--------|--------------|-------------------|------------------|
| BIP-39 | https://github.com/trezor/python-mnemonic/blob/master/vectors.json | `src/lib/wallet-core/__tests__/vectors/bip39.json` | 100% dos vetores oficiais |
| BIP-32 | https://github.com/bitcoin/bips/blob/master/bip-0032/TestVectors.md | `src/lib/wallet-core/__tests__/vectors/bip32.json` | 100% |
| SLIP-0010 | https://github.com/satoshilabs/slips/blob/master/slip-0010/testvectors.json | `src/lib/wallet-core/__tests__/vectors/slip10.json` | 100% (Ed25519 + secp256k1) |
| BIP-44 | Derivado de BIP-32 + registro de coin types | `src/lib/wallet-core/__tests__/vectors/bip44.json` | Cobre path para 60', 501', 84' |
| secp256k1 | https://github.com/bitcoin-core/test-vectors | `src/lib/wallet-core/__tests__/vectors/secp256k1.json` | 100% vectors oficiais |
| Ed25519 | https://ed25519.cr.yp.to/python/sign.py + RFC 8032 Appendix | `src/lib/wallet-core/__tests__/vectors/ed25519.json` | 100% RFC 8032 |
| AES-256-GCM | NIST CAVP + RFC 5288 Appendix A | `src/lib/wallet-core/__tests__/vectors/aes-gcm.json` | 100% NIST CAVP |
| HKDF-SHA256 | RFC 5869 Appendix A | `src/lib/wallet-core/__tests__/vectors/hkdf.json` | 100% RFC 5869 |
| PBKDF2-SHA256 | RFC 6070 + NIST SP 800-132 | `src/lib/wallet-core/__tests__/vectors/pbkdf2.json` | 100% RFC 6070 |
| HMAC-SHA256 | RFC 4231 Section 4 | `src/lib/wallet-core/__tests__/vectors/hmac.json` | 100% RFC 4231 |
| SHA-256 | NIST FIPS 180-4 Appendix B | `src/lib/wallet-core/__tests__/vectors/sha256.json` | 100% FIPS 180-4 |
| Shamir Secret Sharing (SLIP-39) | https://github.com/satoshilabs/slips/blob/master/slip-0039 | `src/lib/wallet-engines/recovery/__tests__/vectors/slip39.json` | 100% SLIP-39 vectors |
| EIP-1559 | EIP-1559 spec test cases | `src/lib/wallet-evm/__tests__/vectors/eip1559.json` | 100% |
| EIP-712 | EIP-712 spec test cases | `src/lib/wallet-evm/__tests__/vectors/eip712.json` | 100% |
| EIP-191 | EIP-191 spec test cases | `src/lib/wallet-evm/__tests__/vectors/eip191.json` | 100% |

### 12.3 Regras

1. **Vetores são committed no repo**, em JSON, versionados. Não baixar em
   runtime — podem sumir ou ser alterados.
2. **Toda implementação criptográfica** tem teste `vectors.test.ts` que
   carrega o JSON e verifica cada vetor.
3. **Falha em qualquer vetor** = bloqueio de release.
4. **Adição de novo vetor** é bem-vinda; remoção só com justificativa escrita.
5. **Implementação própria de primitivo** (em vez de usar `@noble/*`) é
   proibida sem aprovação do Security Lead e auditoria externa.

### 12.4 Comparação de Implementações

Para primitivos críticos (BIP-32, secp256k1, Ed25519, AES-GCM, Shamir), o
teste de vetores deve também rodar a implementação contra uma segunda
implementação de referência (em outra linguagem ou outra biblioteca) e
verificar que os outputs coincidem. Exemplo:

- BIP-32: comparar `@scure/bip32` com `bip32` (Node.js reference).
- AES-GCM: comparar WebCrypto com `@noble/ciphers`.
- Shamir: comparar implementação própria com `slip39` (trezor) reference.

---

## 13. RPC Reais — Exercitando Chains

### 13.1 Princípio

> **Nenhum plugin é considerado production-ready até ter sido exercitado
> contra mainnet, testnet, múltiplos provedores RPC e nó próprio.**

### 13.2 Matriz Obrigatória por Chain

Para cada chain suportada (Ethereum, Bitcoin, Solana, Lightning):

| Ambiente | Provedor | Obrigatório |
|----------|----------|-------------|
| Mainnet | Provedor A (público, ex.: publicnode) | Sim |
| Mainnet | Provedor B (público, ex.: 1rpc) | Sim |
| Mainnet | Provedor C (público, ex.: llamarpc) | Sim |
| Mainnet | Próprio nó (quando viável) | Desejável |
| Testnet | Provedor dedicado (Sepolia, Signet, Devnet) | Sim |
| Local | Anvil / Regtest / Localnet | Sim (para dev + CI) |

### 13.3 Operações a Exercitar

Para cada chain, validar no mínimo:

1. **getBalance** — endereço com saldo, endereço sem saldo.
2. **getTransactionCount / UTXO list**.
3. **estimateGas / fee estimation** — com e sem congestionamento.
4. **eth_call / simulação** — contrato ERC-20, contrato proxy, contrato
   inexistente.
5. **sendTransaction (testnet)** — TX simples, TX com dados, TX com falha.
6. **broadcast** — TX válida aceita, TX inválida rejeitada com erro tipado.
7. **monitor** — confirmação de TX, reorg, timeout.
8. **Failover** — provedor principal cai, fallback assume sem interrupção.
9. **Rate limit** — comportamento ao atingir limite (backoff, retry, erro).
10. **Bloco inválido / fork** — sistema detecta e reporta.

### 13.4 Quorum e Circuit Breaker

- Para chains críticas (Ethereum mainnet), usar **quorum de 2+ provedores**
  para ler estado de saldo crítico (ex.: antes de send).
- Circuit breaker por provedor: 3 falhas consecutivas em 60s → provedor
  suspenso por 5 min → re-testado com probe.
- Log de cada decisão de failover em observability stack.

### 13.5 Próprio Nó (Desejável)

Para chains de maior volume, considerar rodar nó próprio:
- Reduz dependência de terceiros.
- Permite queries avançadas (ex.: `eth_getLogs` em ranges amplos).
- Aumenta latência operacional? Considerar híbrido: próprio nó para leitura,
  provedor público para broadcast.

### 13.6 Health Check Contínuo

- Cada provedor tem health check a cada 30s: `eth_blockNumber` (ou
  equivalente).
- Latência, block height, erro rate reportados em dashboard.
- Alerta se provedor estiver > 2 blocos atrás do líder.

---

## 14. Observabilidade — Stack Completa

### 14.1 Camadas

```
Application Logs  →  Pino (structured)  →  Loki / Grafana
Metrics           →  Prometheus client  →  Prometheus / Grafana
Traces            →  OpenTelemetry SDK  →  Tempo / Jaeger
Errors            →  Sentry SDK         →  Sentry
Uptime            →  Uptime Kuma        →  Alertmanager
```

### 14.2 Métricas Obrigatórias

| Métrica | Tipo | Labels |
|---------|------|--------|
| `tank_decisions_total` | Counter | `result` (allow/deny/challenge), `engine`, `chain` |
| `tank_decision_duration_ms` | Histogram | `engine`, `chain` |
| `tank_threats_blocked_total` | Counter | `severity`, `type`, `chain` |
| `tank_rpc_calls_total` | Counter | `provider`, `chain`, `method`, `status` |
| `tank_rpc_duration_ms` | Histogram | `provider`, `chain`, `method` |
| `tank_engine_status` | Gauge | `engine`, `status` (healthy/degraded/down) |
| `tank_engine_memory_bytes` | Gauge | `engine` |
| `tank_audit_log_writes_total` | Counter | `status` |
| `tank_audit_log_lag_seconds` | Gauge | — |
| `tank_wallet_unlocks_total` | Counter | `method` (password/passkey/biometric) |
| `tank_lockdown_events_total` | Counter | `trigger` |
| `tank_recovery_events_total` | Counter | `method` (shamir/passkey) |
| `tank_bundle_size_bytes` | Gauge | `entrypoint` |
| `tank_security_score` | Gauge | `component` |

### 14.3 Alertas (Alertmanager)

| Alerta | Condição | Severidade |
|--------|----------|-----------|
| DecisionP95High | `histogram_quantile(0.95, tank_decision_duration_ms) > 200` | Warning |
| DecisionErrorsSpike | `rate(tank_decisions_total{result="error"}[5m]) > 0.01` | Critical |
| RPCDown | `tank_engine_status{engine="network"} == 0` | Critical |
| AuditLagHigh | `tank_audit_log_lag_seconds > 30` | Critical |
| ThreatIntelStale | `time() - tank_threat_intel_last_update > 600` | Warning |
| LockdownTriggered | `increase(tank_lockdown_events_total[5m]) > 0` | Critical |
| EngineDown | `tank_engine_status{status="down"} == 1` | Critical |
| MemoryLeak | `tank_engine_memory_bytes` crescente por 30min | Warning |
| BundleSizeExceeded | `tank_bundle_size_bytes > 350 * 1024` | Warning |

### 14.4 Tracing

- OpenTelemetry SDK inicializado em `src/lib/observability/tracing.ts`.
- Span raiz por request de usuário (HTTP / wallet operation).
- Span filho por engine envolvida na operação.
- `traceId` propagado para logs (correlação).
- Sampling: 100% em staging, 10% em produção (100% para erros).

### 14.5 Error Tracking

- Sentry SDK no client e server.
- `beforeSend` hook para sanitizar PII e dados sensíveis.
- Source maps upload em release (para stack traces legíveis).
- Issue tracking automático: todo `critical` Sentry vira issue no tracker.

---

## 15. Auditorias Independentes

### 15.1 Princípio

> **Uma arquitetura excelente sem auditoria é apenas uma arquitetura.**
> Auditoria externa é o maior multiplicador de confiança do produto.

### 15.2 Plano de Auditoria (Sprint 5)

| Fase | Escopo | Auditor | Status |
|------|--------|---------|--------|
| Audit #1 | Kernel + Crypto + Key Management + Recovery | Firma externa especializada em cripto | Planejado |
| Audit #2 | Engines de segurança + Decision pipeline + Event Bus | Firma externa especializada em smart contracts | Planejado |
| Pentest #1 | Frontend + API + browser extension | Red team externo | Planejado |
| Pentest #2 | Infra + deployment + supply chain | Red team externo | Planejado |
| Bug Bounty | Público, com escopo e recompensas definidos | Plataforma (Immunefi / HackerOne) | Após Audit #1 |

### 15.3 Critérios de Seleção de Auditor

- Experiência comprovada em cripto (carteiras, smart contracts).
- Portfolio público de auditorias relevantes.
- Processo transparente (metodologia, prazos, entregáveis).
- Sem conflito de interesse com concorrentes diretos.
- Disponibilidade para re-auditar após correções.

### 15.4 Processo

1. **Briefing**: envio de ARCHITECTURE-FREEZE-1.0-BASELINE.md, ENGINEERING-STANDARDS.md,
   acesso ao repo, acesso aos testes existentes.
2. **Execução**: 2-4 semanas típicas.
3. **Findings**: classificados Critical / High / Medium / Low / Informational.
4. **Correção**: time interno corrige; auditor valida fix.
5. **Report final**: público (com NDA prévio para vulnerabilidades não corrigidas).
6. **Retest**: após todas as correções, auditor emite certificado.

### 15.5 Bug Bounty

- **Escopo**: código em produção, contratos, infra.
- **Recompensas**: definidas por severidade, até US$ 50K para critical.
- **Disclosure**: coordenado, 90 dias para fix antes de publicação.
- **Programa**: Immunerfi ou HackerOne, after Audit #1.

### 15.6 SECURITY.md

`SECURITY.md` na raiz do repo, contendo:
- Versões suportadas.
- Política de disclosure.
- Escopo de vulnerabilidades aceitas.
- Recompensas.
- PGP key para report criptografado.
- SLA de resposta.
- Histórico de vulnerabilidades corrigidas.

---

## 16. Governança deste Documento

### 16.1 Alterações

- Mudanças em ENGINEERING-STANDARDS.md exigem **PR com 2 approvals** (Engineering
  Lead + Security Lead).
- Mudanças breaking exigem **ADR** (Architecture Decision Record) em
  `docs/adr/<n>-<title>.md`.
- Mudanças são comunicadas em Engineering Review semanal.

### 16.2 Exceções

- Exceção a qualquer regra deste documento exige:
  1. Issue documentando a exceção e justificativa.
  2. Approval de Engineering Lead + Security Lead.
  3. Prazo de validade da exceção (máx 90 dias).
  4. Issue de follow-up para resolver a causa raiz.

### 16.3 Aplicação

- Este documento é **enforced por CI** onde possível (lint rules, size-limit,
  semgrep rules).
- Itens não-enforceable por CI são enforced em code review.
- Violações em `main` geram incidente e fix obrigatório imediato.

---

## 17. Referências

- Architecture Frozen 1.0 Baseline (`ARCHITECTURE-FREEZE-1.0-BASELINE.md`)
- Architecture & Roadmap (`ARCHITECTURE.md`)
- KPI Formulas (`KPI-FORMULAS.md`)
- SemVer 2.0.0 — https://semver.org/
- Conventional Commits — https://www.conventionalcommits.org/
- The Twelve-Factor App — https://12factor.net/
- OWASP ASVS 4.0 — https://owasp.org/www-project-application-security-verification-standard/
- NIST SP 800-53 — https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
- CycloneDX — https://cyclonedx.org/
- OpenTelemetry — https://opentelemetry.io/
- Sigstore — https://www.sigstore.dev/

---

> **Fim do ENGINEERING-STANDARDS.md.**
> Este documento é a base operacional da série 1.x. Toda implementação a
> partir de agora é regida por estas regras. Quando em dúvida, pergunte:
> "isto está conforme ENGINEERING-STANDARDS.md?" — se a resposta for não,
> não faça merge.
