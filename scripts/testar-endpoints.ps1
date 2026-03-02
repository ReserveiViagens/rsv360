# Script para testar endpoints da API

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$Token = ""
)

Write-Host "=== TESTE DE ENDPOINTS - API ===" -ForegroundColor Green
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "1. Verificando se o servidor está rodando..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "  ✅ Servidor está rodando!" -ForegroundColor Green
        $healthData = $healthCheck.Content | ConvertFrom-Json
        Write-Host "     Status: $($healthData.status)" -ForegroundColor White
        Write-Host "     Uptime: $($healthData.uptime) segundos" -ForegroundColor White
    }
} catch {
    Write-Host "  ❌ Servidor não está respondendo em $BaseUrl" -ForegroundColor Red
    Write-Host "     Certifique-se de que o backend está rodando: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Testando endpoints de turismo..." -ForegroundColor Cyan

$endpoints = @(
    @{ Method = "GET"; Path = "/api/v1/leiloes"; Name = "Listar Leilões" },
    @{ Method = "GET"; Path = "/api/v1/leiloes/flash-deals"; Name = "Flash Deals" },
    @{ Method = "GET"; Path = "/api/v1/excursoes"; Name = "Listar Excursões" },
    @{ Method = "GET"; Path = "/api/v1/viagens-grupo"; Name = "Listar Grupos" }
)

$headers = @{
    "Content-Type" = "application/json"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

foreach ($endpoint in $endpoints) {
    Write-Host "  Testando: $($endpoint.Name)..." -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$($endpoint.Path)" -Method $endpoint.Method -Headers $headers -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
            if ($response.StatusCode -eq 401) {
                Write-Host "    ⚠️ Requer autenticação (401)" -ForegroundColor Yellow
            } else {
                Write-Host "    ✅ Endpoint funcionando (200)" -ForegroundColor Green
            }
        } else {
            Write-Host "    ⚠️ Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "    ⚠️ Requer autenticação (401)" -ForegroundColor Yellow
        } else {
            Write-Host "    ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Nota: Se todos os endpoints retornarem 401, isso é esperado." -ForegroundColor Yellow
Write-Host "Os endpoints requerem autenticação. Para testar completamente:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Fazer login em: POST $BaseUrl/api/auth/login" -ForegroundColor White
Write-Host "2. Obter o token da resposta" -ForegroundColor White
Write-Host "3. Usar o token: .\scripts\testar-endpoints.ps1 -Token 'seu-token-aqui'" -ForegroundColor White
Write-Host ""

