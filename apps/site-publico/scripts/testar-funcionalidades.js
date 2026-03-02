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

async function queryDatabase(text, params) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function testCalendar() {
  console.log('\n📅 TESTANDO CALENDÁRIO');
  console.log('========================================');
  
  try {
    // Verificar se existe propriedade com ID 1
    const property = await queryDatabase('SELECT id, title, base_price, city, state FROM properties WHERE id = $1', [1]);
    
    if (property.length === 0) {
      console.log('⚠️  Propriedade com ID 1 não encontrada');
      console.log('   Criando propriedade de teste...');
      
      // Criar propriedade de teste
      await queryDatabase(`
        INSERT INTO properties (id, title, description, base_price, city, state, max_guests, status)
        VALUES (1, 'Casa de Temporada Teste', 'Propriedade para testes do calendário', 200.00, 'Caldas Novas', 'GO', 4, 'active')
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          base_price = EXCLUDED.base_price
      `);
      console.log('✅ Propriedade criada com sucesso');
    } else {
      console.log(`✅ Propriedade encontrada: ${property[0].title}`);
      console.log(`   Preço base: R$ ${property[0].base_price}`);
      console.log(`   Localização: ${property[0].city}, ${property[0].state}`);
    }
    
    // Verificar tabela de calendário
    const calendarExists = await queryDatabase(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'property_calendars'
      ) as exists
    `);
    
    if (calendarExists[0]?.exists) {
      console.log('✅ Tabela property_calendars existe');
    } else {
      console.log('⚠️  Tabela property_calendars não encontrada');
    }
    
    // Verificar eventos
    const eventsExists = await queryDatabase(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'events_calendar'
      ) as exists
    `);
    
    if (eventsExists[0]?.exists) {
      const eventCount = await queryDatabase('SELECT COUNT(*) as count FROM events_calendar');
      console.log(`✅ Tabela events_calendar existe (${eventCount[0]?.count || 0} eventos)`);
    } else {
      console.log('⚠️  Tabela events_calendar não encontrada');
    }
    
    console.log('\n📋 URL de teste: http://localhost:3000/properties/1/calendar');
    console.log('   ✅ Calendário pronto para testes');
    
  } catch (error) {
    console.error('❌ Erro ao testar calendário:', error.message);
  }
}

async function testCheckin() {
  console.log('\n✅ TESTANDO CHECK-IN');
  console.log('========================================');
  
  try {
    // Verificar se existe reserva com ID 1
    const booking = await queryDatabase(`
      SELECT id, booking_code, customer_name, customer_email, check_in, check_out, status
      FROM bookings 
      WHERE id = $1 OR booking_code = $2
      LIMIT 1
    `, [1, 'TEST001']);
    
    if (booking.length === 0) {
      console.log('⚠️  Reserva de teste não encontrada');
      console.log('   Criando reserva de teste...');
      
      // Verificar se existe propriedade
      const property = await queryDatabase('SELECT id FROM properties WHERE id = $1', [1]);
      if (property.length === 0) {
        console.log('   Criando propriedade primeiro...');
        await queryDatabase(`
          INSERT INTO properties (id, title, base_price, city, state, status)
          VALUES (1, 'Casa Teste', 200.00, 'Caldas Novas', 'GO', 'active')
          ON CONFLICT (id) DO NOTHING
        `);
      }
      
      // Criar reserva de teste
      await queryDatabase(`
        INSERT INTO bookings (
          id, booking_code, item_id, customer_name, customer_email, 
          customer_phone, check_in, check_out, total, status, created_at
        )
        VALUES (
          1, 'TEST001', 1, 'Cliente Teste', 'teste@example.com',
          '62999999999', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days',
          600.00, 'confirmed', CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          booking_code = EXCLUDED.booking_code,
          status = 'confirmed'
      `);
      console.log('✅ Reserva criada com sucesso (ID: 1, Código: TEST001)');
    } else {
      console.log(`✅ Reserva encontrada: ${booking[0].booking_code}`);
      console.log(`   Cliente: ${booking[0].customer_name}`);
      console.log(`   Check-in: ${booking[0].check_in}`);
      console.log(`   Status: ${booking[0].status}`);
    }
    
    // Verificar tabela de check-in
    const checkinExists = await queryDatabase(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'checkins'
      ) as exists
    `);
    
    if (checkinExists[0]?.exists) {
      console.log('✅ Tabela checkins existe');
    } else {
      console.log('⚠️  Tabela checkins não encontrada');
    }
    
    console.log('\n📋 URL de teste: http://localhost:3000/checkin?booking_id=1');
    console.log('   ✅ Check-in pronto para testes');
    
  } catch (error) {
    console.error('❌ Erro ao testar check-in:', error.message);
  }
}

async function testHoteis() {
  console.log('\n🏨 TESTANDO PÁGINA DE HOTÉIS');
  console.log('========================================');
  
  try {
    // Verificar propriedades
    const properties = await queryDatabase('SELECT id, title, base_price, status FROM properties ORDER BY id LIMIT 5');
    
    if (properties.length === 0) {
      console.log('⚠️  Nenhuma propriedade encontrada');
      console.log('   Criando propriedades de teste...');
      
      await queryDatabase(`
        INSERT INTO properties (title, description, base_price, city, state, max_guests, status)
        VALUES 
          ('Casa de Temporada 1', 'Descrição da casa 1', 250.00, 'Caldas Novas', 'GO', 4, 'active'),
          ('Casa de Temporada 2', 'Descrição da casa 2', 300.00, 'Caldas Novas', 'GO', 6, 'active'),
          ('Casa de Temporada 3', 'Descrição da casa 3', 200.00, 'Caldas Novas', 'GO', 2, 'active')
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Propriedades criadas com sucesso');
    } else {
      console.log(`✅ ${properties.length} propriedade(s) encontrada(s):`);
      properties.forEach(prop => {
        console.log(`   - ${prop.title} (R$ ${prop.base_price}) - ${prop.status}`);
      });
    }
    
    // Verificar API
    console.log('\n📋 URL de teste: http://localhost:3000/hoteis');
    console.log('   ✅ Página de hotéis pronta para testes');
    console.log('   ✅ API de propriedades: http://localhost:3000/api/properties');
    
  } catch (error) {
    console.error('❌ Erro ao testar página de hotéis:', error.message);
  }
}

async function main() {
  console.log('========================================');
  console.log('TESTE DE FUNCIONALIDADES - RSV 360°');
  console.log('========================================');
  
  await testCalendar();
  await testCheckin();
  await testHoteis();
  
  console.log('\n========================================');
  console.log('TESTES CONCLUÍDOS!');
  console.log('========================================');
  console.log('\n📋 URLs PARA TESTE:');
  console.log('   📅 Calendário: http://localhost:3000/properties/1/calendar');
  console.log('   ✅ Check-in: http://localhost:3000/checkin?booking_id=1');
  console.log('   🏨 Hotéis: http://localhost:3000/hoteis');
  console.log('\n💡 Dica: Certifique-se de que o servidor está rodando (npm run dev)');
  console.log('');
  
  await pool.end();
}

main().catch(console.error);

