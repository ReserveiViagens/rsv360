# Script para analisar todas as tabelas do PostgreSQL
# Tenta conectar na porta 5432 e 5433, lista todos os bancos e tabelas

param(
    [int]$Porta = 5433,
    [string]$Usuario = "postgres",
    [string]$Senha = "290491Bb",
    [string]$DbHost = "localhost"
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "[ERRO] psql.exe não encontrado em: $psqlPath" -ForegroundColor Red
    Write-Host "[INFO] Verifique se o PostgreSQL está instalado." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANÁLISE DE TABELAS POSTGRESQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Porta: $Porta" -ForegroundColor Yellow
Write-Host "Host: $DbHost" -ForegroundColor Yellow
Write-Host "Usuário: $Usuario" -ForegroundColor Yellow
Write-Host ""

# Variável para armazenar resultados
$resultado = @{
    Porta = $Porta
    Bancos = @()
    Erro = $null
}

# Função para executar comando SQL
function Executar-SQL {
    param(
        [string]$Database,
        [string]$Query,
        [int]$Port
    )
    
    $env:PGPASSWORD = $Senha
    try {
        $output = & $psqlPath -U $Usuario -h $DbHost -p $Port -d $Database -t -A -c $Query 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output
        } else {
            return $null
        }
    } catch {
        return $null
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Tentar conectar e listar bancos
Write-Host "1. Conectando ao PostgreSQL na porta $Porta..." -ForegroundColor Yellow

$env:PGPASSWORD = $Senha
try {
    $bancos = & $psqlPath -U $Usuario -h $DbHost -p $Porta -d postgres -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERRO] Não foi possível conectar na porta $Porta" -ForegroundColor Red
        Write-Host "  [INFO] Tentando porta 5433..." -ForegroundColor Yellow
        $Porta = 5433
        $resultado.Porta = $Porta
        $bancos = & $psqlPath -U $Usuario -h $DbHost -p $Porta -d postgres -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;" 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Conectado com sucesso!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "  [ERRO] Falha na conexão: $bancos" -ForegroundColor Red
        $resultado.Erro = $bancos
        exit 1
    }
} catch {
    Write-Host "  [ERRO] Exceção: $($_.Exception.Message)" -ForegroundColor Red
    $resultado.Erro = $_.Exception.Message
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

# Processar cada banco
$listaBancos = $bancos | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }

Write-Host "2. Encontrados $($listaBancos.Count) banco(s) de dados:" -ForegroundColor Yellow
foreach ($banco in $listaBancos) {
    Write-Host "   - $banco" -ForegroundColor Cyan
}
Write-Host ""

# Para cada banco, listar schemas e tabelas
$todosResultados = @()

foreach ($banco in $listaBancos) {
    Write-Host "3. Analisando banco: $banco" -ForegroundColor Yellow
    
    $bancoInfo = @{
        Nome = $banco
        Schemas = @()
    }
    
    # Listar schemas
    $querySchemas = "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;"
    $schemas = Executar-SQL -Database $banco -Query $querySchemas -Port $Porta
    
    if ($schemas) {
        $listaSchemas = $schemas | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
        
        foreach ($schema in $listaSchemas) {
            Write-Host "   Schema: $schema" -ForegroundColor Cyan
            
            $schemaInfo = @{
                Nome = $schema
                Tabelas = @()
            }
            
            # Listar tabelas do schema
            $queryTabelas = "SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' AND table_type = 'BASE TABLE' ORDER BY table_name;"
            $tabelas = Executar-SQL -Database $banco -Query $queryTabelas -Port $Porta
            
            if ($tabelas) {
                $listaTabelas = $tabelas | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
                
                foreach ($tabela in $listaTabelas) {
                    # Obter informações da tabela (colunas, constraints, etc.)
                    $queryColunas = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '$schema' AND table_name = '$tabela' ORDER BY ordinal_position;"
                    $colunas = Executar-SQL -Database $banco -Query $queryColunas -Port $Porta
                    
                    $tabelaInfo = @{
                        Nome = $tabela
                        Colunas = @()
                    }
                    
                    if ($colunas) {
                        $colunas | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object {
                            $parts = $_ -split '\|'
                            if ($parts.Length -ge 3) {
                                $tabelaInfo.Colunas += @{
                                    Nome = $parts[0].Trim()
                                    Tipo = $parts[1].Trim()
                                    Nullable = $parts[2].Trim()
                                }
                            }
                        }
                    }
                    
                    $schemaInfo.Tabelas += $tabelaInfo
                    Write-Host "      - $tabela ($($tabelaInfo.Colunas.Count) colunas)" -ForegroundColor Gray
                }
            }
            
            $bancoInfo.Schemas += $schemaInfo
        }
    }
    
    $todosResultados += $bancoInfo
    Write-Host ""
}

