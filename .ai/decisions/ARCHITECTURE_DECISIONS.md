# ARCHITECTURE_DECISIONS.md — Architecture Decision Records (ADRs)

> Decisões **arquiteturais** (estruturais, imutáveis durante a série
> 1.x). Para decisões **operacionais** (processo, ferramentas,
> padrões), ver `DECISION_LOG.md` (D-XXX).
>
> **Imutável**: nunca editar ADR existente. Se uma decisão muda, criar
> novo ADR com `Supersedes: ADR-YYY` e marcar `ADR-YYY` como
> `Superseded By: ADR-ZZZ`.
>
> Status: **Ativo**
> Mantenedor: Engineering Lead + Security Lead
> Alteração exige: PR com 2 approvals + entrada em
> `docs/freeze-2-candidates.md` se a mudança afeta componente congelado.

---

## Formato Rígido (obrigatório)

Cada ADR segue exatamente este formato:

```markdown
## ADR-XXX — <Título curto>

Status:
Accepted | Rejected | Deprecated | Superseded

Date:
YYYY-MM-DD

Context:
<Por que esta decisão arquitetural foi necessária. Estado anterior.
Problema estrutural que estava sendo resolvido.>

Decision:
<O que foi decidido. De forma objetiva e verificável.>

Alternatives:
- <Alternativa 1>: <por que foi descartada>
- <Alternativa 2>: <por que foi descartada>

Consequences:
- <impacto positivo 1>
- <impacto positivo 2>
- <impacto negativo ou trade-off 1>

Architecture Impact:
<Quais componentes são afetados. Quais contratos são estabelecidos.
Quais hard gates dependem desta decisão.>

Supersedes:
<Nenhum | ADR-YYY>

Superseded By:
<Nenhum | ADR-ZZZ>
```

---

## ADR-001 — Security Kernel como orquestrador único

Status:
Accepted

Date:
2026-07-15

Context:
Carteiras Web3 convencionais distribuem lógica de segurança entre
múltiplos pontos (signer, broadcaster, UI). Não há orquestrador
central garantindo que toda transação passe pelo mesmo pipeline. Isso
cria bypass acidental: uma assinatura pode acontecer sem passar por
threat intel, simulation ou policy.

Decision:
Security Kernel é o orquestrador único. Pipeline obrigatório de 12
estágios: User Action → Chain Plugin → Transaction Engine →
Simulation → Threat Intel → Behavior → Policy → Decision → Signature
→ Broadcast → Audit → Notification. Nenhuma assinatura acontece fora
deste fluxo. Implementado em `src/lib/wallet-security-real/`.

Alternatives:
- Orquestração distribuída (cada engine decide se executa): descartada
  porque permite bypass acidental.
- Orquestração na UI: descartada porque UI não é confiável (pode ser
  modificada por extensão maliciosa).
- Sem orquestrador (engines chamam uns aos outros): descartada porque
  cria acoplamento e impede evolução isolada.

Consequences:
- Toda transação passa pelo mesmo pipeline, auditável.
- Engines são desacoplados entre si (comunicam via Event Bus).
- Adicionar engine novo não exige mudar engines existentes.
- Pipeline é componente congelado — adicionar estágio exige
  Architecture Freeze 2.0.

Architecture Impact:
Componente congelado #1 (Security Kernel). Validado por
`scripts/metrics/architecture.ts` check "Security Kernel exists".
Hard gate: indireto (sem Kernel, nada funciona).

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-002 — Security Event Bus tipado

Status:
Accepted

Date:
2026-07-15

Context:
Sem Event Bus, engines precisam conhecer uns aos outros diretamente.
Isso cria acoplamento forte: mudar interface de um engine quebra
todos que dependem dele. Impede evolução isolada e substituição de
implementação.

Decision:
Security Event Bus tipado com 16 security events + 9 chain events.
Nenhum engine conhece diretamente outro. Engines publicam eventos
para o bus e subscrevem eventos do bus. Implementado em
`src/lib/wallet/types.ts` (tipos) e `src/lib/wallet-security-real/`
(orquestração).

Alternatives:
- Chamadas diretas entre engines: descartada porque cria acoplamento.
- RPC interno: descartada porque adiciona complexidade desnecessária
  para processo local.
- Mensageria externa (RabbitMQ, Kafka): descartada porque engines
  rodam no mesmo processo.

