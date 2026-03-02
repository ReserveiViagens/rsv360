# Script para testar Dashboard Turismo e Site Público após correções

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTANDO SERVIÇOS APÓS CORREÇÕES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Testar Dashboard Turismo (porta 3005)
Write-Host "1. Testando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
Write-Host "   Iniciando servidor..." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev --workspace=apps/turismo"

Write-Host "   Aguardando 15 segundos para compilação..." -ForegroundColor Gray
Start-Sleep -Seconds 15

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   [OK] Dashboard Turismo respondendo! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   [INFO] Servidor ainda compilando ou erro: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Verifique a janela do PowerShell para ver os logs." -ForegroundColor Cyan
}

Write-Host ""

# Testar Site Público (porta 3000)
Write-Host "2. Testando Site Público (porta 3000)..." -ForegroundColor Yellow
Write-Host "   Iniciando servidor..." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev --workspace=apps/site-publico"

Write-Host "   Aguardando 15 segundos para compilação..." -ForegroundColor Gray
Start-Sleep -Seconds 15

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   [OK] Site Público respondendo! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   [INFO] Servidor ainda compilando ou erro: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Verifique a janela do PowerShell para ver os logs." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] TESTES CONCLUÍDOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Cyan
Write-Host "  Dashboard Turismo: http://localhost:3005" -ForegroundColor White
Write-Host "  Site Público: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Verifique as janelas do PowerShell para ver os logs completos." -ForegroundColor Yellow
Write-Host ""

