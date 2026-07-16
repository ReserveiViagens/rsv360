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
  # Docker prints progress on stderr; with $ErrorActionPreference=Stop that becomes a
  # terminating NativeCommandError (false positive). Temporarily Continue + check exit.
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    docker compose up -d site-publico redis backend 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "docker compose up failed (exit $LASTEXITCODE)"
    }
  } finally {
    $ErrorActionPreference = $prevEap
  }
  Start-Sleep -Seconds 8
  & (Join-Path $Root "scripts\smoke-marketing-lab.ps1")
}

switch ($Action) {
  "test"  { Run-HubTests }
  "smoke" { Run-SmokeLab }
  "all"   { Run-HubTests; Run-SmokeLab }
}
