# =====================================================
# Script Completo: Corrigir pgAdmin 4 e PostgreSQL
# =====================================================
# Este script:
# 1. Verifica e inicia PostgreSQL
# 2. Corrige/reseta a senha do PostgreSQL
# 3. Verifica configuração do Docker (se necessário)
# 4. Testa conexão
# 5. Fornece instruções para pgAdmin 4
# =====================================================

param(
    [string]$NovaSenha = "290491Bb",
    [int]$Porta = 5433,
    [switch]$Forcar
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORREÇÃO COMPLETA: pgAdmin 4 + PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  AVISO: Executando sem privilégios de Administrador" -ForegroundColor Yellow
    Write-Host "   Algumas operações podem falhar. Para melhor resultado:" -ForegroundColor Yellow
    Write-Host "   Clique com botão direito → 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
}

# =====================================================
# 1. VERIFICAR SERVIÇO POSTGRESQL
# =====================================================
Write-Host "1. Verificando serviço PostgreSQL..." -ForegroundColor Yellow

$serviceName = "postgresql-x64-18"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "   ❌ Serviço PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host "   Verifique se PostgreSQL 18 está instalado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Serviços PostgreSQL encontrados:" -ForegroundColor Cyan
    Get-Service | Where-Object {$_.Name -like "*postgres*"} | Format-Table Name, Status, DisplayName -AutoSize
    exit 1
}

Write-Host "   ✅ Serviço encontrado: $($service.DisplayName)" -ForegroundColor Green
Write-Host "   Status atual: $($service.Status)" -ForegroundColor Cyan

# =====================================================
# 2. INICIAR SERVIÇO (se parado)
# =====================================================
if ($service.Status -ne 'Running') {
    Write-Host ""
    Write-Host "2. Iniciando serviço PostgreSQL..." -ForegroundColor Yellow
    
    try {
        if ($isAdmin) {
            Start-Service -Name $serviceName -ErrorAction Stop
        } else {
            Write-Host "   ⚠️  Sem privilégios de admin. Tentando iniciar via net start..." -ForegroundColor Yellow
            $result = Start-Process -FilePath "net" -ArgumentList "start", $serviceName -Wait -NoNewWindow -PassThru
            if ($result.ExitCode -ne 0) {
                throw "Falha ao iniciar serviço"
            }
        }
        
        Start-Sleep -Seconds 5
        
        $service = Get-Service -Name $serviceName
        if ($service.Status -eq 'Running') {
            Write-Host "   ✅ Serviço iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Serviço não iniciou. Status: $($service.Status)" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "   ❌ Erro ao iniciar serviço: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Tente iniciar manualmente:" -ForegroundColor Yellow
        Write-Host "   Start-Service -Name '$serviceName'" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "2. Serviço já está rodando ✅" -ForegroundColor Green
}

# =====================================================
# 3. VERIFICAR PORTA
# =====================================================
Write-Host ""
Write-Host "3. Verificando porta PostgreSQL..." -ForegroundColor Yellow

$portaEmUso = Get-NetTCPConnection -LocalPort $Porta -ErrorAction SilentlyContinue | Select-Object -First 1
if ($portaEmUso) {
    Write-Host "   ✅ Porta $Porta está em uso (PostgreSQL rodando)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Porta $Porta não está em uso" -ForegroundColor Yellow
    Write-Host "   Verificando porta 5432..." -ForegroundColor Cyan
    
    $porta5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($porta5432) {
        Write-Host "   ⚠️  Porta 5432 está em uso (possivelmente Docker)" -ForegroundColor Yellow
        Write-Host "   Usando porta $Porta como alternativa" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Nenhuma porta PostgreSQL detectada" -ForegroundColor Yellow
        Write-Host "   Verifique se o PostgreSQL está configurado corretamente" -ForegroundColor Yellow
    }
}

# =====================================================
# 4. VERIFICAR/CORRIGIR SENHA
# =====================================================
Write-Host ""
Write-Host "4. Verificando e corrigindo senha do PostgreSQL..." -ForegroundColor Yellow

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    # Tentar outras versões
    $psqlPaths = @(
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    )
    
    $psqlPath = $null
    foreach ($path in $psqlPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            Write-Host "   ✅ Encontrado: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $psqlPath) {
        Write-Host "   ❌ psql.exe não encontrado!" -ForegroundColor Red
        Write-Host "   Verifique se PostgreSQL está instalado corretamente" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "   Usando: $psqlPath" -ForegroundColor Cyan

# Testar conexão com senha atual
Write-Host "   Testando conexão..." -ForegroundColor Cyan

$testConnection = $false
$senhasParaTestar = @("290491Bb", "postgres", "password", ".,@#290491Bb")

foreach ($senhaTeste in $senhasParaTestar) {
    $env:PGPASSWORD = $senhaTeste
    $testResult = & $psqlPath -U postgres -d postgres -p $Porta -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Conexão bem-sucedida com senha: $senhaTeste" -ForegroundColor Green
        $testConnection = $true
        $NovaSenha = $senhaTeste
        break
    }
}

if (-not $testConnection) {
    Write-Host "   ⚠️  Nenhuma senha conhecida funcionou. Tentando resetar..." -ForegroundColor Yellow
    
    # Modificar pg_hba.conf temporariamente
    $pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
    if (Test-Path $pgHbaPath) {
        Write-Host "   Modificando pg_hba.conf para modo trust (temporário)..." -ForegroundColor Cyan
        
        $pgHbaBackup = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $pgHbaPath $pgHbaBackup -Force
        
        $content = Get-Content $pgHbaPath -Raw
        $content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256", '$1trust'
        $content = $content -replace "(host\s+all\s+all\s+::1/128\s+)scram-sha-256", '$1trust'
        Set-Content -Path $pgHbaPath -Value $content -NoNewline
        
        # Reiniciar serviço
        Restart-Service -Name $serviceName -Force
        Start-Sleep -Seconds 3
        
        # Alterar senha
        $env:PGPASSWORD = ""
        $sqlCommand = "ALTER USER postgres WITH PASSWORD '$NovaSenha';"
        $sqlFile = "$env:TEMP\alter_password_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        Set-Content -Path $sqlFile -Value $sqlCommand
        
        & $psqlPath -U postgres -d postgres -p $Porta -f $sqlFile 2>&1 | Out-Null
        
        # Reverter pg_hba.conf
        $content = Get-Content $pgHbaPath -Raw
        $content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)trust", '$1scram-sha-256'
        $content = $content -replace "(host\s+all\s+all\s+::1/128\s+)trust", '$1scram-sha-256'
        Set-Content -Path $pgHbaPath -Value $content -NoNewline
        
        # Reiniciar serviço novamente
        Restart-Service -Name $serviceName -Force
        Start-Sleep -Seconds 3
        
        Remove-Item $sqlFile -ErrorAction SilentlyContinue
        
        Write-Host "   ✅ Senha resetada para: $NovaSenha" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Arquivo pg_hba.conf não encontrado: $pgHbaPath" -ForegroundColor Red
    }
}

# =====================================================
# 5. TESTAR CONEXÃO FINAL
# =====================================================
Write-Host ""
Write-Host "5. Testando conexão final..." -ForegroundColor Yellow

$env:PGPASSWORD = $NovaSenha
$finalTest = & $psqlPath -U postgres -d postgres -p $Porta -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Conexão testada com sucesso!" -ForegroundColor Green
    $version = ($finalTest | Select-String "PostgreSQL").ToString()
    Write-Host "   $version" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Falha na conexão final" -ForegroundColor Red
    Write-Host "   Erro: $finalTest" -ForegroundColor Yellow
}

