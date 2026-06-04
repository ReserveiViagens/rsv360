# Garante instancia canonica Postgres para stack Docker (issue #251)
# Canonico: container rsv360-postgres em :5432
# Windows PG 18 deve usar :5433 (ver POSTGRESQL_CONFIGURADO.md)
param(
  [switch]$Apply,
  [switch]$StopWindowsService
)

$ErrorActionPreference = 'Stop'
$logDir = Join-Path $PSScriptRoot '..\docs\evidence\soak-72h\issues'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$out = Join-Path $logDir 'postgres-inventory.txt'

"=== ensure-postgres-canonical $(Get-Date -Format o) ===" | Out-File $out -Encoding utf8

$listeners = @(Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue)
$listeners | Format-Table -AutoSize | Out-String | Add-Content $out

$pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
  $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
  "$procId -> $($proc.ProcessName) $($proc.Path)" | Add-Content $out
}

$winPg = Get-Service -Name 'postgresql-x64-18' -ErrorAction SilentlyContinue
if ($winPg) {
  "Windows service postgresql-x64-18: $($winPg.Status)" | Add-Content $out
}

docker ps --filter 'name=rsv360-postgres' --format '{{.Names}} {{.Status}} {{.Ports}}' 2>&1 | Add-Content $out

if (-not $Apply) {
  Write-Host "Dry-run. Use -Apply para parar PG Windows em :5432 (requer admin)."
  Write-Host "Log: $out"
  exit 0
}

if ($StopWindowsService -and $winPg -and $winPg.Status -eq 'Running') {
  Write-Host 'Parando postgresql-x64-18 (libera :5432 para Docker)...'
  Stop-Service -Name 'postgresql-x64-18' -Force
  Start-Sleep -Seconds 2
}

$winPostgres = @(Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue |
  Where-Object { (Get-Process -Id $_.OwningProcess -EA SilentlyContinue).ProcessName -eq 'postgres' })
if ($winPostgres.Count -gt 0) {
  Write-Warning "PostgreSQL Windows ainda escuta em :5432. Execute como Administrador ou configure porta 5433 em postgresql.conf."
  exit 1
}

Write-Host 'OK: sem postgres.exe Windows em :5432 — use docker compose -p rsv360 up -d postgres.'
Get-Content $out
