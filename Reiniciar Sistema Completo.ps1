# Script para reiniciar o sistema completo
# Para tudo, limpa portas, cache e janelas PowerShell, depois reinicia
param(
    [switch]$Ajuda = $false,
    [switch]$Forcar = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$MicroservicesPath = Join-Path $RootPath "backend\microservices"

Set-Location $RootPath

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\Reiniciar Sistema Completo.ps1 [-Forcar]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script:" -ForegroundColor Yellow
    Write-Host "  1. Para todos os serviços (Microserviços + Dashboard + Site Público)" -ForegroundColor White
    Write-Host "  2. Limpa portas 3000, 3005 e 6000-6031" -ForegroundColor White
    Write-Host "  3. Limpa cache do Next.js" -ForegroundColor White
    Write-Host "  4. Fecha janelas do PowerShell relacionadas" -ForegroundColor White
    Write-Host "  5. Reinicia todos os serviços" -ForegroundColor White
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  -Forcar    Força o reinício sem confirmação" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REINICIANDO SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Confirmação (se não usar -Forcar)
if (-not $Forcar) {
    Write-Host "Tem certeza que deseja reiniciar todo o sistema? (S/N)" -ForegroundColor Yellow
    $confirmacao = Read-Host
    if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit
    }
    Write-Host ""
}

# ========================================
# FASE 1: PARAR TODOS OS SERVIÇOS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "FASE 1: PARANDO SERVIÇOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$totalParados = 0

# Parar Microserviços (portas 6000-6031)
Write-Host "1.1. Parando Microserviços (portas 6000-6031)..." -ForegroundColor Yellow
$microservicesStopped = 0
for ($port = 6000; $port -le 6031; $port++) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                $microservicesStopped++
                $totalParados++
            } catch {
                # Ignorar erros
            }
        }
    }
}
Write-Host "  [OK] $microservicesStopped microserviços parados" -ForegroundColor Green
Write-Host ""

# Parar Dashboard Turismo (porta 3005)
Write-Host "1.2. Parando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
$porta3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($porta3005) {
    try {
        Stop-Process -Id $porta3005 -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Dashboard Turismo parado (PID: $porta3005)" -ForegroundColor Green
        $totalParados++
    } catch {
        Write-Host "  [AVISO] Falha ao parar Dashboard Turismo" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] Dashboard Turismo não está rodando" -ForegroundColor Gray
}
Write-Host ""

# Parar Site Público (porta 3000)
Write-Host "1.3. Parando Site Público (porta 3000)..." -ForegroundColor Yellow
$porta3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($porta3000) {
    try {
        Stop-Process -Id $porta3000 -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Site Público parado (PID: $porta3000)" -ForegroundColor Green
        $totalParados++
    } catch {
        Write-Host "  [AVISO] Falha ao parar Site Público" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] Site Público não está rodando" -ForegroundColor Gray
}
Write-Host ""

# Aguardar processos finalizarem
Write-Host "1.4. Aguardando processos finalizarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "  [OK] Aguardado" -ForegroundColor Green
Write-Host ""