Consequences:
- Engines são desacoplados: mudar um não quebra outros.
- Eventos são tipados, permitindo análise estática.
- Log de eventos é natural (todos passam pelo bus).
- Event Bus é componente congelado — adicionar evento exige
  Architecture Freeze 2.0.

Architecture Impact:
Componente congelado #6 (Security Event Bus). Validado por
`scripts/metrics/architecture.ts` check "Security Event Bus typed".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-003 — SecurityEngine interface

Status:
Accepted

Date:
2026-07-15

Context:
Sem interface comum, cada engine tem API diferente. Kernel precisa
saber chamar cada um especificamente, criando switch cases enormes.
Adicionar engine novo exige modificar Kernel.

Decision:
Toda engine implementa interface `SecurityEngine` comum. Kernel
invoca engines polimorficamente. Interface define: `id`, `evaluate()`,
`getCapabilities()`, `getState()`. Implementação concreta fica em
`src/lib/wallet-engines/<name>/engine.ts`.

Alternatives:
- Cada engine com API própria: descartada porque cria switch cases.
- Herança (classe base): descartada porque TypeScript prefere
  composição sobre herança para este caso.
- duck typing sem interface explícita: descartada porque perde
  análise estática.

Consequences:
- Kernel não conhece implementações concretas.
- Adicionar engine novo = criar arquivo + registrar. Sem mudar Kernel.
- Interface é componente congelado — mudança exige Architecture
  Freeze 2.0.
- Engines podem ser testados isoladamente (mock da interface).

Architecture Impact:
Componente congelado #9 (Architecture Contracts — SecurityEngine
interface). Validado por `scripts/metrics/architecture.ts` check
"Architecture Contracts documented".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-004 — ChainPlugin Interface (apiVersion 1.0)

Status:
Accepted

Date:
2026-07-15

Context:
Sem interface comum para chains, adicionar chain nova exige
modificar Kernel, signer, broadcaster e UI. Cada chain tem
particularidades (UTXO vs account, EIP-1559 vs legacy, versioned TX
vs legacy), mas operações de alto nível são as mesmas.

Decision:
ChainPlugin interface congelada com `apiVersion: 1.0`. Define:
`connect()`, `build()`, `simulate()`, `sign()`, `broadcast()`,
`monitor()`, `estimateFees()`, `getBalance()`, `getAssets()`,
`explain()`, `manifest()`. 4 plugins implementados: Ethereum (full
lifecycle EIP-1559), Bitcoin (PSBT, UTXO, RBF, coin selection),
Solana (versioned TX, SPL), Lightning (BOLT-11 decoder real, LNURL).

Alternatives:
- Uma implementação por chain sem interface comum: descartada porque
  impede adicionar chain nova sem modificar Kernel.
- Interface genérica demais (qualquer operação): descartada porque
  perde tipagem e documentação.
- Web3Modal/WalletConnect como camada de abstração: descartada porque
  é externo e não cobre todas as chains (BTC, Lightning).

Consequences:
- Adicionar chain nova = implementar ChainPlugin + registrar. Sem
  mudar Kernel.
- ChainPlugin é componente congelado — mudança na interface exige
  Architecture Freeze 2.0.
- Conformance Suite (11 testes × 4 plugins) valida aderência.
- Plugins podem evoluir independentemente da interface.

Architecture Impact:
Componente congelado #8 (ChainPlugin Interface). Validado por
`scripts/metrics/architecture.ts` check "ChainPlugin Interface
(apiVersion 1.0) + 4 plugins".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-005 — Unified Data Model (15 objetos centrais)

Status:
Accepted

Date:
2026-07-15

Context:
Sem modelo de dados compartilhado, engines definem seus próprios
tipos para os mesmos conceitos (SecurityContext, SecurityResult,
EvidenceBasedDecision). Isso cria conversões desnecessárias e
inconsistências.

Decision:
15 objetos centrais compartilhados definidos em
`src/lib/wallet-core/types.ts` e `src/lib/wallet/types.ts`:
SecurityContext, SecurityResult, EvidenceBasedDecision, Threat,
Policy, Trust, AuditEntry, PluginManifest, CapabilityManifest,
DecisionResult, EngineScore, Evidence, Source, Posture,
SecurityEvent. Todos os engines consomem e produzem estes tipos.

Alternatives:
- Cada engine com tipos próprios: descartada porque cria conversões
  e inconsistências.
- Schema JSON externo (sem tipos TypeScript): descartada porque perde
  análise estática.
