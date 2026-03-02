# Script para configurar banco de dados PostgreSQL
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
Write-Host "CONFIGURANDO BANCO DE DADOS" -ForegroundColor Cyan
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

# Criar arquivo .env se não existir
$envPath = Join-Path $RootPath "backend\.env"
$envExamplePath = Join-Path $RootPath "backend\.env.example"

if (-not (Test-Path $envPath)) {
    Write-Host ""
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "  [OK] Arquivo .env criado a partir do .env.example" -ForegroundColor Green
    } else {
        # Criar .env básico
        $envContent = @"
DB_HOST=$DBHost
DB_PORT=$DBPort
DB_NAME=$DBName
DB_USER=$DBUser
DB_PASSWORD=$DBPassword
NODE_ENV=development
PORT=5000
JWT_SECRET=dev_secret_change_in_production
"@
        $envContent | Out-File $envPath -Encoding UTF8
        Write-Host "  [OK] Arquivo .env criado" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "[AVISO] Por favor, edite o arquivo .env com suas credenciais:" -ForegroundColor Yellow
    Write-Host "  $envPath" -ForegroundColor White
} else {
    Write-Host "  [OK] Arquivo .env ja existe" -ForegroundColor Green
}

# Solicitar senha se não fornecida
if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host ""
    Write-Host "Por favor, informe a senha do PostgreSQL:" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString "Senha"
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $DBPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Criar banco de dados
Write-Host ""
Write-Host "Criando banco de dados '$DBName'..." -ForegroundColor Yellow

$env:PGPASSWORD = $DBPassword
$createDbCommand = "CREATE DATABASE $DBName;"

try {
    $result = psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "$createDbCommand" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "already exists") {
        Write-Host "  [OK] Banco de dados '$DBName' criado ou ja existe" -ForegroundColor Green
    } else {
        Write-Host "  [AVISO] Erro ao criar banco (pode ja existir): $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [AVISO] Nao foi possivel criar o banco automaticamente." -ForegroundColor Yellow
    Write-Host "  Execute manualmente: CREATE DATABASE $DBName;" -ForegroundColor White
}

# Executar migrations SQL
Write-Host ""
Write-Host "Executando migrations SQL..." -ForegroundColor Yellow

$migrations = @(
    @{Path = "database\migrations\leiloes\001-create-leiloes-tables.sql"; Name = "Leiloes"},
    @{Path = "database\migrations\excursoes\001-create-excursoes-tables.sql"; Name = "Excursoes"},
    @{Path = "database\migrations\viagens-grupo\001-create-viagens-grupo-tables.sql"; Name = "Viagens em Grupo"},
    @{Path = "database\migrations\atendimento-ia\001-create-atendimento-ia-tables.sql"; Name = "Atendimento IA"}
)

foreach ($migration in $migrations) {
    $migrationPath = Join-Path $RootPath $migration.Path
    
    if (Test-Path $migrationPath) {
        Write-Host "  Executando: $($migration.Name)..." -ForegroundColor Cyan
        
        try {
            $sqlContent = Get-Content $migrationPath -Raw -Encoding UTF8
            $sqlContent | psql -h $DBHost -p $DBPort -U $DBUser -d $DBName 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    [OK] $($migration.Name)" -ForegroundColor Green
            } else {
                Write-Host "    [AVISO] Erro ao executar migration (pode ja estar criada)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    [ERRO] Falha ao executar: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [FALTANDO] $($migration.Path)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] CONFIGURACAO DO BANCO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verifique o arquivo .env em: backend\.env" -ForegroundColor White
Write-Host "  2. Teste a conexao: npm run dev:backend" -ForegroundColor White
Write-Host "  3. Execute migrations via Knex: npm run migrate" -ForegroundColor White
Write-Host ""

