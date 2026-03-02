# Script para reiniciar os servidores principais
$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REINICIANDO SERVIDORES PRINCIPAIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos nas portas 3000 e 3005
Write-Host "Parando processos existentes..." -ForegroundColor Yellow

$porta3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
$porta3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($porta3000) {
    Write-Host "  Parando processo na porta 3000 (PID: $porta3000)..." -ForegroundColor Yellow
    Stop-Process -Id $porta3000 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if ($porta3005) {
    Write-Host "  Parando processo na porta 3005 (PID: $porta3005)..." -ForegroundColor Yellow
    Stop-Process -Id $porta3005 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "  [OK] Processos parados" -ForegroundColor Green
Write-Host ""

# Limpar cache do Next.js (opcional)
Write-Host "Deseja limpar o cache do Next.js? (S/N)" -ForegroundColor Yellow
$limparCache = Read-Host
if ($limparCache -eq "S" -or $limparCache -eq "s") {
    Write-Host "Limpando cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$RootPath\apps\site-publico\.next" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$RootPath\apps\turismo\.next" -ErrorAction SilentlyContinue
    Write-Host "  [OK] Cache limpo" -ForegroundColor Green
    Write-Host ""
}

# Iniciar servidores
Write-Host "Iniciando servidores..." -ForegroundColor Yellow

Write-Host "  Iniciando Site Público (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\apps\site-publico'; Write-Host 'Iniciando Site Público na porta 3000...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "  Iniciando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\apps\turismo'; Write-Host 'Iniciando Dashboard Turismo na porta 3005...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] SERVIDORES REINICIADOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Os servidores foram iniciados em janelas separadas." -ForegroundColor Cyan
Write-Host "Aguarde alguns minutos para a compilação do Next.js." -ForegroundColor Yellow
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Yellow
Write-Host "  Site Público: http://localhost:3000" -ForegroundColor White
Write-Host "  Dashboard Turismo: http://localhost:3005" -ForegroundColor White
Write-Host "  Dashboard: http://localhost:3005/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Verifique as janelas do PowerShell para ver os logs e erros." -ForegroundColor Cyan
Write-Host ""