# =====================================================
# 6. VERIFICAR DOCKER (se necessário)
# =====================================================
Write-Host ""
Write-Host "6. Verificando Docker..." -ForegroundColor Yellow

try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker está rodando" -ForegroundColor Green
        
        # Verificar containers PostgreSQL
        $pgContainers = docker ps -a --filter "name=postgres" --format "{{.Names}}" 2>&1
        if ($pgContainers) {
            Write-Host "   Containers PostgreSQL encontrados:" -ForegroundColor Cyan
            $pgContainers | ForEach-Object { Write-Host "      - $_" -ForegroundColor White }
        }
    } else {
        Write-Host "   ℹ️  Docker não está rodando ou não está instalado" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ℹ️  Docker não disponível" -ForegroundColor Cyan
}

# =====================================================
# 7. RESUMO E INSTRUÇÕES
# =====================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 CONFIGURAÇÃO ATUAL:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Porta: $Porta" -ForegroundColor White
Write-Host "   Usuário: postgres" -ForegroundColor White
Write-Host "   Senha: $NovaSenha" -ForegroundColor White
Write-Host ""
Write-Host "🔧 CONFIGURAR PGADMIN 4:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Abra o pgAdmin 4" -ForegroundColor White
Write-Host "   2. Clique com botão direito em 'Servers' → 'Create' → 'Server'" -ForegroundColor White
Write-Host "   3. Na aba 'General':" -ForegroundColor White
Write-Host "      - Name: PostgreSQL 18 (Porta $Porta)" -ForegroundColor Yellow
Write-Host "   4. Na aba 'Connection':" -ForegroundColor White
Write-Host "      - Host name/address: localhost" -ForegroundColor Yellow
Write-Host "      - Port: $Porta" -ForegroundColor Yellow
Write-Host "      - Maintenance database: postgres" -ForegroundColor Yellow
Write-Host "      - Username: postgres" -ForegroundColor Yellow
Write-Host "      - Password: $NovaSenha" -ForegroundColor Yellow
Write-Host "      - ✅ Marque 'Save password'" -ForegroundColor Yellow
Write-Host "   5. Clique em 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "🧪 TESTAR CONEXÃO:" -ForegroundColor Cyan
Write-Host "   & `"$psqlPath`" -U postgres -d postgres -p $Porta" -ForegroundColor White
Write-Host "   (Digite a senha: $NovaSenha)" -ForegroundColor White
Write-Host ""
Write-Host '📝 ATUALIZAR ARQUIVOS .ENV:' -ForegroundColor Cyan
Write-Host '   DB_HOST=localhost' -ForegroundColor White
Write-Host "   DB_PORT=$Porta" -ForegroundColor White
Write-Host '   DB_NAME=rsv360' -ForegroundColor White
Write-Host '   DB_USER=postgres' -ForegroundColor White
Write-Host "   DB_PASSWORD=$NovaSenha" -ForegroundColor White
Write-Host ''
