/**
 * Script de Migração Customizado para 71 Registros
 * 
 * Migra registros das tabelas:
 * - properties (3 registros)
 * - website_content (64 registros)
 * - website_settings (4 registros)
 * 
 * Converte UUID → INTEGER e mapeia colunas conforme necessário
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTAINER_NAME = 'postgres-rsv360';
const SOURCE_DB = 'rsv_360_ecosystem';
const TARGET_CONFIG = {
  host: 'localhost',
  port: 5433,
  database: 'rsv360',
  user: 'postgres',
  password: '290491Bb',
};

// Tabela de mapeamento UUID → INTEGER para referências
const uuidToIntegerMap = new Map();

async function executarComandoDocker(comando) {
  try {
    const resultado = execSync(
      `docker exec ${CONTAINER_NAME} ${comando}`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    return { sucesso: true, resultado };
  } catch (error) {
    return { sucesso: false, erro: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

async function obterDadosDocker(tableName, columns = '*') {
  const comando = `psql -U postgres -d ${SOURCE_DB} -t -A -F'|' -c "SELECT ${columns} FROM ${tableName} ORDER BY created_at;"`;
  const resultado = await executarComandoDocker(comando);
  
  if (!resultado.sucesso) {
    return [];
  }
  
  // Parse do resultado (formato delimitado por |)
  const linhas = resultado.resultado.trim().split('\n').filter(l => l.trim());
  return linhas;
}

async function obterDadosDockerJSON(tableName, orderBy = 'created_at') {
  // Verificar se a coluna existe antes de ordenar
  let orderClause = '';
  if (orderBy === 'created_at') {
    // Tentar ordenar por created_at, se não existir, usar updated_at ou sem ordenação
    orderClause = `ORDER BY COALESCE(created_at, updated_at, '1970-01-01'::timestamp)`;
  } else if (orderBy === 'updated_at') {
    orderClause = `ORDER BY COALESCE(updated_at, '1970-01-01'::timestamp)`;
  }
  
  const comando = `psql -U postgres -d ${SOURCE_DB} -t -c "SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM ${tableName} ${orderClause}) t;"`;
  const resultado = await executarComandoDocker(comando);
  
  if (!resultado.sucesso || !resultado.resultado.trim()) {
    return [];
  }
  
  try {
    const json = JSON.parse(resultado.resultado.trim());
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error(`Erro ao parsear JSON de ${tableName}:`, error.message);
    return [];
  }
}

async function mapearOwnerId(targetPool, ownerUuid) {
  if (!ownerUuid) return null;
  
  // Verificar se já mapeamos
  if (uuidToIntegerMap.has(ownerUuid)) {
    return uuidToIntegerMap.get(ownerUuid);
  }
  
  // Buscar owner no Docker para obter informações
  const dockerOwner = await executarComandoDocker(
    `psql -U postgres -d ${SOURCE_DB} -t -A -F'|' -c "SELECT id::text, name, email FROM owners WHERE id::text = '${ownerUuid}';"`
  );
  
  if (dockerOwner.sucesso && dockerOwner.resultado.trim()) {
    const ownerInfo = dockerOwner.resultado.trim().split('|');
    const ownerName = ownerInfo[1]?.trim();
    const ownerEmail = ownerInfo[2]?.trim();
    
    // Tentar encontrar no destino pelo UUID (se foi migrado)
    let result = await targetPool.query(`
      SELECT id::text FROM owners WHERE id::text = $1;
    `, [ownerUuid]);
    
    if (result.rows.length > 0) {
      // Owner existe no destino com mesmo UUID
      // Mas properties.owner_id precisa ser INTEGER, não UUID
      // Como não temos mapeamento direto, vamos usar NULL ou buscar um owner INTEGER
      // Por enquanto, vamos usar NULL (owner_id é nullable)
      uuidToIntegerMap.set(ownerUuid, null);
      return null;
    }
    
    // Se não encontrou pelo UUID, tentar pelo nome/email
    if (ownerName || ownerEmail) {
      let query = `SELECT id::text FROM owners WHERE `;
      const params = [];
      
      if (ownerName && ownerEmail) {
        query += `(name = $1 OR email = $2)`;
        params.push(ownerName, ownerEmail);
      } else if (ownerName) {
        query += `name = $1`;
        params.push(ownerName);
      } else {
        query += `email = $1`;
        params.push(ownerEmail);
      }
      
      result = await targetPool.query(query + ' LIMIT 1;', params);
      
      if (result.rows.length > 0) {
        // Encontrou pelo nome/email, mas ainda precisa converter UUID → INTEGER
        // Como properties.owner_id é INTEGER e owners.id é UUID, não há compatibilidade direta
        // Vamos usar NULL por enquanto
        uuidToIntegerMap.set(ownerUuid, null);
        return null;
      }
    }
  }
  
  // Se não encontrou, usar NULL (owner_id é nullable em properties)
  uuidToIntegerMap.set(ownerUuid, null);
  return null;
}

async function migrarWebsiteSettings(targetPool) {
  console.log('\n📋 Migrando website_settings (4 registros)...');
  
  const dados = await obterDadosDockerJSON('website_settings', 'updated_at');
  
  if (dados.length === 0) {
    console.log('  ⚠️  Nenhum dado encontrado no Docker');
    return { inseridos: 0, erros: 0 };
  }
  
  let inseridos = 0;
  let erros = 0;
  
  for (const registro of dados) {
    try {
      // Verificar se já existe pelo setting_key
      const existe = await targetPool.query(
        `SELECT id FROM website_settings WHERE setting_key = $1`,
        [registro.setting_key]
      );
      
      if (existe.rows.length > 0) {
        console.log(`  ⏭️  ${registro.setting_key} já existe, atualizando...`);
        
        // Atualizar registro existente
        await targetPool.query(`
          UPDATE website_settings 
          SET 
            setting_value = $1,
            description = $2,
            updated_at = $3,
            updated_by = $4
          WHERE setting_key = $5
        `, [
          typeof registro.setting_value === 'string' 
            ? registro.setting_value 
            : JSON.stringify(registro.setting_value),
          registro.description || null,
          registro.updated_at || new Date(),
          null, // updated_by será NULL (não temos mapeamento)
          registro.setting_key
        ]);
        
        inseridos++;
      } else {
        // Inserir novo registro
        await targetPool.query(`
          INSERT INTO website_settings (
            setting_key,
            setting_value,
            description,
            updated_at,
            updated_by
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          registro.setting_key,
          typeof registro.setting_value === 'string' 
            ? registro.setting_value 
            : JSON.stringify(registro.setting_value),
          registro.description || null,
          registro.updated_at || new Date(),
          null // updated_by será NULL
        ]);
        
        inseridos++;
        console.log(`  ✅ ${registro.setting_key} inserido`);
      }
    } catch (error) {
      erros++;
      console.error(`  ❌ Erro ao migrar ${registro.setting_key}:`, error.message);
    }
  }
  
  console.log(`  ✅ ${inseridos} registros processados, ${erros} erros`);
  return { inseridos, erros };
}

async function migrarWebsiteContent(targetPool) {
  console.log('\n📋 Migrando website_content (64 registros)...');
  
  const dados = await obterDadosDockerJSON('website_content');
  
  if (dados.length === 0) {
    console.log('  ⚠️  Nenhum dado encontrado no Docker');
    return { inseridos: 0, erros: 0 };
  }
  
  let inseridos = 0;
  let erros = 0;
  
  for (const registro of dados) {
    try {
      // Verificar se já existe pelo content_id e page_type
      const existe = await targetPool.query(
        `SELECT id FROM website_content WHERE page_type = $1 AND content_id = $2`,
        [registro.page_type, registro.content_id]
      );
      
      if (existe.rows.length > 0) {
        console.log(`  ⏭️  ${registro.page_type}/${registro.content_id} já existe, atualizando...`);
        
        // Atualizar registro existente
        await targetPool.query(`
          UPDATE website_content 
          SET 
            title = $1,
            description = $2,
            images = $3,
            metadata = $4,
            seo_data = $5,
            status = $6,
            order_index = $7,
            updated_at = $8,
            created_by = $9,
            updated_by = $10
          WHERE page_type = $11 AND content_id = $12
        `, [
          registro.title,
          registro.description || null,
          typeof registro.images === 'string' ? registro.images : JSON.stringify(registro.images || []),
          typeof registro.metadata === 'string' ? registro.metadata : JSON.stringify(registro.metadata || {}),
          typeof registro.seo_data === 'string' ? registro.seo_data : JSON.stringify(registro.seo_data || {}),
          registro.status || 'active',
          registro.order_index || 0,
          registro.updated_at || registro.created_at || new Date(),
          null, // created_by será NULL
          null, // updated_by será NULL
          registro.page_type,
          registro.content_id
        ]);
        
        inseridos++;
      } else {
        // Inserir novo registro
        await targetPool.query(`
          INSERT INTO website_content (
            page_type,
            content_id,
            title,
            description,
            images,
            metadata,
            seo_data,
            status,
            order_index,
            created_at,
            updated_at,
            created_by,
            updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          registro.page_type,
          registro.content_id,
          registro.title,
          registro.description || null,
          typeof registro.images === 'string' ? registro.images : JSON.stringify(registro.images || []),
          typeof registro.metadata === 'string' ? registro.metadata : JSON.stringify(registro.metadata || {}),
          typeof registro.seo_data === 'string' ? registro.seo_data : JSON.stringify(registro.seo_data || {}),
          registro.status || 'active',
          registro.order_index || 0,
          registro.created_at || new Date(),
          registro.updated_at || registro.created_at || new Date(),
          null, // created_by será NULL
          null  // updated_by será NULL
        ]);
        
        inseridos++;
        if (inseridos % 10 === 0) {
          console.log(`  ✅ ${inseridos} registros inseridos...`);
        }
      }
    } catch (error) {
      erros++;
      if (erros <= 5) {
        console.error(`  ❌ Erro ao migrar ${registro.page_type}/${registro.content_id}:`, error.message.substring(0, 100));
      }
    }
  }
  
  console.log(`  ✅ ${inseridos} registros processados, ${erros} erros`);
  return { inseridos, erros };
}

async function migrarProperties(targetPool) {
  console.log('\n📋 Migrando properties (3 registros)...');
  
  const dados = await obterDadosDockerJSON('properties');
  
  if (dados.length === 0) {
    console.log('  ⚠️  Nenhum dado encontrado no Docker');
    return { inseridos: 0, erros: 0 };
  }
  
  let inseridos = 0;
  let erros = 0;
  
  for (const registro of dados) {
    try {
      // Verificar se já existe (vamos usar title + city como identificador único)
      const existe = await targetPool.query(
        `SELECT id FROM properties WHERE name = $1 AND address_city = $2`,
        [registro.title, registro.address_city]
      );
      
      if (existe.rows.length > 0) {
        console.log(`  ⏭️  ${registro.title} já existe, atualizando...`);
        
        // Mapear owner_id
        const ownerId = await mapearOwnerId(targetPool, registro.owner_id);
        
        // Truncar check_in_time e check_out_time para 10 caracteres
        const checkInTime = registro.check_in_time ? registro.check_in_time.substring(0, 10) : '14:00';
        const checkOutTime = registro.check_out_time ? registro.check_out_time.substring(0, 10) : '11:00';
        
        // Converter cancellation_policy para VARCHAR(50)
        const cancellationPolicy = registro.cancellation_policy 
          ? registro.cancellation_policy.substring(0, 50) 
          : 'moderate';
        
        // Converter status para VARCHAR(20)
        const status = registro.status ? registro.status.substring(0, 20) : 'active';
        
        // Atualizar registro existente
        await targetPool.query(`
          UPDATE properties 
          SET 
            owner_id = $1,
            name = $2,
            description = $3,
            property_type = $4,
            address_street = $5,
            address_city = $6,
            address_state = $7,
            address_zip_code = $8,
            address_country = $9,
            latitude = $10,
            longitude = $11,
            bedrooms = $12,
            bathrooms = $13,
            max_guests = $14,
            area_sqm = $15,
            base_price_per_night = $16,
            cleaning_fee = $17,
            amenities = $18,
            images = $19,
            min_stay_nights = $20,
            check_in_time = $21,
            check_out_time = $22,
            status = $23,
            cancellation_policy = $24,
            updated_at = $25
          WHERE name = $2 AND address_city = $6
        `, [
          ownerId,
          registro.title, // title → name
          registro.description || null,
          registro.type, // type → property_type
          registro.address_street || null,
          registro.address_city,
          registro.address_state,
          registro.address_zip_code || null,
          registro.address_country || 'Brasil',
          registro.latitude || null,
          registro.longitude || null,
          registro.bedrooms || 0,
          registro.bathrooms || 0,
          registro.max_guests || 1,
          registro.area_sqm || null,
          registro.base_price, // base_price → base_price_per_night
          registro.cleaning_fee || 0,
          typeof registro.amenities === 'string' ? registro.amenities : JSON.stringify(registro.amenities || {}),
          typeof registro.images === 'string' ? registro.images : JSON.stringify(registro.images || []),
          registro.min_stay || 1, // min_stay → min_stay_nights
          checkInTime,
          checkOutTime,
          status,
          cancellationPolicy,
          registro.updated_at || registro.created_at || new Date()
        ]);
        
        inseridos++;
      } else {
        // Mapear owner_id
        const ownerId = await mapearOwnerId(targetPool, registro.owner_id);
        
        // Truncar check_in_time e check_out_time para 10 caracteres
        const checkInTime = registro.check_in_time ? registro.check_in_time.substring(0, 10) : '14:00';
        const checkOutTime = registro.check_out_time ? registro.check_out_time.substring(0, 10) : '11:00';
        
        // Converter cancellation_policy para VARCHAR(50)
        const cancellationPolicy = registro.cancellation_policy 
          ? registro.cancellation_policy.substring(0, 50) 
          : 'moderate';
        
        // Converter status para VARCHAR(20)
        const status = registro.status ? registro.status.substring(0, 20) : 'active';
        
        // Inserir novo registro
        await targetPool.query(`
          INSERT INTO properties (
            owner_id,
            name,
            description,
            property_type,
            address_street,
            address_city,
            address_state,
            address_zip_code,
            address_country,
            latitude,
            longitude,
            bedrooms,
            bathrooms,
            beds,
            max_guests,
            area_sqm,
            amenities,
            base_price_per_night,
            currency,
            cleaning_fee,
            service_fee_percentage,
            min_stay_nights,
            check_in_time,
            check_out_time,
            status,
            is_featured,
            is_instant_book,
            cancellation_policy,
            images,
            metadata,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
        `, [
          ownerId,
          registro.title, // title → name
          registro.description || null,
          registro.type, // type → property_type
          registro.address_street || null,
          registro.address_city,
          registro.address_state,
          registro.address_zip_code || null,
          registro.address_country || 'Brasil',
          registro.latitude || null,
          registro.longitude || null,
          registro.bedrooms || 0,
          registro.bathrooms || 0,
          0, // beds (não existe no Docker, usar 0)
          registro.max_guests || 1,
          registro.area_sqm || null,
          typeof registro.amenities === 'string' ? registro.amenities : JSON.stringify(registro.amenities || {}),
          registro.base_price, // base_price → base_price_per_night
          'BRL', // currency (padrão)
          registro.cleaning_fee || 0,
          0, // service_fee_percentage (padrão)
          registro.min_stay || 1, // min_stay → min_stay_nights
          checkInTime,
          checkOutTime,
          status,
          false, // is_featured (padrão)
          false, // is_instant_book (padrão)
          cancellationPolicy,
          typeof registro.images === 'string' ? registro.images : JSON.stringify(registro.images || []),
          '{}', // metadata (padrão)
          registro.created_at || new Date(),
          registro.updated_at || registro.created_at || new Date()
        ]);
        
        inseridos++;
        console.log(`  ✅ ${registro.title} inserido`);
      }
    } catch (error) {
      erros++;
      console.error(`  ❌ Erro ao migrar ${registro.title}:`, error.message);
    }
  }
  
  console.log(`  ✅ ${inseridos} registros processados, ${erros} erros`);
  return { inseridos, erros };
}

async function executarMigracao() {
  console.log('');
  console.log('========================================');
  console.log('MIGRAÇÃO CUSTOMIZADA - 71 REGISTROS');
  console.log('========================================');
  console.log('');
  
  // Verificar container
  console.log('1. Verificando container Docker...');
  try {
    const containerCheck = execSync(`docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}"`, { encoding: 'utf8' });
    if (!containerCheck.trim()) {
      console.log('  ❌ Container não está rodando!');
      return;
    }
    console.log(`  ✅ Container encontrado: ${containerCheck.trim()}`);
  } catch (error) {
    console.log('  ❌ Erro ao verificar container:', error.message);
    return;
  }
  
  // Conectar ao destino
  const targetPool = new Pool(TARGET_CONFIG);
  
  try {
    // Testar conexão
    await targetPool.query('SELECT 1');
    console.log('  ✅ Conexão com PostgreSQL nativo estabelecida');
    console.log('');
    
    const resultados = {
      website_settings: { inseridos: 0, erros: 0 },
      website_content: { inseridos: 0, erros: 0 },
      properties: { inseridos: 0, erros: 0 },
    };
    
    // 1. Migrar website_settings (CRÍTICO - 4 registros)
    console.log('2. Migrando website_settings...');
    resultados.website_settings = await migrarWebsiteSettings(targetPool);
    
    // 2. Migrar website_content (CRÍTICO - 64 registros)
    console.log('\n3. Migrando website_content...');
    resultados.website_content = await migrarWebsiteContent(targetPool);
    
    // 3. Migrar properties (IMPORTANTE - 3 registros)
    console.log('\n4. Migrando properties...');
    resultados.properties = await migrarProperties(targetPool);
    
    // Resumo
    console.log('');
    console.log('========================================');
    console.log('✅ MIGRAÇÃO CONCLUÍDA!');
    console.log('========================================');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  website_settings: ${resultados.website_settings.inseridos} inseridos, ${resultados.website_settings.erros} erros`);
    console.log(`  website_content: ${resultados.website_content.inseridos} inseridos, ${resultados.website_content.erros} erros`);
    console.log(`  properties: ${resultados.properties.inseridos} inseridos, ${resultados.properties.erros} erros`);
    console.log('');
    
    const totalInseridos = resultados.website_settings.inseridos + 
                          resultados.website_content.inseridos + 
                          resultados.properties.inseridos;
    const totalErros = resultados.website_settings.erros + 
                      resultados.website_content.erros + 
                      resultados.properties.erros;
    
    console.log(`  TOTAL: ${totalInseridos} registros processados, ${totalErros} erros`);
    console.log('');
    
    // Salvar relatório
    const relatorioPath = path.join(__dirname, '..', 'RELATORIO_MIGRACAO_CUSTOMIZADA.md');
    let relatorio = `# 📊 Relatório de Migração Customizada - 71 Registros\n\n`;
    relatorio += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    relatorio += `## 📊 Resumo\n\n`;
    relatorio += `- website_settings: ${resultados.website_settings.inseridos} inseridos, ${resultados.website_settings.erros} erros\n`;
    relatorio += `- website_content: ${resultados.website_content.inseridos} inseridos, ${resultados.website_content.erros} erros\n`;
    relatorio += `- properties: ${resultados.properties.inseridos} inseridos, ${resultados.properties.erros} erros\n`;
    relatorio += `- **TOTAL:** ${totalInseridos} registros processados, ${totalErros} erros\n\n`;
    relatorio += `## ✅ Status\n\n`;
    relatorio += totalErros === 0 ? '✅ **TODOS OS REGISTROS MIGRADOS COM SUCESSO!**\n\n' : `⚠️ **Alguns erros ocorreram. Verifique os logs acima.**\n\n`;
    
    fs.writeFileSync(relatorioPath, relatorio, 'utf8');
    console.log(`📄 Relatório salvo em: ${relatorioPath}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error.message);
  } finally {
    await targetPool.end();
  }
}

executarMigracao().catch(console.error);
