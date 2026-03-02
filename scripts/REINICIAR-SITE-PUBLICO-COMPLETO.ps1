# Script completo para reiniciar o Site Público com limpeza de cache
# Garante que o CSS seja sempre compilado corretamente
# Uso: .\scripts\REINICIAR-SITE-PUBLICO-COMPLETO.ps1

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$SitePublicoPath = Join-Path $RootPath "apps\site-publico"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REINICIANDO SITE PÚBLICO (COMPLETO)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Parar servidor na porta 3000
Write-Host "1. Parando servidor na porta 3000..." -ForegroundColor Yellow
$killPortsScript = Join-Path $RootPath "scripts\KILL-PORTS.ps1"
if (Test-Path $killPortsScript) {
    try {
        & $killPortsScript -Ports @(3000)
        Start-Sleep -Seconds 2
        Write-Host "  [OK] Servidor parado" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao parar servidor: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [AVISO] Script KILL-PORTS.ps1 não encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 2. Limpar cache do Next.js
Write-Host "2. Limpando cache do Next.js..." -ForegroundColor Yellow
$clearCacheScript = Join-Path $RootPath "scripts\LIMPAR-CACHE-NEXTJS.ps1"
if (Test-Path $clearCacheScript) {
    try {
        & $clearCacheScript -Apps @("site-publico")
        Write-Host "  [OK] Cache limpo" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    # Fallback: limpar manualmente
    $nextPath = Join-Path $SitePublicoPath ".next"
    if (Test-Path $nextPath) {
        Remove-Item -Recurse -Force $nextPath -ErrorAction SilentlyContinue
        Write-Host "  [OK] Cache removido (fallback)" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Cache não existe" -ForegroundColor Gray
    }
}
Write-Host ""

# 3. Verificar arquivos de configuração
Write-Host "3. Verificando arquivos de configuração..." -ForegroundColor Yellow
$configFiles = @(
    @{Path="app\globals.css"; Name="globals.css"},
    @{Path="postcss.config.js"; Name="PostCSS config"},
    @{Path="tailwind.config.ts"; Name="Tailwind config"},
    @{Path="app\layout.tsx"; Name="Layout (import CSS)"}
)

$allOk = $true
foreach ($file in $configFiles) {
    $filePath = Join-Path $SitePublicoPath $file.Path
    if (Test-Path $filePath) {
        Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] $($file.Name) não encontrado!" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host ""
    Write-Host "  [ERRO] Alguns arquivos de configuração estão faltando!" -ForegroundColor Red
    Write-Host "  [INFO] Corrija os arquivos antes de continuar" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 4. Verificar import do globals.css
Write-Host "4. Verificando import do globals.css..." -ForegroundColor Yellow
$layoutPath = Join-Path $SitePublicoPath "app\layout.tsx"
if (Test-Path $layoutPath) {
    $layoutContent = Get-Content $layoutPath -Raw
    if ($layoutContent -match "globals\.css") {
        Write-Host "  [OK] globals.css está sendo importado" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] globals.css NÃO está sendo importado!" -ForegroundColor Red
        Write-Host "  [INFO] Adicione: import './globals.css' no layout.tsx" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  [ERRO] layout.tsx não encontrado!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Iniciar servidor
Write-Host "5. Iniciando servidor..." -ForegroundColor Yellow
Write-Host "  [INFO] Aguarde alguns minutos para compilação completa..." -ForegroundColor Cyan
Write-Host ""

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SitePublicoPath'; Write-Host 'Reiniciando Site Público com cache limpo...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "  [OK] Servidor iniciado" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha ao iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Verificar se servidor iniciou
Write-Host "6. Verificando se servidor iniciou..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($portCheck) {
    Write-Host "  [OK] Servidor rodando na porta 3000" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Servidor pode ainda estar iniciando..." -ForegroundColor Yellow
    Write-Host "  [INFO] Verifique a janela do PowerShell" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: http://localhost:3000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Importante:" -ForegroundColor Yellow
Write-Host "  - Aguarde 2-3 minutos para compilação completa" -ForegroundColor White
Write-Host "  - Limpe o cache do navegador (Ctrl+F5 ou aba anônima)" -ForegroundColor White
Write-Host "  - O CSS foi recompilado do zero" -ForegroundColor White
Write-Host ""

