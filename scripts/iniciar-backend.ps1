# Script para iniciar o Backend (porta 5000)
# Usado no script de inicialização do sistema

param(
    [switch]$Ajuda = $false
)

$RootPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackendPath = Join-Path $RootPath "backend"

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\iniciar-backend.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script:" -ForegroundColor Yellow
    Write-Host "  - Verifica se o backend está rodando na porta 5000" -ForegroundColor White
    Write-Host "  - Inicia o backend se não estiver rodando" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO BACKEND (PORTA 5000)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se a porta 5000 está ativa
Write-Host "1. Verificando porta 5000..." -ForegroundColor Yellow
$portaAtiva = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($portaAtiva) {
    Write-Host "   [i] Porta 5000 está em uso" -ForegroundColor Yellow
    
    # Testar conexão
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Backend já está respondendo corretamente" -ForegroundColor Green
            Write-Host ""
            return $true
        }
    } catch {
        Write-Host "   ⚠️  Porta ativa mas backend não responde - liberando porta..." -ForegroundColor Yellow
        # Liberar porta 5000 antes de iniciar
        $killPortsScript = Join-Path $RootPath "scripts\KILL-PORTS.ps1"
        if (Test-Path $killPortsScript) {
            & $killPortsScript -Ports @(5000)
            Start-Sleep -Seconds 2
            Write-Host "   [OK] Porta 5000 liberada" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   [OK] Porta 5000 livre" -ForegroundColor Green
}

# Verificar se o diretório do backend existe
if (-not (Test-Path $BackendPath)) {
    Write-Host "   ❌ Diretório do backend não encontrado: $BackendPath" -ForegroundColor Red
    Write-Host ""
    return $false
}

# Verificar se package.json existe
$packageJson = Join-Path $BackendPath "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "   ❌ package.json não encontrado no backend" -ForegroundColor Red
    Write-Host ""
    return $false
}

# Iniciar o backend
Write-Host "2. Iniciando backend..." -ForegroundColor Yellow
try {
    Set-Location $BackendPath
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "   ⚠️  node_modules não encontrado. Execute 'npm install' primeiro." -ForegroundColor Yellow
        Write-Host ""
        return $false
    }
    
    # Criar diretorio de logs se nao existir
    $logsDir = Join-Path $BackendPath "logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
    }
    # Log unico por sessao para evitar "arquivo em uso por outro processo"
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backendLogPath = Join-Path $logsDir "backend-5000-$timestamp.log"
    
    # Iniciar o backend em uma nova janela (com LOG_TO_FILE e configuracoes dev robustas)
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; `$env:LOG_TO_FILE='true'; `$env:REDIS_ENABLED='false'; `$env:RATE_LIMIT_SKIP_LOCAL='true'; Write-Host 'Iniciando Backend na porta 5000...' -ForegroundColor Cyan; npm run dev 2>&1 | Tee-Object -FilePath '$backendLogPath' -Append" -WindowStyle Normal
    
    # Aguardar backend iniciar (DB + ~50 rotas + jobs = pode levar 20-40s em cold start)
    Write-Host "   Aguardando inicializacao (25 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 25
    
    # Testar conexão (até 20 tentativas x 3s = 60s adicionais)
    $tentativas = 0
    $maxTentativas = 20
    $sucesso = $false
    
    while ($tentativas -lt $maxTentativas -and -not $sucesso) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "   ✅ Backend iniciado e respondendo" -ForegroundColor Green
                $sucesso = $true
            }
        } catch {
            $tentativas++
            if ($tentativas -lt $maxTentativas) {
                Write-Host "   Aguardando... ($tentativas/$maxTentativas)" -ForegroundColor Yellow
                Start-Sleep -Seconds 3
            }
        }
    }
    
    if ($sucesso) {
        Write-Host ""
        return $true
    } else {
        Write-Host "   ⚠️  Backend iniciado mas não respondeu ainda" -ForegroundColor Yellow
        Write-Host "   💡 Verifique a janela do PowerShell para ver os logs" -ForegroundColor Yellow
        Write-Host "   💡 O backend pode precisar de mais tempo para conectar ao banco de dados" -ForegroundColor Yellow
        Write-Host ""
        return $false
    }
    
} catch {
    Write-Host "   ❌ Erro ao iniciar backend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    return $false
} finally {
    Set-Location $RootPath
}
