# Script para verificar e reiniciar o Site Público
# Resolve problemas de páginas não carregando

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$SitePublicoPath = Join-Path $RootPath "apps\site-publico"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO E REINICIANDO SITE PÚBLICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se porta 3000 está em uso
Write-Host "1. Verificando porta 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    $pid = $port3000.OwningProcess | Select-Object -First 1 -Unique
    Write-Host "  [INFO] Porta 3000 em uso (PID: $pid)" -ForegroundColor Gray
    Write-Host "  [INFO] Parando processo..." -ForegroundColor Gray
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Processo parado" -ForegroundColor Green
} else {
    Write-Host "  [OK] Porta 3000 livre" -ForegroundColor Green
}
Write-Host ""

# 2. Limpar cache do Next.js
Write-Host "2. Limpando cache do Next.js..." -ForegroundColor Yellow
$nextPath = Join-Path $SitePublicoPath ".next"
if (Test-Path $nextPath) {
    Remove-Item -Recurse -Force $nextPath -ErrorAction SilentlyContinue
    Write-Host "  [OK] Cache removido" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Cache não existe" -ForegroundColor Gray
}
Write-Host ""

# 3. Verificar arquivos de configuração
Write-Host "3. Verificando arquivos de configuração..." -ForegroundColor Yellow
$files = @(
    "postcss.config.js",
    "tailwind.config.ts",
    "app\globals.css"
)

foreach ($file in $files) {
    $filePath = Join-Path $SitePublicoPath $file
    if (Test-Path $filePath) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] $file não encontrado!" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Iniciar servidor
Write-Host "4. Iniciando servidor..." -ForegroundColor Yellow
Write-Host "  [INFO] Aguarde alguns segundos para compilação..." -ForegroundColor Gray
Write-Host ""

Set-Location $SitePublicoPath

# Iniciar em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SitePublicoPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# 5. Verificar se servidor iniciou
Write-Host "5. Verificando se servidor iniciou..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($portCheck) {
    Write-Host "  [OK] Servidor rodando na porta 3000" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Servidor pode ainda estar iniciando..." -ForegroundColor Yellow
    Write-Host "  [INFO] Verifique a janela do PowerShell" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: http://localhost:3000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se as páginas ainda não carregarem:" -ForegroundColor Yellow
Write-Host "  1. Verifique o console do navegador (F12)" -ForegroundColor White
Write-Host "  2. Verifique o terminal do servidor" -ForegroundColor White
Write-Host "  3. Aguarde alguns minutos para compilação completa" -ForegroundColor White
Write-Host ""

