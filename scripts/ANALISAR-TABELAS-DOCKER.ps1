# Script para analisar todas as tabelas do PostgreSQL no Docker
# Container: postgres-rsv360 na porta 5432

param(
    [string]$ContainerName = "postgres-rsv360",
    [string]$Usuario = "postgres",
    [string]$Senha = "290491Bb",
    [string]$Database = "rsv_360_ecosystem"
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANÁLISE DE TABELAS POSTGRESQL (DOCKER)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Container: $ContainerName" -ForegroundColor Yellow
Write-Host "Database: $Database" -ForegroundColor Yellow
Write-Host "Usuário: $Usuario" -ForegroundColor Yellow
Write-Host ""

# Verificar se o container está rodando
$containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "[ERRO] Container '$ContainerName' não está rodando!" -ForegroundColor Red
    Write-Host "[INFO] Execute: docker start $ContainerName" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Container está rodando: $containerStatus" -ForegroundColor Green
Write-Host ""

# Listar todos os bancos de dados
Write-Host "2. Listando bancos de dados..." -ForegroundColor Yellow
$bancosOutput = docker exec $ContainerName psql -U $Usuario -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;"
$bancos = $bancosOutput | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }

Write-Host "   Encontrados $($bancos.Count) banco(s):" -ForegroundColor Cyan
foreach ($banco in $bancos) {
    Write-Host "   - $banco" -ForegroundColor White
}
Write-Host ""

# Variável para armazenar resultados
$todosResultados = @()

# Para cada banco, listar schemas e tabelas
foreach ($banco in $bancos) {
    Write-Host "3. Analisando banco: $banco" -ForegroundColor Yellow
    
    $bancoInfo = @{
        Nome = $banco
        Schemas = @()
    }
    
    # Listar schemas
    $querySchemas = "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;"
    $schemasOutput = docker exec $ContainerName psql -U $Usuario -d $banco -t -A -c $querySchemas
    $schemas = $schemasOutput | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
    
    if ($schemas.Count -eq 0) {
        Write-Host "   [INFO] Nenhum schema customizado encontrado (usando 'public')" -ForegroundColor Gray
        $schemas = @("public")
    }
    
    foreach ($schema in $schemas) {
        Write-Host "   Schema: $schema" -ForegroundColor Cyan
        
        $schemaInfo = @{
            Nome = $schema
            Tabelas = @()
        }
        
        # Listar tabelas do schema
        $queryTabelas = "SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' AND table_type = 'BASE TABLE' ORDER BY table_name;"
        $tabelasOutput = docker exec $ContainerName psql -U $Usuario -d $banco -t -A -c $queryTabelas
        $tabelas = $tabelasOutput | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
        
        if ($tabelas.Count -eq 0) {
            Write-Host "      [INFO] Nenhuma tabela encontrada" -ForegroundColor Gray
        } else {
            foreach ($tabela in $tabelas) {
                # Obter informações da tabela (colunas)
                $queryColunas = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '$schema' AND table_name = '$tabela' ORDER BY ordinal_position;"
                $colunasOutput = docker exec $ContainerName psql -U $Usuario -d $banco -t -A -c $queryColunas
                
                $tabelaInfo = @{
                    Nome = $tabela
                    Colunas = @()
                }
                
                if ($colunasOutput) {
                    $colunasOutput | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object {
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
    
    $todosResultados += $bancoInfo
    Write-Host ""
}

# Gerar relatório em Markdown
$relatorioPath = Join-Path $RootPath "RELATORIO_TABELAS_POSTGRESQL_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').md"

$conteudo = @"
# 📊 RELATÓRIO COMPLETO DE TABELAS POSTGRESQL

**Data de Análise:** $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')  
**Container Docker:** $ContainerName  
**Porta:** 5432  
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

#### Tabelas Relacionadas:
"@

# Identificar tabelas relacionadas aos sistemas
$tabelasReservas = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'reserv|booking|order|payment|user|client|customer|hotel|room|flight|ticket|passenger'
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

#### Tabelas Relacionadas:
"@

$tabelasTurismo = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'turismo|tourism|travel|trip|package|tour|excurs|attraction|destination|pacote|roteiro'
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

# Adicionar categorias de tabelas
$conteudo += @"

---

## 📊 CATEGORIAS DE TABELAS

### 👥 Usuários e Autenticação
"@

$tabelasAuth = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'user|auth|login|session|token|permission|role|account'
        }
    }
}

if ($tabelasAuth) {
    foreach ($tabela in $tabelasAuth) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### 💰 Reservas e Pagamentos
"@

$tabelasReservas = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'reserv|booking|order|payment|transaction|invoice|billing'
        }
    }
}

if ($tabelasReservas) {
    foreach ($tabela in $tabelasReservas) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### 🏨 Hotéis e Hospedagem
"@

$tabelasHoteis = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'hotel|room|accommodation|amenity|facility'
        }
    }
}

if ($tabelasHoteis) {
    foreach ($tabela in $tabelasHoteis) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### ✈️ Voos e Transporte
"@

$tabelasVoos = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'flight|airline|airport|transport|route|ticket'
        }
    }
}

if ($tabelasVoos) {
    foreach ($tabela in $tabelasVoos) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### 🎯 Turismo e Atrações
"@

$tabelasTurismo = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'tour|attraction|destination|package|excurs|activity|event'
        }
    }
}

if ($tabelasTurismo) {
    foreach ($tabela in $tabelasTurismo) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### 📝 CMS e Conteúdo
"@

$tabelasCMS = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'content|page|post|article|media|image|file|cms'
        }
    }
}

if ($tabelasCMS) {
    foreach ($tabela in $tabelasCMS) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

### 📊 Analytics e Estatísticas
"@

$tabelasAnalytics = $todosResultados | ForEach-Object { 
    $_.Schemas | ForEach-Object { 
        $_.Tabelas | Where-Object { 
            $_.Nome -match 'analytics|statistic|metric|log|audit|track|report'
        }
    }
}

if ($tabelasAnalytics) {
    foreach ($tabela in $tabelasAnalytics) {
        $conteudo += "- ``$($tabela.Nome)```n"
    }
} else {
    $conteudo += "*Nenhuma tabela encontrada.*`n"
}

$conteudo += @"

---

## 📝 NOTAS

- Este relatório foi gerado automaticamente pelo script ``ANALISAR-TABELAS-DOCKER.ps1``
- Para atualizar, execute o script novamente
- Tabelas são mapeadas por padrões de nomenclatura; validação manual pode ser necessária
- Container Docker: ``$ContainerName``

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
