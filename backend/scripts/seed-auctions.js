/**
 * Seed de leilões para ativar o módulo
 * Cria enterprises e auctions ativos para teste
 *
 * Uso: node scripts/seed-auctions.js
 * (execute na raiz do backend)
 */
require('dotenv').config();
const { pool } = require('../database/db');

const HOTELS_CALDAS_NOVAS = [
  { name: 'Lagoa Eco Towers', lat: -17.7444, lng: -48.6278 },
  { name: 'Piazza DiRoma', lat: -17.7444, lng: -48.6278 },
  { name: 'Spazzio DiRoma', lat: -17.7444, lng: -48.6278 },
  { name: 'Praias do Lago Eco Resort', lat: -17.731076, lng: -48.619533 },
];

async function seedAuctions() {
  console.log('🌱 Iniciando seed de leilões...\n');

  try {
    // Verificar se tabela enterprises existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enterprises')
    `);
    if (!tableCheck.rows[0]?.exists) {
      console.error('❌ Tabela enterprises não existe. Execute as migrations: npm run migrate');
      process.exit(1);
    }

    const tableAuctions = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auctions')
    `);
    if (!tableAuctions.rows[0]?.exists) {
      console.error('❌ Tabela auctions não existe. Execute as migrations: npm run migrate');
      process.exit(1);
    }

    let enterpriseIds = [];

    for (const hotel of HOTELS_CALDAS_NOVAS) {
      const existing = await pool.query(
        'SELECT id FROM enterprises WHERE name = $1 LIMIT 1',
        [hotel.name]
      );
      if (existing.rows.length > 0) {
        enterpriseIds.push(existing.rows[0].id);
        console.log(`  ℹ️ Enterprise já existe: ${hotel.name} (id ${existing.rows[0].id})`);
      } else {
        const res = await pool.query(
          `INSERT INTO enterprises (name, enterprise_type, address_city, address_state, latitude, longitude, created_at, updated_at)
           VALUES ($1, 'hotel', 'Caldas Novas', 'GO', $2, $3, NOW(), NOW())
           RETURNING id`,
          [hotel.name, hotel.lat, hotel.lng]
        );
        if (res.rows.length > 0) {
          enterpriseIds.push(res.rows[0].id);
          console.log(`  ✅ Enterprise criado: ${hotel.name} (id ${res.rows[0].id})`);
        }
      }
    }

    if (enterpriseIds.length === 0) {
      const anyEnt = await pool.query('SELECT id FROM enterprises LIMIT 1');
      if (anyEnt.rows.length > 0) {
        enterpriseIds = [anyEnt.rows[0].id];
        console.log(`  ℹ️ Usando enterprise existente id ${enterpriseIds[0]}`);
      } else {
        const newEnt = await pool.query(
          `INSERT INTO enterprises (name, enterprise_type, address_city, address_state, latitude, longitude, created_at, updated_at)
           VALUES ('Lagoa Eco Towers', 'hotel', 'Caldas Novas', 'GO', -17.7444, -48.6278, NOW(), NOW())
           RETURNING id`
        );
        enterpriseIds = [newEnt.rows[0].id];
        console.log(`  ✅ Enterprise criado: Lagoa Eco Towers (id ${enterpriseIds[0]})`);
      }
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    // Schema migration 007: start_price, current_price, min_increment, enterprise_id (opcional)
    const enterpriseId = enterpriseIds.length > 0 ? enterpriseIds[0] : null;
    const auctionRes = await pool.query(
      `INSERT INTO auctions (title, description, start_price, current_price, min_increment, start_date, end_date, status, enterprise_id, created_at, updated_at)
       VALUES ($1, $2, $3, $3, $4, $5, $6, 'active', $7, NOW(), NOW())
       RETURNING id, title`,
      [
        'Suíte Premium - Leilão RSV360',
        'Leilão de acomodação premium em Caldas Novas. Participe!',
        200,
        10,
        start,
        end,
        enterpriseId,
      ]
    );

    console.log(`\n  ✅ Leilão ativo criado: ${auctionRes.rows[0].title} (id ${auctionRes.rows[0].id})`);
    console.log(`\n🎉 Seed concluído! Acesse http://localhost:3000/leiloes para ver os leilões.\n`);
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    if (err.code === '23505') {
      console.log('  (Registro duplicado - pode ignorar se já existir)');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAuctions();
