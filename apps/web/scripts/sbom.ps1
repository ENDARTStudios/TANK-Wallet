# SBOM generator (CycloneDX). PowerShell version for Windows.
# Usage: powershell -File scripts/sbom.ps1 [output-path]

param([string]$Out = "reports/sbom.cyclonedx.json")

$dir = Split-Path -Parent $Out
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$npm = Get-Command npx -ErrorAction SilentlyContinue
if ($npm) {
  & npx --yes @cyclonedx/cyclonedx-npm --output-file $Out 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Out)) {
    '{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}' | Out-File -FilePath $Out -Encoding utf8
  }
} else {
  '{"bomFormat":"CycloneDX","specVersion":"1.5","components":[]}' | Out-File -FilePath $Out -Encoding utf8
}
Write-Host "SBOM written: $Out"
