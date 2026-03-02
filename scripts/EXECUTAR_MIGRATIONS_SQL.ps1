# Script para executar migrations SQL diretamente no PostgreSQL
param(
    [string]$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial",
    [string]$DBName = "rsv360",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "",
    [string]$DBHost = "localhost",
    [int]$DBPort = 5432
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXECUTANDO MIGRATIONS SQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está instalado
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "[ERRO] PostgreSQL nao encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o PostgreSQL ou adicione-o ao PATH." -ForegroundColor Yellow
    exit 1
}

Write-Host "  [OK] PostgreSQL encontrado" -ForegroundColor Green

# Ler configurações do .env se existir
$envPath = Join-Path $RootPath "backend\.env"
if (Test-Path $envPath) {
    Write-Host ""
    Write-Host "Lendo configuracoes do .env..." -ForegroundColor Yellow
    $envContent = Get-Content $envPath
    
    foreach ($line in $envContent) {
        if ($line -match "^DB_HOST=(.+)$") {
            $DBHost = $matches[1].Trim()
        }
        if ($line -match "^DB_PORT=(.+)$") {
            $DBPort = [int]$matches[1].Trim()
        }
        if ($line -match "^DB_NAME=(.+)$") {
            $DBName = $matches[1].Trim()
        }
        if ($line -match "^DB_USER=(.+)$") {
            $DBUser = $matches[1].Trim()
        }
        if ($line -match "^DB_PASSWORD=(.+)$") {
            $DBPassword = $matches[1].Trim()
        }
    }
    
    Write-Host "  [OK] Configuracoes carregadas" -ForegroundColor Green
    Write-Host "    Host: $DBHost" -ForegroundColor White
    Write-Host "    Port: $DBPort" -ForegroundColor White
    Write-Host "    Database: $DBName" -ForegroundColor White
    Write-Host "    User: $DBUser" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[AVISO] Arquivo .env nao encontrado. Usando valores padrao." -ForegroundColor Yellow
}

# Solicitar senha se não fornecida
if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host ""
    Write-Host "Por favor, informe a senha do PostgreSQL:" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString "Senha"
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $DBPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Verificar conexão com o banco
Write-Host ""
Write-Host "Testando conexao com o banco de dados..." -ForegroundColor Yellow
$env:PGPASSWORD = $DBPassword

try {
    $testResult = psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Conexao estabelecida com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] Nao foi possivel conectar ao banco de dados" -ForegroundColor Red
        Write-Host "  Verifique as credenciais e se o banco '$DBName' existe" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  [ERRO] Falha ao conectar: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Executar migrations SQL
Write-Host ""
Write-Host "Executando migrations SQL..." -ForegroundColor Yellow
Write-Host ""

$migrations = @(
    @{Path = "database\migrations\leiloes\001-create-leiloes-tables.sql"; Name = "Leiloes"},
    @{Path = "database\migrations\excursoes\001-create-excursoes-tables.sql"; Name = "Excursoes"},
    @{Path = "database\migrations\viagens-grupo\001-create-viagens-grupo-tables.sql"; Name = "Viagens em Grupo"},
    @{Path = "database\migrations\atendimento-ia\001-create-atendimento-ia-tables.sql"; Name = "Atendimento IA"},
    @{Path = "database\migrations\011_create_marketplace_split_and_tax_tables.sql"; Name = "Split Marketplace e Tributacao"}
)

$successCount = 0
$errorCount = 0

foreach ($migration in $migrations) {
    $migrationPath = Join-Path $RootPath $migration.Path
    
    if (Test-Path $migrationPath) {
        Write-Host "  Executando: $($migration.Name)..." -ForegroundColor Cyan
        Write-Host "    Arquivo: $($migration.Path)" -ForegroundColor Gray
        
        try {
            $sqlContent = Get-Content $migrationPath -Raw -Encoding UTF8
            
            # Executar SQL via psql
            $output = $sqlContent | psql -h $DBHost -p $DBPort -U $DBUser -d $DBName 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    [OK] $($migration.Name) executada com sucesso" -ForegroundColor Green
                $successCount++
            } else {
                # Verificar se o erro é porque a tabela já existe
                if ($output -match "already exists" -or $output -match "duplicate") {
                    Write-Host "    [AVISO] Tabelas ja existem (pode ser normal)" -ForegroundColor Yellow
                    $successCount++
                } else {
                    Write-Host "    [ERRO] Falha ao executar migration" -ForegroundColor Red
                    Write-Host "    Detalhes: $output" -ForegroundColor Red
                    $errorCount++
                }
            }
        } catch {
            Write-Host "    [ERRO] Excecao: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  [FALTANDO] $($migration.Path)" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DA EXECUCAO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sucesso: $successCount" -ForegroundColor Green
Write-Host "  Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "[OK] Todas as migrations foram executadas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Verifique as tabelas criadas no banco de dados" -ForegroundColor White
    Write-Host "  2. Execute: npm run dev:backend" -ForegroundColor White
    Write-Host "  3. Teste as APIs dos modulos" -ForegroundColor White
} else {
    Write-Host "[AVISO] Algumas migrations falharam. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host ""

