# Script de teste completo - Todas as rotas RSV360
# Testa Site Público, Dashboard Turismo, Backend, Microserviços, Agentes SRE
#
# PRÉ-REQUISITOS: Execute .\scripts\INICIAR_MICROSERVICES.ps1 antes para garantir
# que todos os microserviços (6000-6031) estejam rodando.

$ErrorActionPreference = "SilentlyContinue"
$timeout = 15
$results = @()

function Test-Url {
    param([string]$url, [string]$name, [int[]]$acceptRedirects = @())
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $timeout -MaximumRedirection 0
        return @{ name = $name; url = $url; status = $r.StatusCode; ok = $true }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        # 307/302 em rotas admin = redirecionamento para login (comportamento esperado)
        $ok = ($acceptRedirects -contains $status)
        return @{ name = $name; url = $url; status = $status; ok = $ok }
    }
}

Write-Host "=== TESTE COMPLETO RSV360 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Site Público (3000)
Write-Host "1. Site Público (3000)..." -ForegroundColor Yellow
$siteRotas = @(
    "/", "/buscar", "/hoteis", "/hoteis/busca/completa", "/leiloes", "/flash-deals", "/ingressos", "/atracoes", "/promocoes", "/tickets",
    "/viagens-grupo", "/group-travel", "/booking", "/booking/pay-later", "/minhas-reservas", "/perfil", "/login", "/recuperar-senha", "/contato",
    "/politica-privacidade", "/admin/cms", "/admin/login", "/admin/crm", "/dashboard/proprietario", "/dashboard-rsv", "/checkin/scan",
    "/pricing/dashboard", "/analytics", "/crm", "/loyalty", "/quality", "/cupons", "/fidelidade", "/wishlists", "/group-chats",
    "/mensagens", "/notificacoes", "/marketplace", "/insurance", "/onboarding", "/verification", "/trips", "/buscar-hosts"
)
foreach ($r in $siteRotas) {
    $acceptRedirects = if ($r -match "^/admin/(cms|crm)$") { @(307, 302) } else { @() }
    $res = Test-Url "http://localhost:3000$r" "Site:$r" $acceptRedirects
    $results += $res
    $s = if ($res.ok) { "OK" } else { $res.status }
    Write-Host "  $r : $s"
}
Write-Host ""

# 2. Site Público - rotas com ID (usar 1 como placeholder)
Write-Host "Site Público - rotas com ID..." -ForegroundColor Yellow
$siteRotasId = @("/hoteis/1", "/leiloes/1")
foreach ($r in $siteRotasId) {
    $res = Test-Url "http://localhost:3000$r" "Site:$r"
    $results += $res
    $s = if ($res.ok) { "OK" } else { $res.status }
    Write-Host "  $r : $s"
}
Write-Host ""

# 3. Dashboard Turismo (3005)
Write-Host "2. Dashboard Turismo (3005)..." -ForegroundColor Yellow
$dashRotas = @(
    "/", "/login", "/register", "/dashboard", "/dashboard-master", "/rsv-360-ecosystem", "/integracoes-apis", "/hotels", "/reservations-rsv",
    "/travel-catalog-rsv", "/cotacoes", "/financeiro", "/pagamentos", "/marketing", "/analytics-dashboard", "/reports-dashboard",
    "/dashboard/leiloes", "/dashboard/leiloes/novo", "/dashboard/leiloes/flash-deals", "/dashboard/excursoes", "/dashboard/viagens-grupo",
    "/dashboard/marketplace", "/dashboard/ota-sync", "/dashboard/voice-commerce", "/dashboard/google-hotel-ads",
    "/accommodations/enterprises", "/accommodations/analytics", "/users", "/roles", "/permissions", "/settings", "/notifications",
    "/reviews", "/vouchers", "/giftcards", "/subscriptions", "/seo", "/multilingual", "/photos", "/videos", "/maps", "/insurance", "/visa",
    "/products", "/orders", "/inventory", "/refunds", "/partners", "/plans", "/upgrades", "/workflows", "/validation", "/documents",
    "/e-commerce", "/finance", "/sales", "/recommendations", "/transport", "/parks", "/loyalty", "/rewards"
)
foreach ($r in $dashRotas) {
    $res = Test-Url "http://localhost:3005$r" "Dash:$r"
    $results += $res
    $s = if ($res.ok) { "OK" } else { $res.status }
    Write-Host "  $r : $s"
}
Write-Host ""

# 4. Backend APIs (5000)
Write-Host "3. Backend APIs (5000)..." -ForegroundColor Yellow
$apiRotas = @(
    "/health", "/api/website/content/hotels", "/api/website/content/promotions", "/api/website/content/attractions",
    "/api/website/content/tickets", "/api/v1/auctions/active", "/api/v1/flash-deals/active"
)
foreach ($r in $apiRotas) {
    $res = Test-Url "http://localhost:5000$r" "API:$r"
    $results += $res
    $s = if ($res.ok) { "OK" } else { $res.status }
    Write-Host "  $r : $s"
}
Write-Host ""

# 5. Backend Admin (5002)
Write-Host "4. Backend Admin (5002)..." -ForegroundColor Yellow
$res = Test-Url "http://localhost:5002/health" "BackendAdmin:health"
$results += $res
Write-Host "  /health : $(if ($res.ok) { 'OK' } else { $res.status })"
Write-Host ""

# 6. Microserviços (6000-6031)
Write-Host "5. Microserviços (6000-6031)..." -ForegroundColor Yellow
$msOk = 0
$msFail = 0
for ($p = 6000; $p -le 6031; $p++) {
    $res = Test-Url "http://localhost:$p/health" "MS:$p"
    $results += $res
    if ($res.ok) { $msOk++ } else { $msFail++ }
}
Write-Host "  OK: $msOk | Falha: $msFail"
Write-Host ""

# 7. Agentes SRE (5050)
Write-Host "6. Agentes SRE (5050)..." -ForegroundColor Yellow
$sreRotas = @("/", "/logs", "/collector", "/history")
foreach ($r in $sreRotas) {
    $res = Test-Url "http://localhost:5050$r" "SRE:$r"
    $results += $res
    $s = if ($res.ok) { "OK" } else { $res.status }
    Write-Host "  $r : $s"
}
Write-Host ""

# Resumo
$ok = ($results | Where-Object { $_.ok }).Count
$fail = ($results | Where-Object { -not $_.ok }).Count
Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host "OK: $ok | Falha: $fail | Total: $($results.Count)"
Write-Host ""

# Exportar para arquivo
$results | ConvertTo-Json -Depth 3 | Out-File "d:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\RESULTADOS_TESTE_ROTAS.json" -Encoding UTF8
Write-Host "Resultados salvos em RESULTADOS_TESTE_ROTAS.json"
