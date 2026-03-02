require('dotenv').config({ path: '../.env.local' });
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

const pool = new Pool(dbConfig);

const propriedades = [
  {
    title: 'Pousada Águas Quentes',
    description: 'Pousada aconchegante com piscina aquecida e sauna. Localizada a 5 minutos do centro de Caldas Novas.',
    address: 'Av. Brasil, 456',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    base_price: '250.00',
    rating: '4.5',
    review_count: 18,
    amenities: ['WiFi', 'Piscina', 'Ar Condicionado', 'Café da Manhã'],
    images: [],
  },
  {
    title: 'Casa de Temporada com Vista para o Lago',
    description: 'Casa espaçosa com vista privilegiada para o lago. Ideal para famílias grandes.',
    address: 'Rua do Lago, 789',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 10,
    base_price: '450.00',
    rating: '4.9',
    review_count: 32,
    amenities: ['WiFi', 'Piscina', 'Churrasqueira', 'Garagem', 'Lavanderia'],
    images: [],
  },
  {
    title: 'Apartamento Compacto Centro',
    description: 'Apartamento moderno no coração de Caldas Novas. Próximo a restaurantes e atrações.',
    address: 'Rua Principal, 123',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    base_price: '180.00',
    rating: '4.3',
    review_count: 15,
    amenities: ['WiFi', 'Ar Condicionado', 'Cozinha Equipada'],
    images: [],
  },
  {
    title: 'Chalé Rústico na Natureza',
    description: 'Chalé aconchegante cercado por natureza. Perfeito para quem busca tranquilidade.',
    address: 'Estrada da Serra, Km 5',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    base_price: '320.00',
    rating: '4.7',
    review_count: 22,
    amenities: ['WiFi', 'Lareira', 'Área Externa', 'Estacionamento'],
    images: [],
  },
  {
    title: 'Suíte Premium com Hidromassagem',
    description: 'Suíte luxuosa com hidromassagem privativa. Experiência única de relaxamento.',
    address: 'Av. das Termas, 321',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    base_price: '380.00',
    rating: '4.8',
    review_count: 28,
    amenities: ['WiFi', 'Hidromassagem', 'Ar Condicionado', 'TV Smart', 'Minibar'],
    images: [],
  },
  {
    title: 'Casa de Campo com Piscina',
    description: 'Casa de campo espaçosa com piscina e área de lazer completa. Ideal para grupos.',
    address: 'Fazenda São José, S/N',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 12,
    base_price: '550.00',
    rating: '4.9',
    review_count: 45,
    amenities: ['WiFi', 'Piscina', 'Churrasqueira', 'Quadra', 'Playground', 'Lavanderia'],
    images: [],
  },
  {
    title: 'Studio Moderno',
    description: 'Studio moderno e funcional, perfeito para casais. Localização privilegiada.',
    address: 'Rua das Flores, 234',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 0,
    bathrooms: 1,
    max_guests: 2,
    base_price: '150.00',
    rating: '4.2',
    review_count: 12,
    amenities: ['WiFi', 'Ar Condicionado', 'Cozinha Compacta'],
    images: [],
  },
  {
    title: 'Villa Luxo com Piscina Infinita',
    description: 'Villa de luxo com piscina infinita e vista panorâmica. Experiência premium.',
    address: 'Alto da Colina, 567',
    city: 'Caldas Novas',
    state: 'GO',
    country: 'BR',
    bedrooms: 6,
    bathrooms: 5,
    max_guests: 14,
    base_price: '850.00',
    rating: '5.0',
    review_count: 38,
    amenities: ['WiFi', 'Piscina Infinita', 'Spa', 'Home Theater', 'Cozinha Gourmet', 'Garagem 4 carros'],
    images: [],
  },
];

async function adicionarPropriedades() {
  console.log('========================================');
  console.log('ADICIONANDO PROPRIEDADES DE TESTE');
  console.log('========================================');
  console.log('');

  try {
    // Verificar se a tabela properties existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'properties'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Tabela properties não existe!');
      console.log('Execute primeiro: scripts/create-properties-table.sql');
      return;
    }

    let adicionadas = 0;
    let duplicadas = 0;

    for (const prop of propriedades) {
      try {
        // Verificar se já existe (por título)
        const existe = await pool.query(
          'SELECT id FROM properties WHERE title = $1',
          [prop.title]
        );

        if (existe.rows.length > 0) {
          console.log(`⚠️  "${prop.title}" já existe (ID: ${existe.rows[0].id})`);
          duplicadas++;
          continue;
        }

        // Inserir propriedade
        // amenities e images são arrays PostgreSQL (TEXT[]), não JSON
        const result = await pool.query(
          `INSERT INTO properties (
            title, description, address, city, state, country,
            bedrooms, bathrooms, max_guests, base_price,
            rating, review_count, amenities, images, status,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
          RETURNING id, title`,
          [
            prop.title,
            prop.description,
            prop.address,
            prop.city,
            prop.state,
            prop.country,
            prop.bedrooms,
            prop.bathrooms,
            prop.max_guests,
            prop.base_price,
            prop.rating,
            prop.review_count,
            prop.amenities || [], // Array PostgreSQL
            prop.images || [], // Array PostgreSQL
            'active',
          ]
        );

        console.log(`✅ "${prop.title}" adicionada (ID: ${result.rows[0].id})`);
        adicionadas++;
      } catch (error) {
        console.error(`❌ Erro ao adicionar "${prop.title}":`, error.message);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('RESUMO');
    console.log('========================================');
    console.log(`✅ Propriedades adicionadas: ${adicionadas}`);
    console.log(`⚠️  Propriedades duplicadas: ${duplicadas}`);
    console.log(`📊 Total processadas: ${propriedades.length}`);
    console.log('');

    // Listar todas as propriedades
    const todas = await pool.query('SELECT id, title, city, base_price FROM properties ORDER BY id');
    console.log('📋 Propriedades no banco:');
    todas.rows.forEach((p) => {
      console.log(`   ${p.id}. ${p.title} - ${p.city} - R$ ${p.base_price}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
  } finally {
    await pool.end();
  }
}

adicionarPropriedades();

