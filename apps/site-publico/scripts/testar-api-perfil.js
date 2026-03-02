// Script para testar a API de perfil
// Sistema RSV 360 - Teste de API

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function testAPI() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('TESTE DA API DE PERFIL');
    console.log('========================================');
    console.log('');

    // 1. Verificar se as tabelas existem
    console.log('1. Verificando tabelas...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_profiles')
      ORDER BY table_name
    `);
    
    console.log('Tabelas encontradas:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');

    // 2. Verificar estrutura da tabela user_profiles
    console.log('2. Verificando estrutura de user_profiles...');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles'
      ORDER BY ordinal_position
    `);
    
    console.log(`Total de colunas: ${columns.rows.length}`);
    console.log('Primeiras 10 colunas:');
    columns.rows.slice(0, 10).forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // 3. Verificar se há usuários
    console.log('3. Verificando usuários...');
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Total de usuários: ${users.rows[0].count}`);
    console.log('');

    // 4. Verificar se há perfis
    console.log('4. Verificando perfis...');
    const profiles = await pool.query('SELECT COUNT(*) as count FROM user_profiles');
    console.log(`Total de perfis: ${profiles.rows[0].count}`);
    console.log('');

    // 5. Criar usuário de teste se não existir
    console.log('5. Criando usuário de teste...');
    const testEmail = 'teste@perfil.com';
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);
    
    let userId;
    if (existingUser.rows.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO users (name, email, phone, document, role, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ['Usuário Teste', testEmail, '(64) 99999-9999', '123.456.789-00', 'customer', 'active']
      );
      userId = newUser.rows[0].id;
      console.log(`Usuário criado com ID: ${userId}`);
    } else {
      userId = existingUser.rows[0].id;
      console.log(`Usuário já existe com ID: ${userId}`);
    }
    console.log('');

    // 6. Verificar/criar perfil de teste
    console.log('6. Verificando perfil de teste...');
    const existingProfile = await pool.query('SELECT user_id FROM user_profiles WHERE user_id = $1', [userId]);
    
    if (existingProfile.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_profiles (
          user_id, username, bio, description, short_description, tagline,
          website_url, whatsapp, location, city, state, country,
          business_name, business_type, categories, services, amenities, social_media
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          userId,
          'usuario_teste',
          'Biografia de teste do usuário',
          'Descrição completa de teste',
          'Descrição curta de teste',
          'Tagline de teste',
          'https://teste.com',
          '(64) 99999-9999',
          'Caldas Novas, GO',
          'Caldas Novas',
          'GO',
          'Brasil',
          'Empresa Teste LTDA',
          'Aluguel por temporada',
          JSON.stringify(['cabanas', 'apartamentos']),
          JSON.stringify(['limpeza', 'transporte']),
          JSON.stringify(['piscina', 'wifi']),
          JSON.stringify({ facebook: 'https://facebook.com/teste', instagram: 'https://instagram.com/teste' })
        ]
      );
      console.log('Perfil de teste criado!');
    } else {
      console.log('Perfil de teste já existe!');
    }
    console.log('');

    // 7. Testar consulta de perfil completo
    console.log('7. Testando consulta de perfil completo...');
    const profileData = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.document,
        up.*
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (profileData.rows.length > 0) {
      const data = profileData.rows[0];
      console.log('Dados do perfil:');
      console.log(`  - Nome: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Username: ${data.username || 'Não definido'}`);
      console.log(`  - Bio: ${data.bio ? data.bio.substring(0, 50) + '...' : 'Não definida'}`);
      console.log(`  - Localização: ${data.location || 'Não definida'}`);
      const categories = data.categories ? (typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories) : [];
      const services = data.services ? (typeof data.services === 'string' ? JSON.parse(data.services) : data.services) : [];
      console.log(`  - Categorias: ${categories.length > 0 ? categories.join(', ') : 'Nenhuma'}`);
      console.log(`  - Serviços: ${services.length > 0 ? services.join(', ') : 'Nenhum'}`);
    }
    console.log('');

    console.log('========================================');
    console.log('TESTE CONCLUIDO COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Acesse http://localhost:3000/perfil');
    console.log('2. Faça login com: teste@perfil.com');
    console.log('3. Teste a edição do perfil');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO no teste:');
    console.error(error.message);
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

testAPI();

