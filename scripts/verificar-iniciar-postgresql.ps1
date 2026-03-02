# Script para verificar e iniciar PostgreSQL (porta 5432 ou 5433)
# Usado no script de inicialização do sistema
# NOTA: PostgreSQL padrao usa 5432. Backend .env usa 5432.

param(
    [switch]$Ajuda = $false
)

# Porta padrao (igual ao backend .env)
$PG_PORT = 5432

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\verificar-iniciar-postgresql.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script:" -ForegroundColor Yellow
    Write-Host "  - Verifica se PostgreSQL esta rodando na porta $PG_PORT" -ForegroundColor White
    Write-Host "  - Inicia o servico se necessario" -ForegroundColor White
    Write-Host "  - Verifica conexao com o banco" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO POSTGRESQL (PORTA $PG_PORT)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# 1. Verificar se a porta está ativa (5432 padrao, depois 5433)
$portas = @(5432, 5433)
$portaAtiva = $null
foreach ($p in $portas) {
    $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($c) { $portaAtiva = $p; break }
}

if ($portaAtiva) {
    Write-Host "1. Verificando porta $portaAtiva..." -ForegroundColor Yellow
    Write-Host "   Porta $portaAtiva esta ativa" -ForegroundColor Green
    
    # Testar conexão
    $env:PGPASSWORD = "290491Bb"
    try {
        $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
        if (-not (Test-Path $psqlPath)) { $psqlPath = "psql" }
        $teste = & $psqlPath -U postgres -d rsv360 -p $portaAtiva -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Conexao com banco de dados OK" -ForegroundColor Green
            Write-Host ""
            Write-Host "   Use no pgAdmin: Host=localhost, Port=$portaAtiva, Database=rsv360" -ForegroundColor Gray
            Write-Host ""
            return $true
        }
    } catch {
        Write-Host "   Porta ativa mas conexao falhou" -ForegroundColor Yellow
    }
} else {
    Write-Host "1. Verificando portas 5432 e 5433..." -ForegroundColor Yellow
    Write-Host "   Nenhuma porta PostgreSQL ativa" -ForegroundColor Yellow
}

# 2. Verificar serviço PostgreSQL
Write-Host "2. Verificando servico PostgreSQL..." -ForegroundColor Yellow
$psqlExe = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlExe)) { $psqlExe = "psql" }

try {
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction Stop
    
    if ($service.Status -eq 'Running') {
        Write-Host "   Servico esta rodando" -ForegroundColor Green
        
        # Aguardar alguns segundos
        Start-Sleep -Seconds 3
        
        # Testar conexão em 5432 e 5433
        foreach ($p in @(5432, 5433)) {
            $env:PGPASSWORD = "290491Bb"
            $teste = & $psqlExe -U postgres -d rsv360 -p $p -c "SELECT 1;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Conexao estabelecida na porta $p" -ForegroundColor Green
                Write-Host ""
                Write-Host "   Use no pgAdmin: Host=localhost, Port=$p, Database=rsv360" -ForegroundColor Gray
                Write-Host ""
                return $true
            }
        }
        Write-Host "   Servico rodando mas conexao falhou (teste 5432 e 5433)" -ForegroundColor Yellow
    } else {
        Write-Host "   Servico esta parado (Status: $($service.Status))" -ForegroundColor Yellow
        
        # Tentar iniciar se for administrador
        if ($isAdmin) {
            Write-Host "3. Iniciando servico PostgreSQL..." -ForegroundColor Yellow
            try {
                Start-Service -Name "postgresql-x64-18" -ErrorAction Stop
                Write-Host "   Servico iniciado" -ForegroundColor Green
                
                # Aguardar inicialização
                Write-Host "   Aguardando inicializacao (10 segundos)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
                
                # Testar conexão em 5432 e 5433
                foreach ($p in @(5432, 5433)) {
                    $env:PGPASSWORD = "290491Bb"
                    $teste = & $psqlExe -U postgres -d rsv360 -p $p -c "SELECT 1;" 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "   Conexao estabelecida na porta $p" -ForegroundColor Green
                        Write-Host ""
                        Write-Host "   Use no pgAdmin: Host=localhost, Port=$p, Database=rsv360" -ForegroundColor Gray
                        Write-Host ""
                        return $true
                    }
                }
                Write-Host "   Erro ao conectar apos iniciar servico" -ForegroundColor Red
                Write-Host "   Verifique a configuracao do PostgreSQL (postgresql.conf - port)" -ForegroundColor Yellow
                Write-Host ""
                return $false
            } catch {
                Write-Host "   ❌ Erro ao iniciar serviço: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "   💡 Execute o PowerShell como Administrador" -ForegroundColor Yellow
                Write-Host ""
                return $false
            }
        } else {
            Write-Host "   ⚠️  Precisa de privilégios de Administrador para iniciar" -ForegroundColor Yellow
            Write-Host "   💡 Execute o PowerShell como Administrador" -ForegroundColor Yellow
            Write-Host ""
            return $false
        }
    }
} catch {
    Write-Host "   ❌ Serviço PostgreSQL não encontrado" -ForegroundColor Red
    Write-Host "   💡 Verifique se o PostgreSQL está instalado" -ForegroundColor Yellow
    Write-Host ""
    return $false
}

Write-Host ""
return $false
