// Script para verificar dados de teste no banco
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
  console.log('VERIFICANDO DADOS DE TESTE');
  console.log('========================================');
  console.log('');

  try {
    // Verificar propriedades
    console.log('📊 PROPRIEDADES:');
    const propertiesResult = await pool.query('SELECT id, title, city, state, base_price FROM properties LIMIT 5');
    if (propertiesResult.rows.length > 0) {
      console.log(`  ✅ Encontradas ${propertiesResult.rows.length} propriedade(s):`);
      propertiesResult.rows.forEach((prop) => {
        console.log(`     - ID: ${prop.id} | ${prop.title} | ${prop.city || 'N/A'}, ${prop.state || 'N/A'} | R$ ${parseFloat(prop.base_price || 0).toFixed(2)}`);
      });
    } else {
      console.log('  ⚠️  Nenhuma propriedade encontrada');
    }
    console.log('');

    // Verificar reservas
    console.log('📅 RESERVAS:');
    const bookingsResult = await pool.query('SELECT id, booking_code, check_in, check_out, status, total FROM bookings LIMIT 5');
    if (bookingsResult.rows.length > 0) {
      console.log(`  ✅ Encontradas ${bookingsResult.rows.length} reserva(s):`);
      bookingsResult.rows.forEach((booking) => {
        console.log(`     - ID: ${booking.id} | Código: ${booking.booking_code} | ${booking.check_in} a ${booking.check_out} | Status: ${booking.status} | R$ ${parseFloat(booking.total || 0).toFixed(2)}`);
      });
    } else {
      console.log('  ⚠️  Nenhuma reserva encontrada');
    }
    console.log('');

    // Verificar usuários
    console.log('👤 USUÁRIOS:');
    const usersResult = await pool.query('SELECT id, name, email FROM users LIMIT 5');
    if (usersResult.rows.length > 0) {
      console.log(`  ✅ Encontrados ${usersResult.rows.length} usuário(s):`);
      usersResult.rows.forEach((user) => {
        console.log(`     - ID: ${user.id} | ${user.name} | ${user.email}`);
      });
    } else {
      console.log('  ⚠️  Nenhum usuário encontrado');
    }
    console.log('');

    // Resumo
    console.log('========================================');
    console.log('RESUMO');
    console.log('========================================');
    console.log(`Propriedades: ${propertiesResult.rows.length}`);
    console.log(`Reservas: ${bookingsResult.rows.length}`);
    console.log(`Usuários: ${usersResult.rows.length}`);
    console.log('');

    if (propertiesResult.rows.length === 0 || bookingsResult.rows.length === 0) {
      console.log('⚠️  DADOS DE TESTE NECESSÁRIOS');
      console.log('');
      console.log('Para testar as funcionalidades, você precisa de:');
      if (propertiesResult.rows.length === 0) {
        console.log('  - Pelo menos 1 propriedade');
      }
      if (bookingsResult.rows.length === 0) {
        console.log('  - Pelo menos 1 reserva');
      }
      console.log('');
      console.log('Execute: node scripts/criar-dados-teste.js');
    } else {
      console.log('✅ DADOS SUFICIENTES PARA TESTES');
      console.log('');
      console.log('URLs de teste:');
      if (propertiesResult.rows.length > 0) {
        console.log(`  - Calendário: http://localhost:3000/properties/${propertiesResult.rows[0].id}/calendar`);
      }
      if (bookingsResult.rows.length > 0) {
        console.log(`  - Check-in: http://localhost:3000/checkin?booking_id=${bookingsResult.rows[0].id}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
  } finally {
    await pool.end();
  }
}

main();

