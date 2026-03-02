# Script para corrigir problema de múltiplas instâncias do React

Write-Host "=== CORRIGIR REACT MÚLTIPLO ===" -ForegroundColor Green
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$turismoPath = Join-Path $projectRoot "apps\turismo"

if (-not (Test-Path $turismoPath)) {
    Write-Host "ERRO: Diretório apps\turismo não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "1. Limpando cache do Next.js..." -ForegroundColor Cyan
$nextPath = Join-Path $turismoPath ".next"
if (Test-Path $nextPath) {
    Remove-Item -Recurse -Force $nextPath -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache limpo" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Cache não encontrado (já está limpo)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. Verificando configurações..." -ForegroundColor Cyan

$nextConfig = Join-Path $turismoPath "next.config.js"
$npmrc = Join-Path $turismoPath ".npmrc"

if (Test-Path $nextConfig) {
    Write-Host "   ✅ next.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ next.config.js não encontrado" -ForegroundColor Red
}

if (Test-Path $npmrc) {
    Write-Host "   ✅ .npmrc encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ .npmrc não encontrado (será criado)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Verificando React local..." -ForegroundColor Cyan

$reactPath = Join-Path $turismoPath "node_modules\react"
if (Test-Path $reactPath) {
    $reactVersion = (Get-Content (Join-Path $reactPath "package.json") | ConvertFrom-Json).version
    Write-Host "   ✅ React local encontrado: v$reactVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ React local não encontrado" -ForegroundColor Red
    Write-Host "   Execute: cd apps\turismo && npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== PRÓXIMOS PASSOS ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Pare o servidor frontend (Ctrl+C)" -ForegroundColor White
Write-Host ""
Write-Host "2. Reinicie o frontend:" -ForegroundColor Cyan
Write-Host "   cd apps\turismo" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Se o problema persistir, reinstale as dependências:" -ForegroundColor Cyan
Write-Host "   cd apps\turismo" -ForegroundColor White
Write-Host "   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host ""

