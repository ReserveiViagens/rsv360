# Script para liberar a porta 5000 (Backend Principal)
# Use quando aparecer "Port 5000 is already in use"

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

Write-Host ""
Write-Host "Liberando porta 5000..." -ForegroundColor Yellow
& "$RootPath\scripts\KILL-PORTS.ps1" -Ports @(5000)
Write-Host ""
Write-Host "Pronto! Agora inicie o backend novamente." -ForegroundColor Green
Write-Host ""
