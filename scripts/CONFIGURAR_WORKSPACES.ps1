# Script para configurar workspaces e instalar dependências
param(
    [string]$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURANDO WORKSPACES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $RootPath

# Verificar se npm está instalado
Write-Host "Verificando Node.js e npm..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
$npmVersion = npm --version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Node.js ou npm não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "  [OK] npm: $npmVersion" -ForegroundColor Green

# Instalar dependências root
Write-Host ""
Write-Host "Instalando dependências root..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao instalar dependências root" -ForegroundColor Red
    exit 1
}

Write-Host "  [OK] Dependências root instaladas" -ForegroundColor Green

# Instalar dependências de cada workspace
Write-Host ""
Write-Host "Instalando dependências dos workspaces..." -ForegroundColor Yellow

$workspaces = @(
    "apps/turismo",
    "apps/site-publico",
    "apps/guest",
    "apps/admin",
    "apps/atendimento-ia",
    "backend"
)

foreach ($workspace in $workspaces) {
    $workspacePath = Join-Path $RootPath $workspace
    if (Test-Path $workspacePath) {
        Write-Host "  Instalando: $workspace..." -ForegroundColor Cyan
        Set-Location $workspacePath
        if (Test-Path "package.json") {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    [OK] $workspace" -ForegroundColor Green
            } else {
                Write-Host "    [AVISO] $workspace - Alguns erros podem ter ocorrido" -ForegroundColor Yellow
            }
        } else {
            Write-Host "    [PULADO] $workspace - Sem package.json" -ForegroundColor Yellow
        }
        Set-Location $RootPath
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Execute: npm run dev" -ForegroundColor White
Write-Host "  2. Acesse: http://localhost:3005/dashboard/modulos-turismo" -ForegroundColor White
Write-Host ""

