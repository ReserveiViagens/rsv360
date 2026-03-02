# Script para limpar portas 3000 e 3005 (Site Público e Dashboard Turismo)
# Use antes de executar "Iniciar Sistema Completo" para evitar conflitos

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LIMPANDO PORTAS 3000 E 3005" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(3000, 3005)
$totalKilled = 0

foreach ($port in $ports) {
    Write-Host "Verificando porta $port..." -ForegroundColor Yellow
    
    try {
        # Usar Get-NetTCPConnection para encontrar processos
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            
            foreach ($pid in $pids) {
                if ($pid) {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "  Matando processo PID $pid ($($process.ProcessName)) na porta $port" -ForegroundColor Gray
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                            Start-Sleep -Milliseconds 200
                            $totalKilled++
                        }
                    } catch {
                        $errorMsg = $_.Exception.Message
                        Write-Host "  [AVISO] Erro ao matar PID $($pid): $($errorMsg)" -ForegroundColor Yellow
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
Write-Host "Agora você pode executar:" -ForegroundColor Yellow
Write-Host "  .\Iniciar Sistema Completo.ps1" -ForegroundColor White
Write-Host "  ou" -ForegroundColor Gray
Write-Host "  npm run dev --workspace=apps/site-publico" -ForegroundColor White
Write-Host "  npm run dev --workspace=apps/turismo" -ForegroundColor White
Write-Host ""

