# Inventario lint por workspace (issue #253)
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'docs/evidence/soak-72h/logs/lint-inventory.tsv'
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null
"workspace`texit`twarnings_note" | Set-Content $out -Encoding utf8
Push-Location $root
try {
  foreach ($ws in @('apps/site-publico', 'apps/admin', 'backend')) {
    Push-Location $ws
    $log = Join-Path $env:TEMP "lint-$($ws -replace '/','-').log"
    npm run lint 2>&1 | Tee-Object $log
    $exit = $LASTEXITCODE
    $warn = (Select-String -Path $log -Pattern 'warning' -AllMatches -ErrorAction SilentlyContinue).Count
    Pop-Location
    "$ws`t$exit`twarnings_approx=$warn" | Add-Content $out
  }
} finally {
  Pop-Location
}
Write-Host "Wrote $out"
Get-Content $out