# ========================================
# FASE 2: LIMPAR PORTAS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "FASE 2: LIMPANDO PORTAS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$killPortsScript = Join-Path $RootPath "scripts\KILL-PORTS.ps1"
if (Test-Path $killPortsScript) {
    try {
        # Limpar portas principais
        Write-Host "2.1. Limpando portas 3000 e 3005..." -ForegroundColor Yellow
        & $killPortsScript -Ports @(3000, 3005)
        Start-Sleep -Seconds 1
        
        # Limpar portas dos microserviços (em lotes para não demorar muito)
        Write-Host "2.2. Limpando portas dos microserviços (6000-6031)..." -ForegroundColor Yellow
        $ports = 6000..6031
        & $killPortsScript -Ports $ports
        Start-Sleep -Seconds 1
        
        Write-Host "  [OK] Portas limpas" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao limpar portas: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [AVISO] Script KILL-PORTS.ps1 não encontrado" -ForegroundColor Yellow
    Write-Host "  [INFO] Continuando mesmo assim..." -ForegroundColor Gray
}
Write-Host ""

# ========================================
# FASE 3: LIMPAR CACHE DO NEXT.JS
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "FASE 3: LIMPANDO CACHE DO NEXT.JS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$clearCacheScript = Join-Path $RootPath "scripts\LIMPAR-CACHE-NEXTJS.ps1"
if (Test-Path $clearCacheScript) {
    try {
        Write-Host "3.1. Limpando cache do Next.js..." -ForegroundColor Yellow
        & $clearCacheScript -Apps @("site-publico", "turismo")
        Write-Host "  [OK] Cache limpo" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [AVISO] Script LIMPAR-CACHE-NEXTJS.ps1 não encontrado" -ForegroundColor Yellow
    Write-Host "  [INFO] Limpando manualmente..." -ForegroundColor Gray
    
    # Fallback: limpar manualmente
    $nextPaths = @(
        (Join-Path $RootPath "apps\site-publico\.next"),
        (Join-Path $RootPath "apps\turismo\.next")
    )
    
    foreach ($path in $nextPaths) {
        if (Test-Path $path) {
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        }
    }
    Write-Host "  [OK] Cache limpo (fallback)" -ForegroundColor Green
}
Write-Host ""

# ========================================
# FASE 4: FECHAR JANELAS DO POWERSHELL
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "FASE 4: FECHANDO JANELAS POWERSHELL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "4.1. Identificando janelas do PowerShell relacionadas..." -ForegroundColor Yellow

# Obter todos os processos PowerShell
$powershellProcesses = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -ne "" -and 
    ($_.MainWindowTitle -like "*npm*" -or 
     $_.MainWindowTitle -like "*node*" -or
     $_.MainWindowTitle -like "*dev*" -or
     $_.MainWindowTitle -like "*start*" -or
     $_.Path -like "*RSV360*")
}

$windowsClosed = 0

# Tentar fechar janelas relacionadas ao sistema
foreach ($proc in $powershellProcesses) {
    try {
        # Verificar se o processo tem janela visível
        if ($proc.MainWindowTitle -ne "") {
            $title = $proc.MainWindowTitle
            Write-Host "  Fechando: $title (PID: $($proc.Id))" -ForegroundColor Gray
            
            # Tentar fechar graciosamente primeiro
            $proc.CloseMainWindow() | Out-Null
            Start-Sleep -Milliseconds 500
            
            # Se ainda estiver rodando, forçar
            if (-not $proc.HasExited) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
            
            $windowsClosed++
        }
    } catch {
        # Ignorar erros ao fechar janelas
    }
}

# Também fechar processos Node.js órfãos que possam ter janelas
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -ne ""
}

foreach ($proc in $nodeProcesses) {
    try {
        if ($proc.MainWindowTitle -ne "") {
            Write-Host "  Fechando processo Node.js: $($proc.MainWindowTitle) (PID: $($proc.Id))" -ForegroundColor Gray
            $proc.CloseMainWindow() | Out-Null
            Start-Sleep -Milliseconds 500
            if (-not $proc.HasExited) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
            $windowsClosed++
        }
    } catch {
        # Ignorar erros
    }
}

if ($windowsClosed -gt 0) {
    Write-Host "  [OK] $windowsClosed janelas fechadas" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Nenhuma janela relacionada encontrada" -ForegroundColor Gray
}
Write-Host ""

# Aguardar um pouco para garantir que tudo foi fechado
Start-Sleep -Seconds 2

# ========================================
# FASE 5: REINICIAR SISTEMA
# ========================================
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "FASE 5: REINICIANDO SISTEMA" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "5.1. Aguardando alguns segundos antes de reiniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "  [OK] Pronto para reiniciar" -ForegroundColor Green
Write-Host ""

# Chamar script de iniciar sistema
$iniciarScript = Join-Path $RootPath "Iniciar Sistema Completo.ps1"
if (Test-Path $iniciarScript) {
    Write-Host "5.2. Iniciando sistema completo..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        & $iniciarScript
    } catch {
        Write-Host "  [ERRO] Falha ao iniciar sistema: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  [INFO] Tente executar manualmente: .\Iniciar Sistema Completo.ps1" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  [ERRO] Script Iniciar Sistema Completo.ps1 não encontrado!" -ForegroundColor Red
    Write-Host "  [INFO] Execute manualmente: .\Iniciar Sistema Completo.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] REINÍCIO COMPLETO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Yellow
Write-Host "  - Processos parados: $totalParados" -ForegroundColor White
Write-Host "  - Janelas fechadas: $windowsClosed" -ForegroundColor White
Write-Host "  - Cache limpo: Sim" -ForegroundColor White
Write-Host "  - Sistema reiniciado: Sim" -ForegroundColor White
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Yellow
Write-Host "  Dashboard Turismo: http://localhost:3005/dashboard" -ForegroundColor White
Write-Host "  Site Público: http://localhost:3000" -ForegroundColor White
Write-Host "  Microserviços: http://localhost:6000/health até http://localhost:6031/health" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Aguarde alguns minutos para a compilação do Next.js." -ForegroundColor Cyan
Write-Host "[INFO] O cache foi limpo automaticamente - CSS será recompilado." -ForegroundColor Cyan
Write-Host "[DICA] Limpe o cache do navegador (Ctrl+F5) após a compilação." -ForegroundColor Yellow
Write-Host ""