# Gerar relatório em Markdown
$relatorioPath = Join-Path $RootPath "RELATORIO_TABELAS_POSTGRESQL_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').md"

$conteudo = @"
# 📊 RELATÓRIO COMPLETO DE TABELAS POSTGRESQL

**Data de Análise:** $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')  
**Porta Analisada:** $Porta  
**Host:** $DbHost  
**Usuário:** $Usuario

---

## 🔍 SUMÁRIO

- **Total de Bancos:** $($todosResultados.Count)
- **Total de Schemas:** $(($todosResultados | ForEach-Object { $_.Schemas.Count } | Measure-Object -Sum).Sum)
- **Total de Tabelas:** $(($todosResultados | ForEach-Object { $_.Schemas | ForEach-Object { $_.Tabelas.Count } } | Measure-Object -Sum).Sum)

---

## 📋 BANCOS DE DADOS E TABELAS

"@

foreach ($banco in $todosResultados) {
    $conteudo += @"

### 🗄️ Banco: **$($banco.Nome)**

"@
    
    foreach ($schema in $banco.Schemas) {
        $conteudo += @"

#### 📁 Schema: **$($schema.Nome)**

"@
        
        if ($schema.Tabelas.Count -eq 0) {
            $conteudo += "*Nenhuma tabela encontrada neste schema.*`n`n"
        } else {
            $conteudo += "| Tabela | Colunas | Descrição |`n"
            $conteudo += "|--------|---------|-----------|`n"
            
            foreach ($tabela in $schema.Tabelas) {
                $colunasInfo = "$($tabela.Colunas.Count) colunas"
                $conteudo += "| ``$($tabela.Nome)`` | $colunasInfo | - |`n"
            }
            
            $conteudo += "`n"
            
            # Detalhes das colunas (expandível)
            foreach ($tabela in $schema.Tabelas) {
                if ($tabela.Colunas.Count -gt 0) {
                    $conteudo += @"

<details>
<summary><strong>$($tabela.Nome)</strong> - Detalhes das Colunas</summary>

| Coluna | Tipo | Nullable |
|--------|------|----------|
"@
                    foreach ($coluna in $tabela.Colunas) {
                        $conteudo += "| ``$($coluna.Nome)`` | $($coluna.Tipo) | $($coluna.Nullable) |`n"
                    }
                    $conteudo += "`n</details>`n`n"
                }
            }
        }
    }
}

# Adicionar mapeamento com sistemas
$conteudo += @"

---

## 🔗 MAPEAMENTO COM SISTEMAS

### 🌐 RSV 360° - Sistema de Reservas
**URL:** http://localhost:3000  
**Descrição:** Sistema principal de reservas e gestão

#### Rotas Principais:
- `/` - Página inicial
- `/admin/login` - Login administrativo
- `/admin/crm` - CRM (Customer Relationship Management)
- `/admin/cms` - CMS (Content Management System)
- `/admin/dashboard-estatisticas` - Dashboard de estatísticas
- `/minhas-reservas` - Área do cliente

#### Tabelas Relacionadas (inferidas):
"@

# Tentar identificar tabelas relacionadas aos sistemas
$tabelasReservas = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'reserv|booking|order|payment|user|client|customer|hotel|room|flight'
        }
    }
}

if ($tabelasReservas) {
    foreach ($tabela in $tabelasReservas) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Tabelas serão mapeadas após análise mais detalhada.*`n"
}

$conteudo += @"

---

### 🏖️ Reservei Viagens - Sistema de Turismo
**URL:** http://localhost:3005  
**Descrição:** Dashboard de turismo e gestão de viagens

#### Rotas Principais:
- `/dashboard` - Dashboard principal
- `/dashboard/turismo` - Gestão de turismo
- `/dashboard/pacotes` - Gestão de pacotes

#### Tabelas Relacionadas (inferidas):
"@

$tabelasTurismo = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'turismo|tourism|travel|trip|package|tour|excurs|attraction|destination'
        }
    }
}

if ($tabelasTurismo) {
    foreach ($tabela in $tabelasTurismo) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Tabelas serão mapeadas após análise mais detalhada.*`n"
}

$conteudo += @"

---

## 📝 NOTAS

- Este relatório foi gerado automaticamente pelo script ``ANALISAR-TABELAS-POSTGRESQL.ps1``
- Para atualizar, execute o script novamente
- Tabelas são mapeadas por padrões de nomenclatura; validação manual pode ser necessária

---

**Última Atualização:** $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
"@

# Salvar relatório
$conteudo | Out-File -FilePath $relatorioPath -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] ANÁLISE CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Relatório salvo em:" -ForegroundColor Cyan
Write-Host "  $relatorioPath" -ForegroundColor Yellow
Write-Host ""
