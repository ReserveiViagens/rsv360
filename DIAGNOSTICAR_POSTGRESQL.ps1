# Script para Diagnosticar Problemas com PostgreSQL 18
# Execute como Administrador

Write-Host "🔍 DIAGNÓSTICO DO POSTGRESQL 18" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se o serviço existe
Write-Host "1. Verificando serviços PostgreSQL..." -ForegroundColor Yellow
$services = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($services) {
    foreach ($service in $services) {
        Write-Host "   Serviço encontrado: $($service.Name)" -ForegroundColor Green
        Write-Host "   Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { 'Green' } else { 'Red' })
        Write-Host "   Display Name: $($service.DisplayName)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Nenhum serviço PostgreSQL encontrado!" -ForegroundColor Red
    exit
}

Write-Host ""

# 2. Verificar se a porta 5432 está em uso
Write-Host "2. Verificando porta 5432..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "   ✅ Porta 5432 está em uso" -ForegroundColor Green
    Write-Host "   Estado: $($port.State)" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️ Porta 5432 não está em uso" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar arquivo pg_hba.conf
Write-Host "3. Verificando arquivo pg_hba.conf..." -ForegroundColor Yellow
$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

if (Test-Path $pgHbaPath) {
    Write-Host "   ✅ Arquivo encontrado: $pgHbaPath" -ForegroundColor Green
    
    $content = Get-Content $pgHbaPath -Raw
    if ($content -match "trust") {
        Write-Host "   ⚠️ ATENÇÃO: Arquivo contém 'trust' (modo inseguro)" -ForegroundColor Yellow
        Write-Host "   Isso permite conexão sem senha!" -ForegroundColor Yellow
    }
    if ($content -match "scram-sha-256") {
        Write-Host "   ✅ Arquivo contém 'scram-sha-256' (modo seguro)" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Arquivo não encontrado: $pgHbaPath" -ForegroundColor Red
    Write-Host "   Verifique se PostgreSQL 18 está instalado corretamente" -ForegroundColor Yellow
}

Write-Host ""

# 4. Verificar logs do PostgreSQL
Write-Host "4. Verificando logs do PostgreSQL..." -ForegroundColor Yellow
$logPath = "C:\Program Files\PostgreSQL\18\data\log"
$logFiles = Get-ChildItem -Path $logPath -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($logFiles) {
    Write-Host "   ✅ Log mais recente: $($logFiles.Name)" -ForegroundColor Green
    Write-Host "   Última modificação: $($logFiles.LastWriteTime)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "   📋 Últimas 10 linhas do log:" -ForegroundColor Cyan
    Get-Content $logFiles.FullName -Tail 10 | ForEach-Object {
        if ($_ -match "ERROR|FATAL") {
            Write-Host "   ❌ $_" -ForegroundColor Red
        } elseif ($_ -match "WARNING") {
            Write-Host "   ⚠️ $_" -ForegroundColor Yellow
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ⚠️ Nenhum arquivo de log encontrado em: $logPath" -ForegroundColor Yellow
}

Write-Host ""

# 5. Tentar parar o serviço primeiro
Write-Host "5. Tentando parar o serviço..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "postgresql-x64-18" -Force -ErrorAction Stop
        Start-Sleep -Seconds 3
        Write-Host "   ✅ Serviço parado com sucesso" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ Serviço já estava parado" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Erro ao parar serviço: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Verificar permissões
Write-Host "6. Verificando permissões do diretório de dados..." -ForegroundColor Yellow
$dataPath = "C:\Program Files\PostgreSQL\18\data"
if (Test-Path $dataPath) {
    $acl = Get-Acl $dataPath
    Write-Host "   ✅ Diretório existe: $dataPath" -ForegroundColor Green
    Write-Host "   Proprietário: $($acl.Owner)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Diretório não encontrado: $dataPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Diagnóstico concluído!" -ForegroundColor Green
Write-Host ""

# Sugestões
Write-Host "💡 SUGESTÕES:" -ForegroundColor Cyan
Write-Host "1. Se o serviço não iniciar, verifique os logs acima" -ForegroundColor White
Write-Host "2. Verifique se o arquivo pg_hba.conf está correto" -ForegroundColor White
Write-Host "3. Tente iniciar o serviço manualmente via Services (services.msc)" -ForegroundColor White
Write-Host "4. Verifique se há outro processo usando a porta 5432" -ForegroundColor White

