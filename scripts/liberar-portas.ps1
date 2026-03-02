# Script para liberar portas 3005 e 5000

Write-Host "=== LIBERAR PORTAS ===" -ForegroundColor Yellow
Write-Host ""

# Porta 3005 (Frontend)
Write-Host "1. Liberando porta 3005 (Frontend)..." -ForegroundColor Cyan
$port3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue
if ($port3005) {
    $processId = $port3005.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  Processo encontrado: $($process.Name) (PID: $processId)" -ForegroundColor White
        try {
            Stop-Process -Id $processId -Force
            Write-Host "  ✅ Processo finalizado com sucesso" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Erro ao finalizar processo: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️ Processo não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ Porta 3005 já está livre" -ForegroundColor Green
}

Write-Host ""

# Porta 5000 (Backend)
Write-Host "2. Liberando porta 5000 (Backend)..." -ForegroundColor Cyan
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $processId = $port5000.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  Processo encontrado: $($process.Name) (PID: $processId)" -ForegroundColor White
        try {
            Stop-Process -Id $processId -Force
            Write-Host "  ✅ Processo finalizado com sucesso" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Erro ao finalizar processo: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️ Processo não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ Porta 5000 já está livre" -ForegroundColor Green
}

Write-Host ""
Write-Host "Aguarde alguns segundos e tente iniciar os serviços novamente." -ForegroundColor Yellow
Write-Host ""

