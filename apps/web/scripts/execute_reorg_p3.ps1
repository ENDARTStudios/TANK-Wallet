#Requires -Version 5.1
<#
.SYNOPSIS
  Reorg docs/ em 8 pilares (P3) — port PowerShell do roteiro Bash (Issue #75).
  Mesmas 5 fases, mesmos gates, mesma idempotência. RUNTIME: Windows PowerShell 5.1.
.DESCRIPTION
  ASSUNÇÃO: branch main contendo PRs #65/#71/#73 integrados, sem conflitos.
  SEGURANÇA: aborta com árvore suja (estágio 0); sem deleções; stage-file idempotente.
  VALIDAÇÃO SEM EXECUÇÃO: .\execute_reorg_p3.ps1 -Validate  (somente leitura)
  EXECUÇÃO: .\execute_reorg_p3.ps1  (fase a fase; re-run retoma pelo stage)
#>
[CmdletBinding()]
param([switch]$Validate)

$ErrorActionPreference = 'Stop'
$DocsDir = 'docs'
$BackupDir = '.reorg_backup'
$StageFile = '.reorg_stage'
$NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-Phase([string]$N, [string]$Msg) { Write-Host "`n[Fase $N] $Msg" -ForegroundColor Cyan }
function Fail([string]$Msg) { Write-Host "`n[ERRO] $Msg" -ForegroundColor Red; exit 1 }
function Invoke-Git([string[]]$GitArgs) {
  # stderr nativo (ex.: warnings CRLF) não pode derrubar o run: coleta sem throw,
  # falha só por exit code (com a mensagem real anexada).
  $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  try { $out = & git @GitArgs 2>&1 | ForEach-Object { "$_" } }
  finally { $ErrorActionPreference = $prev }
  if ($LASTEXITCODE -ne 0) { Fail ('git ' + ($GitArgs -join ' ') + "`n" + ($out -join "`n")) }
}
function Get-Stage() {
  if (Test-Path $StageFile) { return (Get-Content $StageFile -Raw).Trim() } else { return '0' }
}
function Read-Utf8([string]$P) { return [System.IO.File]::ReadAllText($P) }
function Write-Utf8([string]$P, [string]$S) { [System.IO.File]::WriteAllText($P, $S, $NoBom) }

# ---------------------------------------------------------------- TABELAS (fonte única)
$P8 = @('01-product-discovery','02-architecture-design','03-development-process','04-api-integrations','05-security-compliance','06-devops-deployment','07-operations-marketing','08-knowledge-management')
$Moves = @(
  @('docs/DEFINE_THE_USER.md','docs/01-product-discovery/DEFINE_THE_USER.md'),
  @('docs/ROADMAP.md','docs/01-product-discovery/ROADMAP.md'),
  @('docs/PRD.md','docs/01-product-discovery/PRD.md'),
  @('docs/CHOOSE_TECH_STACK.md','docs/02-architecture-design/CHOOSE_TECH_STACK.md'),
  @('docs/DESIGN.md','docs/02-architecture-design/DESIGN.md'),
  @('docs/STYLE_GUIDE.md','docs/02-architecture-design/STYLE_GUIDE.md'),
  @('docs/ARCHITECTURE.md','docs/02-architecture-design/ARCHITECTURE.md'),
  @('docs/ADR.md','docs/02-architecture-design/ADR.md'),
  @('docs/uml/UML.md','docs/02-architecture-design/UML.md'),
  @('docs/ARCHITECTURE-MODULES.md','docs/02-architecture-design/ARCHITECTURE-MODULES.md'),
  @('ARCHITECTURE-FREEZE-1.0.md','docs/02-architecture-design/ARCHITECTURE-FREEZE-1.0.md'),
  @('ARCHITECTURE-FREEZE-1.0-BASELINE.md','docs/02-architecture-design/ARCHITECTURE-FREEZE-1.0-BASELINE.md'),
  @('docs/DEVELOPMENT.md','docs/03-development-process/DEVELOPMENT.md'),
  @('docs/SETUP.md','docs/03-development-process/SETUP.md'),
  @('docs/RULES.md','docs/03-development-process/RULES.md'),
  @('docs/TASKS.md','docs/03-development-process/TASKS.md'),
  @('docs/TASK_BREAKING_DOWN.md','docs/03-development-process/TASK_BREAKING_DOWN.md'),
  @('docs/TESTING.md','docs/03-development-process/TESTING.md'),
  @('docs/ISSUES-BACKLOG.md','docs/03-development-process/ISSUES-BACKLOG.md'),
  @('docs/CLEANUP-PLAN.md','docs/03-development-process/CLEANUP-PLAN.md'),
  @('docs/API.md','docs/04-api-integrations/API.md'),
  @('docs/CONTENT.md','docs/04-api-integrations/CONTENT.md'),
  @('docs/INTEGRATIONS.md','docs/04-api-integrations/INTEGRATIONS.md'),
  @('docs/COMPLIANCE.md','docs/05-security-compliance/COMPLIANCE.md'),
  @('docs/RBAC.md','docs/05-security-compliance/RBAC.md'),
  @('docs/RLS.md','docs/05-security-compliance/RLS.md'),
  @('docs/SECURITY_REVIEW.md','docs/05-security-compliance/SECURITY_REVIEW.md'),
  @('docs/SECURITY-GATE.md','docs/05-security-compliance/SECURITY-GATE.md'),
  @('docs/SECRETS.md','docs/05-security-compliance/SECRETS.md'),
  @('docs/HSTS-PRELOAD.md','docs/05-security-compliance/HSTS-PRELOAD.md'),
  @('docs/incident-response.md','docs/05-security-compliance/INCIDENT_RESPONSE.md'),
  @('docs/security','docs/05-security-compliance/security'),
  @('docs/audit-package','docs/05-security-compliance/audit-package'),
  @('docs/BACKUP_DR.md','docs/06-devops-deployment/BACKUP_DR.md'),
  @('docs/CODE_REVIEW.md','docs/06-devops-deployment/CODE_REVIEW.md'),
  @('docs/PREVIEW_DEPLOYMENT.md','docs/06-devops-deployment/PREVIEW_DEPLOYMENT.md'),
  @('docs/PRODUCTION_DEPLOY.md','docs/06-devops-deployment/PRODUCTION_DEPLOY.md'),
  @('docs/QA_TESTING.md','docs/06-devops-deployment/QA_TESTING.md'),
  @('docs/DAST-RUNBOOK.md','docs/06-devops-deployment/DAST-RUNBOOK.md'),
  @('docs/LOAD-TESTING.md','docs/06-devops-deployment/LOAD-TESTING.md'),
  @('docs/reproducible-build.md','docs/06-devops-deployment/reproducible-build.md'),
  @('docs/RELEASE-CHECKLIST.md','docs/06-devops-deployment/RELEASE-CHECKLIST.md'),
  @('docs/RELEASE-ANNOUNCEMENT-v1.2.1.md','docs/06-devops-deployment/RELEASE-ANNOUNCEMENT-v1.2.1.md'),
  @('docs/ACCESSIBILITY.md','docs/07-operations-marketing/ACCESSIBILITY.md'),
  @('docs/AEO.md','docs/07-operations-marketing/AEO.md'),
  @('docs/AIO.md','docs/07-operations-marketing/AIO.md'),
  @('docs/ANALYTICS.md','docs/07-operations-marketing/ANALYTICS.md'),
  @('docs/ERROR_HANDLING.md','docs/07-operations-marketing/ERROR_HANDLING.md'),
  @('docs/GEO.md','docs/07-operations-marketing/GEO.md'),
  @('docs/MONITORING.md','docs/07-operations-marketing/MONITORING.md'),
  @('docs/PERFORMANCE.md','docs/07-operations-marketing/PERFORMANCE.md'),
  @('docs/SEO.md','docs/07-operations-marketing/SEO.md'),
  @('docs/OBSERVABILITY.md','docs/07-operations-marketing/OBSERVABILITY.md'),
  @('docs/CHANGELOG.md','docs/08-knowledge-management/CHANGELOG.md'),
  @('docs/ITERATION.md','docs/08-knowledge-management/ITERATION.md'),
  @('docs/MEMORY.md','docs/08-knowledge-management/MEMORY.md'),
  @('docs/ONBOARDING.md','docs/08-knowledge-management/ONBOARDING.md'),
  @('docs/RESEARCH.md','docs/08-knowledge-management/RESEARCH.md'),
  @('docs/HANDOFF.md','docs/08-knowledge-management/HANDOFF.md'),
  @('docs/audit','docs/08-knowledge-management/audit'),
  @('docs/historical','docs/08-knowledge-management/historical'),
  @('docs/SPRINT-PLAN-28-40.md','docs/08-knowledge-management/historical/SPRINT-PLAN-28-40.md'),
  @('docs/SPRINT-PLAN-41-45.md','docs/08-knowledge-management/historical/SPRINT-PLAN-41-45.md')
)
$Merges = @(
  @('PRD.md','docs/01-product-discovery/PRD.md','docs/01-product-discovery/PRD.md'),
  @('ARCHITECTURE.md','docs/02-architecture-design/ARCHITECTURE.md','docs/02-architecture-design/ARCHITECTURE.md'),
  @('ENGINEERING-STANDARDS.md','docs/03-development-process/RULES.md','docs/03-development-process/RULES.md'),
  @('docs/disaster-recovery.md','docs/06-devops-deployment/BACKUP_DR.md','06-devops-deployment/BACKUP_DR.md'),
  @('docs/PR-REVIEW-CHECKLIST.md','docs/06-devops-deployment/CODE_REVIEW.md','06-devops-deployment/CODE_REVIEW.md'),
  @('docs/PERFORMANCE-BUDGET.md','docs/07-operations-marketing/PERFORMANCE.md','07-operations-marketing/PERFORMANCE.md'),
  @('KPI-FORMULAS.md','docs/07-operations-marketing/ANALYTICS.md','docs/07-operations-marketing/ANALYTICS.md'),
  @('CHANGELOG.md','docs/08-knowledge-management/CHANGELOG.md','docs/08-knowledge-management/CHANGELOG.md')
)
$SkeletonTitles = @{
  'docs/01-product-discovery/LEGAL_TERMS.md'='Termos Legais e SLAs';
  'docs/01-product-discovery/PRICING_MONETIZATION.md'='Precificação e Monetização';
  'docs/02-architecture-design/DATA_MODEL.md'='Modelo de Dados';
  'docs/02-architecture-design/GREEN_COMPUTING.md'='Green Computing';
  'docs/05-security-compliance/IAM_IGA.md'='Identity and Access Management (IAM/IGA)';
  'docs/05-security-compliance/MFA.md'='Multi-Factor Authentication (MFA)';
  'docs/05-security-compliance/NAC.md'='Network Access Control (NAC)';
  'docs/05-security-compliance/THREAT_MODELING.md'='Modelagem de Ameaças';
  'docs/05-security-compliance/VULNERABILITY_DISCLOSURE.md'='Política de Divulgação de Vulnerabilidades';
  'docs/05-security-compliance/ZTNA.md'='Zero Trust Network Access (ZTNA)';
  'docs/06-devops-deployment/CI_CD_PIPELINE.md'='Esteira de CI/CD';
  'docs/06-devops-deployment/FINOPS.md'='Cultura FinOps';
  'docs/08-knowledge-management/CODE_OF_CONDUCT.md'='Código de Conduta';
  'docs/08-knowledge-management/CONTRIBUTING.md'='Diretrizes de Contribuição';
  'docs/08-knowledge-management/DEPRECATION_POLICY.md'='Política de Descontinuação'
}
$Remaps = @(
  @('DEFINE_THE_USER.md','01-product-discovery/DEFINE_THE_USER.md'),
  @('ROADMAP.md','01-product-discovery/ROADMAP.md'),
  @('PRD.md','01-product-discovery/PRD.md'),
  @('CHOOSE_TECH_STACK.md','02-architecture-design/CHOOSE_TECH_STACK.md'),
  @('DESIGN.md','02-architecture-design/DESIGN.md'),
  @('STYLE_GUIDE.md','02-architecture-design/STYLE_GUIDE.md'),
  @('ARCHITECTURE.md','02-architecture-design/ARCHITECTURE.md'),
  @('ADR.md','02-architecture-design/ADR.md'),
  @('uml/UML.md','02-architecture-design/UML.md'),
  @('UML.md','02-architecture-design/UML.md'),
  @('ARCHITECTURE-MODULES.md','02-architecture-design/ARCHITECTURE-MODULES.md'),
  @('ARCHITECTURE-FREEZE-1.0.md','02-architecture-design/ARCHITECTURE-FREEZE-1.0.md'),
  @('ARCHITECTURE-FREEZE-1.0-BASELINE.md','02-architecture-design/ARCHITECTURE-FREEZE-1.0-BASELINE.md'),
  @('DEVELOPMENT.md','03-development-process/DEVELOPMENT.md'),
  @('SETUP.md','03-development-process/SETUP.md'),
  @('RULES.md','03-development-process/RULES.md'),
  @('TASKS.md','03-development-process/TASKS.md'),
  @('TASK_BREAKING_DOWN.md','03-development-process/TASK_BREAKING_DOWN.md'),
  @('TESTING.md','03-development-process/TESTING.md'),
  @('ISSUES-BACKLOG.md','03-development-process/ISSUES-BACKLOG.md'),
  @('CLEANUP-PLAN.md','03-development-process/CLEANUP-PLAN.md'),
  @('ENGINEERING-STANDARDS.md','03-development-process/RULES.md'),
  @('API.md','04-api-integrations/API.md'),
  @('CONTENT.md','04-api-integrations/CONTENT.md'),
  @('INTEGRATIONS.md','04-api-integrations/INTEGRATIONS.md'),
  @('COMPLIANCE.md','05-security-compliance/COMPLIANCE.md'),
  @('RBAC.md','05-security-compliance/RBAC.md'),
  @('RLS.md','05-security-compliance/RLS.md'),
  @('SECURITY_REVIEW.md','05-security-compliance/SECURITY_REVIEW.md'),
  @('SECURITY-GATE.md','05-security-compliance/SECURITY-GATE.md'),
  @('SECRETS.md','05-security-compliance/SECRETS.md'),
  @('HSTS-PRELOAD.md','05-security-compliance/HSTS-PRELOAD.md'),
  @('incident-response.md','05-security-compliance/INCIDENT_RESPONSE.md'),
  @('security/','05-security-compliance/security/'),
  @('audit-package/','05-security-compliance/audit-package/'),
  @('BACKUP_DR.md','06-devops-deployment/BACKUP_DR.md'),
  @('disaster-recovery.md','06-devops-deployment/BACKUP_DR.md'),
  @('CODE_REVIEW.md','06-devops-deployment/CODE_REVIEW.md'),
  @('PR-REVIEW-CHECKLIST.md','06-devops-deployment/CODE_REVIEW.md'),
  @('PREVIEW_DEPLOYMENT.md','06-devops-deployment/PREVIEW_DEPLOYMENT.md'),
  @('PRODUCTION_DEPLOY.md','06-devops-deployment/PRODUCTION_DEPLOY.md'),
  @('QA_TESTING.md','06-devops-deployment/QA_TESTING.md'),
  @('DAST-RUNBOOK.md','06-devops-deployment/DAST-RUNBOOK.md'),
  @('LOAD-TESTING.md','06-devops-deployment/LOAD-TESTING.md'),
  @('reproducible-build.md','06-devops-deployment/reproducible-build.md'),
  @('RELEASE-CHECKLIST.md','06-devops-deployment/RELEASE-CHECKLIST.md'),
  @('RELEASE-ANNOUNCEMENT-v1.2.1.md','06-devops-deployment/RELEASE-ANNOUNCEMENT-v1.2.1.md'),
  @('ACCESSIBILITY.md','07-operations-marketing/ACCESSIBILITY.md'),
  @('AEO.md','07-operations-marketing/AEO.md'),
  @('AIO.md','07-operations-marketing/AIO.md'),
  @('ANALYTICS.md','07-operations-marketing/ANALYTICS.md'),
  @('ERROR_HANDLING.md','07-operations-marketing/ERROR_HANDLING.md'),
  @('GEO.md','07-operations-marketing/GEO.md'),
  @('MONITORING.md','07-operations-marketing/MONITORING.md'),
  @('PERFORMANCE.md','07-operations-marketing/PERFORMANCE.md'),
  @('SEO.md','07-operations-marketing/SEO.md'),
  @('OBSERVABILITY.md','07-operations-marketing/OBSERVABILITY.md'),
  @('PERFORMANCE-BUDGET.md','07-operations-marketing/PERFORMANCE.md'),
  @('KPI-FORMULAS.md','07-operations-marketing/ANALYTICS.md'),
  @('CHANGELOG.md','08-knowledge-management/CHANGELOG.md'),
  @('ITERATION.md','08-knowledge-management/ITERATION.md'),
  @('MEMORY.md','08-knowledge-management/MEMORY.md'),
  @('ONBOARDING.md','08-knowledge-management/ONBOARDING.md'),
  @('RESEARCH.md','08-knowledge-management/RESEARCH.md'),
  @('HANDOFF.md','08-knowledge-management/HANDOFF.md'),
  @('audit/','08-knowledge-management/audit/'),
  @('historical/','08-knowledge-management/historical/'),
  @('SPRINT-PLAN-28-40.md','08-knowledge-management/historical/SPRINT-PLAN-28-40.md'),
  @('SPRINT-PLAN-41-45.md','08-knowledge-management/historical/SPRINT-PLAN-41-45.md')
)
$Phantoms = @('standalone.md','tricks.md','prosa')

function Get-RepoMdFiles() {
  Get-ChildItem -Recurse -Include '*.md' -File |
    Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' -and $_.FullName -notmatch '[\\/]\.reorg_backup[\\/]' -and $_.FullName -notmatch '[\\/]node_modules[\\/]' }
}

# ---------------------------------------------------------- MODO VALIDATE (read-only)
if ($Validate) {
  $errs = 0
  $docsFiles = Get-ChildItem -Path $DocsDir -Recurse -Include '*.md' -File -Name | ForEach-Object { ('docs/' + $_).Replace('\','/') }
  $moveSrcs = $Moves | ForEach-Object { $_[0].Replace('\','/') }
  $moveDirs = $Moves | Where-Object { !(Test-Path $($_[0]) -PathType Leaf) -or ($_[0] -notlike '*.md') } | ForEach-Object { $_[0].Replace('\','/') }
  $mergeDocsSrcs = $Merges | Where-Object { $_[0] -like 'docs/*' } | ForEach-Object { $_[0].Replace('\','/') }
  function Test-Covered([string]$F) {
    if ($F -eq 'docs/README.md') { return $true }
    if ($moveSrcs -contains $F -or $mergeDocsSrcs -contains $F) { return $true }
    foreach ($d in $moveDirs) { if ($F.StartsWith($d.TrimEnd('/') + '/')) { return $true } }
    return $false
  }
  foreach ($f in $docsFiles) {
    if (!(Test-Covered $f)) {
      Write-Host "[COBERTURA] sem ação mapeada: $f" -ForegroundColor Yellow; $errs++
    }
  }
  $dups = $moveSrcs | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($d in $dups) { Write-Host "[DUP] origem mapeada 2x: $($d.Name)" -ForegroundColor Red; $errs++ }
  if ($SkeletonTitles.Count -ne 15) { Write-Host "[SKEL] esperado 15, há $($SkeletonTitles.Count)" -ForegroundColor Red; $errs++ }
  $mapKeys = $Remaps | ForEach-Object { ('docs/' + $_[0]).TrimEnd('/') }
  foreach ($m in $Moves) {
    $norm = $m[0].TrimEnd('/')
    if ($m[0] -like 'docs/*' -and $mapKeys -notcontains $norm) {
      Write-Host "[REMAP] move sem entrada: $($m[0])" -ForegroundColor Red; $errs++
    }
  }
  if ($errs -eq 0) { Write-Host 'VALIDATE OK: cobertura total, sem dups, 15 skeletons, remaps completos.' -ForegroundColor Green }
  else { Fail "VALIDATE falhou com $errs problema(s)." }
  return
}

# ---------------------------------------------------------------- GATES
# O próprio port é untracked na primeira execução: isentá-lo (e só ele) do gate.
if (!(Test-Path $StageFile)) {
  $dirty = git status --porcelain | Where-Object { $_ -notmatch '^\?\? execute_reorg_p3\.ps1$' }
  if ($dirty) {
    Fail 'Árvore suja (ou untracked além do próprio port). Commit/stash antes de rodar.'
  }
}
if (!(Test-Path $DocsDir) -or !(Test-Path 'AGENTS.md')) { Fail 'Rode na raiz (docs/ + AGENTS.md).' }
$Stage = Get-Stage

# ---------------------------------------------------------------- FASE 1 snapshot
if ($Stage -lt 1) {
  Write-Phase '1' 'Snapshot de hashes pré-migração...'
  New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
  $pre1 = Get-ChildItem -Path $DocsDir -Recurse -Filter '*.md' -File | ForEach-Object { & git hash-object $_.FullName }
  $pre1 | Set-Content "$BackupDir/pre_docs.git_hashes"
  $pre2 = Get-ChildItem -Filter '*.md' -File | ForEach-Object { & git hash-object $_.FullName }
  $pre2 | Set-Content "$BackupDir/pre_raiz.git_hashes"
  Copy-Item -Recurse -Force $DocsDir "$BackupDir/docs_fisi_backup"
  Copy-Item -Force *.md $BackupDir/ -ErrorAction SilentlyContinue
  '1' | Set-Content $StageFile
}

# ---------------------------------------------------------------- FASE 2 moves
if ((Get-Stage) -lt 2) {
  Write-Phase '2' 'Criando 8 pilares + git mv...'
  foreach ($p in $P8) { New-Item -ItemType Directory -Force -Path "$DocsDir/$p" | Out-Null }
  foreach ($m in $Moves) {
    if (Test-Path $m[0]) { Invoke-Git @('mv','--',$m[0],$m[1]); Write-Host "OK: $($m[0]) -> $($m[1])" }
  }
  if ((Test-Path "$DocsDir/uml") -and -not (Get-ChildItem "$DocsDir/uml" -Force)) { Remove-Item -Recurse -Force "$DocsDir/uml" }
  '2' | Set-Content $StageFile
}

# ---------------------------------------------------------------- FASE 3 merges + skeletons + índice
if ((Get-Stage) -lt 3) {
  Write-Phase '3' 'Fusões + esqueletos + índice...'
  foreach ($mg in $Merges) {
    $src, $dst, $rel = $mg
    if (Test-Path $src) {
      $marker = "> **Fundido de:** $src"
      $cur = Read-Utf8 $dst
      if ($cur.Contains($marker)) { Write-Host "Merge já aplicado: $src"; continue }
      $merged = (Read-Utf8 $dst) + "`r`n`r`n> **Fundido de:** $src`r`n`r`n" + (Read-Utf8 $src)
      Write-Utf8 $dst $merged
      Write-Utf8 $src "# Documento Movido`r`n`r`nEste arquivo foi consolidado em: [$dst]($rel)`r`n"
      Invoke-Git @('add','--',$src,$dst)
      Write-Host "Merge: $src -> $dst"
    }
  }
  foreach ($kv in $SkeletonTitles.GetEnumerator()) {
    if (!(Test-Path $kv.Key)) {
      Write-Utf8 $kv.Key "# $($kv.Value)`r`n`r`n## Objetivo`r`n`r`n## Escopo`r`n`r`n## Conteúdo`r`n`r`n## Referências`r`n"
      Invoke-Git @('add','--',$kv.Key)
      Write-Host "Skeleton: $($kv.Key)"
    }
  }
  $idx = "# Índice Geral de Documentação`r`n`r`n" + (($P8 | ForEach-Object { "- $_" }) -join "`r`n") + "`r`n"
  Write-Utf8 "$DocsDir/README.md" $idx
  Invoke-Git @('add','--',"$DocsDir/README.md")
  '3' | Set-Content $StageFile
}

# ---------------------------------------------------------------- FASE 4 fantasmas (report)
if ((Get-Stage) -lt 4) {
  Write-Phase '4' 'Report de links fantasmas (humano no loop)...'
  $rep = '=== REPORT DE REFERRERS PARA LINKS FANTASMAS ==='
  foreach ($link in $Phantoms) {
    $rep += "`r`n`r`nOcorrências de '$link':`r`n"
    $hits = Get-RepoMdFiles | Select-String -Pattern ([regex]::Escape($link)) | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
    if ($hits) { $rep += ($hits -join "`r`n") } else { $rep += 'Nenhuma encontrada.' }
  }
  Write-Utf8 "$BackupDir/links_fantasmas_review.txt" $rep
  '4' | Set-Content $StageFile
}

# ---------------------------------------------------------------- FASE 4b remap mecânico
if ((Get-Stage) -lt 5) {
  Write-Phase '4b' 'Remap em lote (tabela associativa)...'
  $files = Get-RepoMdFiles
  foreach ($r in $Remaps) {
    $pat = 'docs/' + $r[0]
    $rep = 'docs/' + $r[1]
    $isDir = $pat.EndsWith('/')
    foreach ($f in $files) {
      $t = Read-Utf8 $f.FullName
      if ($isDir) { $t2 = $t.Replace($pat, $rep) }
      else { $t2 = [regex]::Replace($t, [regex]::Escape($pat) + '(?![\w.])', $rep) }
      if ($t2 -ne $t) { Write-Utf8 $f.FullName $t2 }
    }
  }
  Invoke-Git @('add','-u')
  '5' | Set-Content $StageFile
}

# ---------------------------------------------------------------- FASE 5 prova + varredura
Write-Phase '5' 'Prova de integridade + varredura final...'
$del = git status --porcelain | Select-String -Pattern '^ D ' -SimpleMatch:$false
if ($del) { Fail "Deleções inesperadas:`n$del" }
$ok = $true
foreach ($h in @((Get-Content "$BackupDir/pre_docs.git_hashes"), (Get-Content "$BackupDir/pre_raiz.git_hashes"))) {
  foreach ($line in $h) {
    $hash = ($line -split '\s+')[0]
    & git cat-file -e $hash 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Host "[QUEBRA] blob perdido: $hash" -ForegroundColor Red; $ok = $false }
  }
}
if (!$ok) { Fail 'Prova de conteúdo falhou.' }
$checkNames = @($Remaps | ForEach-Object { $_[0] }) + @('standalone.md','tricks.md')
$bad = 0
foreach ($n in $checkNames) {
  $hits = Get-RepoMdFiles | Select-String -Pattern ([regex]::Escape('docs/' + $n)) -SimpleMatch:$false
  if ($hits) { Write-Host "[ORFÃ] docs/$n em: $($hits.Path -join ', ')" -ForegroundColor Red; $bad++ }
}
if ($bad -gt 0) { Fail 'Links remanescentes detectados.' }
Remove-Item -Force $StageFile
Write-Host '`n[SUCESSO] Reorg completo, links convertidos, zero perda.' -ForegroundColor Green
