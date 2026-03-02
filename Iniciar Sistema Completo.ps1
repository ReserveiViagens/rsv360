# Script para iniciar o sistema completo RSV360
# Inicia: PostgreSQL, Backends, 32 Microservicos, Next.js (Site Publico + Dashboard Turismo + Frontend Oficial)
# NOVAS APLICACOES INCLUIDAS: Frontend RSV360 Servidor Oficial (3001) | Modulo Contrato Spazzio diRoma
# Executavel de qualquer diretorio - cd automatico para o projeto
param(
    [switch]$Ajuda = $false
)

# Diretorio do projeto (onde o script esta) - permite executar de qualquer lugar
# Sempre apontar para a pasta DEFINITIVA
$RootPath = if ($PSScriptRoot) { $PSScriptRoot } else { "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial definitivo" }
$MicroservicesPath = Join-Path $RootPath "backend\microservices"
$BackendPath = Join-Path $RootPath "backend"

# CD automatico para o diretorio do projeto
Set-Location $RootPath
Write-Host "[*] Diretorio do projeto: $RootPath" -ForegroundColor Gray

if ($Ajuda) {
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host "  INICIAR SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Este script inicia TODOS os servicos do sistema:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  INFRAESTRUTURA: PostgreSQL (porta 5433)" -ForegroundColor White
    Write-Host "  BACKENDS: Principal (5000), Admin/CMS (5002)" -ForegroundColor White
    Write-Host "  MICROSERVICOS: 32 servicos (portas 6000-6031)" -ForegroundColor White
    Write-Host "  FRONTENDS: Site Publico (3000), Dashboard Turismo (3005), Frontend Oficial (3001)" -ForegroundColor White
    Write-Host "  AGENTES SRE: Dashboard de monitoramento (5050)" -ForegroundColor White
    Write-Host ""
    Write-Host "  NOVAS APLICACOES (criadas no projeto):" -ForegroundColor Yellow
    Write-Host "    - Frontend RSV360 Servidor Oficial    http://localhost:3001" -ForegroundColor Cyan
    Write-Host "    - Contrato Spazzio diRoma (Reservei)  http://localhost:3001/reservei/contrato-spazzio-diroma" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\Iniciar Sistema Completo.ps1" -ForegroundColor Green
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SISTEMA COMPLETO RSV360" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# 0. PREPARACAO E VERIFICACOES
# 0.1. Verificar e iniciar PostgreSQL (porta 5433)
Write-Host "[0.1] Verificando PostgreSQL (porta 5433)..." -ForegroundColor Yellow
$postgresScript = Join-Path $RootPath "scripts\verificar-iniciar-postgresql.ps1"
$postgresOk = $false
if (Test-Path $postgresScript) {
    try {
        $postgresOk = & $postgresScript
        if ($postgresOk) {
            Write-Host "  [OK] PostgreSQL esta rodando e acessivel" -ForegroundColor Green
        } else {
            Write-Host "  [!] PostgreSQL pode nao estar acessivel" -ForegroundColor Yellow
            Write-Host "  [i] O CMS pode nao carregar dados corretamente" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [!] Erro ao verificar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [!] Script verificar-iniciar-postgresql.ps1 nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 0.2. Verificar dados do CMS
Write-Host "[0.2] Verificando dados do CMS..." -ForegroundColor Yellow
$verificarDadosScript = Join-Path $RootPath "scripts\verificar-dados-cms.js"
if (Test-Path $verificarDadosScript) {
    try {
        $null = node $verificarDadosScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Dados do CMS verificados" -ForegroundColor Green
        } else {
            Write-Host "  [!] Erro ao verificar dados do CMS" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [!] Erro ao executar verificacao: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [!] Script verificar-dados-cms.js nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 0.2b. Garantir tabela website_pages (CMS Site)
Write-Host "[0.2b] Garantindo tabela website_pages..." -ForegroundColor Yellow
$ensurePagesScript = Join-Path $RootPath "scripts\ensure-website-pages.js"
if (Test-Path $ensurePagesScript) {
    try {
        $ensureResult = node $ensurePagesScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Tabela website_pages criada/verificada" -ForegroundColor Green
        } else {
            Write-Host "  [!] $ensureResult" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [!] Erro: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [i] Script ensure-website-pages.js nao encontrado (opcional)" -ForegroundColor Gray
}
Write-Host ""

# 0.2c. Garantir tabelas Flash Deals, OTA, Google Hotel Ads (CMS)
Write-Host "[0.2c] Garantindo tabelas CMS (Flash Deals, OTA, Google Hotel Ads)..." -ForegroundColor Yellow
$ensureCmsScript = Join-Path $RootPath "scripts\ensure-cms-tables.js"
if (Test-Path $ensureCmsScript) {
    try {
        $ensureCmsResult = node $ensureCmsScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Tabelas CMS verificadas/criadas" -ForegroundColor Green
        } else {
            Write-Host "  [!] $ensureCmsResult" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [!] Erro: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [i] Script ensure-cms-tables.js nao encontrado (opcional)" -ForegroundColor Gray
}
Write-Host ""

# 0.3. Limpar portas 3000, 3001, 3005, 5000 e 5002 antes de iniciar (evita "Port already in use")
Write-Host "[0.3] Limpando portas 3000, 3001, 3005, 5000 e 5002..." -ForegroundColor Yellow
$killPortsScript = Join-Path $RootPath "scripts\KILL-PORTS.ps1"
if (Test-Path $killPortsScript) {
    try {
        $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        $port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
        $port3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue
        $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
        $port5002 = Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue
        $port5050 = Get-NetTCPConnection -LocalPort 5050 -ErrorAction SilentlyContinue
        if ($port3000 -or $port3001 -or $port3005 -or $port5000 -or $port5002 -or $port5050) {
            Write-Host "  [i] Processos encontrados nas portas, limpando..." -ForegroundColor Cyan
            & $killPortsScript -Ports @(3000, 3001, 3005, 5000, 5002, 5050)
            Start-Sleep -Seconds 3
            Write-Host "  [OK] Portas limpas" -ForegroundColor Green
        } else {
            Write-Host "  [OK] Portas 3000, 3001, 3005, 5000 e 5002 ja estao livres" -ForegroundColor Green
        }
    } catch {
        Write-Host "  [!] Erro ao limpar portas: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [!] Script KILL-PORTS.ps1 nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 0.4. Limpar cache do Next.js
Write-Host "[0.4] Limpando cache do Next.js..." -ForegroundColor Yellow
$clearCacheScript = Join-Path $RootPath "scripts\LIMPAR-CACHE-NEXTJS.ps1"
if (Test-Path $clearCacheScript) {
    try {
        & $clearCacheScript -Apps @("site-publico", "turismo")
        Write-Host "  [OK] Cache do Next.js limpo" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Erro ao limpar cache: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [!] Script LIMPAR-CACHE-NEXTJS.ps1 nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 0.5. Criar estrutura de diretorios de logs (para Coletor SRE)
Write-Host "[0.5] Criando diretorios de logs..." -ForegroundColor Yellow
$logDirs = @(
    (Join-Path $BackendPath "logs"),
    (Join-Path $BackendPath "logs\microservices"),
    (Join-Path $RootPath "apps\turismo\logs"),
    (Join-Path $RootPath "apps\site-publico\logs")
)
foreach ($dir in $logDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  [OK] Criado: $dir" -ForegroundColor Green
    }
}
Write-Host "  [OK] Estrutura de logs pronta" -ForegroundColor Green
Write-Host ""

# 1. BACKENDS
# 1.1. Backend Principal (porta 5000)
Write-Host "[1.1] Iniciando Backend Principal (porta 5000)..." -ForegroundColor Yellow
Write-Host "  [DEBUG] Chegou na seção de Backends" -ForegroundColor Gray
$backendOk = $false

# SEMPRE iniciar diretamente, ignorando o script auxiliar para garantir que a janela abra
$serverPath = Join-Path $BackendPath "src\server.js"
Write-Host "  [DEBUG] Caminho do servidor: $serverPath" -ForegroundColor Gray
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backendLogPath = Join-Path $RootPath "backend\logs\backend-5000-$timestamp.log"
Write-Host "  [DEBUG] Caminho do log: $backendLogPath" -ForegroundColor Gray

if (Test-Path $serverPath) {
    Write-Host "  [i] Criando janela PowerShell para Backend Principal..." -ForegroundColor Cyan
    Write-Host "  [DEBUG] Arquivo server.js encontrado, criando processo..." -ForegroundColor Gray
    try {
        Write-Host "  [DEBUG] Executando Start-Process..." -ForegroundColor Gray
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; `$env:LOG_TO_FILE='true'; `$env:REDIS_ENABLED='false'; `$env:RATE_LIMIT_SKIP_LOCAL='true'; Write-Host 'BACKEND PRINCIPAL (porta 5000)' -ForegroundColor Cyan; node src\server.js 2>&1 | Tee-Object -FilePath '$backendLogPath' -Append" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  [OK] Backend Principal iniciado (PID: $($proc.Id))" -ForegroundColor Green
            Write-Host "  [DEBUG] Processo criado com sucesso!" -ForegroundColor Gray
            $backendOk = $true
        } else {
            Write-Host "  [X] Falha ao criar processo" -ForegroundColor Red
            Write-Host "  [DEBUG] Start-Process retornou null" -ForegroundColor Red
        }
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "  [X] Erro ao iniciar Backend Principal: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  [DEBUG] StackTrace: $($_.ScriptStackTrace)" -ForegroundColor Red
    }
} else {
    Write-Host "  [!] server.js nao encontrado em: $serverPath" -ForegroundColor Yellow
    Write-Host "  [DEBUG] Test-Path retornou false" -ForegroundColor Yellow
}
Write-Host "  [DEBUG] Finalizando seção Backend Principal" -ForegroundColor Gray
Write-Host ""

# 1.2. Backend Admin/CMS (porta 5002)
Write-Host "[1.2] Iniciando Backend Admin/CMS (porta 5002)..." -ForegroundColor Yellow
Write-Host "  [DEBUG] Chegou na seção Backend Admin/CMS" -ForegroundColor Gray
$adminServerPath = Join-Path $BackendPath "server-5002.js"
$adminLogPath = Join-Path $RootPath "backend\logs\backend-5002.log"
Write-Host "  [DEBUG] Caminho: $adminServerPath" -ForegroundColor Gray
if (Test-Path $adminServerPath) {
    Write-Host "  [DEBUG] Arquivo encontrado, criando processo..." -ForegroundColor Gray
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'BACKEND ADMIN/CMS (porta 5002)' -ForegroundColor Cyan; node server-5002.js 2>&1 | Tee-Object -FilePath '$adminLogPath' -Append" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  [OK] Backend Admin/CMS iniciado (PID: $($proc.Id))" -ForegroundColor Green
        } else {
            Write-Host "  [X] Falha ao criar processo" -ForegroundColor Red
        }
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "  [X] Erro ao iniciar Backend Admin/CMS: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  [!] server-5002.js nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

if ($backendOk) {
    Write-Host "  [i] Aguardando backends estarem prontos..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}
Write-Host ""

# 2. MICROSERVICOS (32 servicos)
$microservices = @(
    @{Name="core-api"; Port=6000},
    @{Name="user-management"; Port=6001},
    @{Name="hotel-management"; Port=6002},
    @{Name="travel-api"; Port=6003},
    @{Name="booking-engine"; Port=6004},
    @{Name="finance-api"; Port=6005},
    @{Name="tickets-api"; Port=6006},
    @{Name="payments-gateway"; Port=6007},
    @{Name="ecommerce-api"; Port=6008},
    @{Name="attractions-api"; Port=6009},
    @{Name="vouchers-api"; Port=6010},
    @{Name="voucher-editor"; Port=6011},
    @{Name="giftcards-api"; Port=6012},
    @{Name="coupons-api"; Port=6013},
    @{Name="parks-api"; Port=6014},
    @{Name="maps-api"; Port=6015},
    @{Name="visa-processing"; Port=6016},
    @{Name="marketing-api"; Port=6017},
    @{Name="subscriptions"; Port=6018},
    @{Name="seo-api"; Port=6019},
    @{Name="multilingual"; Port=6020},
    @{Name="videos-api"; Port=6021},
    @{Name="photos-api"; Port=6022},
    @{Name="admin-panel"; Port=6023},
    @{Name="analytics-api"; Port=6024},
    @{Name="reports-api"; Port=6025},
    @{Name="data-management"; Port=6026},
    @{Name="notifications"; Port=6027},
    @{Name="reviews-api"; Port=6028},
    @{Name="rewards-api"; Port=6029},
    @{Name="loyalty-api"; Port=6030},
    @{Name="sales-api"; Port=6031}
)

$started = 0
$failed = 0

Write-Host "[2] Iniciando 32 Microservicos (portas 6000-6031)..." -ForegroundColor Yellow
Write-Host "  [DEBUG] Chegou na seção de Microservicos" -ForegroundColor Gray
Write-Host "  [DEBUG] Total de microservicos: $($microservices.Count)" -ForegroundColor Gray
foreach ($ms in $microservices) {
    $msPath = Join-Path $MicroservicesPath $ms.Name
    $msLogPath = Join-Path $RootPath "backend\logs\microservices\$($ms.Name).log"
    if (Test-Path $msPath) {
        try {
            $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$msPath'; Write-Host '[$($ms.Name)] Porta $($ms.Port)' -ForegroundColor Cyan; npm start 2>&1 | Tee-Object -FilePath '$msLogPath' -Append" -WindowStyle Normal -PassThru
            if ($proc) {
                $started++
            } else {
                $failed++
                Write-Host "  [X] Falha ao criar processo para $($ms.Name)" -ForegroundColor Red
            }
            Start-Sleep -Milliseconds 300
        } catch {
            $failed++
            Write-Host "  [X] Falha ao iniciar $($ms.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [!] $($ms.Name) nao encontrado" -ForegroundColor Yellow
    }
}
Write-Host "  [OK] $started microservicos iniciados" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "  [!] $failed microservicos falharam" -ForegroundColor Yellow
}
Write-Host ""

Start-Sleep -Seconds 3

# 3. FRONTENDS (Next.js)
Write-Host "  [DEBUG] Chegou na seção de Frontends" -ForegroundColor Gray
# 3.1. Dashboard Turismo (porta 3005)
Write-Host "[3.1] Iniciando Dashboard Turismo (porta 3005)..." -ForegroundColor Yellow
$turismoPath = Join-Path $RootPath "apps\turismo"
$turismoLogPath = Join-Path $RootPath "apps\turismo\logs\dev.log"
Write-Host "  [DEBUG] Caminho: $turismoPath" -ForegroundColor Gray
if (Test-Path $turismoPath) {
    Write-Host "  [DEBUG] Diretório encontrado, criando processo..." -ForegroundColor Gray
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$turismoPath'; Write-Host 'DASHBOARD TURISMO (Porta 3005)' -ForegroundColor Cyan; npm run dev 2>&1 | Tee-Object -FilePath '$turismoLogPath' -Append" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  [OK] Dashboard Turismo iniciado (PID: $($proc.Id))" -ForegroundColor Green
        } else {
            Write-Host "  [X] Falha ao criar processo" -ForegroundColor Red
            $failed++
        }
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  [X] Falha ao iniciar Dashboard Turismo: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [!] apps\turismo nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 3.2. Site Publico (porta 3000)
Write-Host "[3.2] Iniciando Site Publico (porta 3000)..." -ForegroundColor Yellow
$sitePublicoPath = Join-Path $RootPath "apps\site-publico"
$sitePublicoLogPath = Join-Path $RootPath "apps\site-publico\logs\dev.log"
Write-Host "  [DEBUG] Caminho: $sitePublicoPath" -ForegroundColor Gray
if (Test-Path $sitePublicoPath) {
    Write-Host "  [DEBUG] Diretório encontrado, criando processo..." -ForegroundColor Gray
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$sitePublicoPath'; Write-Host 'SITE PUBLICO (Porta 3000)' -ForegroundColor Cyan; npm run dev 2>&1 | Tee-Object -FilePath '$sitePublicoLogPath' -Append" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  [OK] Site Publico iniciado (PID: $($proc.Id))" -ForegroundColor Green
        } else {
            Write-Host "  [X] Falha ao criar processo" -ForegroundColor Red
            $failed++
        }
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  [X] Falha ao iniciar Site Publico: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [!] apps\site-publico nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# 3.3. Frontend RSV360 Servidor Oficial (porta 3001) - Inclui módulo de Contrato Spazzio diRoma
Write-Host "[3.3] Iniciando Frontend RSV360 Servidor Oficial (porta 3001)..." -ForegroundColor Yellow
$frontendOficialRoot = Split-Path $RootPath -Parent
$frontendOficialPath = Join-Path $frontendOficialRoot "rsv360-servidor-oficial\frontend"
$frontendOficialLogPath = Join-Path $frontendOficialPath "logs\dev.log"
Write-Host "  [DEBUG] Caminho: $frontendOficialPath" -ForegroundColor Gray
if (Test-Path $frontendOficialPath) {
    Write-Host "  [DEBUG] Diretório encontrado" -ForegroundColor Gray
    
    # Limpar node_modules problemáticos dentro de pages/ (evita avisos de páginas duplicadas)
    Write-Host "  [i] Limpando node_modules dentro de pages/..." -ForegroundColor Cyan
    $pagesPath = Join-Path $frontendOficialPath "pages"
    $nodeModulesPaths = @(
        "BUSINESS-MODULES\crm-system\node_modules",
        "BUSINESS-MODULES\hotel-management\node_modules",
        "reservei\RSV-360-ECOSYSTEM\ANALYTICS-INTELLIGENCE\node_modules",
        "reservei\RSV-360-ECOSYSTEM\BUSINESS-MODULES\booking-engine\node_modules",
        "reservei\RSV-360-ECOSYSTEM\BUSINESS-MODULES\crm-system\node_modules"
    )
    foreach ($relativePath in $nodeModulesPaths) {
        $fullPath = Join-Path $pagesPath $relativePath
        if (Test-Path $fullPath) {
            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
        }
    }
    Write-Host "  [OK] Limpeza concluída" -ForegroundColor Green
    
    # Criar diretório de logs se não existir
    $logsDir = Split-Path $frontendOficialLogPath -Parent
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
        Write-Host "  [DEBUG] Diretório de logs criado" -ForegroundColor Gray
    }
    Write-Host "  [DEBUG] Criando processo..." -ForegroundColor Gray
    try {
        $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendOficialPath'; Write-Host 'FRONTEND RSV360 SERVIDOR OFICIAL (Porta 3001)' -ForegroundColor Cyan; Write-Host 'Inclui: Modulo Contrato Spazzio diRoma' -ForegroundColor Gray; npm run dev -- -p 3001 2>&1 | Tee-Object -FilePath '$frontendOficialLogPath' -Append" -WindowStyle Normal -PassThru
        if ($proc) {
            Write-Host "  [OK] Frontend RSV360 Servidor Oficial iniciado (PID: $($proc.Id))" -ForegroundColor Green
            Write-Host "  [i] Modulo Contrato: http://localhost:3001/reservei/contrato-spazzio-diroma" -ForegroundColor Cyan
        } else {
            Write-Host "  [X] Falha ao criar processo" -ForegroundColor Red
            $failed++
        }
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  [X] Falha ao iniciar Frontend RSV360 Servidor Oficial: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [!] rsv360-servidor-oficial\frontend nao encontrado" -ForegroundColor Yellow
    Write-Host "  [i] Caminho esperado: $frontendOficialPath" -ForegroundColor Gray
}
Write-Host ""

# 4. AGENTES SRE (porta 5050)
Write-Host "[4] Iniciando Agentes SRE (porta 5050)..." -ForegroundColor Yellow
$sreAgentsPath = Join-Path $RootPath "sre-agents"
$triggerApiPath = Join-Path $sreAgentsPath "watcher\trigger_api.py"
if (Test-Path $triggerApiPath) {
    try {
        $pythonCmd = "cd '$sreAgentsPath'; Write-Host 'AGENTES SRE - Dashboard (Porta 5050)' -ForegroundColor Cyan; python watcher\trigger_api.py"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonCmd -WindowStyle Normal
        Start-Sleep -Seconds 2
        Write-Host "  [OK] Agentes SRE iniciado - http://localhost:5050" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Erro ao iniciar Agentes SRE: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  [i] Inicie manualmente: cd sre-agents; python watcher\trigger_api.py" -ForegroundColor Gray
    }
} else {
    Write-Host "  [!] sre-agents\watcher\trigger_api.py nao encontrado" -ForegroundColor Yellow
}
Write-Host ""

# RESUMO FINAL
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Green
Write-Host "  SISTEMA COMPLETO INICIADO!" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "ESTATISTICAS: Microservicos $started/32, Falhas $failed" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs principais:" -ForegroundColor Yellow
Write-Host "  Site Publico:       http://localhost:3000" -ForegroundColor White
Write-Host "  CMS Admin:         http://localhost:3000/admin/cms" -ForegroundColor White
Write-Host "  Dashboard Turismo: http://localhost:3005" -ForegroundColor White
Write-Host "  Backend Principal: http://localhost:5000" -ForegroundColor White
Write-Host "  Backend Admin/CMS: http://localhost:5002" -ForegroundColor White
Write-Host "  Agentes SRE:      http://localhost:5050" -ForegroundColor White
Write-Host "  Microservicos:     http://localhost:6000/health ate 6031/health" -ForegroundColor Gray
Write-Host ""
Write-Host "NOVAS APLICACOES (criadas no projeto):" -ForegroundColor Yellow
Write-Host "  Frontend RSV360 Servidor Oficial:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Contrato Spazzio diRoma (Reservei): http://localhost:3001/reservei/contrato-spazzio-diroma" -ForegroundColor Cyan
Write-Host ""
Write-Host "[i] Aguarde alguns minutos para compilacao do Next.js" -ForegroundColor Cyan
Write-Host ""
