# Script para verificar se as tabelas foram criadas corretamente

param(
    [string]$Host = "localhost",
    [int]$Port = 5433,
    [string]$Database = "rsv360",
    [string]$User = "postgres",
    [string]$Password = "290491Bb"
)

Write-Host "=== VERIFICAR TABELAS - MÓDULOS DE TURISMO ===" -ForegroundColor Green
Write-Host ""

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "ERRO: psql não encontrado em $psqlPath" -ForegroundColor Red
    exit 1
}

# Tabelas esperadas
$tabelasEsperadas = @(
    "auctions",
    "bids",
    "excursoes",
    "roteiros",
    "participantes_excursao",
    "grupos_viagem",
    "membros_grupo",
    "wishlist_items",
    "pagamentos_divididos"
)

Write-Host "Verificando tabelas no banco $Database..." -ForegroundColor Cyan
Write-Host ""

try {
    $env:PGPASSWORD = $Password
    
    # Query para listar tabelas
    $query = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('auctions', 'bids', 'excursoes', 'roteiros', 'participantes_excursao', 'grupos_viagem', 'membros_grupo', 'wishlist_items', 'pagamentos_divididos')
ORDER BY table_name;
"@
    
    $result = & $psqlPath -h $Host -p $Port -U $User -d $Database -t -c $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $tabelasEncontradas = $result | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
        
        Write-Host "Tabelas encontradas:" -ForegroundColor Yellow
        foreach ($tabela in $tabelasEncontradas) {
            Write-Host "  ✅ $tabela" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Tabelas esperadas:" -ForegroundColor Yellow
        foreach ($tabela in $tabelasEsperadas) {
            $existe = $tabelasEncontradas -contains $tabela
            if ($existe) {
                Write-Host "  ✅ $tabela" -ForegroundColor Green
            } else {
                Write-Host "  ❌ $tabela (NÃO ENCONTRADA)" -ForegroundColor Red
            }
        }
        
        $faltando = $tabelasEsperadas | Where-Object { $tabelasEncontradas -notcontains $_ }
        
        Write-Host ""
        if ($faltando.Count -eq 0) {
            Write-Host "✅ Todas as tabelas foram criadas com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Tabelas faltando: $($faltando -join ', ')" -ForegroundColor Yellow
            Write-Host "Execute o script executar-migrations-turismo.ps1 para criar as tabelas faltantes" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ERRO ao verificar tabelas:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "ERRO: $_" -ForegroundColor Red
}

