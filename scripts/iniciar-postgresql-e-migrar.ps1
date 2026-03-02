# Script para iniciar PostgreSQL e executar migração
# Execute como Administrador

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO POSTGRESQL E MIGRAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Este script precisa ser executado como Administrador!" -ForegroundColor Yellow
    Write-Host "   Clique com botão direito e selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# 1. Iniciar serviço PostgreSQL
Write-Host "1. Iniciando serviço PostgreSQL..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Write-Host "   ✅ Serviço já está rodando" -ForegroundColor Green
    } else {
        Start-Service -Name "postgresql-x64-18" -ErrorAction Stop
        Write-Host "   ✅ Serviço iniciado com sucesso" -ForegroundColor Green
        
        # Aguardar alguns segundos para o serviço inicializar
        Write-Host "   ⏳ Aguardando inicialização..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "   ❌ Erro ao iniciar serviço: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verificar se a porta 5433 está acessível
Write-Host "2. Verificando porta 5433..." -ForegroundColor Yellow
try {
    $connection = Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "   ✅ Porta 5433 está ativa" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Porta 5433 não está ativa ainda. Aguardando..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        $connection = Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "   ✅ Porta 5433 está ativa agora" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Porta 5433 ainda não está ativa" -ForegroundColor Red
            Write-Host "   💡 Verifique a configuração do PostgreSQL em:" -ForegroundColor Yellow
            Write-Host "      C:\Program Files\PostgreSQL\18\data\postgresql.conf" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar a porta" -ForegroundColor Yellow
}

Write-Host ""

# 3. Testar conexão
Write-Host "3. Testando conexão..." -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (Test-Path $psqlPath) {
    try {
        $env:PGPASSWORD = "290491Bb"
        $result = & $psqlPath -U postgres -d postgres -p 5433 -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão bem-sucedida!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Erro na conexão: $result" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Erro ao testar conexão: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  psql.exe não encontrado em $psqlPath" -ForegroundColor Yellow
}

Write-Host ""

# 4. Executar migração
Write-Host "4. Executando migração..." -ForegroundColor Yellow
$scriptPath = Join-Path $PSScriptRoot "migrar-docker-via-docker-exec.js"
if (Test-Path $scriptPath) {
    Write-Host "   📋 Executando script de migração..." -ForegroundColor Cyan
    Write-Host ""
    
    $rootDir = Split-Path (Split-Path $PSScriptRoot)
    Push-Location $rootDir
    
    try {
        node $scriptPath
    } catch {
        Write-Host "   ❌ Erro ao executar migração: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    Write-Host "   ❌ Script de migração não encontrado: $scriptPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONCLUÍDO!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
