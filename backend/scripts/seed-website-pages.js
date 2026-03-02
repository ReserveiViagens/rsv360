#!/usr/bin/env node
/**
 * Importa as páginas existentes do Site Público para o Gerenciamento de Páginas (website_pages).
 * Permite editar, personalizar e excluir diretamente pelo CMS.
 */
require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[env]);

// Páginas existentes do Site Público (app/): slug, título, tipo
const PAGINAS_SITE = [
  { slug: 'home', title: 'Página Inicial', type: 'landing' },
  { slug: 'hoteis', title: 'Hotéis', type: 'page' },
  { slug: 'promocoes', title: 'Promoções', type: 'page' },
  { slug: 'atracoes', title: 'Atrações', type: 'page' },
  { slug: 'ingressos', title: 'Ingressos', type: 'page' },
  { slug: 'leiloes', title: 'Leilões', type: 'page' },
  { slug: 'flash-deals', title: 'Flash Deals', type: 'page' },
  { slug: 'marketplace', title: 'Marketplace', type: 'page' },
  { slug: 'contato', title: 'Contato', type: 'page' },
  { slug: 'politica-privacidade', title: 'Política de Privacidade', type: 'page' },
  { slug: 'viagens-grupo', title: 'Viagens em Grupo', type: 'page' },
  { slug: 'buscar', title: 'Buscar', type: 'page' },
  { slug: 'login', title: 'Login', type: 'page' },
  { slug: 'recuperar-senha', title: 'Recuperar Senha', type: 'page' },
  { slug: 'redefinir-senha', title: 'Redefinir Senha', type: 'page' },
  { slug: 'perfil', title: 'Perfil', type: 'page' },
  { slug: 'minhas-reservas', title: 'Minhas Reservas', type: 'page' },
  { slug: 'mensagens', title: 'Mensagens', type: 'page' },
  { slug: 'notificacoes', title: 'Notificações', type: 'page' },
  { slug: 'avaliacoes', title: 'Avaliações', type: 'page' },
  { slug: 'wishlists', title: 'Listas de Desejos', type: 'page' },
  { slug: 'fidelidade', title: 'Programa Fidelidade', type: 'page' },
  { slug: 'cupons', title: 'Cupons', type: 'page' },
  { slug: 'checkin', title: 'Check-in', type: 'page' },
  { slug: 'group-travel', title: 'Viagens em Grupo (Planning)', type: 'page' },
  { slug: 'trips', title: 'Viagens', type: 'page' },
  { slug: 'booking', title: 'Reservas', type: 'page' },
  { slug: 'buscar-hosts', title: 'Buscar Hosts', type: 'page' },
  { slug: 'analytics', title: 'Analytics', type: 'page' },
  { slug: 'dashboard-estatisticas', title: 'Dashboard Estatísticas', type: 'page' },
  { slug: 'insurance', title: 'Seguros', type: 'page' },
  { slug: 'quality', title: 'Qualidade', type: 'page' },
  { slug: 'pricing', title: 'Precificação', type: 'page' },
  { slug: 'verification', title: 'Verificação', type: 'page' },
  { slug: 'onboarding', title: 'Onboarding', type: 'page' },
  { slug: 'api-docs', title: 'Documentação API', type: 'page' },
];

async function ensureTable() {
  const hasTable = await db.schema.hasTable('website_pages');
  if (!hasTable) {
    await db.schema.createTable('website_pages', (table) => {
      table.increments('id').primary();
      table.string('slug', 255).unique().notNullable();
      table.string('title', 255).notNullable();
      table.string('type', 50).defaultTo('page');
      table.text('content').nullable();
      table.jsonb('images').defaultTo('[]');
      table.jsonb('videos').defaultTo('[]');
      table.jsonb('metadata').defaultTo('{}');
      table.jsonb('navigation').defaultTo('{}');
      table.string('status', 50).defaultTo('active');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log('Tabela website_pages criada.');
  }
}

async function seed() {
  try {
    await ensureTable();

    let inseridas = 0;
    let existentes = 0;

    for (const pagina of PAGINAS_SITE) {
      const existe = await db('website_pages').where('slug', pagina.slug).first();
      if (existe) {
        existentes++;
        continue;
      }

      const nav = {
        show_in_menu: ['home', 'hoteis', 'promocoes', 'atracoes', 'ingressos', 'contato'].includes(pagina.slug),
        menu_order: PAGINAS_SITE.indexOf(pagina),
        menu_label: pagina.title,
        icon: '📄',
      };
      await db('website_pages').insert({
        slug: pagina.slug,
        title: pagina.title,
        type: pagina.type || 'page',
        content: `<p>Página <strong>${pagina.title}</strong>. Edite o conteúdo pelo CMS.</p>`,
        images: db.raw("?::jsonb", [JSON.stringify([])]),
        videos: db.raw("?::jsonb", [JSON.stringify([])]),
        metadata: db.raw("?::jsonb", [JSON.stringify({ description: `${pagina.title} - Reservei Viagens` })]),
        navigation: db.raw("?::jsonb", [JSON.stringify(nav)]),
        status: 'active',
      });
      inseridas++;
      console.log(`  + ${pagina.slug} (${pagina.title})`);
    }

    console.log('');
    console.log(`✅ Concluído: ${inseridas} páginas inseridas, ${existentes} já existiam.`);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seed();
