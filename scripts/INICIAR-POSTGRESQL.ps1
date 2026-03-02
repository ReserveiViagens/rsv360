# Script para INICIAR PostgreSQL - RSV360
# Execute como Administrador para iniciar o servico automaticamente
# Ou use os passos manuais abaixo

param(
    [switch]$Ajuda = $false
)

if ($Ajuda) {
    Write-Host ""
    Write-Host "Uso: .\INICIAR-POSTGRESQL.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script inicia o PostgreSQL para o RSV360." -ForegroundColor Yellow
    Write-Host "Execute o PowerShell como Administrador (clique direito > Executar como administrador)" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIAR POSTGRESQL - RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[AVISO] Execute como Administrador para iniciar o servico automaticamente!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Passos manuais:" -ForegroundColor Cyan
    Write-Host "  1. Feche este PowerShell" -ForegroundColor White
    Write-Host "  2. Clique direito no PowerShell > Executar como administrador" -ForegroundColor White
    Write-Host "  3. Execute: cd 'D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial'" -ForegroundColor White
    Write-Host "  4. Execute: .\scripts\INICIAR-POSTGRESQL.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "OU use o Servicos do Windows:" -ForegroundColor Cyan
    Write-Host "  1. Pressione Win+R, digite services.msc e Enter" -ForegroundColor White
    Write-Host "  2. Procure 'postgresql-x64-18' ou 'PostgreSQL Server 18'" -ForegroundColor White
    Write-Host "  3. Clique direito > Iniciar" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Tentar diferentes nomes de servico PostgreSQL
$serviceNames = @("postgresql-x64-18", "postgresql-x64-17", "postgresql-x64-16", "postgresql-x64-15")

$serviceFound = $null
foreach ($name in $serviceNames) {
    $svc = Get-Service -Name $name -ErrorAction SilentlyContinue
    if ($svc) {
        $serviceFound = $svc
        break
    }
}

if (-not $serviceFound) {
    Write-Host "[ERRO] Servico PostgreSQL nao encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique se o PostgreSQL esta instalado:" -ForegroundColor Yellow
    Write-Host "  - Caminho padrao: C:\Program Files\PostgreSQL\18\ (ou 17, 16)" -ForegroundColor White
    Write-Host "  - Execute: Get-Service *postgres*" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Servico encontrado: $($serviceFound.Name)" -ForegroundColor Green
Write-Host "Status atual: $($serviceFound.Status)" -ForegroundColor $(if ($serviceFound.Status -eq 'Running') { 'Green' } else { 'Yellow' })
Write-Host ""

if ($serviceFound.Status -eq 'Running') {
    Write-Host "[OK] PostgreSQL ja esta rodando!" -ForegroundColor Green
} else {
    Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
    try {
        Start-Service -Name $serviceFound.Name -ErrorAction Stop
        Write-Host "[OK] Servico iniciado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Aguardando inicializacao (10 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } catch {
        Write-Host "[ERRO] Falha ao iniciar: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Verificar porta (PostgreSQL 18 pode usar 5432 ou 5433)
Write-Host ""
Write-Host "Verificando conexao..." -ForegroundColor Yellow

$ports = @(5433, 5432)  # RSV360 usa 5433, fallback 5432
$portaOk = $null

foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $portaOk = $port
        Write-Host "  [OK] PostgreSQL escutando na porta $port" -ForegroundColor Green
        break
    }
}

if (-not $portaOk) {
    Write-Host "  [AVISO] Nenhuma porta 5432 ou 5433 em escuta" -ForegroundColor Yellow
    Write-Host "  O servico pode estar iniciando. Aguarde 30 segundos e tente novamente." -ForegroundColor Yellow
} else {
    # Testar conexao com psql
    $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
    if (-not (Test-Path $psqlPath)) {
        $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    }
    if (-not (Test-Path $psqlPath)) {
        $psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    }
    
    if (Test-Path $psqlPath) {
        $env:PGPASSWORD = "290491Bb"
        $teste = & $psqlPath -U postgres -d rsv360 -p $portaOk -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Conexao com banco 'rsv360' OK!" -ForegroundColor Green
        } else {
            Write-Host "  [AVISO] Banco 'rsv360' pode nao existir. Crie com: CREATE DATABASE rsv360;" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CONCLUIDO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuracao do backend (backend\.env):" -ForegroundColor Cyan
Write-Host "  DB_HOST=localhost" -ForegroundColor White
Write-Host "  DB_PORT=$(if ($portaOk) { $portaOk } else { 5433 })" -ForegroundColor White
Write-Host "  DB_NAME=rsv360" -ForegroundColor White
Write-Host "  DB_USER=postgres" -ForegroundColor White
Write-Host ""
