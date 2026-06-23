$ErrorActionPreference = "Stop"

# Script para iniciar o ambiente DEV "definitivo" abrindo 5 janelas do PowerShell,
# uma por servico: backend, site-publico, admin, guest e turismo.

$root = $PSScriptRoot

function Start-ServiceWindow {
  param(
    [Parameter(Mandatory=$true)][string]$title,
    [Parameter(Mandatory=$true)][string]$workingDir,
    [Parameter(Mandatory=$true)][string]$command
  )

  $cmd = "cd `"$workingDir`"; $command"
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $cmd
  ) | Out-Null

  Write-Host "[START] $title -> $workingDir" -ForegroundColor Cyan
}

Write-Host "Abrindo 5 servicos (janelas separadas)..." -ForegroundColor Green

Start-ServiceWindow -title "Backend API (:3007)" -workingDir (Join-Path $root "backend") -command "npm run dev"
Start-ServiceWindow -title "Site publico (:3000)" -workingDir (Join-Path $root "apps\site-publico") -command "npm run dev"
Start-ServiceWindow -title "Admin (:3004)" -workingDir (Join-Path $root "apps\admin") -command "npm run dev"
Start-ServiceWindow -title "Guest (:3006)" -workingDir (Join-Path $root "apps\guest") -command "npm run dev"

# Turismo: para container Docker, libera :3005 e abre npm run dev (ver scripts\INICIAR-TURISMO-DEV.ps1)
$turismoScript = Join-Path $root "scripts\INICIAR-TURISMO-DEV.ps1"
if (Test-Path $turismoScript) {
  & $turismoScript -RootPath $root
} else {
  Write-Host "[AVISO] INICIAR-TURISMO-DEV.ps1 nao encontrado; iniciando turismo sem parar Docker." -ForegroundColor Yellow
  Start-ServiceWindow -title "Turismo (:3005)" -workingDir (Join-Path $root "apps\turismo") -command "npm run dev"
}

Write-Host "Pronto. Executando health check automático (com retry)..." -ForegroundColor Yellow

$urls = @(
  @{ name = "Backend"; url = "http://localhost:3007/health"; okCodes = @(200) },
  @{ name = "Site"; url = "http://localhost:3000"; okCodes = @(200) },
  @{ name = "Admin"; url = "http://localhost:3004"; okCodes = @(200) },
  @{ name = "Turismo"; url = "http://localhost:3005/login"; okCodes = @(200, 302, 401, 403) },
  @{ name = "Guest"; url = "http://localhost:3006"; okCodes = @(200) }
)

function Test-UrlOk {
  param(
    [Parameter(Mandatory=$true)][string]$name,
    [Parameter(Mandatory=$true)][string]$url,
    [Parameter(Mandatory=$true)][int[]]$okCodes
  )

  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
    foreach ($code in $okCodes) {
      if ($resp.StatusCode -eq $code) { return $true }
    }
    return $false
  } catch {
    return $false
  }
}

$maxAttempts = 24 # ~2 minutos (24 * 5s)
$sleepSeconds = 5

for ($attempt=1; $attempt -le $maxAttempts; $attempt++) {
  $allOk = $true
  Write-Host ("[HEALTH] Attempt {0}/{1}" -f $attempt, $maxAttempts) -ForegroundColor DarkCyan

  foreach ($u in $urls) {
    $ok = Test-UrlOk -name $u.name -url $u.url -okCodes $u.okCodes
    if ($ok) {
      Write-Host ("[HEALTH] {0}: OK" -f $u.name) -ForegroundColor Green
    } else {
      Write-Host ("[HEALTH] {0}: NOT READY" -f $u.name) -ForegroundColor Yellow
      $allOk = $false
    }
  }

  if ($allOk) {
    Write-Host "[HEALTH] Tudo pronto!" -ForegroundColor Green
    break
  }

  Start-Sleep -Seconds $sleepSeconds
}

Write-Host "Turismo (:3005): use http://localhost:3005/login — demo@onionrsv.com / demo123" -ForegroundColor Cyan
Write-Host "Se Turismo ficar em 'Carregando RSV 360°...', veja docs\INICIAR-S1-S2-RAPIDO.md ou rode .\scripts\INICIAR-TURISMO-DEV.ps1" -ForegroundColor Magenta
Write-Host "Se algum servico continuar em loop, use CHECKLIST-ORGANIZACAO-DEV.md e verifique AuthContext/Provider e ports." -ForegroundColor Magenta






