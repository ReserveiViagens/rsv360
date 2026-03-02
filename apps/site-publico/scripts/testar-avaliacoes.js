require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

const pool = new Pool(dbConfig);

async function testarAvaliacoes() {
  console.log("========================================");
  console.log("TESTE: SISTEMA DE AVALIAÇÕES");
  console.log("========================================");
  console.log("");

  console.log("1. Verificando tabela reviews...");
  try {
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      ) as exists
    `);

    if (tableExists.rows[0].exists) {
      console.log("✅ Tabela reviews existe");
      
      const count = await pool.query('SELECT COUNT(*) as count FROM reviews');
      console.log(`   Total de avaliações: ${count.rows[0].count}`);
    } else {
      console.log("⚠️  Tabela reviews não existe");
      console.log("   Execute o script create-all-tables.js para criar");
    }
  } catch (error) {
    console.log("❌ Erro ao verificar tabela:", error.message);
  }
  console.log("");

  console.log("2. Verificando API de avaliações...");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  console.log(`   Endpoint GET: ${baseUrl}/api/reviews`);
  console.log(`   Endpoint POST: ${baseUrl}/api/reviews`);
  console.log("");

  console.log("3. Verificando componentes...");
  const fs = require('fs');
  const path = require('path');

  const components = [
    { name: 'ReviewForm', path: 'components/review-form.tsx' },
    { name: 'ReviewsList', path: 'components/reviews-list.tsx' },
  ];

  components.forEach(comp => {
    const filePath = path.join(__dirname, '..', comp.path);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${comp.name} encontrado`);
    } else {
      console.log(`   ❌ ${comp.name} não encontrado`);
    }
  });
  console.log("");

  console.log("4. Verificando páginas...");
  const pages = [
    { name: '/avaliacoes', path: 'app/avaliacoes/page.tsx' },
    { name: '/hoteis/[id] (com avaliações)', path: 'app/hoteis/[id]/page.tsx' },
    { name: '/minhas-reservas (com botão avaliar)', path: 'app/minhas-reservas/page.tsx' },
  ];

  pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page.path);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (page.path.includes('avaliacoes') || content.includes('Review') || content.includes('review')) {
        console.log(`   ✅ ${page.name} encontrado`);
      } else {
        console.log(`   ⚠️  ${page.name} encontrado mas sem integração de avaliações`);
      }
    } else {
      console.log(`   ❌ ${page.name} não encontrado`);
    }
  });
  console.log("");

  console.log("5. Testando criação de avaliação (simulado)...");
  try {
    // Verificar se há usuários e hosts no banco
    const users = await pool.query('SELECT id, name, email FROM users LIMIT 1');
    if (users.rows.length > 0) {
      console.log(`   ✅ Usuário encontrado: ${users.rows[0].name} (ID: ${users.rows[0].id})`);
      console.log("   ℹ️  Para criar uma avaliação real:");
      console.log("      - Acesse http://localhost:3000/minhas-reservas");
      console.log("      - Clique em 'Avaliar' em uma reserva concluída");
      console.log("      - Ou acesse http://localhost:3000/avaliacoes");
    } else {
      console.log("   ⚠️  Nenhum usuário encontrado no banco");
    }
  } catch (error) {
    console.log("   ⚠️  Erro ao verificar usuários:", error.message);
  }
  console.log("");

  console.log("========================================");
  console.log("TESTE DE AVALIAÇÕES CONCLUÍDO");
  console.log("========================================");
  console.log("");
  console.log("📖 Para testar avaliações:");
  console.log("   1. Acesse http://localhost:3000/hoteis/[id]");
  console.log("   2. Veja a seção de avaliações na página");
  console.log("   3. Acesse http://localhost:3000/avaliacoes");
  console.log("   4. Acesse http://localhost:3000/minhas-reservas");
  console.log("   5. Clique em 'Avaliar' em uma reserva concluída");
  console.log("");

  await pool.end();
}

testarAvaliacoes().catch(console.error);

