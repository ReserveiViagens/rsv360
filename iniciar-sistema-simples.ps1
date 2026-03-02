# Script simplificado para iniciar sistema completo
$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$BackendPath = Join-Path $RootPath "backend"
$MicroservicesPath = Join-Path $RootPath "backend\microservices"

Set-Location $RootPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend Principal
Write-Host "[1] Iniciando Backend Principal (porta 5000)..." -ForegroundColor Yellow
$backendServer = Join-Path $BackendPath "src\server.js"
if (Test-Path $backendServer) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'Backend Principal (porta 5000)' -ForegroundColor Cyan; node src\server.js" -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "  Backend Principal iniciado" -ForegroundColor Green
}

# 2. Backend Admin/CMS
Write-Host "[2] Iniciando Backend Admin/CMS (porta 5002)..." -ForegroundColor Yellow
$adminServer = Join-Path $BackendPath "server-5002.js"
if (Test-Path $adminServer) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'Backend Admin/CMS (porta 5002)' -ForegroundColor Cyan; node server-5002.js" -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "  Backend Admin/CMS iniciado" -ForegroundColor Green
}

# 3. Microservicos (32 servicos)
Write-Host "[3] Iniciando 32 Microservicos..." -ForegroundColor Yellow
$microservices = @(
    "core-api", "user-management", "hotel-management", "travel-api", "booking-engine",
    "finance-api", "tickets-api", "payments-gateway", "ecommerce-api", "attractions-api",
    "vouchers-api", "voucher-editor", "giftcards-api", "coupons-api", "parks-api",
    "maps-api", "visa-processing", "marketing-api", "subscriptions", "seo-api",
    "multilingual", "videos-api", "photos-api", "admin-panel", "analytics-api",
    "reports-api", "data-management", "notifications", "reviews-api", "rewards-api",
    "loyalty-api", "sales-api"
)

$started = 0
foreach ($ms in $microservices) {
    $msPath = Join-Path $MicroservicesPath $ms
    if (Test-Path $msPath) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$msPath'; Write-Host '[$ms] Iniciando...' -ForegroundColor Cyan; npm start" -WindowStyle Minimized
        Start-Sleep -Milliseconds 200
        $started++
    }
}
Write-Host "  $started microservicos iniciados" -ForegroundColor Green

# 4. Dashboard Turismo
Write-Host "[4] Iniciando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
$turismoPath = Join-Path $RootPath "apps\turismo"
if (Test-Path $turismoPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$turismoPath'; Write-Host 'DASHBOARD TURISMO (Porta 3005)' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  Dashboard Turismo iniciado" -ForegroundColor Green
}

# 5. Site Publico
Write-Host "[5] Iniciando Site Publico (porta 3000)..." -ForegroundColor Yellow
$sitePublicoPath = Join-Path $RootPath "apps\site-publico"
if (Test-Path $sitePublicoPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$sitePublicoPath'; Write-Host 'SITE PUBLICO (Porta 3000)' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  Site Publico iniciado" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SISTEMA COMPLETO INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Site Publico: http://localhost:3000" -ForegroundColor White
Write-Host "  CMS Admin: http://localhost:3000/admin/cms" -ForegroundColor White
Write-Host "  Dashboard Turismo: http://localhost:3005" -ForegroundColor White
Write-Host "  Backend Principal: http://localhost:5000" -ForegroundColor White
Write-Host "  Backend Admin/CMS: http://localhost:5002" -ForegroundColor White
Write-Host ""
Write-Host "Aguarde alguns minutos para compilacao do Next.js..." -ForegroundColor Cyan
