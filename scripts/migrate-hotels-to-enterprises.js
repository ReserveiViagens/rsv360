/**
 * Script de Migração: website_content (hotels) → enterprises
 * 
 * Este script migra os hotéis da tabela website_content para a nova
 * estrutura de enterprises, properties e accommodations via API.
 * 
 * Uso:
 *   node scripts/migrate-hotels-to-enterprises.js [--dry-run] [--limit=N]
 * 
 * Opções:
 *   --dry-run: Apenas simula a migração sem salvar
 *   --limit=N: Migra apenas os primeiros N hotéis
 */

const axios = require('axios');
const { Pool } = require('pg');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'rsv360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '290491Bb'
};

// Configuração da API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Parse argumentos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extrai cidade e estado de uma string de localização
 */
function extractCityState(location) {
  if (!location) return { city: 'Caldas Novas', state: 'GO' };
  
  if (location.includes(',')) {
    const parts = location.split(',').map(p => p.trim());
    return {
      city: parts[0] || 'Caldas Novas',
      state: parts[1]?.toUpperCase() || 'GO'
    };
  }
  
  return { city: location.trim(), state: 'GO' };
}

/**
 * Converte hotel de website_content para formato Enterprise
 */
function convertHotelToEnterprise(hotel) {
  const metadata = hotel.metadata || {};
  const location = metadata.location || hotel.title + ', GO';
  const { city, state } = extractCityState(location);
  
  const price = parseFloat(metadata.price || metadata.originalPrice || 200);
  const maxGuests = parseInt(
    metadata.maxGuests || 
    (metadata.capacity ? metadata.capacity.replace(/\D/g, '') : '4')
  ) || 4;
  
  const images = Array.isArray(hotel.images) ? hotel.images : [];
  const features = Array.isArray(metadata.features) ? metadata.features : [];
  
  return {
    name: hotel.title,
    description: hotel.description || '',
    enterprise_type: 'hotel',
    address: {
      city,
      state,
      country: 'Brasil'
    },
    phone: metadata.phone || null,
    email: metadata.email || null,
    website: metadata.website || null,
    images,
    amenities: features,
    status: hotel.status === 'active' ? 'active' : 'inactive',
    is_featured: metadata.featured || false,
    metadata: {
      migrated_from: 'website_content',
      original_id: hotel.id,
      original_content_id: hotel.content_id,
      stars: parseInt(metadata.stars) || 3,
      original_price: parseFloat(metadata.originalPrice) || price,
      discount: parseInt(metadata.discount) || 0
    },
    // Dados para criar property e accommodation
    _migration_data: {
      price,
      maxGuests
    }
  };
}

/**
 * Busca hotéis da tabela website_content
 */
async function fetchOldHotels() {
  const pool = new Pool(dbConfig);
  
  try {
    const query = `
      SELECT 
        id,
        content_id,
        title,
        description,
        images,
        metadata,
        status,
        created_at,
        updated_at
      FROM website_content
      WHERE page_type = 'hotels'
      AND status = 'active'
      ORDER BY id
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } finally {
    await pool.end();
  }
}

/**
 * Cria enterprise via API
 */
async function createEnterprise(enterpriseData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/enterprises`,
      enterpriseData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'admin-token-123'}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Cria property via API
 */
async function createProperty(enterpriseId, propertyData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/enterprises/${enterpriseId}/properties`,
      propertyData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'admin-token-123'}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Cria accommodation via API
 */
async function createAccommodation(propertyId, accommodationData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/properties/${propertyId}/accommodations`,
      accommodationData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'admin-token-123'}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Migra um hotel
 */
async function migrateHotel(hotel) {
  const enterpriseData = convertHotelToEnterprise(hotel);
  const { price, maxGuests } = enterpriseData._migration_data;
  
  if (isDryRun) {
    log(`[DRY RUN] Migraria: ${hotel.title}`, 'yellow');
    return { enterprise: null, property: null, accommodation: null };
  }
  
  // 1. Criar Enterprise
  const enterpriseResult = await createEnterprise(enterpriseData);
  const enterprise = enterpriseResult.data || enterpriseResult;
  const enterpriseId = enterprise.id;
  
  log(`✅ Enterprise criado: ${hotel.title} (ID: ${enterpriseId})`, 'green');
  
  // 2. Criar Property
  const propertyData = {
    name: `${hotel.title} - Propriedade Principal`,
    description: hotel.description || '',
    property_type: 'room',
    max_guests: maxGuests,
    base_price_per_night: price,
    currency: 'BRL',
    status: 'active'
  };
  
  const propertyResult = await createProperty(enterpriseId, propertyData);
  const property = propertyResult.data || propertyResult;
  const propertyId = property.id;
  
  log(`✅ Property criado: ${hotel.title} (ID: ${propertyId})`, 'green');
  
  // 3. Criar Accommodation
  const accommodationData = {
    name: `${hotel.title} - Acomodação Principal`,
    description: hotel.description || '',
    accommodation_type: 'standard',
    max_guests: maxGuests,
    base_price_per_night: price,
    currency: 'BRL',
    status: 'active'
  };
  
  const accommodationResult = await createAccommodation(propertyId, accommodationData);
  const accommodation = accommodationResult.data || accommodationResult;
  
  log(`✅ Accommodation criado: ${hotel.title} (ID: ${accommodation.id})`, 'green');
  
  return { enterprise, property, accommodation };
}

/**
 * Função principal
 */
async function main() {
  log('\n🚀 Iniciando migração de hotéis...\n', 'cyan');
  
  if (isDryRun) {
    log('⚠️  MODO DRY-RUN: Nenhum dado será salvo\n', 'yellow');
  }
  
  if (limit) {
    log(`📊 Limite: ${limit} hotéis\n`, 'blue');
  }
  
  try {
    // Buscar hotéis
    log('📥 Buscando hotéis da tabela website_content...', 'blue');
    const hotels = await fetchOldHotels();
    log(`✅ ${hotels.length} hotéis encontrados\n`, 'green');
    
    if (hotels.length === 0) {
      log('ℹ️  Nenhum hotel para migrar', 'yellow');
      return;
    }
    
    // Migrar cada hotel
    const results = {
      success: [],
      errors: []
    };
    
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      log(`\n[${i + 1}/${hotels.length}] Migrando: ${hotel.title}`, 'cyan');
      
      try {
        const result = await migrateHotel(hotel);
        results.success.push({ hotel, result });
        
        // Pequeno delay para não sobrecarregar a API
        if (!isDryRun && i < hotels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        log(`❌ Erro ao migrar ${hotel.title}: ${error.message}`, 'red');
        results.errors.push({ hotel, error: error.message });
      }
    }
    
    // Resumo
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 RESUMO DA MIGRAÇÃO', 'cyan');
    log('='.repeat(50), 'cyan');
    log(`✅ Sucessos: ${results.success.length}`, 'green');
    log(`❌ Erros: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
    
    if (results.errors.length > 0) {
      log('\n❌ Hotéis com erro:', 'red');
      results.errors.forEach(({ hotel, error }) => {
        log(`   - ${hotel.title}: ${error}`, 'red');
      });
    }
    
    log('\n🎉 Migração concluída!\n', 'green');
    
  } catch (error) {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateHotel, convertHotelToEnterprise };
