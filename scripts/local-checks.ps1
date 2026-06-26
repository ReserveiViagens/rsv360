param(
  [ValidateSet("test", "smoke", "all")]
  [string]$Action = "all"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$env:DATABASE_URL = "postgresql://rsv360:REDACTED_PG_DEV_PASSWORD@127.0.0.1:5433/rsv_360_ecosystem"
$env:REDIS_URL = "redis://127.0.0.1:6379"
if (-not $env:FORNECEDORES_ENCRYPTION_KEY) {
  $env:FORNECEDORES_ENCRYPTION_KEY = "integration-test-key-32-chars-min!!"
}
Remove-Item Env:REDIS_DISABLED -ErrorAction SilentlyContinue

function Run-HubTests {
  Write-Host "`n=== Testes fornecedores-hub ===" -ForegroundColor Cyan
  Push-Location (Join-Path $Root "backend")
  npm test -- --testPathPattern=fornecedores-hub
  Pop-Location
}

function Run-SmokeLab {
  Write-Host "`n=== Smoke Marketing Lab ===" -ForegroundColor Cyan
  docker compose up -d site-publico redis backend 2>&1 | Out-Null
  Start-Sleep -Seconds 8
  & (Join-Path $Root "scripts\smoke-marketing-lab.ps1")
}

switch ($Action) {
  "test"  { Run-HubTests }
  "smoke" { Run-SmokeLab }
  "all"   { Run-HubTests; Run-SmokeLab }
}
