# Sobe o site principal S1 (Crm-RSV-360) em :5000 e valida saude.
# Requer Postgres do Docker rsv360 (porta host 5433).
param(
  [string]$S1Root = "$env:USERPROFILE\Documents\GitHub\Crm-RSV-360",
  [string]$Rsv360Root = "$env:USERPROFILE\Documents\rsv360",
  [int]$Port = 5000,
  [int]$MaxWaitSeconds = 90,
  [switch]$NoStart
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "OK $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "WARN $msg" -ForegroundColor Yellow }

Write-Step "=== Site principal S1 (:$Port) ==="

# 1) Postgres Docker (rsv360)
$pgContainer = docker ps --filter "name=rsv360-postgres" --format "{{.Names}}" 2>$null
if (-not $pgContainer) {
  Write-Warn "Container rsv360-postgres nao encontrado. Subindo stack minima..."
  Push-Location $Rsv360Root
  docker compose up -d postgres redis 2>&1 | Out-Host
  Pop-Location
  Start-Sleep -Seconds 5
}

$pgReady = docker exec rsv360-postgres pg_isready -U rsv360 -d rsv_360_ecosystem 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "Postgres nao respondeu em :5433. Verifique: docker compose up -d postgres"
}
Write-Ok "Postgres rsv360 (:5433)"

if (-not (Test-Path $S1Root)) {
  throw "Repositorio S1 nao encontrado: $S1Root"
}

if (-not (Test-Path "$S1Root\node_modules")) {
  Write-Step "Instalando dependencias do S1..."
  Push-Location $S1Root
  npm install 2>&1 | Out-Host
  Pop-Location
}

# 2) DATABASE_URL alinhado ao Docker dev
$dbUrl = "postgresql://rsv360:rsv360_dev_2024@127.0.0.1:5433/rsv_360_ecosystem"
$envFile = Join-Path $S1Root ".env"
if (Test-Path $envFile) {
  $content = Get-Content $envFile -Raw
  if ($content -match '(?m)^DATABASE_URL=.*$') {
    $content = $content -replace '(?m)^DATABASE_URL=.*$', "DATABASE_URL=$dbUrl"
  } else {
    $content += "`nDATABASE_URL=$dbUrl`n"
  }
  Set-Content -Path $envFile -Value $content.TrimEnd() -Encoding UTF8
  Write-Ok ".env DATABASE_URL -> :5433/rsv_360_ecosystem"
}

# 3) Verificar se :5000 ja responde
$healthUrl = "http://127.0.0.1:$Port/health"
$rootUrl = "http://127.0.0.1:$Port/"
$statusUrl = "http://127.0.0.1:$Port/api/status"

foreach ($url in @($healthUrl, $statusUrl, $rootUrl)) {
  $code = curl.exe -s -o NUL -w "%{http_code}" $url 2>$null
  if ($code -eq "200") {
    Write-Ok "$url -> 200 (S1 ja em execucao)"
    Write-Step "Site principal: http://localhost:$Port/"
    Write-Step "=== S1 pronto ==="
    exit 0
  }
}

if ($NoStart) {
  throw "S1 nao esta rodando e -NoStart foi informado"
}

# 4) Porta em uso sem resposta HTTP
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  Write-Warn "Porta $Port em uso (PID $($listener.OwningProcess)). Tentando health antes de reiniciar..."
  $code = curl.exe -s -o NUL -w "%{http_code}" $healthUrl
  if ($code -eq "200") {
    Write-Ok "Servico existente respondeu em /health"
    exit 0
  }
}

Write-Step "Iniciando npm run dev em $S1Root ..."
$logDir = Join-Path $Rsv360Root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir "s1-site-principal.log"
$logErr = Join-Path $logDir "s1-site-principal.err.log"

Push-Location $S1Root
$env:DATABASE_URL = $dbUrl
$env:PORT = "$Port"
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $S1Root `
  -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $logErr
Pop-Location

Write-Step "Aguardando S1 (max ${MaxWaitSeconds}s). Log: $logFile"

$deadline = (Get-Date).AddSeconds($MaxWaitSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 2
  foreach ($url in @($healthUrl, $statusUrl, $rootUrl)) {
    $code = curl.exe -s -o NUL -w "%{http_code}" $url 2>$null
    if ($code -eq "200") {
      $ready = $true
      break
    }
  }
  if ($ready) { break }
}

if (-not $ready) {
  Write-Host "--- ultimas linhas do log ---" -ForegroundColor Yellow
  if (Test-Path $logFile) { Get-Content $logFile -Tail 30 }
  if (Test-Path $logErr) { Get-Content $logErr -Tail 15 }
  throw "S1 nao respondeu em $healthUrl dentro de ${MaxWaitSeconds}s"
}

$statusCode = curl.exe -s -o NUL -w "%{http_code}" "http://127.0.0.1:$Port/api/status"
$rootCode = curl.exe -s -o NUL -w "%{http_code}" $rootUrl

Write-Ok "$healthUrl -> 200"
Write-Ok "/api/status -> $statusCode"
Write-Ok "/ -> $rootCode"
Write-Step "Site principal: http://localhost:$Port/"
Write-Step "Marketing Lab:  http://localhost:3000/lab"
Write-Step "=== S1 pronto ==="
