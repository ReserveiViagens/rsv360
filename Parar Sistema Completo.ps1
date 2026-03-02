# Script para parar o sistema completo (Microserviços + Dashboard Turismo + Site Público)
param(
    [switch]$Ajuda = $false,
    [switch]$Forcar = $false,
    [switch]$LimparCache = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\Parar Sistema Completo.ps1 [-Forcar]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script para:" -ForegroundColor Yellow
    Write-Host "  - 32 Microserviços (portas 6000-6031)" -ForegroundColor White
    Write-Host "  - Dashboard Turismo (porta 3005)" -ForegroundColor White
    Write-Host "  - Site Público (porta 3000)" -ForegroundColor White
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  -Forcar       Força o encerramento sem confirmação" -ForegroundColor White
    Write-Host "  -LimparCache  Limpa cache do Next.js após parar" -ForegroundColor White
    Write-Host ""
    Write-Host "Este script também fecha automaticamente:" -ForegroundColor Yellow
    Write-Host "  - Janelas do PowerShell relacionadas ao sistema" -ForegroundColor White
    Write-Host "  - Janelas de processos Node.js" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PARANDO SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Confirmação (se não usar -Forcar)
if (-not $Forcar) {
    Write-Host "Tem certeza que deseja parar todos os serviços? (S/N)" -ForegroundColor Yellow
    $confirmacao = Read-Host
    if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit
    }
    Write-Host ""
}

$totalParados = 0

# Parar Microserviços (portas 6000-6031)
Write-Host "1. Parando Microserviços (portas 6000-6031)..." -ForegroundColor Yellow
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
Write-Host "2. Parando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
$porta3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($porta3005) {
    try {
        Stop-Process -Id $porta3005 -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Dashboard Turismo parado (PID: $porta3005)" -ForegroundColor Green
        $totalParados++
    } catch {
        Write-Host "  [ERRO] Falha ao parar Dashboard Turismo" -ForegroundColor Red
    }
} else {
    Write-Host "  [INFO] Dashboard Turismo não está rodando" -ForegroundColor Gray
}
Write-Host ""

# Parar Site Público (porta 3000)
Write-Host "3. Parando Site Público (porta 3000)..." -ForegroundColor Yellow
$porta3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($porta3000) {
    try {
        Stop-Process -Id $porta3000 -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Site Público parado (PID: $porta3000)" -ForegroundColor Green
        $totalParados++
    } catch {
        Write-Host "  [ERRO] Falha ao parar Site Público" -ForegroundColor Red
    }
} else {
    Write-Host "  [INFO] Site Público não está rodando" -ForegroundColor Gray
}
Write-Host ""

# Parar processos Node.js órfãos relacionados
Write-Host "4. Limpando processos Node.js órfãos..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
$orphansStopped = 0
foreach ($proc in $nodeProcesses) {
    # Verificar se o processo não está mais usando as portas
    $conns = Get-NetTCPConnection -OwningProcess $proc.Id -ErrorAction SilentlyContinue
    $isOrphan = $true
    foreach ($conn in $conns) {
        if ($conn.LocalPort -ge 3000 -and $conn.LocalPort -le 6031) {
            $isOrphan = $false
            break
        }
    }
    if ($isOrphan) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $orphansStopped++
        } catch {
            # Ignorar erros
        }
    }
}
if ($orphansStopped -gt 0) {
    Write-Host "  [OK] $orphansStopped processos órfãos parados" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Nenhum processo órfão encontrado" -ForegroundColor Gray
}
Write-Host ""

# Fechar janelas do PowerShell relacionadas
Write-Host "5. Fechando janelas do PowerShell relacionadas..." -ForegroundColor Yellow

$windowsClosed = 0

# Obter todos os processos PowerShell
$powershellProcesses = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -ne ""
}

# Identificar janelas relacionadas ao sistema
foreach ($proc in $powershellProcesses) {
    try {
        $title = $proc.MainWindowTitle
        
        # Verificar se a janela está relacionada ao sistema
        $isRelated = $false
        
        # Verificar pelo título da janela
        if ($title -like "*npm*" -or 
            $title -like "*node*" -or
            $title -like "*dev*" -or
            $title -like "*start*" -or
            $title -like "*site-publico*" -or
            $title -like "*turismo*" -or
            $title -like "*microservice*" -or
            $title -like "*RSV360*" -or
            $title -like "*3000*" -or
            $title -like "*3005*" -or
            $title -like "*6000*") {
            $isRelated = $true
        }
        
        # Verificar se tem processos Node.js filhos
        $childNodes = Get-Process -ErrorAction SilentlyContinue | Where-Object {
            try {
                $parent = Get-Process -Id $_.Parent.Id -ErrorAction SilentlyContinue
                $parent.Id -eq $proc.Id -and $_.ProcessName -eq "node"
            } catch {
                $false
            }
        }
        
        if ($childNodes.Count -gt 0) {
            $isRelated = $true
        }
        
        # Verificar se o processo está rodando na pasta do projeto
        try {
            $procPath = $proc.Path
            if ($procPath -like "*RSV360*" -or $procPath -like "*Backup rsv36*") {
                $isRelated = $true
            }
        } catch {
            # Ignorar erros ao acessar Path
        }
        
        if ($isRelated) {
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
        # Ignorar erros ao processar janelas
    }
}

# Também fechar processos Node.js que possam ter janelas
$nodeProcessesWithWindows = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -ne ""
}

foreach ($proc in $nodeProcessesWithWindows) {
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

# Limpar cache do Next.js se solicitado
if ($LimparCache) {
    Write-Host "5. Limpando cache do Next.js..." -ForegroundColor Yellow
    $clearCacheScript = Join-Path $RootPath "scripts\LIMPAR-CACHE-NEXTJS.ps1"
    if (Test-Path $clearCacheScript) {
        try {
            & $clearCacheScript -Apps @("site-publico", "turismo")
            Write-Host "  [OK] Cache do Next.js limpo" -ForegroundColor Green
        } catch {
            Write-Host "  [AVISO] Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [AVISO] Script LIMPAR-CACHE-NEXTJS.ps1 não encontrado" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] SISTEMA COMPLETO PARADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Yellow
Write-Host "  - Processos parados: $totalParados" -ForegroundColor White
Write-Host "  - Janelas fechadas: $windowsClosed" -ForegroundColor White
if ($LimparCache) {
    Write-Host "  - Cache limpo: Sim" -ForegroundColor White
} else {
    Write-Host "  - Cache limpo: Não" -ForegroundColor White
}
Write-Host ""
Write-Host "Para reiniciar, execute:" -ForegroundColor Yellow
Write-Host "  .\Iniciar Sistema Completo.ps1" -ForegroundColor White
Write-Host "  .\Reiniciar Sistema Completo.ps1" -ForegroundColor White
Write-Host ""
if ($LimparCache) {
    Write-Host "[INFO] Cache do Next.js foi limpo. CSS será recompilado na próxima inicialização." -ForegroundColor Cyan
    Write-Host ""
}

