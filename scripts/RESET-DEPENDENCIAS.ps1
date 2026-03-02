# Script para reset limpo de dependências no monorepo NPM Workspaces
# FASE 3 - Reset completo de node_modules e lockfiles

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESET LIMPO DE DEPENDÊNCIAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar diretório de logs se não existir
$logsDir = Join-Path $RootPath "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# 1. Limpar node_modules
Write-Host "1. Limpando node_modules..." -ForegroundColor Yellow
$nodeModulesPaths = @(
    $RootPath,
    (Join-Path $RootPath "apps\site-publico"),
    (Join-Path $RootPath "apps\turismo"),
    (Join-Path $RootPath "backend")
)

foreach ($path in $nodeModulesPaths) {
    $nodeModules = Join-Path $path "node_modules"
    if (Test-Path $nodeModules) {
        Write-Host "  Removendo: $nodeModules" -ForegroundColor Gray
        Remove-Item -Recurse -Force $nodeModules -ErrorAction SilentlyContinue
    }
}
Write-Host "  [OK] node_modules removidos" -ForegroundColor Green
Write-Host ""

# 2. Limpar .next (cache do Next.js)
Write-Host "2. Limpando cache do Next.js (.next)..." -ForegroundColor Yellow
$nextPaths = @(
    (Join-Path $RootPath "apps\site-publico\.next"),
    (Join-Path $RootPath "apps\turismo\.next")
)

foreach ($path in $nextPaths) {
    if (Test-Path $path) {
        Write-Host "  Removendo: $path" -ForegroundColor Gray
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
    }
}
Write-Host "  [OK] Cache do Next.js limpo" -ForegroundColor Green
Write-Host ""

# 3. Limpar package-lock.json
Write-Host "3. Limpando package-lock.json..." -ForegroundColor Yellow
$lockFiles = @(
    (Join-Path $RootPath "package-lock.json"),
    (Join-Path $RootPath "apps\site-publico\package-lock.json"),
    (Join-Path $RootPath "apps\turismo\package-lock.json"),
    (Join-Path $RootPath "backend\package-lock.json")
)

foreach ($file in $lockFiles) {
    if (Test-Path $file) {
        Write-Host "  Removendo: $file" -ForegroundColor Gray
        Remove-Item -Force $file -ErrorAction SilentlyContinue
    }
}
Write-Host "  [OK] Lock files removidos" -ForegroundColor Green
Write-Host ""

# 4. Verificar cache do npm
Write-Host "4. Verificando cache do npm..." -ForegroundColor Yellow
try {
    npm cache verify 2>&1 | Out-Null
    Write-Host "  [OK] Cache do npm verificado" -ForegroundColor Green
} catch {
    Write-Host "  [AVISO] Erro ao verificar cache: $_" -ForegroundColor Yellow
}
Write-Host ""

# 5. Instalar dependências
Write-Host "5. Instalando dependências (isso pode levar alguns minutos)..." -ForegroundColor Yellow
Write-Host "   Aguarde..." -ForegroundColor Gray
try {
    npm install 2>&1 | Tee-Object -FilePath (Join-Path $logsDir "npm-install.log")
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Dependências instaladas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] Falha na instalação. Verifique logs/npm-install.log" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERRO] Erro ao instalar: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Verificar versões após reset
Write-Host "6. Verificando versões de React após reset..." -ForegroundColor Yellow
$versionsLog = Join-Path $logsDir "react-versions-after-reset.log"

Write-Host "   Gerando relatório de versões..." -ForegroundColor Gray
"=== VERSOES DE REACT APOS RESET ===" | Out-File -FilePath $versionsLog
"Data: $(Get-Date)" | Out-File -FilePath $versionsLog -Append
"" | Out-File -FilePath $versionsLog -Append

Write-Host "   React:" -ForegroundColor Gray
npm ls react 2>&1 | Tee-Object -FilePath $versionsLog -Append

Write-Host "   React-DOM:" -ForegroundColor Gray
npm ls react-dom 2>&1 | Tee-Object -FilePath $versionsLog -Append

Write-Host "  [OK] Relatório salvo em: $versionsLog" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] RESET CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verifique o relatório em: $versionsLog" -ForegroundColor White
Write-Host "  2. Execute: npm run dev --workspace=apps/site-publico" -ForegroundColor White
Write-Host "  3. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""

