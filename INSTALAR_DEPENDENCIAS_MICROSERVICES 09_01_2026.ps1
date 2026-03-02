# Script para instalar dependências de todos os microserviços
$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$MicroservicesPath = Join-Path $RootPath "backend\microservices"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTALANDO DEPENDÊNCIAS DOS MICROSERVIÇOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$microservices = @(
    "core-api", "user-management", "hotel-management", "travel-api", "booking-engine",
    "finance-api", "tickets-api", "payments-gateway", "ecommerce-api", "attractions-api",
    "vouchers-api", "voucher-editor", "giftcards-api", "coupons-api", "parks-api",
    "maps-api", "visa-processing", "marketing-api", "subscriptions", "seo-api",
    "multilingual", "videos-api", "photos-api", "admin-panel", "analytics-api",
    "reports-api", "data-management", "notifications", "reviews-api", "rewards-api",
    "loyalty-api", "sales-api"
)

$installed = 0
$failed = 0

foreach ($ms in $microservices) {
    $msPath = Join-Path $MicroservicesPath $ms
    
    if (Test-Path $msPath) {
        Write-Host "Instalando dependências de $ms..." -ForegroundColor Yellow
        
        try {
            Set-Location $msPath
            npm install --silent 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                $installed++
                Write-Host "  [OK] $ms - Dependências instaladas" -ForegroundColor Green
            } else {
                $failed++
                Write-Host "  [ERRO] Falha ao instalar dependências de $ms" -ForegroundColor Red
            }
        } catch {
            $failed++
            Write-Host "  [ERRO] Erro ao instalar $ms : $_" -ForegroundColor Red
        } finally {
            Set-Location $RootPath
        }
    } else {
        Write-Host "  [AVISO] $ms não encontrado em $msPath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estatísticas:" -ForegroundColor Cyan
Write-Host "  Instalados: $installed" -ForegroundColor Green
Write-Host "  Falhas: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "  Total: $($microservices.Count)" -ForegroundColor Cyan
Write-Host ""

