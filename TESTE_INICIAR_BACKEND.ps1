# Script de teste simplificado para verificar criação de janelas
# Execute este script para testar se as janelas PowerShell estão sendo criadas

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"
$BackendPath = Join-Path $RootPath "backend"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  TESTE DE CRIAÇÃO DE JANELAS POWERSHELL" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Backend Principal
Write-Host "[TESTE 1] Criando janela para Backend Principal..." -ForegroundColor Yellow
$serverPath = Join-Path $BackendPath "src\server.js"
if (Test-Path $serverPath) {
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'BACKEND PRINCIPAL (porta 5000)' -ForegroundColor Cyan; Write-Host 'Esta janela deve estar visivel!' -ForegroundColor Green; Start-Sleep -Seconds 30" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  ✅ Janela criada! PID: $($proc.Id)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Falha ao criar processo" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Arquivo não encontrado: $serverPath" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Teste 2: Backend Admin/CMS
Write-Host "[TESTE 2] Criando janela para Backend Admin/CMS..." -ForegroundColor Yellow
$adminServerPath = Join-Path $BackendPath "server-5002.js"
if (Test-Path $adminServerPath) {
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'BACKEND ADMIN/CMS (porta 5002)' -ForegroundColor Cyan; Write-Host 'Esta janela deve estar visivel!' -ForegroundColor Green; Start-Sleep -Seconds 30" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  ✅ Janela criada! PID: $($proc.Id)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Falha ao criar processo" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Arquivo não encontrado: $adminServerPath" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Teste 3: Frontend Site Público
Write-Host "[TESTE 3] Criando janela para Site Público..." -ForegroundColor Yellow
$sitePublicoPath = Join-Path $RootPath "apps\site-publico"
if (Test-Path $sitePublicoPath) {
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$sitePublicoPath'; Write-Host 'SITE PUBLICO (Porta 3000)' -ForegroundColor Cyan; Write-Host 'Esta janela deve estar visivel!' -ForegroundColor Green; Start-Sleep -Seconds 30" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  ✅ Janela criada! PID: $($proc.Id)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Falha ao criar processo" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Diretório não encontrado: $sitePublicoPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Green
Write-Host "  TESTE CONCLUÍDO" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verifique se as janelas PowerShell apareceram na sua tela." -ForegroundColor Cyan
Write-Host "Se apareceram, o problema está no script principal." -ForegroundColor Yellow
Write-Host "Se não apareceram, pode haver um problema de permissões ou política de execução." -ForegroundColor Yellow
Write-Host ""
