# Script para matar processos em portas específicas
# Uso: .\scripts\KILL-PORTS.ps1 -Ports 3000,3005

param(
    [int[]]$Ports = @(3000, 3005, 5000, 5002)
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LIMPANDO PORTAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalKilled = 0

foreach ($port in $Ports) {
    Write-Host "Verificando porta $port..." -ForegroundColor Yellow
    
    try {
        # Usar Get-NetTCPConnection para encontrar processos
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            
            foreach ($processId in $pids) {
                if ($processId) {
                    try {
                        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "  Matando PID $processId ($($process.ProcessName)) na porta $port" -ForegroundColor Gray
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                            Start-Sleep -Milliseconds 200
                            $totalKilled++
                        }
                    } catch {
                        $errorMsg = $_.Exception.Message
                        Write-Host "  [AVISO] Erro ao matar PID $($processId): $($errorMsg)" -ForegroundColor Yellow
                    }
                }
            }
            
            # Verificar se ainda está em uso
            Start-Sleep -Milliseconds 500
            $stillInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if (-not $stillInUse) {
                Write-Host "  [OK] Porta $port liberada" -ForegroundColor Green
            } else {
                Write-Host "  [AVISO] Porta $port ainda pode estar em uso" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [INFO] Porta $port não está em uso" -ForegroundColor Gray
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  [ERRO] Erro ao verificar porta $($port): $($errorMsg)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Processos finalizados: $totalKilled" -ForegroundColor Cyan
Write-Host ""

