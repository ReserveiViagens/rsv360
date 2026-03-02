# Script para testar se o backend está funcionando

Write-Host "=== TESTE DO BACKEND ===" -ForegroundColor Green
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "..\backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "ERRO: Diretório backend não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "1. Verificando estrutura de arquivos..." -ForegroundColor Cyan

$arquivosEsperados = @(
    "backend\src\api\v1\leiloes\routes.js",
    "backend\src\api\v1\leiloes\controller.js",
    "backend\src\api\v1\excursoes\routes.js",
    "backend\src\api\v1\excursoes\controller.js",
    "backend\src\api\v1\viagens-grupo\routes.js",
    "backend\src\api\v1\viagens-grupo\controller.js",
    "backend\src\services\leiloes\leilaoService.js",
    "backend\src\services\excursoes\excursaoService.js",
    "backend\src\services\viagens-grupo\grupoService.js"
)

$todosExistem = $true
foreach ($arquivo in $arquivosEsperados) {
    $caminhoCompleto = Join-Path $PSScriptRoot ".." $arquivo
    if (Test-Path $caminhoCompleto) {
        Write-Host "  ✅ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $arquivo (NÃO ENCONTRADO)" -ForegroundColor Red
        $todosExistem = $false
    }
}

Write-Host ""
Write-Host "2. Verificando se as rotas estão registradas no server.js..." -ForegroundColor Cyan

$serverJs = Join-Path $PSScriptRoot "..\backend\src\server.js"
if (Test-Path $serverJs) {
    $conteudo = Get-Content $serverJs -Raw
    if ($conteudo -match "leiloesRoutes" -and $conteudo -match "excursoesRoutes" -and $conteudo -match "viagensGrupoRoutes") {
        Write-Host "  ✅ Rotas registradas no server.js" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Rotas não encontradas no server.js" -ForegroundColor Red
        $todosExistem = $false
    }
} else {
    Write-Host "  ❌ server.js não encontrado" -ForegroundColor Red
    $todosExistem = $false
}

Write-Host ""
if ($todosExistem) {
    Write-Host "✅ Estrutura do backend está correta!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar o backend:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠️ Alguns arquivos estão faltando. Verifique os erros acima." -ForegroundColor Yellow
}

