# Script para corrigir problema de CSS não carregando no navegador
param(
    [switch]$Ajuda = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$SitePublicoPath = Join-Path $RootPath "apps\site-publico"

Set-Location $RootPath

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\scripts\CORRIGIR-CSS-NAO-CARREGA.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script:" -ForegroundColor Yellow
    Write-Host "  1. Para o servidor do Site Público" -ForegroundColor White
    Write-Host "  2. Limpa completamente o cache do Next.js (.next)" -ForegroundColor White
    Write-Host "  3. Limpa node_modules/.cache" -ForegroundColor White
    Write-Host "  4. Recompila o CSS do zero" -ForegroundColor White
    Write-Host "  5. Reinicia o servidor" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRIGINDO CSS NÃO CARREGA" -ForegroundColor Cyan
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
Set-Location $SitePublicoPath

if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
        Write-Host "  [OK] Pasta .next removida" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao remover .next: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] Pasta .next não existe" -ForegroundColor Gray
}

# 3. Limpar cache do node_modules
Write-Host "3. Limpando cache do node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    try {
        Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction Stop
        Write-Host "  [OK] Cache do node_modules removido" -ForegroundColor Green
    } catch {
        Write-Host "  [AVISO] Erro ao remover cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] Cache do node_modules não existe" -ForegroundColor Gray
}
Write-Host ""

# 4. Verificar arquivos de configuração
Write-Host "4. Verificando arquivos de configuração..." -ForegroundColor Yellow
$configFiles = @(
    @{Path="app\globals.css"; Name="globals.css"},
    @{Path="postcss.config.js"; Name="PostCSS config"},
    @{Path="tailwind.config.ts"; Name="Tailwind config"},
    @{Path="app\layout.tsx"; Name="Layout (import CSS)"}
)

$allOk = $true
foreach ($file in $configFiles) {
    if (Test-Path $file.Path) {
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

# 5. Verificar import do globals.css
Write-Host "5. Verificando import do globals.css..." -ForegroundColor Yellow
$layoutContent = Get-Content "app\layout.tsx" -Raw
if ($layoutContent -match "globals\.css") {
    Write-Host "  [OK] globals.css está sendo importado no layout.tsx" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] globals.css NÃO está sendo importado!" -ForegroundColor Red
    Write-Host "  [INFO] Adicione: import './globals.css' no layout.tsx" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 6. Recompilar (iniciar servidor)
Write-Host "6. Iniciando servidor para recompilar CSS..." -ForegroundColor Yellow
Write-Host "  [INFO] Isso pode levar alguns minutos..." -ForegroundColor Cyan
Write-Host ""

Set-Location $RootPath

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SitePublicoPath'; Write-Host 'Recompilando CSS do Site Público...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "  [OK] Servidor iniciado" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha ao iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Aguarde 2-3 minutos para compilação completa" -ForegroundColor White
Write-Host "  2. Abra http://localhost:3000/ no navegador" -ForegroundColor White
Write-Host "  3. Limpe o cache do navegador (Ctrl+Shift+Delete ou Ctrl+F5)" -ForegroundColor White
Write-Host "  4. Abra DevTools (F12) → Network → Filtrar por 'CSS'" -ForegroundColor White
Write-Host "  5. Verifique se layout.css está sendo carregado" -ForegroundColor White
Write-Host ""
Write-Host "Se o CSS ainda não carregar:" -ForegroundColor Yellow
Write-Host "  - Verifique o console do navegador (F12) para erros" -ForegroundColor White
Write-Host "  - Verifique a aba Network para ver se o CSS retorna 404" -ForegroundColor White
Write-Host "  - Tente abrir em aba anônima (sem cache)" -ForegroundColor White
Write-Host ""

