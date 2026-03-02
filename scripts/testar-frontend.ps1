# Script para testar se o frontend está funcionando

Write-Host "=== TESTE DO FRONTEND ===" -ForegroundColor Green
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "..\apps\turismo"

if (-not (Test-Path $frontendPath)) {
    Write-Host "ERRO: Diretório frontend não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "1. Verificando estrutura de páginas..." -ForegroundColor Cyan

$paginasEsperadas = @(
    "apps\turismo\pages\dashboard\leiloes\index.tsx",
    "apps\turismo\pages\dashboard\leiloes\novo.tsx",
    "apps\turismo\pages\dashboard\leiloes\[id].tsx",
    "apps\turismo\pages\dashboard\leiloes\flash-deals.tsx",
    "apps\turismo\pages\dashboard\leiloes\relatorios.tsx",
    "apps\turismo\pages\dashboard\excursoes\index.tsx",
    "apps\turismo\pages\dashboard\excursoes\nova.tsx",
    "apps\turismo\pages\dashboard\excursoes\[id].tsx",
    "apps\turismo\pages\dashboard\excursoes\roteiros.tsx",
    "apps\turismo\pages\dashboard\excursoes\participantes.tsx",
    "apps\turismo\pages\dashboard\viagens-grupo\index.tsx",
    "apps\turismo\pages\dashboard\viagens-grupo\nova.tsx",
    "apps\turismo\pages\dashboard\viagens-grupo\[id].tsx",
    "apps\turismo\pages\dashboard\viagens-grupo\wishlists.tsx",
    "apps\turismo\pages\dashboard\viagens-grupo\pagamentos.tsx"
)

$todosExistem = $true
foreach ($pagina in $paginasEsperadas) {
    $caminhoCompleto = Join-Path $PSScriptRoot ".." $pagina
    if (Test-Path $caminhoCompleto) {
        Write-Host "  ✅ $pagina" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $pagina (NÃO ENCONTRADO)" -ForegroundColor Red
        $todosExistem = $false
    }
}

Write-Host ""
Write-Host "2. Verificando componentes..." -ForegroundColor Cyan

$componentesEsperados = @(
    "apps\turismo\src\services\api\leiloesApi.ts",
    "apps\turismo\src\services\api\excursoesApi.ts",
    "apps\turismo\src\services\api\viagensGrupoApi.ts",
    "apps\turismo\src\components\shared\StatusBadge.tsx",
    "apps\turismo\src\components\shared\ConfirmDialog.tsx",
    "apps\turismo\src\components\shared\FilterBar.tsx",
    "apps\turismo\src\components\shared\DataTable.tsx"
)

foreach ($componente in $componentesEsperados) {
    $caminhoCompleto = Join-Path $PSScriptRoot ".." $componente
    if (Test-Path $caminhoCompleto) {
        Write-Host "  ✅ $componente" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $componente (NÃO ENCONTRADO)" -ForegroundColor Red
        $todosExistem = $false
    }
}

Write-Host ""
if ($todosExistem) {
    Write-Host "✅ Estrutura do frontend está correta!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar o frontend:" -ForegroundColor Yellow
    Write-Host "  cd apps\turismo" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "A aplicação estará disponível em: http://localhost:3005" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Alguns arquivos estão faltando. Verifique os erros acima." -ForegroundColor Yellow
}

