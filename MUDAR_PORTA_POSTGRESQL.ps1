# Script para mudar porta do PostgreSQL de 5432 para 5433
# Execute como Administrador

Write-Host "ALTERANDO PORTA DO POSTGRESQL DE 5432 PARA 5433" -ForegroundColor Cyan
Write-Host ""

$postgresqlConf = "C:\Program Files\PostgreSQL\18\data\postgresql.conf"

# Verificar se arquivo existe
if (-not (Test-Path $postgresqlConf)) {
    Write-Host "ERRO: Arquivo nao encontrado: $postgresqlConf" -ForegroundColor Red
    exit 1
}

# Fazer backup
$backupPath = "$postgresqlConf.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $postgresqlConf $backupPath -Force
Write-Host "OK: Backup criado: $(Split-Path $backupPath -Leaf)" -ForegroundColor Green

# Ler arquivo
$content = Get-Content $postgresqlConf -Raw

# Verificar porta atual
$portLine = $content | Select-String -Pattern "^port\s*="
Write-Host "Porta atual: $portLine" -ForegroundColor Yellow

# Alterar porta
if ($content -match "port\s*=\s*5432") {
    $content = $content -replace "port\s*=\s*5432", "port = 5433"
    Set-Content -Path $postgresqlConf -Value $content -NoNewline -Encoding UTF8
    Write-Host "OK: Porta alterada para 5433" -ForegroundColor Green
} elseif ($content -match "port\s*=\s*5433") {
    Write-Host "INFO: Porta ja esta configurada como 5433" -ForegroundColor Cyan
} else {
    Write-Host "AVISO: Nao foi possivel encontrar a configuracao de porta" -ForegroundColor Yellow
    Write-Host "Adicionando linha: port = 5433" -ForegroundColor Yellow
    $content = $content + "`nport = 5433`n"
    Set-Content -Path $postgresqlConf -Value $content -NoNewline -Encoding UTF8
}

# Verificar alteracao
Write-Host ""
Write-Host "Verificando alteracao..." -ForegroundColor Yellow
$newPortLine = Get-Content $postgresqlConf | Select-String -Pattern "^port\s*=" | Select-Object -First 1
Write-Host "Nova configuracao: $newPortLine" -ForegroundColor Green

Write-Host ""
Write-Host "Tentando iniciar servico PostgreSQL..." -ForegroundColor Yellow
Start-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

$service = Get-Service -Name "postgresql-x64-18"
if ($service.Status -eq 'Running') {
    Write-Host "OK: Servico iniciado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Agora use a porta 5433 para conectar!" -ForegroundColor Cyan
    Write-Host "Exemplo: psql -U postgres -d postgres -p 5433" -ForegroundColor White
} else {
    Write-Host "AVISO: Servico nao iniciou. Status: $($service.Status)" -ForegroundColor Yellow
    Write-Host "Verifique os logs em: C:\Program Files\PostgreSQL\18\data\log" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ALTERACAO CONCLUIDA!" -ForegroundColor Green

