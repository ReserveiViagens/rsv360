# Script para Corrigir e Reiniciar PostgreSQL 18
# Execute como Administrador

param(
    [string]$NovaSenha = "290491Bb"
)

Write-Host "🔧 CORREÇÃO DO POSTGRESQL 18" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "   Clique com botão direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    exit 1
}

# 1. Parar o serviço
Write-Host "1. Parando serviço PostgreSQL..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "postgresql-x64-18" -Force
        Start-Sleep -Seconds 5
        Write-Host "   ✅ Serviço parado" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ Serviço já estava parado" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️ Erro ao parar serviço: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verificar e corrigir pg_hba.conf
Write-Host "2. Verificando arquivo pg_hba.conf..." -ForegroundColor Yellow
$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$pgHbaBackup = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (-not (Test-Path $pgHbaPath)) {
    Write-Host "   ❌ Arquivo não encontrado: $pgHbaPath" -ForegroundColor Red
    Write-Host "   Verifique se PostgreSQL 18 está instalado corretamente" -ForegroundColor Yellow
    exit 1
}

# Fazer backup
Copy-Item $pgHbaPath $pgHbaBackup -Force
Write-Host "   ✅ Backup criado: $pgHbaBackup" -ForegroundColor Green

# Ler conteúdo
$content = Get-Content $pgHbaPath -Raw

# Verificar se já está em modo trust
if ($content -match "host\s+all\s+all\s+127\.0\.0\.1/32\s+trust") {
    Write-Host "   ℹ️ Arquivo já está em modo trust" -ForegroundColor Cyan
} else {
    Write-Host "   🔄 Alterando para modo trust (temporário)..." -ForegroundColor Yellow
    
    # Substituir scram-sha-256 por trust para localhost
    $content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256", '$1trust'
    $content = $content -replace "(host\s+all\s+all\s+::1/128\s+)scram-sha-256", '$1trust'
    
    # Salvar arquivo
    Set-Content -Path $pgHbaPath -Value $content -NoNewline
    Write-Host "   ✅ Arquivo alterado para modo trust" -ForegroundColor Green
}

Write-Host ""

# 3. Iniciar o serviço
Write-Host "3. Iniciando serviço PostgreSQL..." -ForegroundColor Yellow
try {
    Start-Service -Name "postgresql-x64-18" -ErrorAction Stop
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "postgresql-x64-18"
    if ($service.Status -eq 'Running') {
        Write-Host "   ✅ Serviço iniciado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Serviço não iniciou. Status: $($service.Status)" -ForegroundColor Red
        Write-Host "   Verifique os logs em: C:\Program Files\PostgreSQL\18\data\log\" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Erro ao iniciar serviço: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifique os logs em: C:\Program Files\PostgreSQL\18\data\log\" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 4. Conectar e alterar senha
Write-Host "4. Conectando e alterando senha..." -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "   ❌ psql.exe não encontrado: $psqlPath" -ForegroundColor Red
    exit 1
}

# Criar script SQL temporário
$sqlScript = "$env:TEMP\alter_password_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$sqlCommand = "ALTER USER postgres WITH PASSWORD '$NovaSenha';`n\q"
Set-Content -Path $sqlScript -Value $sqlCommand

try {
    # Executar psql
    $process = Start-Process -FilePath $psqlPath -ArgumentList "-U", "postgres", "-d", "postgres", "-f", $sqlScript -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\psql_output.txt" -RedirectStandardError "$env:TEMP\psql_error.txt"
    
    if ($process.ExitCode -eq 0) {
        Write-Host "   ✅ Senha alterada com sucesso!" -ForegroundColor Green
        Write-Host "   Nova senha: $NovaSenha" -ForegroundColor Cyan
    } else {
        $errorContent = Get-Content "$env:TEMP\psql_error.txt" -ErrorAction SilentlyContinue
        if ($errorContent) {
            Write-Host "   ⚠️ Avisos/Erros:" -ForegroundColor Yellow
            $errorContent | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        }
    }
} catch {
    Write-Host "   ⚠️ Erro ao executar psql: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Tente executar manualmente:" -ForegroundColor Yellow
    Write-Host "   & `"$psqlPath`" -U postgres -d postgres" -ForegroundColor Cyan
    Write-Host "   Depois execute: ALTER USER postgres WITH PASSWORD '$NovaSenha';" -ForegroundColor Cyan
}

# Limpar arquivo temporário
Remove-Item $sqlScript -ErrorAction SilentlyContinue

Write-Host ""

# 5. Reverter pg_hba.conf para modo seguro
Write-Host "5. Revertendo pg_hba.conf para modo seguro..." -ForegroundColor Yellow
$content = Get-Content $pgHbaPath -Raw
$content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)trust", '$1scram-sha-256'
$content = $content -replace "(host\s+all\s+all\s+::1/128\s+)trust", '$1scram-sha-256'
Set-Content -Path $pgHbaPath -Value $content -NoNewline
Write-Host "   ✅ Arquivo revertido para modo scram-sha-256" -ForegroundColor Green

Write-Host ""

# 6. Reiniciar serviço novamente
Write-Host "6. Reiniciando serviço com configuração segura..." -ForegroundColor Yellow
Restart-Service -Name "postgresql-x64-18" -Force
Start-Sleep -Seconds 3

$service = Get-Service -Name "postgresql-x64-18"
if ($service.Status -eq 'Running') {
    Write-Host "   ✅ Serviço reiniciado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Serviço não está rodando. Status: $($service.Status)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RESUMO:" -ForegroundColor Cyan
Write-Host "   Senha configurada: $NovaSenha" -ForegroundColor White
Write-Host "   Serviço: $($service.Status)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 TESTE A CONEXÃO:" -ForegroundColor Cyan
Write-Host "   & `"$psqlPath`" -U postgres -d postgres" -ForegroundColor White
Write-Host "   (Digite a senha: $NovaSenha)" -ForegroundColor White

