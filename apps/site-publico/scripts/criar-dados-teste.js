// Script para criar dados de teste
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

async function main() {
  console.log('========================================');
  console.log('CRIANDO DADOS DE TESTE');
  console.log('========================================');
  console.log('');

  try {
    // 1. Verificar se já existe usuário
    let userId;
    const userCheck = await pool.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`✅ Usuário encontrado (ID: ${userId})`);
    } else {
      // Criar usuário de teste
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Usuário Teste', 'teste@rsv360.com', '$2a$10$dummyhash']
      );
      userId = userResult.rows[0].id;
      console.log(`✅ Usuário criado (ID: ${userId})`);
    }
    console.log('');

    // 2. Verificar se já existe propriedade
    let propertyId;
    const propertyCheck = await pool.query('SELECT id FROM properties LIMIT 1');
    if (propertyCheck.rows.length > 0) {
      propertyId = propertyCheck.rows[0].id;
      console.log(`✅ Propriedade encontrada (ID: ${propertyId})`);
    } else {
      // Criar propriedade de teste
      const propertyResult = await pool.query(
        `INSERT INTO properties (
          title, description, address, city, state, country,
          base_price, max_guests, bedrooms, bathrooms,
          status, rating, review_count, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          'Casa de Temporada Caldas Novas',
          'Linda casa com piscina e área de lazer completa. Localizada próxima ao centro de Caldas Novas.',
          'Rua das Águas Quentes, 123',
          'Caldas Novas',
          'GO',
          'BR',
          300.00, // base_price
          6, // max_guests
          3, // bedrooms
          2, // bathrooms
          'active',
          4.8,
          25
        ]
      );
      propertyId = propertyResult.rows[0].id;
      console.log(`✅ Propriedade criada (ID: ${propertyId})`);
    }
    console.log('');

    // 3. Verificar se já existe reserva
    let bookingId;
    const bookingCheck = await pool.query('SELECT id FROM bookings LIMIT 1');
    if (bookingCheck.rows.length > 0) {
      bookingId = bookingCheck.rows[0].id;
      console.log(`✅ Reserva encontrada (ID: ${bookingId})`);
    } else {
      // Criar reserva de teste
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 7); // 7 dias a partir de hoje
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3); // 3 noites

      const bookingCode = `RSV${Date.now().toString().slice(-6)}`;
      const total = 900.00;

      const bookingResult = await pool.query(
        `INSERT INTO bookings (
          booking_code, booking_type, item_id, item_name,
          check_in, check_out, adults, children, total_guests,
          customer_name, customer_email, customer_phone,
          subtotal, total, payment_method, payment_status, status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          bookingCode,
          'hotel',
          propertyId,
          'Casa de Temporada Caldas Novas',
          checkIn.toISOString().split('T')[0],
          checkOut.toISOString().split('T')[0],
          2, // adults
          0, // children
          2, // total_guests
          'João Silva',
          'joao@teste.com',
          '(64) 99999-9999',
          total,
          total,
          'pix',
          'paid',
          'confirmed'
        ]
      );
      bookingId = bookingResult.rows[0].id;
      console.log(`✅ Reserva criada (ID: ${bookingId}, Código: ${bookingCode})`);
    }
    console.log('');

    // 4. Criar calendário para a propriedade (se não existir)
    const calendarCheck = await pool.query(
      'SELECT id FROM property_calendars WHERE property_id = $1',
      [propertyId]
    );
    if (calendarCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO property_calendars (
          property_id, smart_pricing_enabled, base_price, min_price, max_price,
          ical_export_enabled, ical_import_enabled
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [propertyId, true, 300.00, 200.00, 1200.00, true, true]
      );
      console.log(`✅ Calendário criado para propriedade ${propertyId}`);
    } else {
      console.log(`✅ Calendário já existe para propriedade ${propertyId}`);
    }
    console.log('');

    console.log('========================================');
    console.log('DADOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('URLs de teste:');
    console.log(`  📅 Calendário: http://localhost:3000/properties/${propertyId}/calendar`);
    console.log(`  ✅ Check-in: http://localhost:3000/checkin?booking_id=${bookingId}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

main();

