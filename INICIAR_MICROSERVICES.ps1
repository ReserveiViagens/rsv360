# Script para iniciar todos os microserviços do RSV360
param(
    [switch]$Todos = $true,
    [switch]$Core = $false,
    [switch]$Booking = $false,
    [switch]$Payments = $false,
    [switch]$Analytics = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$MicroservicesPath = Join-Path $RootPath "backend\microservices"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO MICROSERVIÇOS RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lista de todos os microserviços com suas portas
$microservices = @(
    @{Name="core-api"; Port=6000},
    @{Name="user-management"; Port=6001},
    @{Name="hotel-management"; Port=6002},
    @{Name="travel-api"; Port=6003},
    @{Name="booking-engine"; Port=6004},
    @{Name="finance-api"; Port=6005},
    @{Name="tickets-api"; Port=6006},
    @{Name="payments-gateway"; Port=6007},
    @{Name="ecommerce-api"; Port=6008},
    @{Name="attractions-api"; Port=6009},
    @{Name="vouchers-api"; Port=6010},
    @{Name="voucher-editor"; Port=6011},
    @{Name="giftcards-api"; Port=6012},
    @{Name="coupons-api"; Port=6013},
    @{Name="parks-api"; Port=6014},
    @{Name="maps-api"; Port=6015},
    @{Name="visa-processing"; Port=6016},
    @{Name="marketing-api"; Port=6017},
    @{Name="subscriptions"; Port=6018},
    @{Name="seo-api"; Port=6019},
    @{Name="multilingual"; Port=6020},
    @{Name="videos-api"; Port=6021},
    @{Name="photos-api"; Port=6022},
    @{Name="admin-panel"; Port=6023},
    @{Name="analytics-api"; Port=6024},
    @{Name="reports-api"; Port=6025},
    @{Name="data-management"; Port=6026},
    @{Name="notifications"; Port=6027},
    @{Name="reviews-api"; Port=6028},
    @{Name="rewards-api"; Port=6029},
    @{Name="loyalty-api"; Port=6030},
    @{Name="sales-api"; Port=6031}
)

$started = 0
$failed = 0

foreach ($ms in $microservices) {
    $msPath = Join-Path $MicroservicesPath $ms.Name
    
    if (Test-Path $msPath) {
        Write-Host "Iniciando $($ms.Name) (porta $($ms.Port))..." -ForegroundColor Yellow
        
        try {
            # Inicia cada microserviço em uma janela separada
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$msPath'; npm start" -WindowStyle Minimized
            Start-Sleep -Milliseconds 500
            $started++
            Write-Host "  [OK] $($ms.Name) iniciado na porta $($ms.Port)" -ForegroundColor Green
        } catch {
            $failed++
            Write-Host "  [ERRO] Falha ao iniciar $($ms.Name)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [AVISO] $($ms.Name) não encontrado em $msPath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] MICROSERVIÇOS INICIADOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estatísticas:" -ForegroundColor Cyan
Write-Host "  Iniciados: $started" -ForegroundColor Green
Write-Host "  Falhas: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "URLs de acesso (health check):" -ForegroundColor Yellow
Write-Host "  Core API: http://localhost:6000/health" -ForegroundColor White
Write-Host "  Booking Engine: http://localhost:6004/health" -ForegroundColor White
Write-Host "  Payments Gateway: http://localhost:6007/health" -ForegroundColor White
Write-Host "  Analytics API: http://localhost:6024/health" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Os microserviços foram iniciados em janelas minimizadas." -ForegroundColor Cyan
Write-Host "Verifique as janelas do PowerShell para ver os logs." -ForegroundColor Cyan
Write-Host ""
Write-Host "Para verificar todos os serviços, acesse:" -ForegroundColor Yellow
Write-Host "  http://localhost:6000/health até http://localhost:6031/health" -ForegroundColor White
Write-Host ""

