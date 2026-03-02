# Script para Reparar e Iniciar PostgreSQL 18
# Execute como Administrador

param(
    [string]$NovaSenha = "290491Bb"
)

Write-Host "REPARACAO DO POSTGRESQL 18" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botao direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    exit 1
}

$serviceName = "postgresql-x64-18"
$dataPath = "C:\Program Files\PostgreSQL\18\data"
$pgHbaPath = "$dataPath\pg_hba.conf"
$lockFile = "$dataPath\postmaster.pid"

# 1. Parar o servico completamente
Write-Host "1. Parando servico PostgreSQL..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name $serviceName -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Stop-Service -Name $serviceName -Force
        Write-Host "   OK: Servico parado" -ForegroundColor Green
    } else {
        Write-Host "   INFO: Servico ja estava parado" -ForegroundColor Cyan
    }
    Start-Sleep -Seconds 5
} catch {
    Write-Host "   AVISO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Remover arquivo de lock (se existir)
Write-Host ""
Write-Host "2. Removendo arquivo de lock..." -ForegroundColor Yellow
if (Test-Path $lockFile) {
    try {
        Remove-Item $lockFile -Force
        Write-Host "   OK: Arquivo de lock removido: postmaster.pid" -ForegroundColor Green
    } catch {
        Write-Host "   AVISO: Nao foi possivel remover o arquivo de lock" -ForegroundColor Yellow
        Write-Host "   Tente fechar todas as conexoes ao PostgreSQL" -ForegroundColor Yellow
    }
} else {
    Write-Host "   INFO: Nenhum arquivo de lock encontrado" -ForegroundColor Cyan
}

# 3. Verificar e corrigir pg_hba.conf
Write-Host ""
Write-Host "3. Verificando arquivo pg_hba.conf..." -ForegroundColor Yellow
if (Test-Path $pgHbaPath) {
    # Fazer backup
    $backupPath = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $pgHbaPath $backupPath -Force
    Write-Host "   OK: Backup criado: $(Split-Path $backupPath -Leaf)" -ForegroundColor Green
    
    # Ler e corrigir
    $content = Get-Content $pgHbaPath -Raw
    
    # Verificar se precisa alterar para trust temporariamente
    if ($content -notmatch "host\s+all\s+all\s+127\.0\.0\.1/32\s+trust") {
        Write-Host "   Alterando para modo trust (temporario)..." -ForegroundColor Yellow
        $content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256", '$1trust'
        $content = $content -replace "(host\s+all\s+all\s+::1/128\s+)scram-sha-256", '$1trust'
        Set-Content -Path $pgHbaPath -Value $content -NoNewline -Encoding UTF8
        Write-Host "   OK: Arquivo alterado para modo trust" -ForegroundColor Green
    } else {
        Write-Host "   INFO: Arquivo ja esta em modo trust" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ERRO: Arquivo nao encontrado: $pgHbaPath" -ForegroundColor Red
    Write-Host "   Verifique se PostgreSQL 18 esta instalado corretamente" -ForegroundColor Yellow
    exit 1
}

# 4. Tentar iniciar o servico
Write-Host ""
Write-Host "4. Iniciando servico PostgreSQL..." -ForegroundColor Yellow
try {
    Start-Service -Name $serviceName -ErrorAction Stop
    Start-Sleep -Seconds 10
    
    $service = Get-Service -Name $serviceName
    if ($service.Status -eq 'Running') {
        Write-Host "   OK: Servico iniciado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: Servico nao iniciou. Status: $($service.Status)" -ForegroundColor Red
        
        # Verificar logs
        Write-Host ""
        Write-Host "   Verificando logs..." -ForegroundColor Yellow
        $logPath = "$dataPath\log"
        $logFiles = Get-ChildItem -Path $logPath -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($logFiles) {
            Write-Host "   Ultimas 5 linhas do log:" -ForegroundColor Cyan
            Get-Content $logFiles.FullName -Tail 5 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Gray
            }
        }
        exit 1
    }
} catch {
    Write-Host "   ERRO ao iniciar servico: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Tente verificar os logs em: $dataPath\log" -ForegroundColor Yellow
    exit 1
}

# 5. Aguardar PostgreSQL estar pronto
Write-Host ""
Write-Host "5. Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
        if (Test-Path $psqlPath) {
            $result = & $psqlPath -U postgres -d postgres -c "SELECT 1;" -t 2>&1
            if ($LASTEXITCODE -eq 0) {
                $ready = $true
                Write-Host "   OK: PostgreSQL esta pronto!" -ForegroundColor Green
            }
        }
    } catch {
        # Continuar tentando
    }
    
    if ($attempt % 5 -eq 0) {
        Write-Host "   Aguardando... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

if (-not $ready) {
    Write-Host "   AVISO: PostgreSQL pode nao estar totalmente pronto" -ForegroundColor Yellow
}

# 6. Alterar senha
Write-Host ""
Write-Host "6. Alterando senha do usuario postgres..." -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (Test-Path $psqlPath) {
    try {
        $sqlCommand = "ALTER USER postgres WITH PASSWORD '$NovaSenha';"
        $result = & $psqlPath -U postgres -d postgres -c $sqlCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK: Senha alterada com sucesso!" -ForegroundColor Green
            Write-Host "   Nova senha: $NovaSenha" -ForegroundColor Cyan
        } else {
            Write-Host "   AVISO: Pode ter havido um problema ao alterar a senha" -ForegroundColor Yellow
            Write-Host "   Tente executar manualmente:" -ForegroundColor Yellow
            Write-Host "   & `"$psqlPath`" -U postgres -d postgres" -ForegroundColor Cyan
            Write-Host "   ALTER USER postgres WITH PASSWORD '$NovaSenha';" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "   AVISO: Erro ao alterar senha: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   AVISO: psql.exe nao encontrado" -ForegroundColor Yellow
}

# 7. Reverter pg_hba.conf para modo seguro
Write-Host ""
Write-Host "7. Revertendo pg_hba.conf para modo seguro..." -ForegroundColor Yellow
$content = Get-Content $pgHbaPath -Raw
$content = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)trust", '$1scram-sha-256'
$content = $content -replace "(host\s+all\s+all\s+::1/128\s+)trust", '$1scram-sha-256'
Set-Content -Path $pgHbaPath -Value $content -NoNewline -Encoding UTF8
Write-Host "   OK: Arquivo revertido para modo scram-sha-256" -ForegroundColor Green

# 8. Reiniciar servico com configuracao segura
Write-Host ""
Write-Host "8. Reiniciando servico com configuracao segura..." -ForegroundColor Yellow
Restart-Service -Name $serviceName -Force
Start-Sleep -Seconds 5

$service = Get-Service -Name $serviceName
if ($service.Status -eq 'Running') {
    Write-Host "   OK: Servico reiniciado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   AVISO: Servico nao esta rodando. Status: $($service.Status)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "REPARACAO CONCLUIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Cyan
Write-Host "   Servico: $($service.Status)" -ForegroundColor White
Write-Host "   Senha configurada: $NovaSenha" -ForegroundColor White
Write-Host ""
Write-Host "TESTE A CONEXAO:" -ForegroundColor Cyan
Write-Host "   & `"$psqlPath`" -U postgres -d postgres" -ForegroundColor White
Write-Host "   (Digite a senha: $NovaSenha)" -ForegroundColor White

