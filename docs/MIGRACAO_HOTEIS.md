# 📋 Guia de Migração: website_content → enterprises

Este documento descreve como migrar os 41 hotéis da tabela `website_content` para a nova estrutura de `enterprises`, `properties` e `accommodations`.

## 🎯 Objetivo

Migrar dados de hotéis da estrutura antiga (`website_content`) para a nova estrutura hierárquica:
- **Enterprise** (Empreendimento)
- **Property** (Propriedade)
- **Accommodation** (Acomodação)

## 📊 Estrutura de Dados

### Antiga (website_content)
```sql
website_content
├── id
├── page_type = 'hotels'
├── title
├── description
├── images (JSONB)
├── metadata (JSONB)
│   ├── location
│   ├── price
│   ├── features
│   ├── stars
│   └── ...
└── status
```

### Nova (enterprises)
```sql
enterprises
├── id
├── name
├── enterprise_type = 'hotel'
├── address (city, state)
├── images (JSONB)
├── amenities (JSONB)
└── metadata (JSONB)
    └── migrated_from = 'website_content'

properties
├── id
├── enterprise_id
├── name
├── property_type
└── base_price_per_night

accommodations
├── id
├── property_id
├── name
├── accommodation_type
└── base_price_per_night
```

## 🚀 Métodos de Migração

### Método 1: SQL Direto (Recomendado)

Executa a migração diretamente no banco de dados usando SQL.

#### Vantagens
- ✅ Mais rápido
- ✅ Transacional (rollback automático em caso de erro)
- ✅ Não depende da API estar rodando

#### Como usar

```powershell
# Migração completa
.\scripts\executar-migracao-hotels.ps1 -Method sql

# Ou executar SQL manualmente
psql -h localhost -p 5433 -U postgres -d rsv360 -f database/migrations/002_migrate_website_content_to_enterprises.sql
```

### Método 2: Via API (Node.js)

Migra através das APIs REST, validando dados e criando registros via endpoints.

#### Vantagens
- ✅ Validação completa dos dados
- ✅ Usa as mesmas APIs do sistema
- ✅ Permite dry-run (simulação)

#### Como usar

```powershell
# Migração completa
.\scripts\executar-migracao-hotels.ps1 -Method api

# Dry-run (simulação)
.\scripts\executar-migracao-hotels.ps1 -Method api -DryRun

# Migrar apenas 5 hotéis (teste)
.\scripts\executar-migracao-hotels.ps1 -Method api -Limit 5

# Ou diretamente via Node.js
node scripts/migrate-hotels-to-enterprises.js
node scripts/migrate-hotels-to-enterprises.js --dry-run
node scripts/migrate-hotels-to-enterprises.js --limit=5
```

## 📝 Pré-requisitos

### Para SQL
- ✅ PostgreSQL rodando (porta 5433)
- ✅ Banco `rsv360` criado
- ✅ Tabelas `enterprises`, `properties`, `accommodations` criadas
- ✅ Tabela `website_content` com dados

### Para API
- ✅ Tudo acima +
- ✅ Node.js instalado
- ✅ Backend rodando (porta 5000)
- ✅ Dependências instaladas (`npm install`)

## 🔍 Verificação

Após a migração, verifique os resultados:

```sql
-- Contar hotéis originais
SELECT COUNT(*) FROM website_content 
WHERE page_type = 'hotels' AND status = 'active';

-- Contar hotéis migrados
SELECT COUNT(*) FROM enterprises 
WHERE enterprise_type = 'hotel' 
AND metadata->>'migrated_from' = 'website_content';

-- Listar hotéis migrados
SELECT 
  e.id,
  e.name,
  e.address_city,
  e.address_state,
  e.metadata->>'original_id' as original_id,
  e.metadata->>'original_content_id' as original_content_id
FROM enterprises e
WHERE e.enterprise_type = 'hotel'
AND e.metadata->>'migrated_from' = 'website_content'
ORDER BY e.id;
```

## 🔄 Mapeamento de Dados

| website_content | enterprises | Observações |
|----------------|-------------|-------------|
| `title` | `name` | Nome do empreendimento |
| `description` | `description` | Descrição |
| `images` | `images` | Array de URLs |
| `metadata.location` | `address_city`, `address_state` | Extraído e separado |
| `metadata.features` | `amenities` | Array de amenidades |
| `metadata.price` | `properties.base_price_per_night` | Preço base |
| `metadata.maxGuests` | `properties.max_guests` | Capacidade |
| `status` | `status` | active/inactive |
| `metadata.featured` | `is_featured` | Destaque |

## ⚠️ Observações Importantes

1. **Não deleta dados originais**: A migração cria novos registros sem remover os antigos
2. **Mantém referência**: O campo `metadata.migrated_from` identifica hotéis migrados
3. **Cria estrutura completa**: Para cada hotel, cria:
   - 1 Enterprise
   - 1 Property (padrão)
   - 1 Accommodation (padrão)
4. **Idempotente**: Pode ser executada múltiplas vezes (verifica duplicatas)

## 🔧 Troubleshooting

### Erro: "relation enterprises does not exist"
```sql
-- Execute a migration de criação das tabelas primeiro
\i database/migrations/001_create_enterprises_and_accommodations.sql
```

### Erro: "duplicate key value"
- Os hotéis já foram migrados
- Verifique com a query de verificação acima

### Erro: "connection refused" (API)
- Verifique se o backend está rodando
- Verifique a URL da API em `.env`

### Alguns hotéis não migraram
- Verifique os logs para identificar erros
- Hotéis com dados inválidos podem ser pulados
- Execute novamente para tentar migrar os restantes

## 📚 Próximos Passos

Após a migração:

1. ✅ **Verificar dados**: Confirme que todos os hotéis foram migrados
2. ✅ **Ajustar propriedades**: Edite properties/accommodations conforme necessário
3. ✅ **Testar sistema**: Verifique se os hotéis aparecem corretamente
4. ✅ **Manter paralelo**: Ambas as fontes continuam funcionando
5. ✅ **Migração gradual**: Migre outros tipos de conteúdo conforme necessário

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs da migração
2. Consulte a documentação das tabelas
3. Execute queries de verificação
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 2025-01-14  
**Versão**: 1.0.0
