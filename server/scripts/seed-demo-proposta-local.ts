/**
 * Cria proposta demo persistente para teste manual local (não apaga ao final).
 * Uso: DATABASE_URL + Redis opcional
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { db } from '../lib/db';
import { orcamentos, orcamentoItens } from '../../backend/src/db/schema/orcamentos';
import { propostas } from '../../backend/src/db/schema/propostas';
import type { OfertaNormalizada } from '@rsv360/shared';

const DEMO_TAG = 'demo-local-cotacao';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL obrigatório');
    process.exit(1);
  }

  const ofertas: OfertaNormalizada[] = [
    {
      fornecedor: 'Hotel Demo Concorrente',
      tipo: 'hospedagem',
      titulo: 'Pacote Caldas Novas — referência mercado',
      preco: 750,
      moeda: 'BRL',
      imagens: ['https://example.com/hotel.jpg'],
      descricao: 'Oferta demo para teste de comparativo',
      fonte: 'https://example.com/oferta-demo',
      capturadoEm: new Date().toISOString(),
    },
  ];

  const [orc] = await db
    .insert(orcamentos)
    .values({
      titulo: 'Demo Cotação Interativa — Caldas Novas',
      clienteNome: 'Cliente Demo',
      clienteEmail: 'demo@reserveiviagens.com.br',
      total: '500.00',
      metadata: { destino: 'Caldas Novas', demo: DEMO_TAG },
    })
    .returning();

  await db.insert(orcamentoItens).values({
    orcamentoId: orc.id,
    nome: 'Hospedagem 3 noites',
    precoUnitario: '500.00',
    precoTotal: '500.00',
  });

  const token = `demo-${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const [proposta] = await db
    .insert(propostas)
    .values({
      orcamentoId: orc.id,
      titulo: 'Sua viagem — Caldas Novas (demo)',
      clienteNome: 'Cliente Demo',
      clienteEmail: 'demo@reserveiviagens.com.br',
      valorTotal: '500.00',
      status: 'sent',
      isPublica: true,
      tokenPublico: token,
      comparativoCache: ofertas,
      exibirComparativo: false,
      statusAprovacao: 'nao_requer',
      conteudo: { demo: true, temAncora: true, itens: [{ descricao: 'Hospedagem 3 noites', valor: 500 }] },
      metadata: { hitlMode: 'ai', temAncora: true, demo: DEMO_TAG },
    })
    .returning();

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3002';

  console.log('\n=== Demo local — Cotação Interativa ===\n');
  console.log(`Proposta ID:  ${proposta.id}`);
  console.log(`Token:        ${token}`);
  console.log(`\nAbrir no browser:`);
  console.log(`  ${site}/proposta/${proposta.id}`);
  console.log(`\nAPI (staff):`);
  console.log(`  GET ${api}/api/v1/propostas/${proposta.id}`);
  console.log(`\nTeste objeção: no chat, envie "Achei muito caro" → comparativo deve revelar.`);
  console.log(`Socket.IO: ws://${api.replace(/^https?:\/\//, '')}/propostas\n`);

  const { closeDbPool } = await import('../../backend/src/db/drizzle');
  await closeDbPool();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
