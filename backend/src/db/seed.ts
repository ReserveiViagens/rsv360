import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Iniciando seed do RSV360...');

  // 1. BRANDING
  console.log('📌 Inserindo branding...');
  await db.insert(schema.branding).values({
    companyName: 'Reservei Viagens',
    tagline: 'Sua viagem dos sonhos começa aqui',
    primaryColor: '#1E40AF',
    secondaryColor: '#F59E0B',
    accentColor: '#10B981',
    phone: '(62) 3333-4444',
    email: 'contato@reserveiviagens.com.br',
    whatsapp: '5562999998888',
    instagram: '@reserveiviagens',
    website: 'https://reserveiviagens.com.br',
    address: 'Goiânia, GO - Brasil',
  });

  // 2. ENTERPRISES
  console.log('🏢 Inserindo enterprises...');
  const [diroma, prive, goldenDolphin] = await db.insert(schema.enterprises).values([
    {
      name: 'Grupo Diroma',
      enterpriseType: 'hotel',
      addressCity: 'Caldas Novas',
      addressState: 'GO',
      phone: '(64) 3453-1234',
      email: 'contato@diroma.com.br',
      website: 'https://diroma.com.br',
      status: 'active',
      isFeatured: true
    },
    {
      name: 'Privé Hotéis e Parques',
      enterpriseType: 'hotel',
      addressCity: 'Caldas Novas',
      addressState: 'GO',
      phone: '(64) 3453-5678',
      email: 'reservas@prive.com.br',
      website: 'https://prive.com.br',
      status: 'active',
      isFeatured: true
    },
    {
      name: 'Golden Dolphin',
      enterpriseType: 'hotel',
      addressCity: 'Caldas Novas',
      addressState: 'GO',
      phone: '(64) 3453-9012',
      email: 'reservas@goldendolphin.com.br',
      website: 'https://goldendolphin.com.br',
      status: 'active'
    },
  ]).returning();

  // 3. PROPERTIES
  console.log('🏨 Inserindo properties...');
  await db.insert(schema.properties).values([
    {
      enterpriseId: diroma.id,
      name: 'Diroma Piazza',
      propertyType: 'hotel',
      maxGuests: 4,
      basePricePerNight: '350.00',
      status: 'active',
      isFeatured: true
    },
    {
      enterpriseId: prive.id,
      name: 'Privé Boulevard',
      propertyType: 'hotel',
      maxGuests: 4,
      basePricePerNight: '420.00',
      status: 'active',
      isFeatured: true
    },
    {
      enterpriseId: goldenDolphin.id,
      name: 'Golden Dolphin Grand Hotel',
      propertyType: 'hotel',
      maxGuests: 4,
      basePricePerNight: '380.00',
      status: 'active'
    },
  ]);

  // 4. ACCOMMODATIONS
  console.log('🛏️ Inserindo accommodations...');
  await db.insert(schema.accommodations).values([
    {
      propertyId: 1,
      name: 'Suíte Master',
      accommodationType: 'suite',
      maxGuests: 4,
      basePricePerNight: '650.00',
      status: 'active'
    },
    {
      propertyId: 1,
      name: 'Apartamento Standard',
      accommodationType: 'apartment',
      maxGuests: 2,
      basePricePerNight: '250.00',
      status: 'active'
    },
    {
      propertyId: 2,
      name: 'Chalé Família',
      accommodationType: 'house',
      maxGuests: 6,
      basePricePerNight: '520.00',
      status: 'active'
    },
  ]);

  // 5. PARKS
  console.log('🎢 Inserindo parks...');
  await db.insert(schema.parks).values([
    {
      name: 'DiRoma Acqua Park',
      slug: 'diroma-acqua-park',
      type: 'aquatico',
      category: 'parque_aquatico',
      city: 'Caldas Novas',
      state: 'GO',
      priceFrom: '80.00',
      rating: '4.6',
      totalReviews: 3200,
      enterpriseId: diroma.id,
      isActive: true,
      isFeatured: true,
      description: 'O maior parque aquático de águas quentes naturais do Brasil'
    },
    {
      name: 'Privé Parque Aquático',
      slug: 'prive-parque-aquatico',
      type: 'aquatico',
      category: 'parque_aquatico',
      city: 'Caldas Novas',
      state: 'GO',
      priceFrom: '90.00',
      rating: '4.5',
      totalReviews: 2800,
      enterpriseId: prive.id,
      isActive: true,
      isFeatured: true
    },
  ]);

  // 6. ATTRACTIONS
  console.log('🎭 Inserindo attractions...');
  await db.insert(schema.attractions).values([
    {
      name: 'Lago de Caldas Novas',
      slug: 'lago-caldas-novas',
      type: 'mirante',
      category: 'natureza',
      city: 'Caldas Novas',
      state: 'GO',
      isFree: true,
      rating: '4.2',
      totalReviews: 650,
      isActive: true
    },
    {
      name: 'Feira do Luar',
      slug: 'feira-do-luar',
      type: 'feira',
      category: 'cultura',
      city: 'Caldas Novas',
      state: 'GO',
      isFree: true,
      rating: '4.0',
      totalReviews: 420,
      isActive: true,
      description: 'Feira noturna com artesanato, gastronomia e cultura regional'
    },
  ]);

  // 7. PROMOTIONS
  console.log('🏷️ Inserindo promotions...');
  await db.insert(schema.promotions).values([
    {
      title: 'Verão Quente 2026',
      slug: 'verao-quente-2026',
      type: 'temporada',
      discountType: 'percentage',
      discountValue: '25.00',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      isActive: true,
      isFeatured: true
    },
    {
      title: 'Combo Parque + Hotel',
      slug: 'combo-parque-hotel',
      type: 'combo',
      discountType: 'percentage',
      discountValue: '15.00',
      isActive: true,
      isFeatured: true
    },
  ]);

  // 8. TRAVEL PACKAGES
  console.log('✈️ Inserindo travel packages...');
  await db.insert(schema.travel).values([
    {
      title: 'Pacote Caldas Novas 5 dias',
      slug: 'pacote-caldas-novas-5d',
      type: 'pacote',
      destination: 'Caldas Novas',
      durationDays: 5,
      durationNights: 4,
      pricePerPerson: '1200.00',
      priceChild: '600.00',
      maxPassengers: 40,
      includes: JSON.stringify(['Hotel 4 estrelas', 'Café da manhã', 'Ingresso parque aquático', 'Transfer']),
      rating: '4.6',
      enterpriseId: diroma.id,
      isActive: true,
      isFeatured: true
    },
  ]);

  // 9. RECOMMENDATIONS
  console.log('💡 Inserindo recommendations...');
  await db.insert(schema.recommendations).values([
    {
      title: 'Combo Família Completo',
      type: 'combo',
      category: 'familia',
      targetAudience: 'familia',
      totalPrice: '3500.00',
      discountedPrice: '2975.00',
      savingsPercent: '15.00',
      priority: 1,
      isActive: true,
      isFeatured: true,
      description: 'Hotel + Parque Aquático + Excursão para toda família'
    },
  ]);

  // 10. POPULAR SEARCHES
  console.log('🔍 Inserindo popular searches...');
  await db.insert(schema.popularSearches).values([
    { term: 'caldas novas', searchCount: 15000, category: 'destino' },
    { term: 'hot park', searchCount: 12000, category: 'parque' },
    { term: 'pacote família', searchCount: 7200, category: 'pacote' },
  ]);

  // 11. LEADS
  console.log('📋 Inserindo leads...');
  await db.insert(schema.leads).values([
    {
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(62) 99999-1111',
      source: 'site',
      interest: 'hotel',
      destination: 'Caldas Novas',
      status: 'novo'
    },
  ]);

  // 12. USERS
  console.log('👤 Inserindo users...');
  await db.insert(schema.users).values([
    {
      name: 'Admin RSV360',
      email: 'admin@rsv360.com.br',
      role: 'admin',
      isActive: true
    },
  ]);

  console.log('✅ Seed completo! Dados realistas inseridos.');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});