# Script para iniciar todos os servidores de desenvolvimento
param(
    [switch]$Backend = $false,
    [switch]$Turismo = $false,
    [switch]$Site = $false,
    [switch]$Todos = $true
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO SERVIDORES RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Todos -or $Backend) {
    Write-Host "Iniciando Backend (porta 5000)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev:backend" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Backend iniciado" -ForegroundColor Green
}

if ($Todos -or $Turismo) {
    Write-Host "Iniciando Dashboard de Turismo (porta 3005)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev:turismo" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Dashboard iniciado" -ForegroundColor Green
}

if ($Todos -or $Site) {
    Write-Host "Iniciando Site Publico (porta 3000)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev:site" -WindowStyle Normal
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Site Publico iniciado" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] SERVIDORES INICIADOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Yellow
Write-Host "  Dashboard: http://localhost:3005/dashboard" -ForegroundColor White
Write-Host "  Modulos: http://localhost:3005/dashboard/modulos-turismo" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  Site Publico: http://localhost:3000/" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Os servidores foram iniciados em janelas separadas." -ForegroundColor Cyan
Write-Host "Verifique as janelas do PowerShell para ver os logs." -ForegroundColor Cyan
Write-Host ""

