# Sincroniza Postgres Docker para API P0 / login (A3)
# - Senha TCP alinhada ao .env (volumes antigos costumam divergir)
# - Tabelas auth_rate_limits / login_attempts
param(
  [string]$Project = 'rsv360',
  [string]$DbUser = 'rsv360',
  [string]$DbPassword = 'rsv360_dev_2024',
  [string]$Database = ''
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$sqlFile = Join-Path $root 'database\g4-auth-smoke-tables.sql'
$container = "$Project-postgres"

if (-not (docker ps --format '{{.Names}}' | Select-String -Pattern "^$([regex]::Escape($container))$")) {
  Write-Error "Container $container nao esta rodando. Execute: docker compose -p $Project up -d postgres"
}

Write-Host "Alterando senha TCP do usuario $DbUser ..."
docker exec $container psql -U $DbUser -d postgres -c "ALTER USER $DbUser WITH PASSWORD '$DbPassword';" | Out-Host

if (-not $Database) {
  $list = docker exec $container psql -U $DbUser -d postgres -tAc `
    "SELECT datname FROM pg_database WHERE datname IN ('rsv_360_ecosystem','rsv360') ORDER BY datname"
  $candidates = @($list -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  if ($candidates -contains 'rsv_360_ecosystem') {
    $Database = 'rsv_360_ecosystem'
  } elseif ($candidates -contains 'rsv360') {
    $Database = 'rsv360'
  } else {
    Write-Host "Criando database rsv360 ..."
    docker exec $container psql -U $DbUser -d postgres -c "CREATE DATABASE rsv360 OWNER $DbUser;" | Out-Host
    $Database = 'rsv360'
  }
}

Write-Host "Aplicando smoke tables em $Database ..."
Get-Content $sqlFile -Raw | docker exec -i $container psql -U $DbUser -d $Database | Out-Host

Write-Host ""
Write-Host "OK. Defina no .env:"
Write-Host "  POSTGRES_DB=$Database"
Write-Host "  DB_NAME=$Database"
Write-Host "Recrie site-publico: docker compose -p $Project up -d --force-recreate site-publico"
