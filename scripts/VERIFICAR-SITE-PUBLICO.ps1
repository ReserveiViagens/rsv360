# Script para verificar o Site Público após inicialização
# Testa: /hoteis, rodapé, promoções, atrações, /admin/login, /admin/crm, busca

param(
    [int]$Timeout = 30,
    [int]$MaxRetries = 10
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICAÇÃO DO SITE PÚBLICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$retries = 0
$siteReady = $false

# Aguardar site ficar pronto
Write-Host "1. Aguardando site ficar pronto..." -ForegroundColor Yellow
while ($retries -lt $MaxRetries -and -not $siteReady) {
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $siteReady = $true
            Write-Host "   [OK] Site está respondendo!" -ForegroundColor Green
        }
    } catch {
        $retries++
        Write-Host "   [INFO] Tentativa $retries/$MaxRetries - Aguardando..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $siteReady) {
    Write-Host "   [ERRO] Site não está respondendo após $MaxRetries tentativas" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Função para verificar página
function Test-Page {
    param(
        [string]$Url,
        [string]$Description,
        [string[]]$RequiredText = @(),
        [string[]]$RequiredElements = @()
    )
    
    Write-Host "   Testando: $Description" -ForegroundColor Cyan
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "   [OK] Tamanho: $($response.Content.Length) bytes" -ForegroundColor Gray
            
            $content = $response.Content
            $allFound = $true
            
            # Verificar textos obrigatórios
            foreach ($text in $RequiredText) {
                if ($content -match [regex]::Escape($text)) {
                    Write-Host "   [OK] Texto encontrado: '$text'" -ForegroundColor Green
                } else {
                    Write-Host "   [AVISO] Texto não encontrado: '$text'" -ForegroundColor Yellow
                    $allFound = $false
                }
            }
            
            # Verificar elementos HTML
            foreach ($element in $RequiredElements) {
                if ($content -match $element) {
                    Write-Host "   [OK] Elemento encontrado: '$element'" -ForegroundColor Green
                } else {
                    Write-Host "   [AVISO] Elemento não encontrado: '$element'" -ForegroundColor Yellow
                    $allFound = $false
                }
            }
            
            return @{
                Success = $true
                StatusCode = $response.StatusCode
                ContentLength = $response.Content.Length
                AllChecks = $allFound
            }
        } else {
            Write-Host "   [ERRO] Status: $($response.StatusCode)" -ForegroundColor Red
            return @{ Success = $false; StatusCode = $response.StatusCode }
        }
    } catch {
        Write-Host "   [ERRO] $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# 2. Verificar página de hotéis
Write-Host "2. Verificando página /hoteis..." -ForegroundColor Yellow
$hoteisResult = Test-Page `
    -Url "$baseUrl/hoteis" `
    -Description "Página de Hotéis" `
    -RequiredText @("hotel", "hoteis", "reserva") `
    -RequiredElements @("class.*hotel", "card|item|listing")

Write-Host ""

# 3. Contar hotéis na página
Write-Host "3. Contando hotéis na página..." -ForegroundColor Yellow
try {
    $hoteisResponse = Invoke-WebRequest -Uri "$baseUrl/hoteis" -TimeoutSec $Timeout -UseBasicParsing
    $content = $hoteisResponse.Content
    
    # Tentar encontrar contagem de hotéis (pode estar em vários formatos)
    $hotelCount = 0
    
    # Buscar por padrões comuns
    if ($content -match '(\d+)\s*(hot[eé]is?|propriedades?)') {
        $hotelCount = [int]$matches[1]
        Write-Host "   [OK] Encontrado: $hotelCount hotéis (via regex)" -ForegroundColor Green
    } elseif ($content -match 'total.*?(\d+)') {
        $hotelCount = [int]$matches[1]
        Write-Host "   [OK] Encontrado: $hotelCount hotéis (via padrão total)" -ForegroundColor Green
    } else {
        # Contar elementos de hotel no HTML
        $hotelElements = ([regex]::Matches($content, 'class="[^"]*hotel[^"]*"|data-hotel|id="hotel')).Count
        if ($hotelElements -gt 0) {
            Write-Host "   [INFO] Encontrados $hotelElements elementos relacionados a hotéis" -ForegroundColor Cyan
        }
        Write-Host "   [AVISO] Não foi possível determinar a contagem exata de hotéis" -ForegroundColor Yellow
        Write-Host "   [INFO] Verifique manualmente em: $baseUrl/hoteis" -ForegroundColor Gray
    }
    
    if ($hotelCount -ge 41) {
        Write-Host "   [OK] ✓ Contagem de hotéis OK ($hotelCount >= 41)" -ForegroundColor Green
    } elseif ($hotelCount -gt 0) {
        Write-Host "   [AVISO] Encontrados $hotelCount hotéis (esperado: 41)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERRO] Não foi possível contar hotéis: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Verificar rodapé
Write-Host "4. Verificando rodapé com informações de contato..." -ForegroundColor Yellow
$footerResult = Test-Page `
    -Url $baseUrl `
    -Description "Rodapé e Informações de Contato" `
    -RequiredText @("contato", "telefone", "email", "endereço") `
    -RequiredElements @("footer", "class.*footer|id.*footer")

Write-Host ""

# 5. Verificar promoções
Write-Host "5. Verificando página de promoções..." -ForegroundColor Yellow
$promocoesResult = Test-Page `
    -Url "$baseUrl/promocoes" `
    -Description "Página de Promoções" `
    -RequiredText @("promo", "desconto", "oferta") `
    -RequiredElements @("promo|discount|offer")

Write-Host ""

# 6. Verificar atrações
Write-Host "6. Verificando página de atrações..." -ForegroundColor Yellow
$atracoesResult = Test-Page `
    -Url "$baseUrl/atracoes" `
    -Description "Página de Atrações" `
    -RequiredText @("atração", "atracao", "passeio") `
    -RequiredElements @("attraction|atracao|passeio")

Write-Host ""

# 7. Verificar página de Login Admin
Write-Host "7. Verificando página de Login Admin..." -ForegroundColor Yellow
$loginResult = Test-Page `
    -Url "$baseUrl/admin/login?from=%2Fadmin%2Fcrm" `
    -Description "Página de Login Admin" `
    -RequiredText @("login", "admin", "senha", "password") `
    -RequiredElements @("form|input.*password|button.*submit")

Write-Host "   [INFO] Credencial de acesso:" -ForegroundColor Cyan
Write-Host "   [INFO]   Senha: admin-token-123" -ForegroundColor Yellow
Write-Host "   [INFO]   (Não requer email, apenas senha)" -ForegroundColor Gray

Write-Host ""

# 8. Verificar página Admin CRM (pode redirecionar para login)
Write-Host "8. Verificando página Admin CRM..." -ForegroundColor Yellow
try {
    $crmResponse = Invoke-WebRequest -Uri "$baseUrl/admin/crm" -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
    
    if ($crmResponse.StatusCode -eq 200) {
        $content = $crmResponse.Content
        if ($content -match "login|admin.*login|redirect.*login") {
            Write-Host "   [OK] Página redireciona para login (esperado)" -ForegroundColor Green
            Write-Host "   [INFO] Acesse: $baseUrl/admin/login?from=%2Fadmin%2Fcrm" -ForegroundColor Cyan
            $crmResult = @{ Success = $true; Redirected = $true }
        } elseif ($content -match "crm|customer|cliente") {
            Write-Host "   [OK] Página Admin CRM carregada" -ForegroundColor Green
            $crmResult = @{ Success = $true; Redirected = $false }
        } else {
            Write-Host "   [AVISO] Página carregou mas conteúdo não identificado claramente" -ForegroundColor Yellow
            $crmResult = @{ Success = $true; Content = $content.Length }
        }
    }
} catch {
    if ($_.Exception.Message -match "redirect|301|302") {
        Write-Host "   [OK] Página redireciona para login (esperado)" -ForegroundColor Green
        $crmResult = @{ Success = $true; Redirected = $true }
    } else {
        Write-Host "   [ERRO] $($_.Exception.Message)" -ForegroundColor Red
        $crmResult = @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-Host ""

# 9. Verificar busca de hotéis
Write-Host "7. Verificando funcionalidade de busca..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "$baseUrl/hoteis" -TimeoutSec $Timeout -UseBasicParsing
    $content = $searchResponse.Content
    
    $hasSearch = $false
    if ($content -match 'search|busca|input.*type.*search|placeholder.*buscar') {
        Write-Host "   [OK] Campo de busca encontrado" -ForegroundColor Green
        $hasSearch = $true
    } else {
        Write-Host "   [AVISO] Campo de busca não encontrado claramente" -ForegroundColor Yellow
    }
    
    if ($content -match 'filter|filtro|select.*category') {
        Write-Host "   [OK] Filtros encontrados" -ForegroundColor Green
    } else {
        Write-Host "   [AVISO] Filtros não encontrados claramente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERRO] Não foi possível verificar busca: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DA VERIFICAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$summary = @{
    "Site Público (/) = $baseUrl" = $siteReady
    "Página de Hotéis (/hoteis)" = $hoteisResult.Success
    "Rodapé com Contato" = $footerResult.Success
    "Página de Promoções (/promocoes)" = $promocoesResult.Success
    "Página de Atrações (/atracoes)" = $atracoesResult.Success
    "Página Login Admin (/admin/login)" = $loginResult.Success
    "Página Admin CRM (/admin/crm)" = $crmResult.Success
}

foreach ($item in $summary.GetEnumerator()) {
    $status = if ($item.Value) { "[OK]" } else { "[ERRO]" }
    $color = if ($item.Value) { "Green" } else { "Red" }
    Write-Host "$status $($item.Key)" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASSOS MANUAIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse manualmente: $baseUrl/hoteis" -ForegroundColor Yellow
Write-Host "2. Confirme visualmente que aparecem 41 hotéis" -ForegroundColor Yellow
Write-Host "3. Verifique o rodapé com informações de contato" -ForegroundColor Yellow
Write-Host "4. Navegue pelas promoções: $baseUrl/promocoes" -ForegroundColor Yellow
Write-Host "5. Verifique atrações: $baseUrl/atracoes" -ForegroundColor Yellow
Write-Host "6. Acesse o Login Admin: $baseUrl/admin/login?from=%2Fadmin%2Fcrm" -ForegroundColor Yellow
Write-Host "   Credencial: Senha = 'admin-token-123' (sem email)" -ForegroundColor Cyan
Write-Host "7. Após login, acesse o Admin CRM: $baseUrl/admin/crm" -ForegroundColor Yellow
Write-Host "8. Teste a busca de hotéis na página /hoteis" -ForegroundColor Yellow
Write-Host ""
