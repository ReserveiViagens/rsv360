# Script para iniciar o sistema completo usando NPM Workspaces
# Versão que aproveita workspaces do NPM + Backends + 32 microserviços
param(
    [switch]$Ajuda = $false
)

# Usar pasta DEFINITIVA (onde está o script principal)
$RootPath = if ($PSScriptRoot) { $PSScriptRoot } else { "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo" }
$MicroservicesPath = Join-Path $RootPath "backend\microservices"
$BackendPath = Join-Path $RootPath "backend"

Set-Location $RootPath

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\Iniciar Sistema Completo (Workspaces).ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script inicia usando NPM Workspaces:" -ForegroundColor Yellow
    Write-Host "  - Backends: Principal (5000), Admin/CMS (5002)" -ForegroundColor White
    Write-Host "  - 32 Microserviços (portas 6000-6031) - Independentes" -ForegroundColor White
    Write-Host "  - Dashboard Turismo (porta 3005) - Workspace: apps/turismo" -ForegroundColor White
    Write-Host "  - Site Público (porta 3000) - Workspace: apps/site-publico" -ForegroundColor White
    Write-Host "  - Frontend Oficial (porta 3001)" -ForegroundColor White
    Write-Host ""
    Write-Host "Vantagens:" -ForegroundColor Yellow
    Write-Host "  - Usa dependências compartilhadas do root" -ForegroundColor Green
    Write-Host "  - Versões consistentes via overrides" -ForegroundColor Green
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
Write-Host "(Usando NPM Workspaces)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. Backends primeiro
Write-Host "0. Iniciando Backends..." -ForegroundColor Yellow
$serverPath = Join-Path $BackendPath "src\server.js"
$adminPath = Join-Path $BackendPath "server-5002.js"
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$logsDir = Join-Path $RootPath "backend\logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Force -Path $logsDir | Out-Null }
$log5000 = Join-Path $logsDir "backend-5000-$ts.log"
$log5002 = Join-Path $logsDir "backend-5002.log"

if (Test-Path $serverPath) {
    try {
        $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; `$env:LOG_TO_FILE='true'; `$env:REDIS_ENABLED='false'; Write-Host 'BACKEND PRINCIPAL (5000)' -ForegroundColor Cyan; node src\server.js 2>&1 | Tee-Object -FilePath '$log5000' -Append" -WindowStyle Normal -PassThru
        if ($p) { Write-Host "  [OK] Backend Principal (PID: $($p.Id))" -ForegroundColor Green }
        Start-Sleep -Seconds 2
    } catch { Write-Host "  [ERRO] Backend Principal: $($_.Exception.Message)" -ForegroundColor Red }
}
if (Test-Path $adminPath) {
    try {
        $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'BACKEND ADMIN/CMS (5002)' -ForegroundColor Cyan; node server-5002.js 2>&1 | Tee-Object -FilePath '$log5002' -Append" -WindowStyle Normal -PassThru
        if ($p) { Write-Host "  [OK] Backend Admin/CMS (PID: $($p.Id))" -ForegroundColor Green }
        Start-Sleep -Seconds 2
    } catch { Write-Host "  [ERRO] Backend Admin: $($_.Exception.Message)" -ForegroundColor Red }
}
Write-Host ""

# 1. Microserviços (32)
$microservices = @(
    @{Name="core-api"; Port=6000}, @{Name="user-management"; Port=6001}, @{Name="hotel-management"; Port=6002},
    @{Name="travel-api"; Port=6003}, @{Name="booking-engine"; Port=6004}, @{Name="finance-api"; Port=6005},
    @{Name="tickets-api"; Port=6006}, @{Name="payments-gateway"; Port=6007}, @{Name="ecommerce-api"; Port=6008},
    @{Name="attractions-api"; Port=6009}, @{Name="vouchers-api"; Port=6010}, @{Name="voucher-editor"; Port=6011},
    @{Name="giftcards-api"; Port=6012}, @{Name="coupons-api"; Port=6013}, @{Name="parks-api"; Port=6014},
    @{Name="maps-api"; Port=6015}, @{Name="visa-processing"; Port=6016}, @{Name="marketing-api"; Port=6017},
    @{Name="subscriptions"; Port=6018}, @{Name="seo-api"; Port=6019}, @{Name="multilingual"; Port=6020},
    @{Name="videos-api"; Port=6021}, @{Name="photos-api"; Port=6022}, @{Name="admin-panel"; Port=6023},
    @{Name="analytics-api"; Port=6024}, @{Name="reports-api"; Port=6025}, @{Name="data-management"; Port=6026},
    @{Name="notifications"; Port=6027}, @{Name="reviews-api"; Port=6028}, @{Name="rewards-api"; Port=6029},
    @{Name="loyalty-api"; Port=6030}, @{Name="sales-api"; Port=6031}
)

