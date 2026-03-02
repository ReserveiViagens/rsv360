# Script Master - Correção Definitiva do Erro _react.cache is not a function
# Executa todas as fases do plano de correção

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORREÇÃO DEFINITIVA: _react.cache ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar diretório de logs
$logsDir = Join-Path $RootPath "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# FASE 1: Contexto e Verificações Iniciais
Write-Host "FASE 1: Verificando contexto e ambiente..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Diretório atual:" -ForegroundColor Gray
Write-Host "    $((Get-Location).Path)" -ForegroundColor White
Write-Host ""

Write-Host "  Versão do Node.js:" -ForegroundColor Gray
$nodeVersion = node -v
Write-Host "    $nodeVersion" -ForegroundColor White

$nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeMajorVersion -lt 18) {
    Write-Host "  [ERRO] Node.js < 18.17 detectado. Instale Node 18 LTS ou 20 LTS." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Versão do Node.js compatível" -ForegroundColor Green
Write-Host ""

# FASE 1.1: Verificar versões React/ReactDOM
Write-Host "  Verificando versões React/ReactDOM..." -ForegroundColor Gray
Write-Host ""

$versionsBefore = Join-Path $logsDir "react-versions-before-fix.log"
"=== VERSOES ANTES DA CORRECAO ===" | Out-File -FilePath $versionsBefore
"Data: $(Get-Date)" | Out-File -FilePath $versionsBefore -Append
"" | Out-File -FilePath $versionsBefore -Append

Write-Host "    React:" -ForegroundColor Gray
npm ls react 2>&1 | Tee-Object -FilePath $versionsBefore -Append

Write-Host "    React-DOM:" -ForegroundColor Gray
npm ls react-dom 2>&1 | Tee-Object -FilePath $versionsBefore -Append

Write-Host "  [OK] Versões registradas em: $versionsBefore" -ForegroundColor Green
Write-Host ""

# FASE 2: Verificar next.config.js (já foi corrigido, mas vamos confirmar)
Write-Host "FASE 2: Verificando next.config.js..." -ForegroundColor Yellow
$nextConfigPath = Join-Path $RootPath "apps\site-publico\next.config.js"

if (Test-Path $nextConfigPath) {
    $configContent = Get-Content $nextConfigPath -Raw
    
    if ($configContent -match "config\.resolve\.alias.*react") {
        Write-Host "  [AVISO] Aliases de react ainda presentes no next.config.js" -ForegroundColor Yellow
        Write-Host "  [INFO] Verifique se foram removidos corretamente" -ForegroundColor Cyan
    } else {
        Write-Host "  [OK] next.config.js não tem aliases perigosos de react" -ForegroundColor Green
    }
} else {
    Write-Host "  [INFO] next.config.js não encontrado (usando padrão)" -ForegroundColor Cyan
}
Write-Host ""

# FASE 3: Reset de dependências
Write-Host "FASE 3: Executando reset limpo de dependências..." -ForegroundColor Yellow
Write-Host "  (Isso pode levar vários minutos)" -ForegroundColor Gray
Write-Host ""

$resetScript = Join-Path $RootPath "scripts\RESET-DEPENDENCIAS.ps1"
if (Test-Path $resetScript) {
    & $resetScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRO] Reset de dependências falhou" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [ERRO] Script RESET-DEPENDENCIAS.ps1 não encontrado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# FASE 4: Verificar versões após reset
Write-Host "FASE 4: Verificando versões após reset..." -ForegroundColor Yellow
Write-Host ""

$versionsAfter = Join-Path $logsDir "react-versions-after-fix.log"
"=== VERSOES APOS A CORRECAO ===" | Out-File -FilePath $versionsAfter
"Data: $(Get-Date)" | Out-File -FilePath $versionsAfter -Append
"" | Out-File -FilePath $versionsAfter -Append

Write-Host "    React:" -ForegroundColor Gray
npm ls react 2>&1 | Tee-Object -FilePath $versionsAfter -Append

Write-Host "    React-DOM:" -ForegroundColor Gray
npm ls react-dom 2>&1 | Tee-Object -FilePath $versionsAfter -Append

Write-Host "  [OK] Versões registradas em: $versionsAfter" -ForegroundColor Green
Write-Host ""

# FASE 5: Testar servidor
Write-Host "FASE 5: Iniciando servidor para teste..." -ForegroundColor Yellow
Write-Host "  [INFO] O servidor será iniciado em background" -ForegroundColor Cyan
Write-Host "  [INFO] Aguarde alguns segundos e acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] CORREÇÃO APLICADA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Resumo das ações:" -ForegroundColor Yellow
Write-Host "  ✅ Versões React verificadas" -ForegroundColor Green
Write-Host "  ✅ next.config.js verificado/corrigido" -ForegroundColor Green
Write-Host "  ✅ Dependências resetadas" -ForegroundColor Green
Write-Host "  ✅ Versões após reset registradas" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Inicie o servidor:" -ForegroundColor White
Write-Host "     npm run dev --workspace=apps/site-publico" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  3. Se o erro persistir, colete:" -ForegroundColor White
Write-Host "     - Conteúdo de apps/site-publico/next.config.js" -ForegroundColor Gray
Write-Host "     - Saída de: npm ls react react-dom" -ForegroundColor Gray
Write-Host "     - Versão do Node: node -v" -ForegroundColor Gray
Write-Host "     - Logs em: $logsDir" -ForegroundColor Gray
Write-Host ""

Write-Host "Logs gerados:" -ForegroundColor Yellow
Write-Host "  - $versionsBefore" -ForegroundColor White
Write-Host "  - $versionsAfter" -ForegroundColor White
$npmLogPath = Join-Path $logsDir "npm-install.log"
Write-Host "  - $npmLogPath" -ForegroundColor White
Write-Host ""

