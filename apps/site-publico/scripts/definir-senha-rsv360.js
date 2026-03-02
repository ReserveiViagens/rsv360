// Script para definir senha real para o usuário "User Rsv 360"
// Sistema RSV 360 - Definir Senha

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
};

async function definirSenha() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('========================================');
    console.log('DEFINIR SENHA: User Rsv 360');
    console.log('========================================');
    console.log('');

    const email = 'user@rsv360.com';
    const senha = 'Rsv360@2025'; // Senha padrão

    // 1. Verificar se usuário existe
    console.log('1. Verificando usuário...');
    const user = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      console.error('ERRO: Usuário não encontrado!');
      console.error('Execute primeiro: node scripts/criar-perfil-rsv360.js');
      process.exit(1);
    }

    const userId = user.rows[0].id;
    console.log(`Usuário encontrado: ${user.rows[0].name} (ID: ${userId})`);
    console.log('');

    // 2. Gerar hash da senha
    console.log('2. Gerando hash da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(senha, saltRounds);
    console.log('Hash gerado com sucesso!');
    console.log('');

    // 3. Atualizar senha no banco
    console.log('3. Atualizando senha no banco de dados...');
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, userId]
    );
    console.log('Senha atualizada com sucesso!');
    console.log('');

    // 4. Verificar se funcionou
    console.log('4. Verificando atualização...');
    const updatedUser = await pool.query('SELECT id, email, password_hash IS NOT NULL as has_password FROM users WHERE id = $1', [userId]);
    
    if (updatedUser.rows[0].has_password) {
      console.log('✅ Senha definida com sucesso!');
    } else {
      console.log('⚠️  Aviso: Senha pode não ter sido salva corretamente');
    }
    console.log('');

    console.log('========================================');
    console.log('SENHA DEFINIDA COM SUCESSO!');
    console.log('========================================');
    console.log('');
    console.log('📧 Credenciais de Acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha}`);
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Esta é a senha padrão');
    console.log('   - Altere a senha após o primeiro login');
    console.log('   - Mantenha a senha segura');
    console.log('');
    console.log('Para fazer login:');
    console.log('   1. Acesse: http://localhost:3000/login');
    console.log(`   2. Email: ${email}`);
    console.log(`   3. Senha: ${senha}`);
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('ERRO ao definir senha:');
    console.error(error.message);
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

definirSenha();