$started = 0
$failed = 0
Write-Host "1. Iniciando 32 Microserviços (portas 6000-6031)..." -ForegroundColor Yellow
foreach ($ms in $microservices) {
    $msPath = Join-Path $MicroservicesPath $ms.Name
    if (Test-Path $msPath) {
        try {
            $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$msPath'; Write-Host '[$($ms.Name)] Porta $($ms.Port)' -ForegroundColor Cyan; npm start" -WindowStyle Normal -PassThru
            if ($p) { $started++ }
            Start-Sleep -Milliseconds 300
        } catch { $failed++; Write-Host "  [ERRO] $($ms.Name)" -ForegroundColor Red }
    }
}
Write-Host "  [OK] $started microserviços iniciados" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

# 2. Dashboard Turismo (NPM Workspace)
Write-Host "2. Iniciando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
Write-Host "   [INFO] Workspace: apps/turismo" -ForegroundColor Cyan
try {
    $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; Write-Host 'DASHBOARD TURISMO (3005) - NPM Workspace' -ForegroundColor Cyan; npm run dev --workspace=apps/turismo" -WindowStyle Normal -PassThru
    if ($p) { Write-Host "  [OK] Dashboard Turismo (PID: $($p.Id))" -ForegroundColor Green }
    Start-Sleep -Seconds 2
} catch { Write-Host "  [ERRO] Dashboard Turismo" -ForegroundColor Red; $failed++ }
Write-Host ""

# 3. Site Público (NPM Workspace)
Write-Host "3. Iniciando Site Público (porta 3000)..." -ForegroundColor Yellow
Write-Host "   [INFO] Workspace: apps/site-publico" -ForegroundColor Cyan
try {
    $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; Write-Host 'SITE PUBLICO (3000) - NPM Workspace' -ForegroundColor Cyan; npm run dev --workspace=apps/site-publico" -WindowStyle Normal -PassThru
    if ($p) { Write-Host "  [OK] Site Público (PID: $($p.Id))" -ForegroundColor Green }
    Start-Sleep -Seconds 2
} catch { Write-Host "  [ERRO] Site Público" -ForegroundColor Red; $failed++ }
Write-Host ""

# 4. Frontend Oficial (3001)
$frontendOficialRoot = Split-Path $RootPath -Parent
$frontendOficialPath = Join-Path $frontendOficialRoot "rsv360-servidor-oficial\frontend"
Write-Host "4. Iniciando Frontend Oficial (porta 3001)..." -ForegroundColor Yellow
if (Test-Path $frontendOficialPath) {
    try {
        $p = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendOficialPath'; Write-Host 'FRONTEND OFICIAL (3001)' -ForegroundColor Cyan; npm run dev -- -p 3001" -WindowStyle Normal -PassThru
        if ($p) { Write-Host "  [OK] Frontend Oficial (PID: $($p.Id))" -ForegroundColor Green; Write-Host "  [i] Contrato Spazzio: http://localhost:3001/reservei/contrato-spazzio-diroma" -ForegroundColor Cyan }
        Start-Sleep -Seconds 2
    } catch { Write-Host "  [ERRO] Frontend Oficial" -ForegroundColor Red; $failed++ }
} else { Write-Host "  [!] Frontend Oficial nao encontrado: $frontendOficialPath" -ForegroundColor Yellow }
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] SISTEMA COMPLETO INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs principais:" -ForegroundColor Yellow
Write-Host "  Site Público:       http://localhost:3000" -ForegroundColor White
Write-Host "  CMS Admin:         http://localhost:3000/admin/cms" -ForegroundColor White
Write-Host "  Dashboard Turismo: http://localhost:3005/dashboard" -ForegroundColor White
Write-Host "  Backend Principal: http://localhost:5000" -ForegroundColor White
Write-Host "  Backend Admin:      http://localhost:5002" -ForegroundColor White
Write-Host "  Microserviços:     http://localhost:6000/health ... 6031/health" -ForegroundColor Gray
Write-Host ""
Write-Host "NOVAS APLICACOES (criadas no projeto):" -ForegroundColor Yellow
Write-Host "  Frontend Oficial:   http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Contrato Spazzio:   http://localhost:3001/reservei/contrato-spazzio-diroma" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Aguarde alguns minutos para compilação do Next.js." -ForegroundColor Cyan
Write-Host "Verifique as janelas do PowerShell para ver os logs." -ForegroundColor Cyan
Write-Host ""
