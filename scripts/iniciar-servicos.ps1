# Script para iniciar backend e frontend simultaneamente

Write-Host "=== INICIAR SERVIÇOS - RSV360 ===" -ForegroundColor Green
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "apps\turismo"

# Verificar se os diretórios existem
if (-not (Test-Path $backendPath)) {
    Write-Host "ERRO: Diretório backend não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "ERRO: Diretório frontend não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar dependências
Write-Host "1. Verificando dependências..." -ForegroundColor Cyan

$backendNodeModules = Join-Path $backendPath "node_modules"
$frontendNodeModules = Join-Path $frontendPath "node_modules"

if (-not (Test-Path $backendNodeModules)) {
    Write-Host "  ⚠️ Backend: node_modules não encontrado" -ForegroundColor Yellow
    Write-Host "    Execute: cd backend && npm install" -ForegroundColor White
}

if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "  ⚠️ Frontend: node_modules não encontrado" -ForegroundColor Yellow
    Write-Host "    Execute: cd apps\turismo && npm install" -ForegroundColor White
}

Write-Host ""
Write-Host "2. Verificando configurações..." -ForegroundColor Cyan

# Verificar .env do backend
$backendEnv = Join-Path $backendPath ".env"
if (Test-Path $backendEnv) {
    Write-Host "  ✅ Backend: .env encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Backend: .env não encontrado" -ForegroundColor Yellow
}

# Verificar .env.local do frontend
$frontendEnv = Join-Path $frontendPath ".env.local"
if (Test-Path $frontendEnv) {
    Write-Host "  ✅ Frontend: .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Frontend: .env.local não encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Iniciando serviços..." -ForegroundColor Cyan
Write-Host ""

Write-Host "=== BACKEND ===" -ForegroundColor Yellow
Write-Host "Diretório: $backendPath" -ForegroundColor White
Write-Host "URL: http://localhost:5000" -ForegroundColor White
Write-Host "Comando: cd backend && npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "=== FRONTEND ===" -ForegroundColor Yellow
Write-Host "Diretório: $frontendPath" -ForegroundColor White
Write-Host "URL: http://localhost:3005" -ForegroundColor White
Write-Host "Comando: cd apps\turismo && npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "=== INSTRUÇÕES ===" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar os serviços, abra 2 terminais:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd apps\turismo" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Após iniciar, acesse:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3005" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""