- Tipos apenas no Kernel: descartada porque engines precisam produzir
  estes tipos.

Consequences:
- Tipos compartilhados eliminam conversões.
- Análise estática garante consistência.
- Mudança em tipo central exige migração de todos os engines.
- Unified Data Model é componente congelado.

Architecture Impact:
Componente congelado #7 (Unified Data Model). Validado por
`scripts/metrics/architecture.ts` check "Unified Data Model present".
Nota: atualmente dividido entre `wallet-core/types.ts` e
`wallet/types.ts`; consolidação planejada.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-006 — Tank Security Standard (TSS) — 10 specs

Status:
Accepted

Date:
2026-07-15

Context:
Sem padrão formal de segurança, decisões ad-hoc variam entre
implementações. Não há forma de verificar conformidade com
princípios declarados (Zero Trust, Defense in Depth, Fail-Safe,
Human First, etc.).

Decision:
Tank Security Standard (TSS) com 10 especificações:
- TSS-001 Zero Trust
- TSS-002 Defense in Depth
- TSS-003 Fail-Safe Defaults
- TSS-004 Least Privilege
- TSS-005 Separation of Duties
- TSS-006 Auditability
- TSS-007 Reproducibility
- TSS-008 Verifiability
- TSS-009 Transparency
- TSS-010 Human First

80% enforced via código (verificação automatizada). 20% restante
exige revisão humana.

Alternatives:
- Adotar OWASP ASVS diretamente: descartada porque ASVS é genérico,
  não cobre particularidades de cripto.
- Sem padrão formal: descartada porque decisões ad-hoc variam.
- Padrão apenas em documentação, sem enforcement: descartada porque
  não há verificação automatizada.

Consequences:
- Decisões de segurança seguem princípios declarados.
- Conformidade é verificável (80% automatizada).
- TSS é componente congelado — adicionar spec exige Architecture
  Freeze 2.0.

Architecture Impact:
Componente congelado #3 (TSS). Validado por
`scripts/metrics/architecture.ts` check "Tank Security Standard (TSS)
documented".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-007 — Tank Security Framework (TSF) — 7 domínios

Status:
Accepted

Date:
2026-07-15

Context:
Sem framework de proteção, escopo de segurança é ambíguo. Não há
forma de garantir que todos os vetores de ameaça estão cobertos
(user, blockchain, wallet, infra, privacy, AI, business).

Decision:
Tank Security Framework (TSF) com 7 domínios:
1. User Protection
2. Blockchain Protection
3. Wallet Protection
4. Infrastructure Protection
5. Privacy Protection
6. AI Protection
7. Business Protection

Cada domínio tem engines e políticas associadas. Cobertura é
rastreada.

Alternatives:
- Apenas OWASP Top 10: descartada porque não cobre todas as
  dimensões (especialmente AI Protection).
- Sem framework explícito: descartada porque escopo fica ambíguo.
- Framework da NIST diretamente: descartada porque é genérico demais
  para cripto.

Consequences:
- Escopo de segurança é explícito.
- Cobertura é rastreável por domínio.
- TSF é componente congelado.

Architecture Impact:
Componente congelado #4 (TSF). Validado por
`scripts/metrics/architecture.ts` check "Tank Security Framework (TSF)
documented".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-008 — Decision Engine evidence-based

Status:
Accepted

Date:
2026-07-15

Context:
Decisões opacas ("blocked by policy") sem justificativa estruturada
impedem auditoria. Usuário não entende por que uma transação foi
bloqueada. Auditor não consegue reproduzir a decisão.

Decision:
Toda decisão produz objeto `EvidenceBasedDecision` contendo:
- `evidence[]` — lista de evidências estruturadas.
- `sources[]` — referências às fontes dos dados.
- `engineScores{}` — score reportado por cada engine.
- `reproducible: true` — decoder pode re-executar e obter mesmo
  resultado.

Decisões sem evidence são consideradas inválidas.

Alternatives:
- Decisões opacas (apenas allow/deny): descartada porque impede
  auditoria.
- Evidence em log separado: descartada porque desvincula decisão de
  evidence.
- Apenas tracing distribuído: descartada porque não é reproduzível.

Consequences:
- Toda decisão é auditável e reproduzível.
- Usuário pode ver exatamente por que foi bloqueado.
- Auditor pode re-executar decisão e comparar resultado.
- Decision Engine é componente congelado.
- Métrica "Security Evidence" (D-002) mede aderência.

