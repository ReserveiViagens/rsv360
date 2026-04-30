import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as schema from './schema/index';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seedDeterministicTestUser() {
  if (process.env.SEED_SKIP_TEST_USER === 'true') {
    console.log('[seed] SEED_SKIP_TEST_USER=true -> skipping deterministic test user');
    return;
  }

  const email = (process.env.SEED_TEST_USER_EMAIL ?? 'test@local.dev').toLowerCase();
  const role = process.env.SEED_TEST_USER_ROLE ?? 'admin';
  const password = process.env.SEED_TEST_USER_PASSWORD;

  if (!password && process.env.NODE_ENV === 'production') {
    throw new Error(
      '[seed] SEED_TEST_USER_PASSWORD is required in production. Set the secret in GitHub or your env, or set SEED_SKIP_TEST_USER=true.'
    );
  }

  if (!password) {
    console.warn('[seed] SEED_TEST_USER_PASSWORD not set -> using dev fallback');
  }

  const effectivePassword = password ?? 'dev-only-fallback-do-not-use-in-prod';
  const passwordHash = await bcrypt.hash(effectivePassword, 12);

  await db
    .insert(schema.users)
    .values({
      name: 'Test User',
      email,
      password: passwordHash,
      role,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        password: passwordHash,
        role,
        isActive: true,
      },
    });

  console.log(`[seed] deterministic test user upserted: email=${email} role=${role}`);
}

async function seedBookings() {
  const seedEmail = (process.env.SEED_TEST_USER_EMAIL ?? 'test@local.dev').toLowerCase();

  const [seedUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, seedEmail))
    .limit(1);

  if (!seedUser) {
    console.warn(`[seed:bookings] user de seed nao encontrado (email=${seedEmail}) - pulando bookings`);
    return;
  }

  const [accommodation] = await db.select().from(schema.accommodations).orderBy(schema.accommodations.id).limit(1);
  const [travelPackage] = await db.select().from(schema.travel).orderBy(schema.travel.id).limit(1);

  if (!accommodation || !travelPackage) {
    console.warn('[seed:bookings] dependencia de produto ausente - pulando bookings');
    return;
  }

  const customerName = seedUser.name ?? 'Test User';
  const customerEmail = seedUser.email ?? seedEmail;
  const customerPhone = '(62) 99999-0000';
  const customerDocument = '000.000.000-00';

  const fixtures = [
    {
      bookingCode: 'SEED-ACC-001',
      bookingType: 'accommodation',
      itemId: accommodation.id,
      itemName: accommodation.name,
      userId: seedUser.id,
      customerName,
      customerEmail,
      customerPhone,
      customerDocument,
      startDate: new Date('2026-06-01T14:00:00Z'),
      endDate: new Date('2026-06-05T11:00:00Z'),
      adultsCount: 2,
      childrenCount: 1,
      infantsCount: 0,
      guestsCount: 3,
      subtotal: '1500.00',
      discount: '0.00',
      taxes: '0.00',
      serviceFee: '0.00',
      totalAmount: '1500.00',
      currency: 'BRL',
      paymentMethod: 'pix',
      paymentStatus: 'paid',
      paymentInfo: { method: 'pix', transactionId: 'SEED-ACC-001' },
      status: 'confirmed',
      confirmedAt: new Date('2026-05-20T12:00:00Z'),
      specialRequests: 'Vista para a piscina',
      notes: 'Seed deterministico de acomodacao',
      metadata: { seed: true, source: 'phase-7-f2' },
    },
    {
      bookingCode: 'SEED-PKG-001',
      bookingType: 'package',
      itemId: travelPackage.id,
      itemName: travelPackage.title,
      userId: seedUser.id,
      customerName,
      customerEmail,
      customerPhone,
      customerDocument,
      startDate: new Date('2026-06-01T14:00:00Z'),
      endDate: new Date('2026-06-05T11:00:00Z'),
      adultsCount: 2,
      childrenCount: 0,
      infantsCount: 0,
      guestsCount: 2,
      subtotal: '3500.00',
      discount: '0.00',
      taxes: '0.00',
      serviceFee: '0.00',
      totalAmount: '3500.00',
      currency: 'BRL',
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentInfo: { method: 'credit_card', authorization: 'SEED-PKG-001' },
      status: 'pending',
      specialRequests: 'Check-in antecipado se disponivel',
      notes: 'Seed deterministico de pacote',
      metadata: { seed: true, source: 'phase-7-f2' },
    },
    {
      bookingCode: 'SEED-ACC-002',
      bookingType: 'accommodation',
      itemId: accommodation.id,
      itemName: accommodation.name,
      userId: seedUser.id,
      customerName,
      customerEmail,
      customerPhone,
      customerDocument,
      startDate: new Date('2026-07-01T14:00:00Z'),
      endDate: new Date('2026-07-05T11:00:00Z'),
      adultsCount: 1,
      childrenCount: 0,
      infantsCount: 0,
      guestsCount: 1,
      subtotal: '1200.00',
      discount: '0.00',
      taxes: '0.00',
      serviceFee: '0.00',
      totalAmount: '1200.00',
      currency: 'BRL',
      paymentMethod: 'pix',
      paymentStatus: 'refunded',
      paymentInfo: { method: 'pix', transactionId: 'SEED-ACC-002', refunded: true },
      status: 'cancelled',
      cancelledAt: new Date('2026-06-10T12:00:00Z'),
      specialRequests: 'Quarto silencioso',
      notes: 'Seed deterministico cancelado',
      metadata: { seed: true, source: 'phase-7-f2' },
    },
  ];

  const inserted = await db
    .insert(schema.bookings)
    .values(fixtures)
    .onConflictDoNothing({ target: schema.bookings.bookingCode })
    .returning({ id: schema.bookings.id });

  console.log(`[seed:bookings] inseridas ${inserted.length} novas (de ${fixtures.length} fixtures)`);
}

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
  ]).onConflictDoNothing({ target: schema.parks.slug });

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
  ]).onConflictDoNothing({ target: schema.attractions.slug });

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
  ]).onConflictDoNothing({ target: schema.promotions.slug });

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
  ]).onConflictDoNothing({ target: schema.travel.slug });

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
  ]).onConflictDoNothing({ target: schema.popularSearches.term });

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
  await db
    .insert(schema.users)
    .values([
      {
        name: 'Admin RSV360',
        email: 'admin@rsv360.com.br',
        password: null,
        role: 'admin',
        isActive: true,
      },
    ])
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: 'Admin RSV360',
        password: null,
        role: 'admin',
        isActive: true,
      },
    });

  await seedDeterministicTestUser();
  await seedBookings();

  console.log('✅ Seed completo! Dados realistas inseridos.');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
