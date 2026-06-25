#!/usr/bin/env node
/**
 * Seed de leilões demo (Fase 5) — Caldas Novas
 * Uso: node backend/scripts/seed-auctions.js
 * Requer: DATABASE_URL no ambiente (ou .env do docker compose)
 */
'use strict';

const { Pool } = require('pg');

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://rsv360:rsv360@127.0.0.1:5432/rsv_360_ecosystem';

const DEMO_AUCTIONS = [
  {
    title: 'Suíte Master — Lagoa Eco Towers',
    description: '2 noites para 4 pessoas com café da manhã.',
    start_price: 450,
    current_price: 450,
    min_increment: 25,
    reserve_price: 400,
    start_date: new Date(Date.now() - 60 * 60 * 1000),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active',
    latitude: -17.7444,
    longitude: -48.6244,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
  {
    title: 'Apartamento Piazza DiRoma — Caldas Novas',
    description: 'Final de semana com acesso às piscinas termais.',
    start_price: 380,
    current_price: 405,
    min_increment: 20,
    start_date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    latitude: -17.751,
    longitude: -48.631,
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  },
  {
    title: 'Chalé Rio Quente Resorts',
    description: 'Leilão beneficente — pacote família 3 noites.',
    start_price: 520,
    current_price: 520,
    min_increment: 30,
    start_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'scheduled',
    latitude: -17.778,
    longitude: -48.772,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },
];

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const existing = await pool.query('SELECT COUNT(*)::int AS c FROM auctions');
    if ((existing.rows[0]?.c ?? 0) > 0) {
      console.log(`[seed-auctions] ${existing.rows[0].c} leilão(ões) já existem — skip.`);
      return;
    }

    for (const item of DEMO_AUCTIONS) {
      await pool.query(
        `INSERT INTO auctions (
           title, description, start_price, current_price, min_increment, reserve_price,
           start_date, end_date, status, latitude, longitude, image_url, enterprise_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1)`,
        [
          item.title,
          item.description,
          item.start_price,
          item.current_price,
          item.min_increment,
          item.reserve_price ?? null,
          item.start_date.toISOString(),
          item.end_date.toISOString(),
          item.status,
          item.latitude,
          item.longitude,
          item.image_url,
        ]
      );
    }

    console.log(`[seed-auctions] Inseridos ${DEMO_AUCTIONS.length} leilões demo.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[seed-auctions] Falha:', error.message);
  process.exit(1);
});