Architecture Impact:
Componente congelado #10 (Decision Engine). Validado por
`scripts/metrics/architecture.ts` check "Decision Engine
(evidence-based)" e por `scripts/metrics/evidence.ts`.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-009 — Security Governance Layer (7 registries)

Status:
Accepted

Date:
2026-07-15

Context:
Sem registries formais, políticas e ameaças são codificadas
diretamente em código. Mudança exige deploy. Não há versionamento
claro nem auditoria.

Decision:
7 registries persistentes em Prisma:
1. Policy Registry — políticas ativas.
2. Threat Registry — 15 ameaças catalogadas (THR-0001 a THR-0015).
3. Trust Registry — 18 entidades com Trust Score.
4. Decision Registry — decisões tomadas.
5. Plugin Registry — 13 chains com capacidades declaradas.
6. Feature Registry — features habilitadas/desabilitadas.
7. Audit Registry — log HMAC-signed append-only.

Alternatives:
- Apenas código (sem DB): descartada porque mudança exige deploy.
- Arquivos JSON versionados: descartada porque não suporta queries
  complexas.
- Redis: descartada porque é volátil (não persistente por padrão).

Consequences:
- Políticas e ameaças são mutáveis sem deploy.
- Versionamento via Prisma migrations.
- Auditoria via queries SQL.
- Governance Layer é componente congelado.
- Mudança em schema exige migration (additive ok, breaking exige
  Architecture Freeze 2.0).

Architecture Impact:
Componente congelado #5 (Security Governance Layer). Validado por
`scripts/metrics/architecture.ts` check "Security Governance Layer
(registries)" que inspeciona `prisma/schema.prisma`.

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## ADR-010 — Architecture Contracts (15 contratos imutáveis)

Status:
Accepted

Date:
2026-07-15

Context:
Sem contratos formais, "congelado" é apenas uma afirmação. Não há
forma de verificar que contratos não foram violados. Refatoração
pode acidentalmente quebrar invariantes.

Decision:
15 contratos imutáveis documentados e enforced por tipos TypeScript:
1. SecurityEngine interface.
2. Event Bus schema.
3. Data Model tipos.
4. DecisionResult shape.
5. Threat schema.
6. Policy schema.
7. Trust schema.
8. Audit schema.
9. Plugin manifest.
10. Capability manifest.
11. 4-layer separation (UI / Kernel / Engines / Infra).
12. Single Decision Flow.
13. 5 Security Levels (L0-L4).
14. Fail-Safe Modes (11 engines).
15. Performance Budget (10 targets).

Alternatives:
- Sem contratos formais: descartada porque "congelado" vira apenas
  afirmação.
- Contratos apenas em documentação: descartada porque não há
  enforcement.
- Contratos via runtime validation: descartada porque adiciona
  overhead.

Consequences:
- "Congelado" é verificável por análise estática.
- Refatoração que quebra contrato é detectada em compile time.
- Contratos são componente congelado.
- Mudança exige Architecture Freeze 2.0.

Architecture Impact:
Componente congelado #9 (Architecture Contracts). Validado por
`scripts/metrics/architecture.ts` check "Architecture Contracts
documented".

Supersedes:
Nenhum

Superseded By:
Nenhum

---

## Como Adicionar Novo ADR

1. Próximo ID disponível: **ADR-011**.
2. Para decisões **operacionais** (não arquiteturais): usar D-XXX em
   `DECISION_LOG.md`.
3. Copiar o formato rígido acima. Não omitir campos.
4. PR com 2 approvals (Engineering Lead + Security Lead).
5. Se a decisão afeta componente congelado: adicionar entrada em
   `docs/freeze-2-candidates.md` justificando necessidade de
   Architecture Freeze 2.0.
6. Se supersede ADR anterior: preencher `Supersedes: ADR-YYY` E
   atualizar entrada `ADR-YYY` com `Superseded By: ADR-XXX`.
7. Nunca editar ADR existente (salvo para adicionar `Superseded By`).

---

## Regras

- **Imutável**: nunca editar ADR existente (salvo `Superseded By`).
  Mesmo ADRs revertidos permanecem no log.
- **Formato rígido**: todos os 9 campos obrigatórios.
- **Architecture Impact obrigatório**: nem que seja "Nenhum".
- **Apenas arquiteturais**: decisões de processo, ferramentas ou
  padrões vão para `DECISION_LOG.md` (D-XXX).
