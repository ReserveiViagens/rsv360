# Script para limpar cache do Next.js (Site Público e Dashboard Turismo)
# Usado por outros scripts para garantir CSS sempre compilado corretamente
# Uso: .\scripts\LIMPAR-CACHE-NEXTJS.ps1 [-Apps "site-publico,turismo"]

param(
    [string[]]$Apps = @("site-publico", "turismo"),
    [switch]$Ajuda = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo"

Set-Location $RootPath

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\scripts\LIMPAR-CACHE-NEXTJS.ps1 [-Apps 'site-publico,turismo']" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script limpa o cache do Next.js (.next) para garantir" -ForegroundColor Yellow
    Write-Host "que o CSS seja recompilado corretamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Parâmetros:" -ForegroundColor White
    Write-Host "  -Apps: Lista de apps para limpar (padrão: site-publico,turismo)" -ForegroundColor Gray
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LIMPANDO CACHE DO NEXT.JS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalCleaned = 0

foreach ($app in $Apps) {
    $appPath = Join-Path $RootPath "apps\$app"
    $nextPath = Join-Path $appPath ".next"
    
    Write-Host "Verificando $app..." -ForegroundColor Yellow
    
    if (-not (Test-Path $appPath)) {
        Write-Host "  [AVISO] App '$app' não encontrado em apps\$app" -ForegroundColor Yellow
        continue
    }
    
    if (Test-Path $nextPath) {
        try {
            $sizeBefore = (Get-ChildItem $nextPath -Recurse -ErrorAction SilentlyContinue | 
                          Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            
            Remove-Item -Recurse -Force $nextPath -ErrorAction Stop
            $totalCleaned++
            
            if ($sizeBefore) {
                $sizeMB = [math]::Round($sizeBefore / 1MB, 2)
                Write-Host "  [OK] Cache removido ($sizeMB MB)" -ForegroundColor Green
            } else {
                Write-Host "  [OK] Cache removido" -ForegroundColor Green
            }
        } catch {
            Write-Host "  [ERRO] Erro ao remover cache: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [INFO] Cache não existe (já está limpo)" -ForegroundColor Gray
    }
    
    # Limpar também cache do node_modules se existir
    $nodeModulesCache = Join-Path $appPath "node_modules\.cache"
    if (Test-Path $nodeModulesCache) {
        try {
            Remove-Item -Recurse -Force $nodeModulesCache -ErrorAction SilentlyContinue
            Write-Host "  [OK] Cache do node_modules removido" -ForegroundColor Green
        } catch {
            Write-Host "  [AVISO] Erro ao remover cache do node_modules: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Apps processados: $totalCleaned" -ForegroundColor Cyan
Write-Host ""

